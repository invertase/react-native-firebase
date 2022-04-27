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

import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.rejectPromiseFirestoreException;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.LoadBundleTaskProgress;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

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
  public void loadBundle(String appName, String bundle, Promise promise) {
    module
        .loadBundle(appName, bundle)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                LoadBundleTaskProgress progress = task.getResult();
                promise.resolve(taskProgressToWritableMap(progress));
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void clearPersistence(String appName, Promise promise) {
    module
        .clearPersistence(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void waitForPendingWrites(String appName, Promise promise) {
    module
        .waitForPendingWrites(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void disableNetwork(String appName, Promise promise) {
    module
        .disableNetwork(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void enableNetwork(String appName, Promise promise) {
    module
        .enableNetwork(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void useEmulator(String appName, String host, int port, Promise promise) {
    module
        .useEmulator(appName, host, port)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void settings(String appName, ReadableMap settings, Promise promise) {
    module
        .settings(appName, toHashMap(settings))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void terminate(String appName, Promise promise) {
    module
        .terminate(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  private WritableMap taskProgressToWritableMap(LoadBundleTaskProgress progress) {
    WritableMap writableMap = Arguments.createMap();
    writableMap.putDouble("bytesLoaded", progress.getBytesLoaded());
    writableMap.putInt("documentsLoaded", progress.getDocumentsLoaded());
    writableMap.putDouble("totalBytes", progress.getTotalBytes());
    writableMap.putInt("totalDocuments", progress.getTotalDocuments());

    LoadBundleTaskProgress.TaskState taskState = progress.getTaskState();
    String convertedState = "Running";
    switch (taskState) {
      case RUNNING:
        convertedState = "Running";
        break;
      case SUCCESS:
        convertedState = "Success";
        break;
      case ERROR:
        convertedState = "Error";
        break;
    }
    writableMap.putString("taskState", convertedState);
    return writableMap;
  }
}
