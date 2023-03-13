package io.invertase.firebase.perf;

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

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.Map;

public class ReactNativeFirebasePerfModule extends ReactContextBaseJavaModule {
  private final ReactNativeFirebasePerfModuleImpl moduleImpl;

  ReactNativeFirebasePerfModule(ReactApplicationContext reactContext) {
    super(reactContext);
    moduleImpl = new ReactNativeFirebasePerfModuleImpl(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return moduleImpl.getName();
  }

  @Override
  public void onCatalystInstanceDestroy() {
    moduleImpl.onCatalystInstanceDestroy();
  }

  @ReactMethod
  public void setPerformanceCollectionEnabled(Boolean enabled, Promise promise) {
    moduleImpl.setPerformanceCollectionEnabled(enabled, promise);
  }

  @ReactMethod
  public void startTrace(int id, String identifier, Promise promise) {
    moduleImpl.startTrace(id, identifier, promise);
  }

  @ReactMethod
  public void stopTrace(int id, ReadableMap traceData, Promise promise) {
    moduleImpl.stopTrace(id, traceData, promise);
  }

  @ReactMethod
  public void startScreenTrace(int id, String identifier, Promise promise) {
    moduleImpl.startScreenTrace(id, identifier, promise);
  }

  @ReactMethod
  public void stopScreenTrace(int id, Promise promise) {
    moduleImpl.stopScreenTrace(id, promise);
  }

  @ReactMethod
  public void startHttpMetric(int id, String url, String httpMethod, Promise promise) {
    moduleImpl.startHttpMetric(id, url, httpMethod, promise);
  }

  @ReactMethod
  public void stopHttpMetric(int id, ReadableMap metricData, Promise promise) {
    moduleImpl.stopHttpMetric(id, metricData, promise);
  }

  @Override
  public Map<String, Object> getConstants() {
    return moduleImpl.getConstants();
  }
}
