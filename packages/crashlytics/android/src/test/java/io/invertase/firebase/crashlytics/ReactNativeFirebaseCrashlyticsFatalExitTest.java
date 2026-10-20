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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;
import org.junit.Test;

/**
 * Plain JUnit (AndroidTest-AD-1) for the JS-fatal record → barrier → terminate ordering. A fake
 * clock/sleeper/terminator stand in for time and {@code System.exit}, so no test ends the JVM.
 */
public class ReactNativeFirebaseCrashlyticsFatalExitTest {
  private static final long TIMEOUT = 2000;

  private final List<String> events = Collections.synchronizedList(new ArrayList<>());
  private final List<Long> sleeps = new ArrayList<>();
  private long now = 10_000;

  private ReactNativeFirebaseCrashlyticsFatalExit fatalExit(
      ReactNativeFirebaseCrashlyticsFatalExit.Barrier barrier,
      ReactNativeFirebaseCrashlyticsFatalExit.Sleeper sleeper) {
    return new ReactNativeFirebaseCrashlyticsFatalExit(
        barrier, sleeper, () -> now, () -> events.add("exit"), TIMEOUT);
  }

  private ReactNativeFirebaseCrashlyticsFatalExit.Sleeper advancingSleeper() {
    return millis -> {
      sleeps.add(millis);
      now += millis;
    };
  }

  @Test
  public void barrierSuccess_terminatesAfterRecordAndBarrierWithoutWaiting() {
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        fatalExit(
            timeoutMs -> {
              assertEquals(TIMEOUT, timeoutMs);
              events.add("barrier");
            },
            advancingSleeper());

    assertTrue(fatalExit.recordThenTerminate(() -> events.add("record")));

    assertEquals(Arrays.asList("record", "barrier", "exit"), events);
    assertTrue(sleeps.isEmpty());
  }

  @Test
  public void recordThrows_stillWaitsOnBarrierAndTerminates() {
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        fatalExit(timeoutMs -> events.add("barrier"), advancingSleeper());

    assertTrue(
        fatalExit.recordThenTerminate(
            () -> {
              events.add("record");
              throw new IllegalStateException("record failed");
            }));

    assertEquals(Arrays.asList("record", "barrier", "exit"), events);
    assertFalse(fatalExit.recordThenTerminate(() -> events.add("second")));
    assertEquals(Arrays.asList("record", "barrier", "exit"), events);
  }

  @Test
  public void barrierTimeout_terminatesOnceTheBoundHasElapsed() {
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        fatalExit(
            timeoutMs -> {
              now += timeoutMs;
              throw new TimeoutException("barrier timed out");
            },
            advancingSleeper());

    assertTrue(fatalExit.recordThenTerminate(() -> events.add("record")));

    assertEquals(Arrays.asList("record", "exit"), events);
    assertTrue("bound already used up by the barrier", sleeps.isEmpty());
  }

  @Test
  public void reflectionFailure_waitsOutTheRemainingBoundThenTerminates() {
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        fatalExit(
            timeoutMs -> {
              now += 300;
              throw new NoSuchFieldException("crashlyticsWorkers");
            },
            advancingSleeper());

    assertTrue(fatalExit.recordThenTerminate(() -> events.add("record")));

    assertEquals(Collections.singletonList(TIMEOUT - 300), sleeps);
    assertEquals(Arrays.asList("record", "exit"), events);
  }

  @Test
  public void linkageError_fallsBackToTheBoundedWait() {
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        fatalExit(
            timeoutMs -> {
              throw new NoSuchFieldError("core");
            },
            advancingSleeper());

    assertTrue(fatalExit.recordThenTerminate(() -> events.add("record")));

    assertEquals(Collections.singletonList(TIMEOUT), sleeps);
    assertEquals(Arrays.asList("record", "exit"), events);
  }

  @Test
  public void interruptedFallbackWait_keepsWaitingUntilTheBound() {
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        fatalExit(
            timeoutMs -> {
              throw new InterruptedException("barrier interrupted");
            },
            millis -> {
              sleeps.add(millis);
              if (sleeps.size() == 1) {
                now += 500;
                throw new InterruptedException("sleep interrupted");
              }
              now += millis;
            });

    assertTrue(fatalExit.recordThenTerminate(() -> events.add("record")));

    assertEquals(Arrays.asList(TIMEOUT, TIMEOUT - 500), sleeps);
    assertEquals(Arrays.asList("record", "exit"), events);
  }

  @Test
  public void secondFatalWhileTerminating_neitherRecordsNorTerminatesAgain() {
    ReactNativeFirebaseCrashlyticsFatalExit[] holder =
        new ReactNativeFirebaseCrashlyticsFatalExit[1];
    List<Boolean> nestedResults = new ArrayList<>();
    holder[0] =
        fatalExit(
            timeoutMs -> {
              // A second JS fatal arrives while the first one is waiting on the barrier.
              nestedResults.add(holder[0].recordThenTerminate(() -> events.add("record-2")));
            },
            advancingSleeper());

    assertTrue(holder[0].recordThenTerminate(() -> events.add("record-1")));
    assertFalse(holder[0].recordThenTerminate(() -> events.add("record-3")));

    assertEquals(Collections.singletonList(false), nestedResults);
    assertEquals(Arrays.asList("record-1", "exit"), events);
  }

  @Test
  public void create_wiresTheProductionTimeoutClockAndSleeper() throws Exception {
    ReactNativeFirebaseCrashlyticsFatalExit fatalExit =
        ReactNativeFirebaseCrashlyticsFatalExit.create();

    assertEquals(2000, ReactNativeFirebaseCrashlyticsFatalExit.TIMEOUT_MS);
    assertEquals(ReactNativeFirebaseCrashlyticsFatalExit.TIMEOUT_MS, fatalExit.timeoutMs);
    long before = fatalExit.clock.nowMillis();
    fatalExit.sleeper.sleep(5);
    assertTrue(fatalExit.clock.nowMillis() >= before + 5);
  }
}
