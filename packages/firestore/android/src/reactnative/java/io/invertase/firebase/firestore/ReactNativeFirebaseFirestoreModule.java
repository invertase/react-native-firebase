package io.invertase.firebase.firestore;

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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.firebase.firestore.FirebaseFirestore;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.rejectPromiseFirestoreException;

public class ReactNativeFirebaseFirestoreModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "Firestore";
  private final UniversalFirebaseFirestoreModule module;

  ReactNativeFirebaseFirestoreModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseFirestoreModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void setLogLevel(String logLevel) {
    if ("debug".equals(logLevel) || "error".equals(logLevel)) {
      FirebaseFirestore.setLoggingEnabled(true);
    } else {
      FirebaseFirestore.setLoggingEnabled(false);
    }
  }

  @ReactMethod
  public void disableNetwork(String appName, Promise promise) {
    module.disableNetwork(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        rejectPromiseFirestoreException(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void enableNetwork(String appName, Promise promise) {
    module.enableNetwork(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        rejectPromiseFirestoreException(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void settings(String appName, ReadableMap settings, Promise promise) {
    module.settings(appName, toHashMap(settings)).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        rejectPromiseFirestoreException(promise, task.getException());
      }
    });
  }
}
