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

public class ReactNativeFirebaseModule extends ReactContextBaseJavaModule implements ContextProvider {
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
    ExecutorService existingSingleThreadExecutor = executors.get(getName());
    if (existingSingleThreadExecutor != null) return existingSingleThreadExecutor;
    ExecutorService newSingleThreadExecutor = Executors.newSingleThreadExecutor();
    executors.put(getName(), newSingleThreadExecutor);
    return newSingleThreadExecutor;
  }

  @Override
  public void onCatalystInstanceDestroy() {
    ExecutorService existingSingleThreadExecutor = executors.get(getName());
    if (existingSingleThreadExecutor != null) {
      existingSingleThreadExecutor.shutdownNow();
      executors.remove(getName());
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
