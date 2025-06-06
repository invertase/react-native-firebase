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

import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.createFirestoreKey;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.instanceCache;

import android.content.Context;
import android.util.SparseArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.LoadBundleTask;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.UniversalFirebaseModule;
import io.invertase.firebase.common.UniversalFirebasePreferences;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class UniversalFirebaseFirestoreModule extends UniversalFirebaseModule {
  private static SparseArray<ListenerRegistration> onSnapshotInSyncListeners = new SparseArray<>();

  private static HashMap<String, String> emulatorConfigs = new HashMap<>();

  UniversalFirebaseFirestoreModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  void addSnapshotsInSync(String appName, String databaseId, int listenerId) {

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    ListenerRegistration listenerRegistration =
        firebaseFirestore.addSnapshotsInSyncListener(
            () -> {
              ReactNativeFirebaseEventEmitter emitter =
                  ReactNativeFirebaseEventEmitter.getSharedInstance();
              WritableMap body = Arguments.createMap();
              emitter.sendEvent(
                  new ReactNativeFirebaseFirestoreEvent(
                      ReactNativeFirebaseFirestoreEvent.SNAPSHOT_IN_SYNC_EVENT_SYNC,
                      body,
                      appName,
                      databaseId,
                      listenerId));
            });

    onSnapshotInSyncListeners.put(listenerId, listenerRegistration);
  }

  void removeSnapshotsInSync(String appName, String databaseId, int listenerId) {
    ListenerRegistration listenerRegistration = onSnapshotInSyncListeners.get(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
      onSnapshotInSyncListeners.remove(listenerId);
    }
  }

  Task<Void> disableNetwork(String appName, String databaseId) {
    return getFirestoreForApp(appName, databaseId).disableNetwork();
  }

  Task<Void> enableNetwork(String appName, String databaseId) {
    return getFirestoreForApp(appName, databaseId).enableNetwork();
  }

  Task<Void> useEmulator(String appName, String databaseId, String host, int port) {
    return Tasks.call(
        getExecutor(),
        () -> {
          String firestoreKey = createFirestoreKey(appName, databaseId);
          if (emulatorConfigs.get(firestoreKey) == null) {
            emulatorConfigs.put(firestoreKey, "true");
            getFirestoreForApp(appName, databaseId).useEmulator(host, port);
          }
          return null;
        });
  }

  Task<Void> settings(String firestoreKey, Map<String, Object> settings) {
    return Tasks.call(
        getExecutor(),
        () -> {
          // settings.cacheSizeBytes
          if (settings.containsKey("cacheSizeBytes")) {
            Double cacheSizeBytesDouble = (Double) settings.get("cacheSizeBytes");

            UniversalFirebasePreferences.getSharedInstance()
                .setIntValue(
                    UniversalFirebaseFirestoreStatics.FIRESTORE_CACHE_SIZE + "_" + firestoreKey,
                    Objects.requireNonNull(cacheSizeBytesDouble).intValue());
          }

          // settings.host
          if (settings.containsKey("host")) {
            UniversalFirebasePreferences.getSharedInstance()
                .setStringValue(
                    UniversalFirebaseFirestoreStatics.FIRESTORE_HOST + "_" + firestoreKey,
                    (String) settings.get("host"));
          }

          // settings.persistence
          if (settings.containsKey("persistence")) {
            UniversalFirebasePreferences.getSharedInstance()
                .setBooleanValue(
                    UniversalFirebaseFirestoreStatics.FIRESTORE_PERSISTENCE + "_" + firestoreKey,
                    (boolean) settings.get("persistence"));
          }

          // settings.ssl
          if (settings.containsKey("ssl")) {
            UniversalFirebasePreferences.getSharedInstance()
                .setBooleanValue(
                    UniversalFirebaseFirestoreStatics.FIRESTORE_SSL + "_" + firestoreKey,
                    (boolean) settings.get("ssl"));
          }

          // settings.serverTimestampBehavior
          if (settings.containsKey("serverTimestampBehavior")) {
            UniversalFirebasePreferences.getSharedInstance()
                .setStringValue(
                    UniversalFirebaseFirestoreStatics.FIRESTORE_SERVER_TIMESTAMP_BEHAVIOR
                        + "_"
                        + firestoreKey,
                    (String) settings.get("serverTimestampBehavior"));
          }

          return null;
        });
  }

  LoadBundleTask loadBundle(String appName, String databaseId, String bundle) {
    byte[] bundleData = bundle.getBytes(StandardCharsets.UTF_8);
    return getFirestoreForApp(appName, databaseId).loadBundle(bundleData);
  }

  Task<Void> clearPersistence(String appName, String databaseId) {
    return getFirestoreForApp(appName, databaseId).clearPersistence();
  }

  Task<Void> waitForPendingWrites(String appName, String databaseId) {
    return getFirestoreForApp(appName, databaseId).waitForPendingWrites();
  }

  Task<Void> terminate(String appName, String databaseId) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    String firestoreKey = createFirestoreKey(appName, databaseId);
    if (instanceCache.get(firestoreKey) != null) {
      instanceCache.get(firestoreKey).clear();
      instanceCache.remove(firestoreKey);
    }

    return firebaseFirestore.terminate();
  }
}
