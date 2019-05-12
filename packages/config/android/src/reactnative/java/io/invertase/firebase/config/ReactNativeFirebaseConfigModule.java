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

import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigFetchThrottledException;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseConfigModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "RemoteConfig";
  private final UniversalFirebaseConfigModule module;

  ReactNativeFirebaseConfigModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseConfigModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void activateFetched(Promise promise) {
    module.activateFetched().addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult());
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void fetch(double cacheExpirationSeconds, boolean activate, Promise promise) {
    module.fetch((long) cacheExpirationSeconds, activate).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult());
      } else {
        if (task.getException().getCause() instanceof FirebaseRemoteConfigFetchThrottledException) {
          rejectPromiseWithCodeAndMessage(
            promise,
            "throttled",
            "fetch() operation cannot be completed successfully, due to throttling."
          );
        } else {
          rejectPromiseWithCodeAndMessage(
            promise,
            "failure",
            "fetch() operation cannot be completed successfully."
          );
        }
      }
    });
  }

  @ReactMethod
  public void getConfigSettings(Promise promise) {
    module.getConfigSettings().addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(Arguments.fromBundle(task.getResult()));
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void setConfigSettings(ReadableMap configSettings, Promise promise) {
    module.setConfigSettings(Arguments.toBundle(configSettings)).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(Arguments.fromBundle(task.getResult()));
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void setDefaults(ReadableMap defaults, Promise promise) {
    module.setDefaults(defaults.toHashMap()).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult());
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void setDefaultsFromResource(String resourceName, Promise promise) {
    module.setDefaultsFromResource(resourceName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        Bundle error = task.getResult();

        if (error == null) {
          promise.resolve(null);
        } else {
          rejectPromiseWithCodeAndMessage(promise, error.getString("code"), error.getString("message"));
        }
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }


  @ReactMethod
  public void getValuesByKeysPrefix(String prefix, Promise promise) {
    module.getValuesByKeysPrefix(prefix).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(
          Arguments.fromBundle(task.getResult())
        );
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }


  @ReactMethod
  public void getKeysByPrefix(String prefix, Promise promise) {
    module.getKeysByPrefix(prefix).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(
          Arguments.fromList(task.getResult())
        );
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void getValue(String key, Promise promise) {
    module.getValue(key).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(
          Arguments.fromBundle(task.getResult())
        );
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void getValues(ReadableArray keys, Promise promise) {
    module.getValues(keys.toArrayList()).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(
          Arguments.fromList(task.getResult())
        );
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }
}
