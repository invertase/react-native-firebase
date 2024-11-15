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
import androidx.annotation.CallSuper;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import io.invertase.firebase.interfaces.ContextProvider;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;

public class ReactNativeFirebaseModule extends ReactContextBaseJavaModule
    implements ContextProvider {
  private final TaskExecutorService executorService;

  private String moduleName;

  public ReactNativeFirebaseModule(ReactApplicationContext reactContext, String moduleName) {
    super(reactContext);
    this.moduleName = moduleName;
    this.executorService = new TaskExecutorService(getName());
  }

  public static void rejectPromiseWithExceptionMap(Promise promise, Exception exception) {
    promise.reject(exception, SharedUtils.getExceptionMap(exception));
  }

  public static void rejectPromiseWithCodeAndMessage(
      Promise promise, String code, String message, ReadableMap resolver) {
    WritableMap userInfoMap = Arguments.createMap();
    userInfoMap.putString("code", code);
    userInfoMap.putString("message", message);
    if (resolver != null) {
      userInfoMap.putMap("resolver", resolver);
    }
    promise.reject(code, message, userInfoMap);
  }

  public static void rejectPromiseWithCodeAndMessage(Promise promise, String code, String message) {
    WritableMap userInfoMap = Arguments.createMap();
    userInfoMap.putString("code", code);
    userInfoMap.putString("message", message);
    promise.reject(code, message, userInfoMap);
  }

  public static void rejectPromiseWithCodeAndMessage(
      Promise promise, String code, String message, String nativeErrorMessage) {
    WritableMap userInfoMap = Arguments.createMap();
    userInfoMap.putString("code", code);
    userInfoMap.putString("message", message);
    userInfoMap.putString("nativeErrorMessage", nativeErrorMessage);
    promise.reject(code, message, userInfoMap);
  }

  @Override
  @CallSuper
  public void initialize() {
    super.initialize();
  }

  public ReactContext getContext() {
    return getReactApplicationContext();
  }

  public final ExecutorService getExecutor() {
    return executorService.getExecutor();
  }

  public final ExecutorService getTransactionalExecutor() {
    return executorService.getTransactionalExecutor();
  }

  public final ExecutorService getTransactionalExecutor(String identifier) {
    return executorService.getTransactionalExecutor(identifier);
  }


  // This is no longer called as of react-native 0.74 and is only here for
  // compatibility with older versions. It delegates to thew new `invalidate`
  // method, which all modules should implement now
  // Remove this method when minimum supported react-native is 0.74
  /** @noinspection removal*/
  @SuppressWarnings({"deprecation", "removal"})
  @Deprecated
  public void onCatalystInstanceDestroy() {
    // This should call the child class invalidate, which will then call super.invalidate,
    // and everything will work correctly up and down the inheritance hierarchy to shut down
    invalidate();
  }

  // This should have an @Override annotation but we cannot do
  // that until our minimum supported react-native version is 0.74, since the
  // method did not exist before then
  @CallSuper
  public void invalidate() {
    super.invalidate();
    executorService.shutdown();
  }

  public final void removeEventListeningExecutor(String identifier) {
    String executorName = executorService.getExecutorName(true, identifier);
    executorService.removeExecutor(executorName);
  }

  public Context getApplicationContext() {
    return getReactApplicationContext().getApplicationContext();
  }

  public Activity getActivity() {
    return getCurrentActivity();
  }

  @NonNull
  @Override
  public String getName() {
    return "RNFB" + moduleName + "Module";
  }

  @NonNull
  @Override
  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }
}
