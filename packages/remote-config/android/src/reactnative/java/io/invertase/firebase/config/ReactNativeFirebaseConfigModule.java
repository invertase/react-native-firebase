package io.invertase.firebase.config;

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

import com.facebook.react.bridge.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigFetchThrottledException;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import javax.annotation.Nullable;
import java.util.HashMap;
import java.util.Map;

public class ReactNativeFirebaseConfigModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "Config";
  private final UniversalFirebaseConfigModule module;

  ReactNativeFirebaseConfigModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseConfigModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void activate(String appName, Promise promise) {
    module.activate(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(task.getResult()));
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void fetch(String appName, double expirationDurationSeconds, Promise promise) {
    module.fetch(appName, (long) expirationDurationSeconds).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(task.getResult()));
      } else {
        rejectPromiseWithConfigException(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void fetchAndActivate(String appName, Promise promise) {
    module.fetchAndActivate(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(task.getResult()));
      } else {
        rejectPromiseWithConfigException(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void reset(String appName, Promise promise) {
    module.reset(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(task.getResult()));
      } else {
        rejectPromiseWithConfigException(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void setConfigSettings(String appName, ReadableMap configSettings, Promise promise) {
    module.setConfigSettings(appName, Arguments.toBundle(configSettings)).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(task.getResult()));
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void setDefaults(String appName, ReadableMap defaults, Promise promise) {
    module.setDefaults(appName, defaults.toHashMap()).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(task.getResult()));
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void setDefaultsFromResource(String appName, String resourceName, Promise promise) {
    module.setDefaultsFromResource(appName, resourceName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(task.getResult()));
      } else {
        Exception exception = task.getException();
        if (exception != null && exception.getMessage().equals("resource_not_found")) {
          rejectPromiseWithCodeAndMessage(promise, "resource_not_found", "The specified resource name was not found.");
        }
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void ensureInitialized(String appName, Promise promise) {
    module.ensureInitialized(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(resultWithConstants(null));
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  private WritableMap resultWithConstants(Object result) {
    Map<String, Object> responseMap = new HashMap<>(2);
    responseMap.put("result", result);
    responseMap.put("constants", module.getConstantsForApp(FirebaseApp.DEFAULT_APP_NAME));
    return Arguments.makeNativeMap(responseMap);
  }

  private void rejectPromiseWithConfigException(Promise promise, @Nullable Exception exception) {
    if (exception == null) {
      rejectPromiseWithCodeAndMessage(promise, "unknown",
          "Operation cannot be completed successfully, due to an unknown error.");
      return;
    }

    if (exception.getCause() instanceof FirebaseRemoteConfigFetchThrottledException) {
      rejectPromiseWithCodeAndMessage(promise, "throttled",
          "fetch() operation cannot be completed successfully, due to throttling.", exception.getMessage());
    } else {
      rejectPromiseWithCodeAndMessage(promise, "failure", "fetch() operation cannot be completed successfully.",
          exception.getMessage());
    }
  }

  @Override
  public Map<String, Object> getConstants() {
    return module.getConstants();
  }
}