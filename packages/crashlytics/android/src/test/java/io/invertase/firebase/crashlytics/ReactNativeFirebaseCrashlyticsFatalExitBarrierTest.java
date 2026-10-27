package io.invertase.firebase.crashlytics;

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
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;

import com.google.firebase.crashlytics.FirebaseCrashlytics;
import com.google.firebase.crashlytics.internal.common.CrashlyticsCore;
import com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorkers;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

/**
 * Covers the production barrier wired by {@link ReactNativeFirebaseCrashlyticsFatalExit#create()}
 * against real Crashlytics workers. Robolectric for the SDK classes; AndroidTest-AD-1. The barrier
 * runs on a pool thread (as on the native-modules thread in production), and {@code mockStatic} is
 * thread-bound, so it is opened on that thread.
 */
@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseCrashlyticsFatalExitBarrierTest {
  private final ExecutorService pool = Executors.newCachedThreadPool();

  @After
  public void tearDown() {
    pool.shutdownNow();
  }

  @Test
  public void productionBarrier_waitsForTheQueuedEventWrite() throws Exception {
    CrashlyticsWorkers workers = new CrashlyticsWorkers(pool, pool);
    FirebaseCrashlytics crashlytics =
        ReactNativeFirebaseCrashlyticsInternalTest.crashlyticsWith(workers);
    AtomicBoolean eventWritten = new AtomicBoolean(false);
    workers.diskWrite.submit(
        () -> {
          try {
            Thread.sleep(150);
          } catch (InterruptedException e) {
            throw new IllegalStateException(e);
          }
          eventWritten.set(true);
        });

    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        ReactNativeFirebaseCrashlyticsFatalExit.create();
    pool.submit(
            () -> {
              try (MockedStatic<FirebaseCrashlytics> firebaseCrashlytics =
                  mockStatic(FirebaseCrashlytics.class)) {
                firebaseCrashlytics.when(FirebaseCrashlytics::getInstance).thenReturn(crashlytics);
                fatalExit.barrier.await(fatalExit.timeoutMs);
              }
              return null;
            })
        .get(10, TimeUnit.SECONDS);

    assertTrue(eventWritten.get());
  }

  /**
   * When the barrier is unavailable (here: an unset {@code crashlyticsWorkers}), the production
   * barrier fails and the fatal exit waits out the bound, then terminates.
   */
  @Test
  public void productionBarrier_barrierUnavailable_fallsBackToTheBoundedWait() throws Exception {
    FirebaseCrashlytics crashlytics =
        ReactNativeFirebaseCrashlyticsInternalTest.crashlyticsWithCore(mock(CrashlyticsCore.class));
    List<String> events = new ArrayList<>();
    long[] now = {0};
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        new ReactNativeFirebaseCrashlyticsFatalExit(
            ReactNativeFirebaseCrashlyticsFatalExit.create().barrier,
            millis -> {
              events.add("sleep:" + millis);
              now[0] += millis;
            },
            () -> now[0],
            () -> events.add("exit"),
            ReactNativeFirebaseCrashlyticsFatalExit.TIMEOUT_MS);

    pool.submit(
            () -> {
              try (MockedStatic<FirebaseCrashlytics> firebaseCrashlytics =
                  mockStatic(FirebaseCrashlytics.class)) {
                firebaseCrashlytics.when(FirebaseCrashlytics::getInstance).thenReturn(crashlytics);
                assertTrue(fatalExit.recordThenTerminate(() -> events.add("record")));
              }
              return null;
            })
        .get(10, TimeUnit.SECONDS);

    assertEquals(Arrays.asList("record", "sleep:2000", "exit"), events);
  }
}
