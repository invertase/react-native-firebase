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

import java.util.concurrent.ExecutorService
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.RejectedExecutionHandler
import java.util.concurrent.SynchronousQueue
import java.util.concurrent.ThreadPoolExecutor
import java.util.concurrent.TimeUnit

open class TaskExecutorService(
  private val name: String,
) {
  private val maximumPoolSize: Int
  private val keepAliveSeconds: Int

  init {
    val json = ReactNativeFirebaseJSON.getSharedInstance()
    maximumPoolSize = json.getIntValue(MAXIMUM_POOL_SIZE_KEY, 1)
    keepAliveSeconds = json.getIntValue(KEEP_ALIVE_SECONDS_KEY, 3)
  }

  open fun getExecutor(): ExecutorService {
    val isTransactional = maximumPoolSize <= 1
    return getExecutor(isTransactional, "")
  }

  open fun getTransactionalExecutor(): ExecutorService = getExecutor(true, "")

  open fun getTransactionalExecutor(identifier: String): ExecutorService {
    val executorIdentifier = if (maximumPoolSize != 0) identifier else ""
    return getExecutor(true, executorIdentifier)
  }

  open fun getExecutor(
    isTransactional: Boolean,
    identifier: String,
  ): ExecutorService {
    val executorName = getExecutorName(isTransactional, identifier)
    synchronized(executors) {
      val existingExecutor = executors[executorName]
      if (existingExecutor == null) {
        val newExecutor = getNewExecutor(isTransactional)
        executors[executorName] = newExecutor
        return newExecutor
      }
      return existingExecutor
    }
  }

  private fun getNewExecutor(isTransactional: Boolean): ExecutorService {
    if (isTransactional) {
      // A bare Executors.newSingleThreadExecutor() has no rejection handler, so a
      // play-services Task completing after shutdown() (module invalidation racing
      // in-flight work, e.g. App Check attestation or Auth network calls finishing
      // while the React instance is torn down) posts to the dead executor and
      // crashes the process with an uncaught RejectedExecutionException. Use an
      // equivalent single-thread pool that discards work arriving after shutdown.
      return ThreadPoolExecutor(
        1,
        1,
        0L,
        TimeUnit.MILLISECONDS,
        LinkedBlockingQueue(),
      ).apply { rejectedExecutionHandler = discardAfterShutdown }
    }

    return ThreadPoolExecutor(
      0,
      maximumPoolSize,
      keepAliveSeconds.toLong(),
      TimeUnit.SECONDS,
      SynchronousQueue(),
    ).apply { rejectedExecutionHandler = executeInFallback }
  }

  private val executeInFallback =
    RejectedExecutionHandler { runnable, executor ->
      // isShutdown() remains true through the terminating and terminated states,
      // so it is the only check needed to detect work arriving after shutdown.
      if (executor.isShutdown) {
        return@RejectedExecutionHandler
      }
      val fallbackExecutor = getTransactionalExecutor()
      fallbackExecutor.execute(runnable)
    }

  open fun getExecutorName(
    isTransactional: Boolean,
    identifier: String,
  ): String =
    if (isTransactional) {
      "${name}TransactionalExecutor$identifier"
    } else {
      "${name}Executor$identifier"
    }

  open fun shutdown() {
    synchronized(executors) {
      val existingExecutorNames = ArrayList(executors.keys)
      for (executorName in existingExecutorNames) {
        if (!executorName.startsWith(name)) {
          executors.remove(executorName)
        } else {
          removeExecutor(executorName)
        }
      }
    }
  }

  open fun removeExecutor(executorName: String) {
    synchronized(executors) {
      val existingExecutor = executors[executorName]
      if (existingExecutor != null) {
        existingExecutor.shutdownNow()
        executors.remove(executorName)
      }
    }
  }

  private companion object {
    private const val MAXIMUM_POOL_SIZE_KEY = "android_task_executor_maximum_pool_size"
    private const val KEEP_ALIVE_SECONDS_KEY = "android_task_executor_keep_alive_seconds"

    private val executors = HashMap<String, ExecutorService>()

    private val discardAfterShutdown =
      RejectedExecutionHandler { runnable, executor ->
        // isShutdown() remains true through the terminating and terminated states,
        // so it is the only check needed to detect work arriving after shutdown.
        if (executor.isShutdown) {
          return@RejectedExecutionHandler
        }
        // Unreachable with an unbounded queue, but preserve AbortPolicy semantics
        // for any rejection that is not caused by shutdown.
        throw RejectedExecutionException("Task $runnable rejected from $executor")
      }
  }
}
