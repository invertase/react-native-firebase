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
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.createFirestoreKey;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;

import com.facebook.fbreact.specs.NativeRNFBTurboFirestoreSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.LoadBundleTaskProgress;
import com.google.firebase.firestore.PersistentCacheIndexManager;

public class NativeRNFBTurboFirestore extends NativeRNFBTurboFirestoreSpec {
  private static final String SERVICE_NAME = "Firestore";
  private final UniversalFirebaseFirestoreModule module;

  public NativeRNFBTurboFirestore(ReactApplicationContext reactContext) {
    super(reactContext);
    module = new UniversalFirebaseFirestoreModule(reactContext, SERVICE_NAME);
  }

  @Override
  public void setLogLevel(String logLevel) {
    if ("debug".equals(logLevel) || "error".equals(logLevel)) {
      FirebaseFirestore.setLoggingEnabled(true);
    } else {
      FirebaseFirestore.setLoggingEnabled(false);
    }
  }

  @Override
  public void loadBundle(String appName, String databaseId, String bundle, Promise promise) {
    module
        .loadBundle(appName, databaseId, bundle)
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

  @Override
  public void clearPersistence(String appName, String databaseId, Promise promise) {
    module
        .clearPersistence(appName, databaseId)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @Override
  public void waitForPendingWrites(String appName, String databaseId, Promise promise) {
    module
        .waitForPendingWrites(appName, databaseId)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @Override
  public void disableNetwork(String appName, String databaseId, Promise promise) {
    module
        .disableNetwork(appName, databaseId)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @Override
  public void enableNetwork(String appName, String databaseId, Promise promise) {
    module
        .enableNetwork(appName, databaseId)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @Override
  public void useEmulator(String appName, String databaseId, String host, double port) {
    module.useEmulator(appName, databaseId, host, (int) port);
  }

  @Override
  public void settings(String appName, String databaseId, ReadableMap settings, Promise promise) {
    String firestoreKey = createFirestoreKey(appName, databaseId);
    module
        .settings(firestoreKey, toHashMap(settings))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @Override
  public void terminate(String appName, String databaseId, Promise promise) {
    module
        .terminate(appName, databaseId)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @Override
  public void persistenceCacheIndexManager(
      String appName, String databaseId, double requestType, Promise promise) {
    int mode = (int) requestType;
    PersistentCacheIndexManager indexManager =
        getFirestoreForApp(appName, databaseId).getPersistentCacheIndexManager();
    if (indexManager != null) {
      switch (mode) {
        case 0:
          indexManager.enableIndexAutoCreation();
          break;
        case 1:
          indexManager.disableIndexAutoCreation();
          break;
        case 2:
          indexManager.deleteAllIndexes();
          break;
      }
    } else {
      promise.reject(
          "firestore/index-manager-null",
          "`PersistentCacheIndexManager` is not available, persistence has not been enabled for"
              + " Firestore");
      return;
    }
    promise.resolve(null);
  }

  @Override
  public void addSnapshotsInSync(String appName, String databaseId, double listenerId) {
    module.addSnapshotsInSync(appName, databaseId, (int) listenerId);
  }

  @Override
  public void removeSnapshotsInSync(String appName, String databaseId, double listenerId) {
    module.removeSnapshotsInSync(appName, databaseId, (int) listenerId);
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
