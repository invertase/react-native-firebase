package io.invertase.firebase.database;

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
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import java.util.Map;

import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;

public class ReactNativeFirebaseDatabaseOnDisconnectModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "DatabaseOnDisconnect";
  private final UniversalFirebaseDatabaseOnDisconnectModule module;

  ReactNativeFirebaseDatabaseOnDisconnectModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseDatabaseOnDisconnectModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void onDisconnectCancel(String app, String dbURL, String path, Promise promise) {
    module.onDisconnectCancel(app, dbURL, path)
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void onDisconnectRemove(String app, String dbURL, String path, Promise promise) {
    module.onDisconnectRemove(app, dbURL, path)
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void onDisconnectSet(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    module.onDisconnectSet(app, dbURL, path, toHashMap(props).get("value"))
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void onDisconnectSetWithPriority(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    module.onDisconnectSetWithPriority(app, dbURL, path, toHashMap(props).get("value"), toHashMap(props).get("priority"))
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void onDisconnectUpdate(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    @SuppressWarnings("unchecked") Map<String, Object> values = (Map<String, Object>) toHashMap(props).get("values");
    module.onDisconnectUpdate(app, dbURL, path, values)
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }
}
