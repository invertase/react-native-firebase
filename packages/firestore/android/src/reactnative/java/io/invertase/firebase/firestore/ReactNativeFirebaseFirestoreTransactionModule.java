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
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.SparseArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.firestore.Transaction;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.annotation.Nonnull;

import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static io.invertase.firebase.common.RCTConvertFirebase.toArrayList;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.parseReadableMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.snapshotToWritableMap;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getDocumentForFirestore;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;

public class ReactNativeFirebaseFirestoreTransactionModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "FirestoreTransaction";
  private SparseArray<ReactNativeFirebaseFirestoreTransactionHandler> transactionHandlers = new SparseArray<>();

  public ReactNativeFirebaseFirestoreTransactionModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void transactionGetDocument(String appName, int transactionId, String path, Promise promise) {
    ReactNativeFirebaseFirestoreTransactionHandler transactionHandler = transactionHandlers.get(transactionId);

    if (transactionHandler == null) {
      rejectPromiseWithCodeAndMessage(promise, "internal-error", "An internal error occurred whilst attempting to find a native transaction by id.");
    }

    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);
    DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

    Tasks.call(getExecutor(), () -> {
      DocumentSnapshot snapshot = Tasks.await(transactionHandler.getDocument(getExecutor(), documentReference));
      return snapshotToWritableMap(snapshot);
    }).addOnCompleteListener(task -> {
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
    ReactNativeFirebaseFirestoreTransactionHandler transactionHandler = transactionHandlers.get(transactionId);

    transactionHandlers.put(transactionId, transactionHandler);
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);

    AsyncTask.execute(() -> getFirestoreForApp(appName)
      .runTransaction((Transaction.Function<Void>) transaction -> {
        transactionHandler.resetState(transaction);

        // emit the update cycle to JS land using an async task
        // otherwise it gets blocked by the pending lock await
        AsyncTask.execute(() -> {
          ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
          WritableMap eventMap = Arguments.createMap();
          eventMap.putString("type", "UPDATE");

//          emitter.sendEvent(new ReactNativeFirebaseFirestoreEvent(
//            ReactNativeFirebaseFirestoreEvent.TRANSCTION_EVENT_SYNC,
//            eventMap,
//            transactionHandler.getAppName(),
//            transactionHandler.getTransactionId()
//          ));

//          WritableMap eventMap = transactionHandler.createEventMap(null, "update");
//                Utils.sendEvent(
//                  getReactApplicationContext(),
//                  "firestore_transaction_event",
//                  eventMap
//                );
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

        for (int i = 0, size = buffer.size(); i < size; i++) {
          ReadableMap data;
          ReadableMap command = buffer.getMap(i);
          String path = command.getString("path");
          String type = command.getString("type");
          DocumentReference documentReference = getDocumentForFirestore(firebaseFirestore, path);

          switch (Objects.requireNonNull(type)) {
            case "SET":
              data = command.getMap("data");
              ReadableMap options = command.getMap("options");
              Map<String, Object> setData = parseReadableMap(
                getFirestoreForApp(appName),
                data
              );

              if (options != null && options.hasKey("merge") && options.getBoolean("merge")) {
                transaction.set(documentReference, setData, SetOptions.merge());
              } else {
                transaction.set(documentReference, setData);
              }
              break;

            case "UPDATE":
              data = command.getMap("data");

              Map<String, Object> updateData = parseReadableMap(
                getFirestoreForApp(appName),
                data
              );

              transaction.update(documentReference, updateData);
              break;

            case "delete":
              transaction.delete(documentReference);
              break;

            default:
              throw new IllegalArgumentException("Unknown command type at index " + i + ".");
          }
        }

        return null;
      })
      .addOnCompleteListener(task -> {
        if (transactionHandler.aborted) {
          return;
        }

        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();


        if (task.isSuccessful()) {

        } else {

        }
      }));
//      .addOnSuccessListener(new OnSuccessListener<Void>() {
//        @Override
//        public void onSuccess(Void aVoid) {
//          if (!transactionHandler.aborted) {
//            Log.d(TAG, "Transaction onSuccess!");
//            WritableMap eventMap = transactionHandler.createEventMap(null, "complete");
//            Utils.sendEvent(
//              getReactApplicationContext(),
//              "firestore_transaction_event",
//              eventMap
//            );
//          }
//        }
//      })
//      .addOnFailureListener(new OnFailureListener() {
//        @Override
//        public void onFailure(@Nonnull Exception e) {
//          if (!transactionHandler.aborted) {
//            Log.w(TAG, "Transaction onFailure.", e);
//            WritableMap eventMap = transactionHandler.createEventMap(
//              (FirebaseFirestoreException) e,
//              "error"
//            );
//            Utils.sendEvent(
//              getReactApplicationContext(),
//              "firestore_transaction_event",
//              eventMap
//            );
//          }
//        }
//      })
//    );
  }
}
