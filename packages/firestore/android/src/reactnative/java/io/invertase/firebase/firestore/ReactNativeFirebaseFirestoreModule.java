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

import android.util.SparseArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.ListenerRegistration;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.rejectPromiseFirestoreException;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;

public class ReactNativeFirebaseFirestoreModule extends ReactNativeFirebaseModule {
  private static SparseArray<ListenerRegistration> snapshotsInSyncListeners = new SparseArray<>();
  private static final String SERVICE_NAME = "Firestore";
  private final UniversalFirebaseFirestoreModule module;

  ReactNativeFirebaseFirestoreModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseFirestoreModule(reactContext, SERVICE_NAME);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();

    for (int i = 0, size = snapshotsInSyncListeners.size(); i < size; i++) {
      int key = snapshotsInSyncListeners.keyAt(i);
      ListenerRegistration listenerRegistration = snapshotsInSyncListeners.get(key);
      listenerRegistration.remove();
    }
    snapshotsInSyncListeners.clear();
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
  public void clearPersistence(String appName, Promise promise) {
    module.clearPersistence(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        rejectPromiseFirestoreException(promise, task.getException());
      }
    });
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

  @ReactMethod
  public void terminate(String appName, Promise promise) {
    module.terminate(appName).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        rejectPromiseFirestoreException(promise, task.getException());
      }
    });
  }

  @ReactMethod
  public void onSnapshotsInSync(String appName, int listenerId, Promise promise) {
    if (snapshotsInSyncListeners.get(listenerId) != null) {
      return;
    }
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);

    final Runnable listener = () -> sendOnSnapshotEvent(appName, listenerId);

    ListenerRegistration listenerRegistration = firebaseFirestore.addSnapshotsInSyncListener(getExecutor(), listener);

    snapshotsInSyncListeners.put(listenerId, listenerRegistration);
  }

  private void sendOnSnapshotEvent(String appName, int listenerId) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    WritableMap body = Arguments.createMap();

    emitter.sendEvent(new ReactNativeFirebaseFirestoreEvent(
      ReactNativeFirebaseFirestoreEvent.SNAPSHOT_IN_SYNC,
      body,
      appName,
      listenerId
    ));
  }

  @ReactMethod
  public void offOnSnapshotsInSync(
    String appName,
    int listenerId
  ) {
    ListenerRegistration listenerRegistration = snapshotsInSyncListeners.get(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
      snapshotsInSyncListeners.remove(listenerId);
    }
  }
}
