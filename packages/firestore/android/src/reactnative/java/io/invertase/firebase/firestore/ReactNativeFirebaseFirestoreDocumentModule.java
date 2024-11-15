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
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.*;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getDocumentForFirestore;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;

import android.util.SparseArray;
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.*;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ReactNativeFirebaseFirestoreDocumentModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "FirestoreDocument";
  private static SparseArray<ListenerRegistration> documentSnapshotListeners = new SparseArray<>();

  ReactNativeFirebaseFirestoreDocumentModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  @Override
  public void invalidate() {
    super.invalidate();

    for (int i = 0, size = documentSnapshotListeners.size(); i < size; i++) {
      int key = documentSnapshotListeners.keyAt(i);
      ListenerRegistration listenerRegistration = documentSnapshotListeners.get(key);
      listenerRegistration.remove();
    }
    documentSnapshotListeners.clear();
  }

  @ReactMethod
  public void documentOnSnapshot(
      String appName, String databaseId, String path, int listenerId, ReadableMap listenerOptions) {
    if (documentSnapshotListeners.get(listenerId) != null) {
      return;
    }

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    final EventListener<DocumentSnapshot> listener =
        (documentSnapshot, exception) -> {
          if (exception != null) {
            ListenerRegistration listenerRegistration = documentSnapshotListeners.get(listenerId);
            if (listenerRegistration != null) {
              listenerRegistration.remove();
              documentSnapshotListeners.remove(listenerId);
            }
            sendOnSnapshotError(appName, databaseId, listenerId, exception);
          } else {
            sendOnSnapshotEvent(appName, databaseId, listenerId, documentSnapshot);
          }
        };

    MetadataChanges metadataChanges;

    if (listenerOptions != null
        && listenerOptions.hasKey("includeMetadataChanges")
        && listenerOptions.getBoolean("includeMetadataChanges")) {
      metadataChanges = MetadataChanges.INCLUDE;
    } else {
      metadataChanges = MetadataChanges.EXCLUDE;
    }

    ListenerRegistration listenerRegistration =
        documentReference.addSnapshotListener(metadataChanges, listener);

    documentSnapshotListeners.put(listenerId, listenerRegistration);
  }

  @ReactMethod
  public void documentOffSnapshot(String appName, String databaseId, int listenerId) {
    ListenerRegistration listenerRegistration = documentSnapshotListeners.get(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
      documentSnapshotListeners.remove(listenerId);
    }
  }

  @ReactMethod
  public void documentGet(
      String appName, String databaseId, String path, ReadableMap getOptions, Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

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

    Tasks.call(
            getExecutor(),
            () -> {
              DocumentSnapshot documentSnapshot = Tasks.await(documentReference.get(source));
              return snapshotToWritableMap(appName, databaseId, documentSnapshot);
            })
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void documentDelete(String appName, String databaseId, String path, Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);
    Tasks.call(getTransactionalExecutor(), documentReference::delete)
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
  public void documentSet(
      String appName,
      String databaseId,
      String path,
      ReadableMap data,
      ReadableMap options,
      Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    Tasks.call(getTransactionalExecutor(), () -> parseReadableMap(firebaseFirestore, data))
        .continueWithTask(
            getTransactionalExecutor(),
            task -> {
              Task<Void> setTask;
              Map<String, Object> settableData = Objects.requireNonNull(task.getResult());

              if (options.hasKey("merge") && options.getBoolean("merge")) {
                setTask = documentReference.set(settableData, SetOptions.merge());
              } else if (options.hasKey("mergeFields")) {
                List<String> fields = new ArrayList<>();

                for (Object object :
                    Objects.requireNonNull(options.getArray("mergeFields")).toArrayList()) {
                  fields.add((String) object);
                }

                setTask = documentReference.set(settableData, SetOptions.mergeFields(fields));
              } else {
                setTask = documentReference.set(settableData);
              }

              return setTask;
            })
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
  public void documentUpdate(
      String appName, String databaseId, String path, ReadableMap data, Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    Tasks.call(getTransactionalExecutor(), () -> parseReadableMap(firebaseFirestore, data))
        .continueWithTask(
            getTransactionalExecutor(),
            task -> documentReference.update(Objects.requireNonNull(task.getResult())))
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
  public void documentBatch(
      String appName, String databaseId, ReadableArray writes, Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);

    Tasks.call(getTransactionalExecutor(), () -> parseDocumentBatches(firebaseFirestore, writes))
        .continueWithTask(
            getTransactionalExecutor(),
            task -> {
              WriteBatch batch = firebaseFirestore.batch();
              List<Object> writesArray = task.getResult();

              for (Object w : writesArray) {
                Map<String, Object> write = (Map) w;
                String type = (String) write.get("type");
                String path = (String) write.get("path");
                Map<String, Object> data = (Map) write.get("data");

                DocumentReference documentReference =
                    getDocumentForFirestore(firebaseFirestore, path);

                switch (Objects.requireNonNull(type)) {
                  case "DELETE":
                    batch = batch.delete(documentReference);
                    break;
                  case "UPDATE":
                    batch = batch.update(documentReference, Objects.requireNonNull(data));
                    break;
                  case "SET":
                    Map<String, Object> options = (Map) write.get("options");

                    if (Objects.requireNonNull(options).containsKey("merge")
                        && (boolean) options.get("merge")) {
                      batch =
                          batch.set(
                              documentReference, Objects.requireNonNull(data), SetOptions.merge());
                    } else if (options.containsKey("mergeFields")) {
                      List<String> fields = new ArrayList<>();

                      for (Object object :
                          Objects.requireNonNull((List) options.get("mergeFields"))) {
                        fields.add((String) object);
                      }

                      batch =
                          batch.set(
                              documentReference,
                              Objects.requireNonNull(data),
                              SetOptions.mergeFields(fields));
                    } else {
                      batch = batch.set(documentReference, Objects.requireNonNull(data));
                    }

                    break;
                }
              }

              return batch.commit();
            })
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                rejectPromiseFirestoreException(promise, task.getException());
              }
            });
  }

  private void sendOnSnapshotEvent(
      String appName, String databaseId, int listenerId, DocumentSnapshot documentSnapshot) {
    Tasks.call(getExecutor(), () -> snapshotToWritableMap(appName, databaseId, documentSnapshot))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                WritableMap body = Arguments.createMap();
                body.putMap("snapshot", task.getResult());

                ReactNativeFirebaseEventEmitter emitter =
                    ReactNativeFirebaseEventEmitter.getSharedInstance();

                emitter.sendEvent(
                    new ReactNativeFirebaseFirestoreEvent(
                        ReactNativeFirebaseFirestoreEvent.DOCUMENT_EVENT_SYNC,
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
            ReactNativeFirebaseFirestoreEvent.DOCUMENT_EVENT_SYNC,
            body,
            appName,
            databaseId,
            listenerId));
  }
}
