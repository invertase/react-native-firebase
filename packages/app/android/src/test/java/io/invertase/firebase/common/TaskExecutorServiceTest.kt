package io.invertase.firebase.common

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

import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotSame
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.ExecutorService
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.RejectedExecutionHandler
import java.util.concurrent.SynchronousQueue
import java.util.concurrent.ThreadPoolExecutor
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Plain JUnit4 + Mockito (AndroidTest-AD-1). Constructor reads pool sizing from
 * [ReactNativeFirebaseJSON]; stub that away so we never touch Android's unmocked
 * `org.json.JSONObject`.
 */
class TaskExecutorServiceTest {
  private lateinit var jsonObjectField: java.lang.reflect.Field
  private var originalJsonObject: Any? = null
  private val configuration = HashMap<String, Int>()

  @Before
  fun setUp() {
    val jsonObject = mock(JSONObject::class.java)
    `when`(jsonObject.optInt(anyString(), anyInt()))
      .thenAnswer { invocation ->
        configuration[invocation.getArgument(0)] ?: invocation.getArgument(1)
      }
    val json = ReactNativeFirebaseJSON.getSharedInstance()
    jsonObjectField = ReactNativeFirebaseJSON::class.java.getDeclaredField("jsonObject")
    jsonObjectField.isAccessible = true
    originalJsonObject = jsonObjectField.get(json)
    jsonObjectField.set(json, jsonObject)
  }

  @After
  fun tearDown() {
    jsonObjectField.set(ReactNativeFirebaseJSON.getSharedInstance(), originalJsonObject)
    configuration.clear()
  }

  @Test
  fun transactionalExecutorRunsSubmittedWork() {
    val service = TaskExecutorService("TestTransactionalRuns")
    val executor = service.getTransactionalExecutor()
    val latch = CountDownLatch(1)

    executor.execute(latch::countDown)

    assertTrue("work submitted before shutdown runs", latch.await(5, TimeUnit.SECONDS))
    assertSame(executor, service.getExecutor())
    service.shutdown()
  }

  @Test
  fun transactionalExecutorIsSingleThreadedNonDaemonAndOrdered() {
    val service = TaskExecutorService("TestTransactionalSemantics")
    val executor = service.getTransactionalExecutor()
    val firstStarted = CountDownLatch(1)
    val releaseFirst = CountDownLatch(1)
    val finished = CountDownLatch(2)
    val order = Collections.synchronizedList(ArrayList<Int>())
    var threadName = ""
    var daemon = true

    executor.execute {
      threadName = Thread.currentThread().name
      daemon = Thread.currentThread().isDaemon
      order.add(1)
      firstStarted.countDown()
      releaseFirst.await()
      finished.countDown()
    }
    assertTrue(firstStarted.await(5, TimeUnit.SECONDS))
    executor.execute {
      order.add(2)
      finished.countDown()
    }
    assertEquals(listOf(1), order)
    releaseFirst.countDown()

    assertTrue(finished.await(5, TimeUnit.SECONDS))
    assertEquals(listOf(1, 2), order)
    assertTrue(threadName.matches(Regex("pool-\\d+-thread-1")))
    assertFalse(daemon)
    service.shutdown()
  }

  @Test
  fun configuredPooledExecutorPreservesPoolSettingsAndFallbackExecution() {
    configuration["android_task_executor_maximum_pool_size"] = 1
    configuration["android_task_executor_keep_alive_seconds"] = 7
    val service = TaskExecutorService("TestPooledFallback")
    val executor = service.getExecutor(false, "") as ThreadPoolExecutor
    val blockingStarted = CountDownLatch(1)
    val releaseBlocking = CountDownLatch(1)
    val fallbackRan = CountDownLatch(1)

    executor.execute {
      blockingStarted.countDown()
      releaseBlocking.await()
    }
    assertTrue(blockingStarted.await(5, TimeUnit.SECONDS))
    executor.execute(fallbackRan::countDown)

    assertTrue(fallbackRan.await(5, TimeUnit.SECONDS))
    assertEquals(0, executor.corePoolSize)
    assertEquals(1, executor.maximumPoolSize)
    assertEquals(7L, executor.getKeepAliveTime(TimeUnit.SECONDS))
    assertTrue(executor.queue is SynchronousQueue<*>)
    releaseBlocking.countDown()
    service.shutdown()
  }

  @Test
  fun defaultExecutorUsesConfiguredPoolWhenMaximumExceedsOne() {
    configuration["android_task_executor_maximum_pool_size"] = 2
    val service = TaskExecutorService("TestDefaultPool")

    val executor = service.getExecutor() as ThreadPoolExecutor

    assertEquals(0, executor.corePoolSize)
    assertEquals(2, executor.maximumPoolSize)
    assertTrue(executor.queue is SynchronousQueue<*>)
    service.shutdown()
  }

