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

import android.content.Context;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.SynchronousQueue;

import javax.annotation.OverridingMethodsMustInvokeSuper;

public class UniversalFirebaseModule {
  private static Map<String, ExecutorService> executors = new HashMap<>();

  private final Context context;
  private final String serviceName;

  protected UniversalFirebaseModule(Context context, String serviceName) {
    this.context = context;
    this.serviceName = serviceName;
  }

  public Context getContext() {
    return context;
  }

  public Context getApplicationContext() {
    return getContext().getApplicationContext();
  }

  protected ExecutorService getExecutor() {
    return getExecutor(false);
  }

  protected ExecutorService getTransactionalExecutor() {
    return getExecutor(true);
  }

  private ExecutorService getExecutor(boolean isTransactional) {
    String executorName = getExecutorName(isTransactional);
    ExecutorService existingExecutor = executors.get(executorName);
    if (existingExecutor != null) return existingExecutor;
    ExecutorService newExecutor = getNewExecutor(isTransactional);
    executors.put(executorName, newExecutor);
    return newExecutor;
  }

  private ExecutorService getNewExecutor(boolean isTransactional) {
    if (isTransactional == true) {
      return new ThreadPoolExecutor(0, 1, 60L, TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>());
    } else {
      return new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS, new SynchronousQueue<Runnable>());
    }
  }

  private String getExecutorName(Boolean isTransactional) {
    String moduleName = getName();
    if (isTransactional == true) {
      return moduleName + "TransactionalExecutor";
    }
    return moduleName + "Executor";
  }

  public String getName() {
    return "Universal" + serviceName + "Module";
  }

  @OverridingMethodsMustInvokeSuper
  public void onTearDown() {
    String singleThreadExecutorName = getExecutorName(false);
    ExecutorService existingSingleThreadExecutor = executors.get(singleThreadExecutorName);
    if (existingSingleThreadExecutor != null) {
      existingSingleThreadExecutor.shutdownNow();
      executors.remove(singleThreadExecutorName);
    }

    String threadPoolExecutorName = getExecutorName(false);
    ExecutorService existingThreadPoolExecutor = executors.get(threadPoolExecutorName);
    if (existingThreadPoolExecutor != null) {
      existingThreadPoolExecutor.shutdownNow();
      executors.remove(threadPoolExecutorName);
    }
  }

  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }
}
