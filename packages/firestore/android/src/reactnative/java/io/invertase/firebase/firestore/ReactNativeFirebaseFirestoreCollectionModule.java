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

import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.rejectPromiseFirestoreException;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.snapshotToWritableMap;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getQueryForFirestore;

import android.util.SparseArray;
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.*;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseFirestoreCollectionModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "FirestoreCollection";
  private static SparseArray<ListenerRegistration> collectionSnapshotListeners =
      new SparseArray<>();

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
  public void namedQueryOnSnapshot(
      String appName,
      String databaseId,
      String queryName,
      String type,
      ReadableArray filters,
      ReadableArray orders,
      ReadableMap options,
      int listenerId,
      ReadableMap listenerOptions) {
    if (collectionSnapshotListeners.get(listenerId) != null) {
      return;
    }

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    firebaseFirestore
        .getNamedQuery(queryName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                Query query = task.getResult();
                if (query == null) {
                  sendOnSnapshotError(appName, databaseId, listenerId, new NullPointerException());
                } else {
                  ReactNativeFirebaseFirestoreQuery firestoreQuery =
                      new ReactNativeFirebaseFirestoreQuery(
                          appName, databaseId, query, filters, orders, options);
                  handleQueryOnSnapshot(
                      firestoreQuery, appName, databaseId, listenerId, listenerOptions);
                }
              } else {
                sendOnSnapshotError(appName, databaseId, listenerId, task.getException());
              }
            });
  }

  @ReactMethod
  public void collectionOnSnapshot(
      String appName,
      String databaseId,
      String path,
      String type,
      ReadableArray filters,
      ReadableArray orders,
      ReadableMap options,
      int listenerId,
      ReadableMap listenerOptions) {
    if (collectionSnapshotListeners.get(listenerId) != null) {
      return;
    }

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    ReactNativeFirebaseFirestoreQuery firestoreQuery =
        new ReactNativeFirebaseFirestoreQuery(
            appName,
            databaseId,
            getQueryForFirestore(firebaseFirestore, path, type),
            filters,
            orders,
            options);

    handleQueryOnSnapshot(firestoreQuery, appName, databaseId, listenerId, listenerOptions);
  }

  @ReactMethod
  public void collectionOffSnapshot(String appName, String databaseId, int listenerId) {
    ListenerRegistration listenerRegistration = collectionSnapshotListeners.get(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
      collectionSnapshotListeners.remove(listenerId);
      removeEventListeningExecutor(Integer.toString(listenerId));
    }
  }

  @ReactMethod
  public void namedQueryGet(
      String appName,
      String databaseId,
      String queryName,
      String type,
      ReadableArray filters,
      ReadableArray orders,
      ReadableMap options,
      ReadableMap getOptions,
      Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    firebaseFirestore
        .getNamedQuery(queryName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                Query query = task.getResult();
                if (query == null) {
                  rejectPromiseFirestoreException(promise, new NullPointerException());
                } else {
                  ReactNativeFirebaseFirestoreQuery firestoreQuery =
                      new ReactNativeFirebaseFirestoreQuery(
                          appName, databaseId, query, filters, orders, options);
                  handleQueryGet(firestoreQuery, getSource(getOptions), promise);
                }
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void collectionCount(
      String appName,
      String databaseId,
      String path,
      String type,
      ReadableArray filters,
      ReadableArray orders,
      ReadableMap options,
      Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    ReactNativeFirebaseFirestoreQuery firestoreQuery =
        new ReactNativeFirebaseFirestoreQuery(
            appName,
            databaseId,
            getQueryForFirestore(firebaseFirestore, path, type),
            filters,
            orders,
            options);

    AggregateQuery aggregateQuery = firestoreQuery.query.count();

    aggregateQuery
        .get(AggregateSource.SERVER)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                WritableMap result = Arguments.createMap();
                result.putDouble("count", Long.valueOf(task.getResult().getCount()).doubleValue());
                promise.resolve(result);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void collectionGet(
      String appName,
      String databaseId,
      String path,
      String type,
      ReadableArray filters,
      ReadableArray orders,
      ReadableMap options,
      ReadableMap getOptions,
      Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    ReactNativeFirebaseFirestoreQuery firestoreQuery =
        new ReactNativeFirebaseFirestoreQuery(
            appName,
            databaseId,
            getQueryForFirestore(firebaseFirestore, path, type),
            filters,
            orders,
            options);
    handleQueryGet(firestoreQuery, getSource(getOptions), promise);
  }

  private void handleQueryOnSnapshot(
      ReactNativeFirebaseFirestoreQuery firestoreQuery,
      String appName,
      String databaseId,
      int listenerId,
      ReadableMap listenerOptions) {
    MetadataChanges metadataChanges;

    if (listenerOptions != null
        && listenerOptions.hasKey("includeMetadataChanges")
        && listenerOptions.getBoolean("includeMetadataChanges")) {
      metadataChanges = MetadataChanges.INCLUDE;
    } else {
      metadataChanges = MetadataChanges.EXCLUDE;
    }

    final EventListener<QuerySnapshot> listener =
        (querySnapshot, exception) -> {
          if (exception != null) {
            ListenerRegistration listenerRegistration = collectionSnapshotListeners.get(listenerId);
            if (listenerRegistration != null) {
              listenerRegistration.remove();
              collectionSnapshotListeners.remove(listenerId);
            }
            sendOnSnapshotError(appName, databaseId, listenerId, exception);
          } else {
            sendOnSnapshotEvent(appName, databaseId, listenerId, querySnapshot, metadataChanges);
          }
        };

    ListenerRegistration listenerRegistration =
        firestoreQuery.query.addSnapshotListener(metadataChanges, listener);

    collectionSnapshotListeners.put(listenerId, listenerRegistration);
  }

  private void handleQueryGet(
      ReactNativeFirebaseFirestoreQuery firestoreQuery, Source source, Promise promise) {
    firestoreQuery
        .get(getExecutor(), source)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  private void sendOnSnapshotEvent(
      String appName,
      String databaseId,
      int listenerId,
      QuerySnapshot querySnapshot,
      MetadataChanges metadataChanges) {
    Tasks.call(
            getTransactionalExecutor(Integer.toString(listenerId)),
            () ->
                snapshotToWritableMap(
                    appName, databaseId, "onSnapshot", querySnapshot, metadataChanges))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                WritableMap body = Arguments.createMap();
                body.putMap("snapshot", task.getResult());

                ReactNativeFirebaseEventEmitter emitter =
                    ReactNativeFirebaseEventEmitter.getSharedInstance();

                emitter.sendEvent(
                    new ReactNativeFirebaseFirestoreEvent(
                        ReactNativeFirebaseFirestoreEvent.COLLECTION_EVENT_SYNC,
                        body,
                        appName,
                        databaseId,
                        listenerId));
              } else {
                sendOnSnapshotError(appName, databaseId, listenerId, task.getException());
              }
            });
  }

  private void sendOnSnapshotError(
      String appName, String databaseId, int listenerId, Exception exception) {
    WritableMap body = Arguments.createMap();
    WritableMap error = Arguments.createMap();

    if (exception instanceof FirebaseFirestoreException) {
      UniversalFirebaseFirestoreException firestoreException =
          new UniversalFirebaseFirestoreException(
              (FirebaseFirestoreException) exception, exception.getCause());
      error.putString("code", firestoreException.getCode());
      error.putString("message", firestoreException.getMessage());
    } else {
      error.putString("code", "unknown");
      error.putString("message", "An unknown error occurred");
    }

    body.putMap("error", error);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    emitter.sendEvent(
        new ReactNativeFirebaseFirestoreEvent(
            ReactNativeFirebaseFirestoreEvent.COLLECTION_EVENT_SYNC,
            body,
            appName,
            databaseId,
            listenerId));
  }

  private Source getSource(ReadableMap getOptions) {
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

    return source;
  }
}
