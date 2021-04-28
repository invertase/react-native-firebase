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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.SynchronousQueue;

public class TaskExecutorService {
  private static final String MAXIMUM_POOL_SIZE_KEY = "android_task_executor_maximum_pool_size";
  private static final String KEEP_ALIVE_SECONDS_KEY = "android_task_executor_keep_alive_seconds";

  private final String name;
  private final int maximumPoolSize;
  private final int keepAliveSeconds;
  private static final Map<String, ExecutorService> executors = new HashMap<>();

  TaskExecutorService(String name) {
    this.name = name;
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    this.maximumPoolSize = json.getIntValue(MAXIMUM_POOL_SIZE_KEY, 1);
    this.keepAliveSeconds = json.getIntValue(KEEP_ALIVE_SECONDS_KEY, 3);
  }

  public ExecutorService getExecutor() {
    boolean isTransactional = maximumPoolSize <= 1;
    return getExecutor(isTransactional, "");
  }

  public ExecutorService getTransactionalExecutor() {
    return getExecutor(true, "");
  }

  public ExecutorService getTransactionalExecutor(String identifier) {
    String executorIdentifier = maximumPoolSize != 0 ? identifier : "";
    return getExecutor(true, executorIdentifier);
  }

  public ExecutorService getExecutor(boolean isTransactional, String identifier) {
    String executorName = getExecutorName(isTransactional, identifier);
    synchronized(executors) {
      ExecutorService existingExecutor = executors.get(executorName);
      if (existingExecutor == null) {
        ExecutorService newExecutor = getNewExecutor(isTransactional);
        executors.put(executorName, newExecutor);
        return newExecutor;
      }
      return existingExecutor;
    }
  }

  private ExecutorService getNewExecutor(boolean isTransactional) {
    if (isTransactional) {
      return Executors.newSingleThreadExecutor();
    } else {
      ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(0, maximumPoolSize, keepAliveSeconds, TimeUnit.SECONDS, new SynchronousQueue<>());
      threadPoolExecutor.setRejectedExecutionHandler(executeInFallback);
      return threadPoolExecutor;
    }
  }

  private final RejectedExecutionHandler executeInFallback = (r, executor) -> {
    if (executor.isShutdown() || executor.isTerminated() || executor.isTerminating()) {
      return;
    }
    ExecutorService fallbackExecutor = getTransactionalExecutor();
    fallbackExecutor.execute(r);
  };

  public String getExecutorName(boolean isTransactional, String identifier) {
    if (isTransactional) {
      return name + "TransactionalExecutor" + identifier;
    }
    return name + "Executor" + identifier;
  }

  public void shutdown() {
    synchronized(executors) {
      List<String> existingExecutorNames = new ArrayList<>(executors.keySet());
      for (String executorName : existingExecutorNames) {
        if (!executorName.startsWith(name)) {
          executors.remove(executorName);
        } else {
          removeExecutor(executorName);
        }
      }
    }
  }

  public void removeExecutor(String executorName) {
    synchronized(executors) {
      ExecutorService existingExecutor = executors.get(executorName);
      if (existingExecutor != null) {
        existingExecutor.shutdownNow();
        executors.remove(executorName);
      }
    }
  }
}
