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

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;

import java.util.Map;

public class ReactNativeFirebasePerfModule extends NativeFirebasePerfModuleSpec {
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
  protected Map<String, Object> getTypedExportedConstants() {
    return moduleImpl.getConstants();
  }

  @Override
  public void onCatalystInstanceDestroy() {
    moduleImpl.onCatalystInstanceDestroy();
  }

  @Override
  public void setPerformanceCollectionEnabled(boolean enabled, Promise promise) {
    moduleImpl.setPerformanceCollectionEnabled(enabled, promise);
  }

  @Override
  public void startTrace(double id, String identifier, Promise promise) {
    moduleImpl.startTrace((int)id, identifier, promise);
  }

  @Override
  public void stopTrace(double id, ReadableMap traceData, Promise promise) {
    moduleImpl.stopTrace((int)id, traceData, promise);
  }

  @Override
  public void startScreenTrace(double id, String identifier, Promise promise) {
    moduleImpl.startScreenTrace((int)id, identifier, promise);
  }

  @Override
  public void stopScreenTrace(double id, Promise promise) {
    moduleImpl.stopScreenTrace((int)id, promise);
  }

  @Override
  public void startHttpMetric(double id, String url, String httpMethod, Promise promise) {
    moduleImpl.startHttpMetric((int)id, url, httpMethod, promise);
  }

  @Override
  public void stopHttpMetric(double id, ReadableMap metricData, Promise promise) {
    moduleImpl.stopHttpMetric((int)id, metricData, promise);
  }

  @Override
  public void instrumentationEnabled(boolean enabled, Promise promise) {
    // iOS only
  }
}