  @Test
  fun transactionalIdentifiersAreCachedAndDistinctWhenPoolingEnabled() {
    val service = TaskExecutorService("TestIdentifiers")
    val first = service.getTransactionalExecutor("one")

    assertSame(first, service.getTransactionalExecutor("one"))
    assertNotSame(first, service.getTransactionalExecutor("two"))
    service.shutdown()
  }

  @Test
  fun transactionalIdentifierIsIgnoredWhenPoolingDisabled() {
    configuration["android_task_executor_maximum_pool_size"] = 0
    val service = TaskExecutorService("TestZeroPool")

    assertSame(
      service.getTransactionalExecutor("one"),
      service.getTransactionalExecutor("two"),
    )
    service.shutdown()
  }

  @Test
  fun executorNamesPreserveTransactionalAndPooledShapes() {
    val service = TaskExecutorService("TestNames")

    assertEquals("TestNamesTransactionalExecutorid", service.getExecutorName(true, "id"))
    assertEquals("TestNamesExecutorid", service.getExecutorName(false, "id"))
    service.shutdown()
  }

  @Test
  fun concurrentLookupReturnsOneSharedExecutor() {
    val service = TaskExecutorService("TestConcurrentLookup")
    val start = CountDownLatch(1)
    val done = CountDownLatch(2)
    val executors = Collections.synchronizedList(ArrayList<ExecutorService>())
    val threads =
      List(2) {
        Thread {
          start.await()
          executors.add(service.getTransactionalExecutor())
          done.countDown()
        }
      }

    threads.forEach(Thread::start)
    start.countDown()

    assertTrue(done.await(5, TimeUnit.SECONDS))
    assertSame(executors[0], executors[1])
    service.shutdown()
  }

  @Test
  fun removeExecutorShutsDownKnownExecutorAndIgnoresMissingName() {
    val service = TaskExecutorService("TestRemove")
    val executor = service.getTransactionalExecutor()

    service.removeExecutor("missing")
    assertFalse(executor.isShutdown)
    service.removeExecutor(service.getExecutorName(true, ""))

    assertTrue(executor.isShutdown)
  }

  @Test
  fun shutdownShutsDownOwnExecutorsAndOnlyRemovesForeignMapping() {
    val foreignService = TaskExecutorService("TestForeign")
    val foreignExecutor = foreignService.getTransactionalExecutor()
    val service = TaskExecutorService("TestShutdown")
    val ownExecutor = service.getTransactionalExecutor()

    service.shutdown()

    assertTrue(ownExecutor.isShutdown)
    assertFalse(foreignExecutor.isShutdown)
    assertNotSame(foreignExecutor, foreignService.getTransactionalExecutor())
    foreignExecutor.shutdownNow()
    foreignService.shutdown()
  }

  @Test
  fun transactionalExecutorUsesUnboundedQueueAndAbortSemanticsBeforeShutdown() {
    val service = TaskExecutorService("TestTransactionalShape")
    val executor = service.getTransactionalExecutor() as ThreadPoolExecutor

    assertEquals(1, executor.corePoolSize)
    assertEquals(1, executor.maximumPoolSize)
    assertTrue(executor.queue is LinkedBlockingQueue<*>)

    val field = TaskExecutorService::class.java.getDeclaredField("discardAfterShutdown")
    field.isAccessible = true
    val handler = field.get(null) as RejectedExecutionHandler
    try {
      handler.rejectedExecution({}, executor)
      fail("expected RejectedExecutionException")
    } catch (exception: RejectedExecutionException) {
      assertTrue(exception.message!!.contains("rejected from"))
    }
    service.shutdown()
  }

  @Test
  fun transactionalExecutorDiscardsWorkSubmittedAfterShutdown() {
    val service = TaskExecutorService("TestTransactionalShutdown")
    val executor = service.getTransactionalExecutor()
    service.shutdown()
    val ran = AtomicBoolean(false)

    // Must not throw RejectedExecutionException - this is the crash path hit when a
    // play-services Task completes after module invalidation has shut the executor down.
    executor.execute { ran.set(true) }

    assertFalse("work submitted after shutdown is discarded", ran.get())
  }

  @Test
  fun pooledExecutorDiscardsWorkSubmittedAfterShutdown() {
    val service = TaskExecutorService("TestPooledShutdown")
    val executor = service.getExecutor(false, "")
    service.shutdown()
    val ran = AtomicBoolean(false)

    // Exercises the executeInFallback handler's shutdown guard.
    executor.execute { ran.set(true) }

    assertFalse("work submitted after shutdown is discarded", ran.get())
  }
}
