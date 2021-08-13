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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.util.Map;

public class ReactNativeFirebasePerfModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "Perf";
  private final UniversalFirebasePerfModule module;

  ReactNativeFirebasePerfModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    this.module = new UniversalFirebasePerfModule(reactContext, SERVICE_NAME);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();
    module.onTearDown();
  }

  @ReactMethod
  public void setPerformanceCollectionEnabled(Boolean enabled, Promise promise) {
    module
        .setPerformanceCollectionEnabled(enabled)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void startTrace(int id, String identifier, Promise promise) {
    module
        .startTrace(id, identifier)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void stopTrace(int id, ReadableMap traceData, Promise promise) {
    module
        .stopTrace(
            id,
            Arguments.toBundle(traceData.getMap("metrics")),
            Arguments.toBundle(traceData.getMap("attributes")))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void startHttpMetric(int id, String url, String httpMethod, Promise promise) {
    module
        .startHttpMetric(id, url, httpMethod)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void stopHttpMetric(int id, ReadableMap metricData, Promise promise) {
    module
        .stopHttpMetric(
            id, Arguments.toBundle(metricData), Arguments.toBundle(metricData.getMap("attributes")))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public Map<String, Object> getConstants() {
    return module.getConstants();
  }
}
