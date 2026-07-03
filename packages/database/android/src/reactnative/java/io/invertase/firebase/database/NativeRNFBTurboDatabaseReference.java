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

import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.database.ReactNativeFirebaseDatabaseCommon.rejectPromiseDatabaseException;

import androidx.annotation.CallSuper;
import com.facebook.fbreact.specs.NativeRNFBTurboDatabaseReferenceSpec;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.Tasks;
import java.util.Map;

public class NativeRNFBTurboDatabaseReference extends NativeRNFBTurboDatabaseReferenceSpec {
  private static final String SERVICE_NAME = "DatabaseReference";
  private final UniversalFirebaseDatabaseReferenceModule module;
  private final DatabaseTurboModuleSupport turboSupport =
      new DatabaseTurboModuleSupport("RNFBDatabaseReference");

  public NativeRNFBTurboDatabaseReference(ReactApplicationContext reactContext) {
    super(reactContext);
    module = new UniversalFirebaseDatabaseReferenceModule(reactContext, SERVICE_NAME);
  }

  @Override
  @CallSuper
  public void invalidate() {
    turboSupport.invalidate();
    super.invalidate();
  }

  @Override
  public void set(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    Tasks.call(turboSupport.getTransactionalExecutor(), () -> toHashMap(props).get("value"))
        .onSuccessTask(aValue -> module.set(app, dbURL, path, aValue))
        .addOnCompleteListener(
            turboSupport.getTransactionalExecutor(),
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseDatabaseException(promise, task.getException());
              }
            });
  }

  @SuppressWarnings("unchecked")
  @Override
  public void update(String app, String dbURL, String path, ReadableMap props, Promise promise) {
    Tasks.call(turboSupport.getTransactionalExecutor(), () -> toHashMap(props).get("values"))
        .onSuccessTask(aMap -> module.update(app, dbURL, path, (Map<String, Object>) aMap))
        .addOnCompleteListener(
            turboSupport.getTransactionalExecutor(),
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseDatabaseException(promise, task.getException());
              }
            });
  }

  @Override
  public void setWithPriority(
      String app, String dbURL, String path, ReadableMap props, Promise promise) {
    Tasks.call(turboSupport.getTransactionalExecutor(), () -> toHashMap(props))
        .onSuccessTask(
            aMap ->
                module.setWithPriority(app, dbURL, path, aMap.get("value"), aMap.get("priority")))
        .addOnCompleteListener(
            turboSupport.getTransactionalExecutor(),
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseDatabaseException(promise, task.getException());
              }
            });
  }

  @Override
  public void remove(String app, String dbURL, String path, Promise promise) {
    module
        .remove(app, dbURL, path)
        .addOnCompleteListener(
            turboSupport.getTransactionalExecutor(),
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseDatabaseException(promise, task.getException());
              }
            });
  }

  @Override
  public void setPriority(
      String app, String dbURL, String path, ReadableMap props, Promise promise) {
    module
        .setPriority(app, dbURL, path, toHashMap(props).get("priority"))
        .addOnCompleteListener(
            turboSupport.getTransactionalExecutor(),
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseDatabaseException(promise, task.getException());
              }
            });
  }
}
