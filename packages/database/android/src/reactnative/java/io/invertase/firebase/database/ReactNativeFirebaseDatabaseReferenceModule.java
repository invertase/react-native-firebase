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
import com.google.android.gms.tasks.Tasks;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import java.util.Map;

import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.database.ReactNativeFirebaseDatabaseCommon.rejectPromiseDatabaseException;

public class ReactNativeFirebaseDatabaseReferenceModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "DatabaseReference";
  private final UniversalFirebaseDatabaseReferenceModule module;

  ReactNativeFirebaseDatabaseReferenceModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseDatabaseReferenceModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void set(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    Tasks
      .call(getExecutor(), () -> toHashMap(props).get("value"))
      .onSuccessTask(aValue -> module.set(app, dbURL, path, aValue))
      .addOnCompleteListener(getExecutor(), task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseDatabaseException(promise, task.getException());
        }
      });
  }

  @SuppressWarnings("unchecked")
  @ReactMethod
  public void update(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    Tasks
      .call(getExecutor(), () -> toHashMap(props).get("values"))
      .onSuccessTask(aMap -> module.update(app, dbURL, path, (Map<String, Object>) aMap))
      .addOnCompleteListener(getExecutor(), task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseDatabaseException(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void setWithPriority(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    Tasks
      .call(getExecutor(), () -> toHashMap(props))
      .onSuccessTask(aMap -> module.setWithPriority(app, dbURL, path, aMap.get("value"), aMap.get("priority")))
      .addOnCompleteListener(getExecutor(), task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseDatabaseException(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void remove(String app, String dbURL, String path, Promise promise) {
    // continuation tasks not needed for this as no data
    module.remove(app, dbURL, path)
      .addOnCompleteListener(getExecutor(), task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseDatabaseException(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void setPriority(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    // continuation tasks not needed for this as minimal data
    module.setPriority(app, dbURL, path, toHashMap(props).get("priority"))
      .addOnCompleteListener(getExecutor(), task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseDatabaseException(promise, task.getException());
        }
      });
  }
}
