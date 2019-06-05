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
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import io.invertase.firebase.common.UniversalFirebasePreferences;

public class ReactNativeFirebaseDatabaseModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "Database";
  private final UniversalFirebaseDatabaseModule module;

  ReactNativeFirebaseDatabaseModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseDatabaseModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void goOnline(String app, String dbURL, Promise promise) {
    module.goOnline(app, dbURL).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult());
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void goOffline(String app, String dbURL, Promise promise) {
    module.goOffline(app, dbURL).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult());
      } else {
        rejectPromiseWithExceptionMap(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void setPersistenceEnabled(String app, String dbURL, boolean enabled) {
    UniversalFirebasePreferences.getSharedInstance().setBooleanValue(
      UniversalDatabaseStatics.DATABASE_PERSISTENCE_ENABLED,
      enabled
    );
  }

  @ReactMethod
  public void setLoggingEnabled(String app, String dbURL, boolean bool) {
    UniversalFirebasePreferences.getSharedInstance().setBooleanValue(
      UniversalDatabaseStatics.DATABASE_LOGGING_ENABLED,
      bool
    );
  }

  @ReactMethod
  public void setPersistenceCacheSizeBytes(String app, String dbURL, double cacheSizeBytes) {
    UniversalFirebasePreferences.getSharedInstance().setLongValue(
      UniversalDatabaseStatics.DATABASE_PERSISTENCE_CACHE_SIZE,
      (long) cacheSizeBytes
    );
  }
}
