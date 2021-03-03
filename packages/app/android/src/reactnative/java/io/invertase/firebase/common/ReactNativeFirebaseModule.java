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

import android.app.Activity;
import android.content.Context;
import com.facebook.react.bridge.*;
import io.invertase.firebase.interfaces.ContextProvider;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.SynchronousQueue;

public class ReactNativeFirebaseModule extends ReactContextBaseJavaModule implements ContextProvider {
  private static final int MAXIMUM_POOL_SIZE = 20;
  private static final int KEEP_ALIVE_SECONDS = 3;
  private static Map<String, ExecutorService> executors = new HashMap<>();
  private String moduleName;

  public ReactNativeFirebaseModule(
    ReactApplicationContext reactContext,
    String moduleName
  ) {
    super(reactContext);
    this.moduleName = moduleName;
  }

  public static void rejectPromiseWithExceptionMap(Promise promise, Exception exception) {
    promise.reject(exception, SharedUtils.getExceptionMap(exception));
  }

  public static void rejectPromiseWithCodeAndMessage(Promise promise, String code, String message) {
    WritableMap userInfoMap = Arguments.createMap();
    userInfoMap.putString("code", code);
    userInfoMap.putString("message", message);
    promise.reject(code, message, userInfoMap);
  }

  public static void rejectPromiseWithCodeAndMessage(
    Promise promise,
    String code,
    String message,
    String nativeErrorMessage
  ) {
    WritableMap userInfoMap = Arguments.createMap();
    userInfoMap.putString("code", code);
    userInfoMap.putString("message", message);
    userInfoMap.putString("nativeErrorMessage", nativeErrorMessage);
    promise.reject(code, message, userInfoMap);
  }

  @Override
  public void initialize() {
    super.initialize();
  }

  public ReactContext getContext() {
    return getReactApplicationContext();
  }

  public ExecutorService getExecutor() {
    return getExecutor(false);
  }

  public ExecutorService getTransactionalExecutor() {
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
      return Executors.newSingleThreadExecutor();
    } else {
      ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(0, MAXIMUM_POOL_SIZE, KEEP_ALIVE_SECONDS, TimeUnit.SECONDS, new SynchronousQueue<Runnable>());
      threadPoolExecutor.setRejectedExecutionHandler(executeInFallback);
      return threadPoolExecutor;
    }
  }

  private RejectedExecutionHandler executeInFallback = new RejectedExecutionHandler() {
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
      ExecutorService fallbackExecutor = getTransactionalExecutor();
      fallbackExecutor.execute(r);
    };
  };

  private String getExecutorName(boolean isTransactional) {
    String moduleName = getName();
    if (isTransactional == true) {
      return moduleName + "TransactionalExecutor";
    }
    return moduleName + "Executor";
  }

  @Override
  public void onCatalystInstanceDestroy() {
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

  public Context getApplicationContext() {
    return getReactApplicationContext().getApplicationContext();
  }

  public Activity getActivity() {
    return getCurrentActivity();
  }

  @Nonnull
  @Override
  public String getName() {
    return "RNFB" + moduleName + "Module";
  }

  @Override
  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }
}
