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
import com.facebook.fbreact.specs.NativeRNFBTurboPerfSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import java.util.Map;

public class NativeRNFBTurboPerf extends NativeRNFBTurboPerfSpec {
  private static final String SERVICE_NAME = "Perf";
  private final UniversalFirebasePerfModule module;

  public NativeRNFBTurboPerf(ReactApplicationContext reactContext) {
    super(reactContext);
    this.module = new UniversalFirebasePerfModule(reactContext, SERVICE_NAME);
  }

  @Override
  public void invalidate() {
    super.invalidate();
    module.onTearDown();
  }

  @Override
  protected Map<String, Object> getTypedExportedConstants() {
    return module.getConstants();
  }

  @Override
  public void setPerformanceCollectionEnabled(boolean enabled, Promise promise) {
    module
        .setPerformanceCollectionEnabled(enabled)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                promise.reject(task.getException());
              }
            });
  }

  @Override
  public void instrumentationEnabled(boolean enabled, Promise promise) {
    promise.resolve(null);
  }

  @Override
  public void startTrace(double id, String identifier, Promise promise) {
    module
        .startTrace((int) id, identifier)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                promise.reject(task.getException());
              }
            });
  }

  @Override
  public void stopTrace(double id, ReadableMap traceData, Promise promise) {
    module
        .stopTrace(
            (int) id,
            Arguments.toBundle(traceData.getMap("metrics")),
            Arguments.toBundle(traceData.getMap("attributes")))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                promise.reject(task.getException());
              }
            });
  }

  @Override
  public void startScreenTrace(double id, String identifier, Promise promise) {
    Activity currentActivity = getCurrentActivity();

    if (currentActivity == null) {
      promise.resolve(null);
      return;
    }

    module
        .startScreenTrace(currentActivity, (int) id, identifier)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                promise.reject(task.getException());
              }
            });
  }

  @Override
  public void stopScreenTrace(double id, Promise promise) {
    module
        .stopScreenTrace((int) id)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                promise.reject(task.getException());
              }
            });
  }

  @Override
  public void startHttpMetric(double id, String url, String httpMethod, Promise promise) {
    module
        .startHttpMetric((int) id, url, httpMethod)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                promise.reject(task.getException());
              }
            });
  }

  @Override
  public void stopHttpMetric(double id, ReadableMap metricData, Promise promise) {
    module
        .stopHttpMetric(
            (int) id, Arguments.toBundle(metricData), Arguments.toBundle(metricData.getMap("attributes")))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                promise.reject(task.getException());
              }
            });
  }
}
