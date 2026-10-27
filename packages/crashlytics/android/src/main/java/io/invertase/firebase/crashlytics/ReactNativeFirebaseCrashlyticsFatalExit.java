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

import com.google.android.gms.tasks.Tasks;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Records a JS fatal, then terminates the process once the record has been written.
 *
 * <p>{@code FirebaseCrashlytics.recordException} writes asynchronously on SDK worker threads, so
 * exiting right after it usually loses the event. This waits on a barrier that completes after the
 * queued event write, bounded by {@link #TIMEOUT_MS}. On any barrier failure (SDK internals
 * changed, timeout, interruption) it waits out the rest of the bound, then terminates anyway.
 *
 * <p>Must run on a background thread (the TurboModule's native-modules thread), never main.
 */
final class ReactNativeFirebaseCrashlyticsFatalExit {
  static final long TIMEOUT_MS = 2000;

  interface Barrier {
    void await(long timeoutMs) throws Exception;
  }

  interface Sleeper {
    void sleep(long millis) throws InterruptedException;
  }

  interface Clock {
    long nowMillis();
  }

  final Barrier barrier;
  final Sleeper sleeper;
  final Clock clock;
  final Runnable terminator;
  final long timeoutMs;
  private final AtomicBoolean exiting = new AtomicBoolean(false);

  ReactNativeFirebaseCrashlyticsFatalExit(
      Barrier barrier, Sleeper sleeper, Clock clock, Runnable terminator, long timeoutMs) {
    this.barrier = barrier;
    this.sleeper = sleeper;
    this.clock = clock;
    this.terminator = terminator;
    this.timeoutMs = timeoutMs;
  }

  static ReactNativeFirebaseCrashlyticsFatalExit create() {
    return new ReactNativeFirebaseCrashlyticsFatalExit(
        timeoutMs ->
            Tasks.await(
                ReactNativeFirebaseCrashlyticsInternal.pendingEventWritesBarrier(
                    FirebaseCrashlytics.getInstance()),
                timeoutMs,
                TimeUnit.MILLISECONDS),
        Thread::sleep,
        () -> TimeUnit.NANOSECONDS.toMillis(System.nanoTime()),
        // Coverage exception: ends the process, so no test can run it.
        () -> System.exit(0),
        TIMEOUT_MS);
  }

  /**
   * Runs {@code record}, waits (bounded) for it to be written, then terminates, even when {@code
   * record} throws. Returns false without running {@code record} when an earlier call already
   * started terminating.
   */
  boolean recordThenTerminate(Runnable record) {
    if (!exiting.compareAndSet(false, true)) {
      return false;
    }
    try {
      record.run();
    } catch (Throwable recordFailed) {
      // The guard is already set, so terminate anyway rather than leave the app running with
      // every later fatal ignored.
      recordFailed.printStackTrace();
    }
    long deadline = clock.nowMillis() + timeoutMs;
    try {
      barrier.await(timeoutMs);
    } catch (Throwable barrierUnavailable) {
      waitUntil(deadline);
    }
    terminator.run();
    return true;
  }

  private void waitUntil(long deadline) {
    long remaining;
    while ((remaining = deadline - clock.nowMillis()) > 0) {
      try {
        sleeper.sleep(remaining);
      } catch (InterruptedException ignored) {
        // Keep waiting out the bound; the process terminates right after.
      }
    }
  }
}
