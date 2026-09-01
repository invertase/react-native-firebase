package io.invertase.firebase.common;

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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedStatic;

/**
 * Plain JUnit4 + Mockito (AndroidTest-AD-1). Constructor reads pool sizing from {@link
 * ReactNativeFirebaseJSON}; stub that away so we never touch Android's unmocked {@code
 * org.json.JSONObject}.
 */
public class TaskExecutorServiceTest {

  private MockedStatic<ReactNativeFirebaseJSON> jsonStatic;

  @Before
  public void setUp() {
    ReactNativeFirebaseJSON json = mock(ReactNativeFirebaseJSON.class);
    when(json.getIntValue(anyString(), anyInt())).thenAnswer(inv -> inv.getArgument(1));
    jsonStatic = mockStatic(ReactNativeFirebaseJSON.class);
    jsonStatic.when(ReactNativeFirebaseJSON::getSharedInstance).thenReturn(json);
  }

  @After
  public void tearDown() {
    jsonStatic.close();
  }

  @Test
  public void transactionalExecutorRunsSubmittedWork() throws Exception {
    TaskExecutorService service = new TaskExecutorService("TestTransactionalRuns");
    ExecutorService executor = service.getTransactionalExecutor();
    CountDownLatch latch = new CountDownLatch(1);

    executor.execute(latch::countDown);

    assertTrue("work submitted before shutdown runs", latch.await(5, TimeUnit.SECONDS));
    service.shutdown();
  }

  @Test
  public void transactionalExecutorDiscardsWorkSubmittedAfterShutdown() {
    TaskExecutorService service = new TaskExecutorService("TestTransactionalShutdown");
    ExecutorService executor = service.getTransactionalExecutor();
    service.shutdown();
    AtomicBoolean ran = new AtomicBoolean(false);

    // Must not throw RejectedExecutionException - this is the crash path hit when a
    // play-services Task completes after module invalidation has shut the executor down.
    executor.execute(() -> ran.set(true));

    assertFalse("work submitted after shutdown is discarded", ran.get());
  }

  @Test
  public void pooledExecutorDiscardsWorkSubmittedAfterShutdown() {
    TaskExecutorService service = new TaskExecutorService("TestPooledShutdown");
    ExecutorService executor = service.getExecutor(false, "");
    service.shutdown();
    AtomicBoolean ran = new AtomicBoolean(false);

    // Exercises the executeInFallback handler's shutdown guard.
    executor.execute(() -> ran.set(true));

    assertFalse("work submitted after shutdown is discarded", ran.get());
  }
}
