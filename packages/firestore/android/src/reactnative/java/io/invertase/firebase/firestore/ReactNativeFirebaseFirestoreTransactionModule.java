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

import android.os.AsyncTask;
import android.util.SparseArray;
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.*;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static io.invertase.firebase.common.RCTConvertFirebase.toArrayList;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.parseReadableMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.snapshotToWritableMap;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getDocumentForFirestore;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;

public class ReactNativeFirebaseFirestoreTransactionModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "FirestoreTransaction";
  private SparseArray<ReactNativeFirebaseFirestoreTransactionHandler> transactionHandlers = new SparseArray<>();

  ReactNativeFirebaseFirestoreTransactionModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    for (int i = 0, size = transactionHandlers.size(); i < size; i++) {
      int key = transactionHandlers.keyAt(i);
      ReactNativeFirebaseFirestoreTransactionHandler transactionHandler = transactionHandlers.get(key);

      if (transactionHandler != null) {
        transactionHandler.abort();
      }
    }

    transactionHandlers.clear();
  }

  @ReactMethod
  public void transactionGetDocument(String appName, int transactionId, String path, Promise promise) {
    ReactNativeFirebaseFirestoreTransactionHandler transactionHandler = transactionHandlers.get(transactionId);

    if (transactionHandler == null) {
      rejectPromiseWithCodeAndMessage(promise, "internal-error", "An internal error occurred whilst attempting to find a native transaction by id.");
      return;
    }

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    Tasks
      .call(getTransactionalExecutor(), () -> snapshotToWritableMap(transactionHandler.getDocument(documentReference)))
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void transactionDispose(String appName, int transactionId) {
    ReactNativeFirebaseFirestoreTransactionHandler transactionHandler = transactionHandlers.get(transactionId);

    if (transactionHandler != null) {
      transactionHandler.abort();
      transactionHandlers.delete(transactionId);
    }
  }

  @ReactMethod
  public void transactionApplyBuffer(String appName, int transactionId, ReadableArray commandBuffer) {
    ReactNativeFirebaseFirestoreTransactionHandler handler = transactionHandlers.get(transactionId);

    if (handler != null) {
      handler.signalBufferReceived(commandBuffer);
    }
  }

  @ReactMethod
  public void transactionBegin(String appName, int transactionId) {
    ReactNativeFirebaseFirestoreTransactionHandler transactionHandler = new ReactNativeFirebaseFirestoreTransactionHandler(appName, transactionId);
    transactionHandlers.put(transactionId, transactionHandler);

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    // Provides its own executor
    firebaseFirestore
      .runTransaction((Transaction.Function<Void>) transaction -> {
        transactionHandler.resetState(transaction);

        AsyncTask.execute(() -> {
          WritableMap eventMap = Arguments.createMap();
          eventMap.putString("type", "update");

          // Send an update signal to JS - telling it to now run the transaction
          emitter.sendEvent(new ReactNativeFirebaseFirestoreEvent(
            ReactNativeFirebaseFirestoreEvent.TRANSACTION_EVENT_SYNC,
            eventMap,
            transactionHandler.getAppName(),
            transactionHandler.getTransactionId()
          ));
        });

        // wait for a signal to be received from JS land code
        transactionHandler.await();

        // exit early if aborted - has to throw an exception otherwise will just keep trying ...
        if (transactionHandler.aborted) {
          throw new FirebaseFirestoreException(
            "abort",
            FirebaseFirestoreException.Code.ABORTED
          );
        }

        // exit early if timeout from bridge - has to throw an exception otherwise will just keep trying ...
        if (transactionHandler.timeout) {
          throw new FirebaseFirestoreException(
            "timeout",
            FirebaseFirestoreException.Code.DEADLINE_EXCEEDED
          );
        }

        // process any buffered commands from JS land
        ReadableArray buffer = transactionHandler.getCommandBuffer();

        // exit early if no commands
        if (buffer == null) {
          return null;
        }

        // iterate over the user buffer running transactions in order
        for (int i = 0, size = buffer.size(); i < size; i++) {
          Map<String, Object> serialized;

          ReadableMap command = buffer.getMap(i);
          String path = Objects.requireNonNull(command).getString("path");
          String type = command.getString("type");
          DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

          switch (Objects.requireNonNull(type)) {
            case "SET":
              serialized = parseReadableMap(firebaseFirestore, command.getMap("data"));
              ReadableMap options = command.getMap("options");

              if (Objects.requireNonNull(options).hasKey("merge") && options.getBoolean("merge")) {
                transaction.set(documentReference, serialized, SetOptions.merge());
              } else if (options.hasKey("mergeFields")) {
                List<String> fields = new ArrayList<>();
                ReadableArray fieldPaths = options.getArray("mergeFields");

                for (Object object : toArrayList(fieldPaths)) {
                  fields.add((String) object);
                }

                transaction.set(documentReference, serialized, SetOptions.mergeFields(fields));
              } else {
                transaction.set(documentReference, serialized);
              }

              break;
            case "UPDATE":
              serialized = parseReadableMap(firebaseFirestore, command.getMap("data"));
              transaction.update(documentReference, serialized);
              break;
            case "DELETE":
              transaction.delete(documentReference);
              break;
          }
        }

        return null;
      })
      .addOnCompleteListener(task -> {
        if (transactionHandler.aborted) {
          return;
        }

        WritableMap eventMap = Arguments.createMap();

        if (task.isSuccessful()) {
          eventMap.putString("type", "complete");

          emitter.sendEvent(new ReactNativeFirebaseFirestoreEvent(
            ReactNativeFirebaseFirestoreEvent.TRANSACTION_EVENT_SYNC,
            eventMap,
            transactionHandler.getAppName(),
            transactionHandler.getTransactionId()
          ));
        } else {
          eventMap.putString("type", "error");

          Exception exception = task.getException();
          WritableMap errorMap = Arguments.createMap();

          UniversalFirebaseFirestoreException universalException = new UniversalFirebaseFirestoreException((FirebaseFirestoreException) exception, exception.getCause());
          errorMap.putString("code", universalException.getCode());
          errorMap.putString("message", universalException.getMessage());

          eventMap.putMap("error", errorMap);

          emitter.sendEvent(new ReactNativeFirebaseFirestoreEvent(
            ReactNativeFirebaseFirestoreEvent.TRANSACTION_EVENT_SYNC,
            eventMap,
            transactionHandler.getAppName(),
            transactionHandler.getTransactionId()
          ));
        }
      });
  }
}
