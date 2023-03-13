package io.invertase.firebase.analytics;

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

import javax.annotation.Nullable;

public class ReactNativeFirebaseAnalyticsModule extends ReactContextBaseJavaModule {
  private final ReactNativeFirebaseAnalyticsModuleImpl moduleImpl;

  ReactNativeFirebaseAnalyticsModule(ReactApplicationContext reactContext) {
    super(reactContext);

    moduleImpl = new ReactNativeFirebaseAnalyticsModuleImpl(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return moduleImpl.getName();
  }

  @ReactMethod
  public void logEvent(String name, @Nullable ReadableMap params, Promise promise) {
    moduleImpl.logEvent(name, params, promise);
  }

  @ReactMethod
  public void setAnalyticsCollectionEnabled(Boolean enabled, Promise promise) {
    moduleImpl.setAnalyticsCollectionEnabled(enabled, promise);
  }

  @ReactMethod
  public void setSessionTimeoutDuration(double milliseconds, Promise promise) {
    moduleImpl.setSessionTimeoutDuration(milliseconds, promise);
  }

  @ReactMethod
  public void getAppInstanceId(Promise promise) {
    moduleImpl.getAppInstanceId(promise);
  }

  @ReactMethod
  public void setUserId(String id, Promise promise) {
    moduleImpl.setUserId(id, promise);
  }

  @ReactMethod
  public void setUserProperty(String name, String value, Promise promise) {
    moduleImpl.setUserProperty(name, value, promise);
  }

  @ReactMethod
  public void setUserProperties(ReadableMap properties, Promise promise) {
    moduleImpl.setUserProperties(properties, promise);
  }

  @ReactMethod
  public void resetAnalyticsData(Promise promise) {
    moduleImpl.resetAnalyticsData(promise);
  }

  @ReactMethod
  public void setDefaultEventParameters(@Nullable ReadableMap params, Promise promise) {
    moduleImpl.setDefaultEventParameters(params, promise);
  }
}
