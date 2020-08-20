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
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.*;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.rejectPromiseFirestoreException;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.snapshotToWritableMap;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getQueryForFirestore;

public class ReactNativeFirebaseFirestoreCollectionModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "FirestoreCollection";
  private static SparseArray<ListenerRegistration> collectionSnapshotListeners = new SparseArray<>();

  ReactNativeFirebaseFirestoreCollectionModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();

    for (int i = 0, size = collectionSnapshotListeners.size(); i < size; i++) {
      int key = collectionSnapshotListeners.keyAt(i);
      ListenerRegistration listenerRegistration = collectionSnapshotListeners.get(key);
      listenerRegistration.remove();
    }
    collectionSnapshotListeners.clear();
  }

  @ReactMethod
  public void collectionOnSnapshot(
    String appName,
    String path,
    String type,
    ReadableArray filters,
    ReadableArray orders,
    ReadableMap options,
    int listenerId,
    ReadableMap listenerOptions
  ) {
    if (collectionSnapshotListeners.get(listenerId) != null) {
      return;
    }

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);
    ReactNativeFirebaseFirestoreQuery firestoreQuery = new ReactNativeFirebaseFirestoreQuery(
      getQueryForFirestore(firebaseFirestore, path, type),
      filters,
      orders,
      options
    );

    MetadataChanges metadataChanges;

    if (listenerOptions != null && listenerOptions.hasKey("includeMetadataChanges")
      && listenerOptions.getBoolean("includeMetadataChanges")) {
      metadataChanges = MetadataChanges.INCLUDE;
    } else {
      metadataChanges = MetadataChanges.EXCLUDE;
    }

    final EventListener<QuerySnapshot> listener = (querySnapshot, exception) -> {
      if (exception != null) {
        ListenerRegistration listenerRegistration = collectionSnapshotListeners.get(listenerId);
        if (listenerRegistration != null) {
          listenerRegistration.remove();
          collectionSnapshotListeners.remove(listenerId);
        }
        sendOnSnapshotError(appName, listenerId, exception);
      } else {
        sendOnSnapshotEvent(appName, listenerId, querySnapshot, metadataChanges);
      }
    };

    ListenerRegistration listenerRegistration = firestoreQuery.query.addSnapshotListener(
      metadataChanges,
      listener
    );

    collectionSnapshotListeners.put(listenerId, listenerRegistration);
  }

  @ReactMethod
  public void collectionOffSnapshot(
    String appName,
    int listenerId
  ) {
    ListenerRegistration listenerRegistration = collectionSnapshotListeners.get(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
      collectionSnapshotListeners.remove(listenerId);
    }
  }

  @ReactMethod
  public void collectionGet(
    String appName,
    String path,
    String type,
    ReadableArray filters,
    ReadableArray orders,
    ReadableMap options,
    ReadableMap getOptions,
    Promise promise
  ) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);
    ReactNativeFirebaseFirestoreQuery query = new ReactNativeFirebaseFirestoreQuery(
      getQueryForFirestore(firebaseFirestore, path, type),
      filters,
      orders,
      options
    );

    Source source;

    if (getOptions != null && getOptions.hasKey("source")) {
      String optionsSource = getOptions.getString("source");
      if ("server".equals(optionsSource)) {
        source = Source.SERVER;
      } else if ("cache".equals(optionsSource)) {
        source = Source.CACHE;
      } else {
        source = Source.DEFAULT;
      }
    } else {
      source = Source.DEFAULT;
    }

    query.get(getExecutor(), source)
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseFirestoreException(promise, task.getException());
        }
      });
  }

  private void sendOnSnapshotEvent(String appName, int listenerId, QuerySnapshot querySnapshot, MetadataChanges metadataChanges) {
    Tasks.call(getExecutor(), () -> snapshotToWritableMap("onSnapshot", querySnapshot, metadataChanges)).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        WritableMap body = Arguments.createMap();
        body.putMap("snapshot", task.getResult());

        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

        emitter.sendEvent(new ReactNativeFirebaseFirestoreEvent(
          ReactNativeFirebaseFirestoreEvent.COLLECTION_EVENT_SYNC,
          body,
          appName,
          listenerId
        ));
      } else {
        sendOnSnapshotError(appName, listenerId, task.getException());
      }
    });
  }

  private void sendOnSnapshotError(String appName, int listenerId, Exception exception) {
    WritableMap body = Arguments.createMap();
    WritableMap error = Arguments.createMap();

    if (exception instanceof FirebaseFirestoreException) {
      UniversalFirebaseFirestoreException firestoreException = new UniversalFirebaseFirestoreException((FirebaseFirestoreException) exception, exception.getCause());
      error.putString("code", firestoreException.getCode());
      error.putString("message", firestoreException.getMessage());
    } else {
      error.putString("code", "unknown");
      error.putString("message", "An unknown error occurred");
    }

    body.putMap("error", error);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    emitter.sendEvent(new ReactNativeFirebaseFirestoreEvent(
      ReactNativeFirebaseFirestoreEvent.COLLECTION_EVENT_SYNC,
      body,
      appName,
      listenerId
    ));
  }
}
