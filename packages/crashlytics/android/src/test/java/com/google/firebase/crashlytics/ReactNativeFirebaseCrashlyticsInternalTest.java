package com.google.firebase.crashlytics;

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
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.crashlytics.internal.common.CrashlyticsCore;
import com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorkers;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;

/**
 * JVM coverage for {@link ReactNativeFirebaseCrashlyticsInternal} against the real Crashlytics
 * worker classes. Robolectric supplies the Android runtime the SDK classes load against;
 * AndroidTest-AD-1. {@code Tasks.await} must not run on the (Robolectric) main thread, so waits
 * happen on a pool thread.
 */
@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseCrashlyticsInternalTest {
  private final ExecutorService pool = Executors.newCachedThreadPool();

  @After
  public void tearDown() {
    pool.shutdownNow();
  }

  /** A FirebaseCrashlytics whose core uses {@code workers}; package-visible for other tests. */
  public static FirebaseCrashlytics crashlyticsWith(CrashlyticsWorkers workers) throws Exception {
    CrashlyticsCore core = mock(CrashlyticsCore.class);
    Field field = CrashlyticsCore.class.getDeclaredField("crashlyticsWorkers");
    field.setAccessible(true);
    field.set(core, workers);
    return crashlyticsWithCore(core);
  }

  private static FirebaseCrashlytics crashlyticsWithCore(CrashlyticsCore core) throws Exception {
    Constructor<FirebaseCrashlytics> constructor =
        FirebaseCrashlytics.class.getDeclaredConstructor(CrashlyticsCore.class);
    constructor.setAccessible(true);
    return constructor.newInstance(core);
  }

  private <T> T awaitOnPool(Task<T> task) throws Exception {
    return pool.submit(() -> Tasks.await(task, 5, TimeUnit.SECONDS)).get(10, TimeUnit.SECONDS);
  }

  @Test
  public void barrier_completesAfterAnEventWriteQueuedByAnEarlierCommonTask() throws Exception {
    CrashlyticsWorkers workers = new CrashlyticsWorkers(pool, pool);
    CountDownLatch barrierCreated = new CountDownLatch(1);
    AtomicBoolean eventWritten = new AtomicBoolean(false);

    // Same shape as CrashlyticsCore.logException → SessionReportingCoordinator.persistEvent: a
    // common task that queues the actual write on diskWrite.
    workers.common.submit(
        () -> {
          try {
            barrierCreated.await(5, TimeUnit.SECONDS);
          } catch (InterruptedException e) {
            throw new IllegalStateException(e);
          }
          workers.diskWrite.submit(
              () -> {
                try {
                  Thread.sleep(150);
                } catch (InterruptedException e) {
                  throw new IllegalStateException(e);
                }
                eventWritten.set(true);
              });
        });

    Task<Void> barrier =
        ReactNativeFirebaseCrashlyticsInternal.pendingEventWritesBarrier(crashlyticsWith(workers));
    assertFalse(barrier.isComplete());
    barrierCreated.countDown();

    awaitOnPool(barrier);
    assertTrue(eventWritten.get());
  }

  @Test
  public void barrier_nullCore_throws() throws Exception {
    FirebaseCrashlytics crashlytics = crashlyticsWithCore(null);
    assertThrows(
        NullPointerException.class,
        () -> ReactNativeFirebaseCrashlyticsInternal.pendingEventWritesBarrier(crashlytics));
  }

  @Test
  public void workersOf_unsetWorkersField_throws() {
    CrashlyticsCore core = mock(CrashlyticsCore.class);
    assertThrows(
        NullPointerException.class, () -> ReactNativeFirebaseCrashlyticsInternal.workersOf(core));
  }

  @Test
  public void findField_byName_onTheRealSdkClass() throws Exception {
    Field field =
        ReactNativeFirebaseCrashlyticsInternal.findField(
            CrashlyticsCore.class,
            ReactNativeFirebaseCrashlyticsInternal.WORKERS_FIELD_NAME,
            CrashlyticsWorkers.class);
    assertEquals("crashlyticsWorkers", field.getName());
    assertSame(CrashlyticsWorkers.class, field.getType());
  }

  @SuppressWarnings("unused")
  private static final class RenamedWorkersField {
    private String unrelated;
    private CrashlyticsWorkers a;
  }

  @SuppressWarnings("unused")
  private static final class NoWorkersField {
    private String unrelated;
  }

  @Test
  public void findField_fallsBackToTheFieldTypeWhenRenamed() throws Exception {
    Field field =
        ReactNativeFirebaseCrashlyticsInternal.findField(
            RenamedWorkersField.class, "crashlyticsWorkers", CrashlyticsWorkers.class);
    assertEquals("a", field.getName());
  }

  @Test
  public void findField_missing_throwsTheByNameFailure() {
    NoSuchFieldException thrown =
        assertThrows(
            NoSuchFieldException.class,
            () ->
                ReactNativeFirebaseCrashlyticsInternal.findField(
                    NoWorkersField.class, "crashlyticsWorkers", CrashlyticsWorkers.class));
    assertEquals("crashlyticsWorkers", thrown.getMessage());
  }
}
