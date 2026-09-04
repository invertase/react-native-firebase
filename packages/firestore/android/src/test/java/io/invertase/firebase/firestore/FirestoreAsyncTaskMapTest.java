package io.invertase.firebase.firestore;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;

/**
 * Regression for unbounded blocking work on a shared single-thread executor (issue #9278). {@link
 * FirestoreAsyncTaskMap#map} must leave the executor free while the upstream Task is still pending.
 *
 * <p>Plain JUnit4 (AndroidTest-AD-1). Does not call {@code Tasks.await} directly — that path loads
 * {@code Looper.getMainLooper()} via Play Services Tasks internals and is not mockable without
 * Robolectric.
 */
public class FirestoreAsyncTaskMapTest {

  @Test
  public void map_pendingUpstream_doesNotBlockSharedSingleThreadExecutor() throws Exception {
    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      TaskCompletionSource<String> neverCompletes = new TaskCompletionSource<>();
      CountDownLatch subsequentWork = new CountDownLatch(1);

      FirestoreAsyncTaskMap.map(
          neverCompletes.getTask(), executor, task -> task.getResult() + "-mapped");

      executor.execute(subsequentWork::countDown);

      assertTrue(
          "subsequent work on the same single-thread executor must run while upstream Task is"
              + " still pending (continueWith must not occupy the thread waiting)",
          subsequentWork.await(2, TimeUnit.SECONDS));
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  public void blockingWorkOnSharedExecutor_wedgesSubsequentWork() throws Exception {
    // Negative control: same queue-occupancy failure mode as Tasks.call + Tasks.await on the
    // module executor. Uses a latch stand-in because Tasks.await needs a real Looper on JVM.
    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      CountDownLatch blockForever = new CountDownLatch(1);
      CountDownLatch awaitStarted = new CountDownLatch(1);
      CountDownLatch subsequentWork = new CountDownLatch(1);

      executor.execute(
          () -> {
            try {
              awaitStarted.countDown();
              blockForever.await();
            } catch (InterruptedException ignored) {
              Thread.currentThread().interrupt();
            }
          });

      assertTrue(
          "blocking work must start on the shared executor",
          awaitStarted.await(2, TimeUnit.SECONDS));
      executor.execute(subsequentWork::countDown);

      assertFalse(
          "blocking work on the single-thread executor wedges later work",
          subsequentWork.await(500, TimeUnit.MILLISECONDS));
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  public void map_completedUpstream_appliesContinuationOnExecutor() throws Exception {
    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      TaskCompletionSource<String> source = new TaskCompletionSource<>();
      CountDownLatch done = new CountDownLatch(1);
      AtomicReference<String> mapped = new AtomicReference<>();

      FirestoreAsyncTaskMap.map(
          source.getTask(),
          executor,
          task -> {
            String value = task.getResult() + "-mapped";
            mapped.set(value);
            done.countDown();
            return value;
          });

      source.setResult("ok");

      assertTrue(done.await(2, TimeUnit.SECONDS));
      assertEquals("ok-mapped", mapped.get());
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  public void map_failedUpstream_preservesOriginalExceptionOnContinuationTask() throws Exception {
    // documentGet / query.get call task.getResult() inside continueWith; Play Services Tasks
    // unwraps RuntimeExecutionException so the continuation Task fails with the original cause.
    // That is the exception shape passed to rejectPromiseFirestoreException (issue #9278).
    // Poll isComplete() — addOnCompleteListener(no executor) loads Looper via TaskExecutors.
    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      TaskCompletionSource<String> source = new TaskCompletionSource<>();
      Exception original = new Exception("firestore-shaped-upstream-failure");

      Task<String> mapped =
          FirestoreAsyncTaskMap.map(
              source.getTask(), executor, task -> task.getResult() + "-mapped");

      source.setException(original);

      long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(2);
      while (!mapped.isComplete() && System.nanoTime() < deadline) {
        Thread.sleep(10);
      }

      assertTrue("continuation Task must complete after failed upstream", mapped.isComplete());
      assertFalse(mapped.isSuccessful());
      assertNotNull(mapped.getException());
      assertSame(original, mapped.getException());
    } finally {
      executor.shutdownNow();
    }
  }
}
