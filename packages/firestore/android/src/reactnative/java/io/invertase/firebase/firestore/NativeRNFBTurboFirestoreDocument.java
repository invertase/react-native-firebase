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
import com.facebook.fbreact.specs.NativeRNFBTurboFirestoreDocumentSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class NativeRNFBTurboFirestoreDocument extends NativeRNFBTurboFirestoreDocumentSpec {
  private final FirestoreTurboModuleSupport turboSupport = new FirestoreTurboModuleSupport("RNFBDocument");
  private static final String SERVICE_NAME = "FirestoreDocument";
  private static SparseArray<ListenerRegistration> documentSnapshotListeners = new SparseArray<>();

  public NativeRNFBTurboFirestoreDocument(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public void invalidate() {
    for (int i = 0, size = documentSnapshotListeners.size(); i < size; i++) {
      int key = documentSnapshotListeners.keyAt(i);
      ListenerRegistration listenerRegistration = documentSnapshotListeners.get(key);
      listenerRegistration.remove();
    }
    documentSnapshotListeners.clear();

    turboSupport.invalidate();
  }

  @Override
  public void documentOnSnapshot(
      String appName, String databaseId, String path, double listenerId, ReadableMap listenerOptions) {
    if (documentSnapshotListeners.get((int) listenerId) != null) {
      return;
    }

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    final EventListener<DocumentSnapshot> listener =
        (documentSnapshot, exception) -> {
          if (exception != null) {
            ListenerRegistration listenerRegistration = documentSnapshotListeners.get((int) listenerId);
            if (listenerRegistration != null) {
              listenerRegistration.remove();
              documentSnapshotListeners.remove((int) listenerId);
            }
            sendOnSnapshotError(appName, databaseId, listenerId, exception);
          } else {
            sendOnSnapshotEvent(appName, databaseId, listenerId, documentSnapshot);
          }
        };

    SnapshotListenOptions.Builder snapshotListenOptionsBuilder =
        new SnapshotListenOptions.Builder();

    if (listenerOptions != null
        && listenerOptions.hasKey("includeMetadataChanges")
        && listenerOptions.getBoolean("includeMetadataChanges")) {
      snapshotListenOptionsBuilder.setMetadataChanges(MetadataChanges.INCLUDE);
    } else {
      snapshotListenOptionsBuilder.setMetadataChanges(MetadataChanges.EXCLUDE);
    }

    if (listenerOptions != null
        && listenerOptions.hasKey("source")
        && "cache".equals(listenerOptions.getString("source"))) {
      snapshotListenOptionsBuilder.setSource(ListenSource.CACHE);
    } else {
      snapshotListenOptionsBuilder.setSource(ListenSource.DEFAULT);
    }

    ListenerRegistration listenerRegistration =
        documentReference.addSnapshotListener(snapshotListenOptionsBuilder.build(), listener);

    documentSnapshotListeners.put((int) listenerId, listenerRegistration);
  }

  @Override
  public void documentOffSnapshot(String appName, String databaseId, double listenerId) {
    ListenerRegistration listenerRegistration = documentSnapshotListeners.get((int) listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
      documentSnapshotListeners.remove((int) listenerId);
    }
  }

  @Override
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
            turboSupport.getExecutor(),
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

  @Override
  public void documentDelete(String appName, String databaseId, String path, Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);
    Tasks.call(turboSupport.getTransactionalExecutor(), documentReference::delete)
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
  public void documentSet(
      String appName,
      String databaseId,
      String path,
      ReadableMap data,
      ReadableMap options,
      Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    Tasks.call(turboSupport.getTransactionalExecutor(), () -> parseReadableMap(firebaseFirestore, data))
        .continueWithTask(
            turboSupport.getTransactionalExecutor(),
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

  @Override
  public void documentUpdate(
      String appName, String databaseId, String path, ReadableMap data, Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    Tasks.call(turboSupport.getTransactionalExecutor(), () -> parseReadableMap(firebaseFirestore, data))
        .continueWithTask(
            turboSupport.getTransactionalExecutor(),
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

  @Override
  public void documentBatch(
      String appName, String databaseId, ReadableArray writes, Promise promise) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName, databaseId);

    Tasks.call(turboSupport.getTransactionalExecutor(), () -> parseDocumentBatches(firebaseFirestore, writes))
        .continueWithTask(
            turboSupport.getTransactionalExecutor(),
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
      String appName, String databaseId, double listenerId, DocumentSnapshot documentSnapshot) {
    try {
      Tasks.call(turboSupport.getExecutor(), () -> snapshotToWritableMap(appName, databaseId, documentSnapshot))
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
                          (int) listenerId));
                } else {
                  sendOnSnapshotError(appName, databaseId, listenerId, task.getException());
                }
              });
    } catch (java.util.concurrent.RejectedExecutionException e) {
      // Snapshot arrived after module invalidation shut down the executor.
      // Safe to drop — the module is being torn down and no JS listener remains.
    }
  }

  private void sendOnSnapshotError(
      String appName, String databaseId, double listenerId, Exception exception) {
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
            (int) listenerId));
  }
}
