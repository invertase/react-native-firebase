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

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.Map;

public class ReactNativeFirebaseCrashlyticsModule extends ReactContextBaseJavaModule {
  private final ReactNativeFirebaseCrashlyticsModuleImpl moduleImpl;

  ReactNativeFirebaseCrashlyticsModule(ReactApplicationContext reactContext) {
    moduleImpl = new ReactNativeFirebaseCrashlyticsModuleImpl(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return moduleImpl.getName();
  }

  @ReactMethod
  public void checkForUnsentReports(Promise promise) {
    moduleImpl.checkForUnsentReports(promise);
  }

  @ReactMethod
  public void crashWithStackPromise(ReadableMap jsErrorMap, Promise promise) {
    moduleImpl.crashWithStackPromise(jsErrorMap, promise);
  }

  @ReactMethod
  public void crash() {
    moduleImpl.crash();
  }

  @ReactMethod
  public void deleteUnsentReports() {
   moduleImpl.deleteUnsentReports();
  }

  @ReactMethod
  public void didCrashOnPreviousExecution(Promise promise) {
    moduleImpl.didCrashOnPreviousExecution(promise);
  }

  @ReactMethod
  public void log(String message) {
    moduleImpl.log(message);
  }

  // For internal use only.
  @ReactMethod
  public void logPromise(String message, Promise promise) {
    moduleImpl.logPromise(message, promise);
  }

  @ReactMethod
  public void setAttribute(String key, String value, Promise promise) {
    moduleImpl.setAttribute(key, value, promise);
  }

  @ReactMethod
  public void setAttributes(ReadableMap keyValuesMap, Promise promise) {
    moduleImpl.setAttributes(keyValuesMap, promise);
  }

  @ReactMethod
  public void sendUnsentReports() {
    moduleImpl.sendUnsentReports();
  }

  @ReactMethod
  public void setUserId(String userId, Promise promise) {
    moduleImpl.setUserId(userId, promise);
  }

  @ReactMethod
  public void setCrashlyticsCollectionEnabled(Boolean enabled, Promise promise) {
    moduleImpl.setCrashlyticsCollectionEnabled(enabled, promise);
  }

  @ReactMethod
  public void recordError(ReadableMap jsErrorMap) {
    moduleImpl.recordError(jsErrorMap);
  }

  @ReactMethod
  public void recordErrorPromise(ReadableMap jsErrorMap, Promise promise) {
    moduleImpl.recordErrorPromise(jsErrorMap, promise);
  }

  @Override
  public Map<String, Object> getConstants() {
    return moduleImpl.getConstants();
  }
}
