package io.invertase.firebase.firestore;

import android.os.AsyncTask;
import android.support.annotation.NonNull;
import android.util.Log;
import android.util.SparseArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.firestore.Transaction;
import com.google.firebase.firestore.WriteBatch;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.ErrorUtils;
import io.invertase.firebase.Utils;


public class RNFirebaseFirestore extends ReactContextBaseJavaModule {
  private static final String TAG = "RNFirebaseFirestore";
  private SparseArray<RNFirebaseFirestoreTransactionHandler> transactionHandlers = new SparseArray<>();

  RNFirebaseFirestore(ReactApplicationContext reactContext) {
    super(reactContext);
  }


  /*
   * REACT NATIVE METHODS
   */

  /**
   * Generates a js-like error from an exception and rejects the provided promise with it.
   *
   * @param exception Exception Exception normally from a task result.
   * @param promise   Promise react native promise
   */
  static void promiseRejectException(Promise promise, FirebaseFirestoreException exception) {
    WritableMap jsError = getJSError(exception);
    promise.reject(
      jsError.getString("code"),
      jsError.getString("message"),
      exception
    );
  }

  /**
   * Get a database instance for a specific firebase app instance
   *
   * @param appName appName
   * @return FirebaseFirestore
   */
  static FirebaseFirestore getFirestoreForApp(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    return FirebaseFirestore.getInstance(firebaseApp);
  }

  /**
   * Convert as firebase DatabaseError instance into a writable map
   * with the correct web-like error codes.
   *
   * @param nativeException nativeException
   * @return WritableMap
   */
  static WritableMap getJSError(FirebaseFirestoreException nativeException) {
    WritableMap errorMap = Arguments.createMap();
    errorMap.putInt("nativeErrorCode", nativeException.getCode().value());
    errorMap.putString("nativeErrorMessage", nativeException.getMessage());

    String code;
    String message;
    String service = "Firestore";

    // TODO: Proper error mappings
    switch (nativeException.getCode()) {
      case OK:
        code = ErrorUtils.getCodeWithService(service, "ok");
        message = ErrorUtils.getMessageWithService("Ok.", service, code);
        break;
      case CANCELLED:
        code = ErrorUtils.getCodeWithService(service, "cancelled");
        message = ErrorUtils.getMessageWithService("The operation was cancelled.", service, code);
        break;
      case UNKNOWN:
        code = ErrorUtils.getCodeWithService(service, "unknown");
        message = ErrorUtils.getMessageWithService(
          "Unknown error or an error from a different error domain.",
          service,
          code
        );
        break;
      case INVALID_ARGUMENT:
        code = ErrorUtils.getCodeWithService(service, "invalid-argument");
        message = ErrorUtils.getMessageWithService(
          "Client specified an invalid argument.",
          service,
          code
        );
        break;
      case DEADLINE_EXCEEDED:
        code = ErrorUtils.getCodeWithService(service, "deadline-exceeded");
        message = ErrorUtils.getMessageWithService(
          "Deadline expired before operation could complete.",
          service,
          code
        );
        break;
      case NOT_FOUND:
        code = ErrorUtils.getCodeWithService(service, "not-found");
        message = ErrorUtils.getMessageWithService(
          "Some requested document was not found.",
          service,
          code
        );
        break;
      case ALREADY_EXISTS:
        code = ErrorUtils.getCodeWithService(service, "already-exists");
        message = ErrorUtils.getMessageWithService(
          "Some document that we attempted to create already exists.",
          service,
          code
        );
        break;
      case PERMISSION_DENIED:
        code = ErrorUtils.getCodeWithService(service, "permission-denied");
        message = ErrorUtils.getMessageWithService(
          "The caller does not have permission to execute the specified operation.",
          service,
          code
        );
        break;
      case RESOURCE_EXHAUSTED:
        code = ErrorUtils.getCodeWithService(service, "resource-exhausted");
        message = ErrorUtils.getMessageWithService(
          "Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.",
          service,
          code
        );
        break;
      case FAILED_PRECONDITION:
        code = ErrorUtils.getCodeWithService(service, "failed-precondition");
        message = ErrorUtils.getMessageWithService(
          "Operation was rejected because the system is not in a state required for the operation`s execution.",
          service,
          code
        );
        break;
      case ABORTED:
        code = ErrorUtils.getCodeWithService(service, "aborted");
        message = ErrorUtils.getMessageWithService(
          "The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.",
          service,
          code
        );
        break;
      case OUT_OF_RANGE:
        code = ErrorUtils.getCodeWithService(service, "out-of-range");
        message = ErrorUtils.getMessageWithService(
          "Operation was attempted past the valid range.",
          service,
          code
        );
        break;
      case UNIMPLEMENTED:
        code = ErrorUtils.getCodeWithService(service, "unimplemented");
        message = ErrorUtils.getMessageWithService(
          "Operation is not implemented or not supported/enabled.",
          service,
          code
        );
        break;
      case INTERNAL:
        code = ErrorUtils.getCodeWithService(service, "internal");
        message = ErrorUtils.getMessageWithService("Internal errors.", service, code);
        break;
      case UNAVAILABLE:
        code = ErrorUtils.getCodeWithService(service, "unavailable");
        message = ErrorUtils.getMessageWithService(
          "The service is currently unavailable.",
          service,
          code
        );
        break;
      case DATA_LOSS:
        code = ErrorUtils.getCodeWithService(service, "data-loss");
        message = ErrorUtils.getMessageWithService(
          "Unrecoverable data loss or corruption.",
          service,
          code
        );
        break;
      case UNAUTHENTICATED:
        code = ErrorUtils.getCodeWithService(service, "unauthenticated");
        message = ErrorUtils.getMessageWithService(
          "The request does not have valid authentication credentials for the operation.",
          service,
          code
        );
        break;
      default:
        code = ErrorUtils.getCodeWithService(service, "unknown");
        message = ErrorUtils.getMessageWithService("An unknown error occurred.", service, code);
    }

    errorMap.putString("code", code);
    errorMap.putString("message", message);
    return errorMap;
  }

  @ReactMethod
  public void disableNetwork(String appName, final Promise promise) {
    getFirestoreForApp(appName).disableNetwork().addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "disableNetwork:onComplete:success");
          promise.resolve(null);
        } else {
          Log.e(TAG, "disableNetwork:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(
            promise,
            (FirebaseFirestoreException) task.getException()
          );
        }
      }
    });
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
  public void enableNetwork(String appName, final Promise promise) {
    getFirestoreForApp(appName).enableNetwork().addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "enableNetwork:onComplete:success");
          promise.resolve(null);
        } else {
          Log.e(TAG, "enableNetwork:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(
            promise,
            (FirebaseFirestoreException) task.getException()
          );
        }
      }
    });
  }

  @ReactMethod
  public void collectionGet(
    String appName, String path, ReadableArray filters,
    ReadableArray orders, ReadableMap options, ReadableMap getOptions,
    final Promise promise
  ) {
    RNFirebaseFirestoreCollectionReference ref = getCollectionForAppPath(
      appName,
      path,
      filters,
      orders,
      options
    );
    ref.get(getOptions, promise);
  }

  @ReactMethod
  public void collectionOffSnapshot(
    String appName, String path, ReadableArray filters,
    ReadableArray orders, ReadableMap options, String listenerId
  ) {
    RNFirebaseFirestoreCollectionReference.offSnapshot(listenerId);
  }

  @ReactMethod
  public void collectionOnSnapshot(
    String appName, String path, ReadableArray filters,
    ReadableArray orders, ReadableMap options, String listenerId,
    ReadableMap queryListenOptions
  ) {
    RNFirebaseFirestoreCollectionReference ref = getCollectionForAppPath(
      appName,
      path,
      filters,
      orders,
      options
    );
    ref.onSnapshot(listenerId, queryListenOptions);
  }

  @ReactMethod
  public void documentBatch(final String appName, final ReadableArray writes,
                            final Promise promise) {
    FirebaseFirestore firestore = getFirestoreForApp(appName);
    WriteBatch batch = firestore.batch();
    final List<Object> writesArray = FirestoreSerialize.parseDocumentBatches(firestore, writes);

    for (Object w : writesArray) {
      Map<String, Object> write = (Map) w;
      String type = (String) write.get("type");
      String path = (String) write.get("path");
      Map<String, Object> data = (Map) write.get("data");

      DocumentReference ref = firestore.document(path);
      switch (type) {
        case "DELETE":
          batch = batch.delete(ref);
          break;
        case "SET":
          Map<String, Object> options = (Map) write.get("options");
          if (options != null && options.containsKey("merge") && (boolean) options.get("merge")) {
            batch = batch.set(ref, data, SetOptions.merge());
          } else {
            batch = batch.set(ref, data);
          }

          break;
        case "UPDATE":
          batch = batch.update(ref, data);
          break;
      }
    }

    batch.commit().addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "documentBatch:onComplete:success");
          promise.resolve(null);
        } else {
          Log.e(TAG, "documentBatch:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, (FirebaseFirestoreException) task.getException());
        }
      }
    });
  }

  @ReactMethod
  public void documentDelete(String appName, String path, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.delete(promise);
  }

  @ReactMethod
  public void documentGet(
    String appName,
    String path,
    ReadableMap getOptions,
    final Promise promise
  ) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.get(getOptions, promise);
  }

  @ReactMethod
  public void documentOffSnapshot(String appName, String path, String listenerId) {
    RNFirebaseFirestoreDocumentReference.offSnapshot(listenerId);
  }

  @ReactMethod
  public void documentOnSnapshot(
    String appName, String path, String listenerId,
    ReadableMap docListenOptions
  ) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.onSnapshot(listenerId, docListenOptions);
  }

  @ReactMethod
  public void documentSet(
    String appName,
    String path,
    ReadableMap data,
    ReadableMap options,
    final Promise promise
  ) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.set(data, options, promise);
  }


  /*
   * Transaction Methods
   */

  @ReactMethod
  public void documentUpdate(String appName, String path, ReadableMap data, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.update(data, promise);
  }

  @ReactMethod
  public void settings(String appName, ReadableMap settings, final Promise promise) {
    FirebaseFirestore firestore = getFirestoreForApp(appName);
    FirebaseFirestoreSettings.Builder firestoreSettings = new FirebaseFirestoreSettings.Builder();
    if (settings.hasKey("host")) {
      firestoreSettings.setHost(settings.getString("host"));
    } else {
      firestoreSettings.setHost(firestore.getFirestoreSettings().getHost());
    }
    if (settings.hasKey("persistence")) {
      firestoreSettings.setPersistenceEnabled(settings.getBoolean("persistence"));
    } else {
      firestoreSettings.setPersistenceEnabled(firestore.getFirestoreSettings().isPersistenceEnabled());
    }
    if (settings.hasKey("ssl")) {
      firestoreSettings.setSslEnabled(settings.getBoolean("ssl"));
    } else {
      firestoreSettings.setSslEnabled(firestore.getFirestoreSettings().isSslEnabled());
    }

//    if (settings.hasKey("timestampsInSnapshots")) {
//      // TODO: Not supported on Android yet
//    }

    firestore.setFirestoreSettings(firestoreSettings.build());
    promise.resolve(null);
  }

  /**
   * Try clean up previous transactions on reload
   */
  @Override
  public void onCatalystInstanceDestroy() {
    for (int i = 0, size = transactionHandlers.size(); i < size; i++) {
      RNFirebaseFirestoreTransactionHandler transactionHandler = transactionHandlers.get(i);
      if (transactionHandler != null) {
        transactionHandler.abort();
      }
    }

    transactionHandlers.clear();
  }

  /**
   * Calls the internal Firestore Transaction classes instance .get(ref) method and resolves with
   * the DocumentSnapshot.
   *
   * @param appName       appName
   * @param transactionId transactionId
   * @param path          path
   * @param promise       promise
   */
  @ReactMethod
  public void transactionGetDocument(
    String appName,
    int transactionId,
    String path,
    final Promise promise
  ) {
    RNFirebaseFirestoreTransactionHandler handler = transactionHandlers.get(transactionId);

    if (handler == null) {
      promise.reject(
        "internal-error",
        "An internal error occurred whilst attempting to find a native transaction by id."
      );
    } else {
      DocumentReference ref = getDocumentForAppPath(appName, path).getRef();
      handler.getDocument(ref, promise);
    }
  }


  /*
   * INTERNALS/UTILS
   */

  /**
   * Aborts any pending signals and deletes the transaction handler.
   *
   * @param appName       appName
   * @param transactionId transactionId
   */
  @ReactMethod
  public void transactionDispose(String appName, int transactionId) {
    RNFirebaseFirestoreTransactionHandler handler = transactionHandlers.get(transactionId);

    if (handler != null) {
      handler.abort();
      transactionHandlers.delete(transactionId);
    }
  }

  /**
   * Signals to transactionHandler that the command buffer is ready.
   *
   * @param appName       appName
   * @param transactionId transactionId
   * @param commandBuffer commandBuffer
   */
  @ReactMethod
  public void transactionApplyBuffer(
    String appName,
    int transactionId,
    ReadableArray commandBuffer
  ) {
    RNFirebaseFirestoreTransactionHandler handler = transactionHandlers.get(transactionId);

    if (handler != null) {
      handler.signalBufferReceived(commandBuffer);
    }
  }

  /**
   * Begin a new transaction via AsyncTask 's
   *
   * @param appName       appName
   * @param transactionId transactionId
   */
  @ReactMethod
  public void transactionBegin(final String appName, int transactionId) {
    final RNFirebaseFirestoreTransactionHandler transactionHandler = new RNFirebaseFirestoreTransactionHandler(
      appName,
      transactionId
    );

    transactionHandlers.put(transactionId, transactionHandler);

    AsyncTask.execute(new Runnable() {
      @Override
      public void run() {
        getFirestoreForApp(appName)
          .runTransaction(new Transaction.Function<Void>() {
            @Override
            public Void apply(@NonNull Transaction transaction) throws FirebaseFirestoreException {
              transactionHandler.resetState(transaction);

              // emit the update cycle to JS land using an async task
              // otherwise it gets blocked by the pending lock await
              AsyncTask.execute(new Runnable() {
                @Override
                public void run() {
                  WritableMap eventMap = transactionHandler.createEventMap(null, "update");
                  Utils.sendEvent(
                    getReactApplicationContext(),
                    "firestore_transaction_event",
                    eventMap
                  );
                }
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
                RNFirebaseFirestoreDocumentReference documentReference = getDocumentForAppPath(
                  appName,
                  path
                );

                switch (type) {
                  case "set":
                    data = command.getMap("data");
                    ReadableMap options = command.getMap("options");
                    Map<String, Object> setData = FirestoreSerialize.parseReadableMap(
                      RNFirebaseFirestore.getFirestoreForApp(appName),
                      data
                    );

                    if (options != null && options.hasKey("merge") && options.getBoolean("merge")) {
                      transaction.set(documentReference.getRef(), setData, SetOptions.merge());
                    } else {
                      transaction.set(documentReference.getRef(), setData);
                    }
                    break;
                  case "update":
                    data = command.getMap("data");

                    Map<String, Object> updateData = FirestoreSerialize.parseReadableMap(
                      RNFirebaseFirestore.getFirestoreForApp(appName),
                      data
                    );

                    transaction.update(documentReference.getRef(), updateData);
                    break;
                  case "delete":
                    transaction.delete(documentReference.getRef());
                    break;
                  default:
                    throw new IllegalArgumentException("Unknown command type at index " + i + ".");
                }
              }

              return null;
            }
          })
          .addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
              if (!transactionHandler.aborted) {
                Log.d(TAG, "Transaction onSuccess!");
                WritableMap eventMap = transactionHandler.createEventMap(null, "complete");
                Utils.sendEvent(
                  getReactApplicationContext(),
                  "firestore_transaction_event",
                  eventMap
                );
              }
            }
          })
          .addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception e) {
              if (!transactionHandler.aborted) {
                Log.w(TAG, "Transaction onFailure.", e);
                WritableMap eventMap = transactionHandler.createEventMap(
                  (FirebaseFirestoreException) e,
                  "error"
                );
                Utils.sendEvent(
                  getReactApplicationContext(),
                  "firestore_transaction_event",
                  eventMap
                );
              }
            }
          });
      }
    });
  }

  /**
   * Get a collection reference for a specific app and path
   *
   * @param appName appName
   * @param filters filters
   * @param orders  orders
   * @param options options
   * @param path    @return
   */
  private RNFirebaseFirestoreCollectionReference getCollectionForAppPath(
    String appName, String path,
    ReadableArray filters,
    ReadableArray orders,
    ReadableMap options
  ) {
    return new RNFirebaseFirestoreCollectionReference(
      this.getReactApplicationContext(),
      appName,
      path,
      filters,
      orders,
      options
    );
  }

  /**
   * Get a document reference for a specific app and path
   *
   * @param appName appName
   * @param path    path
   * @return RNFirebaseFirestoreDocumentReference
   */
  private RNFirebaseFirestoreDocumentReference getDocumentForAppPath(String appName, String path) {
    return new RNFirebaseFirestoreDocumentReference(
      this.getReactApplicationContext(),
      appName,
      path
    );
  }

  /**
   * React Method - returns this module name
   *
   * @return
   */
  @Override
  public String getName() {
    return "RNFirebaseFirestore";
  }

  /**
   * React Native constants for RNFirebaseFirestore
   *
   * @return
   */
  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("deleteFieldValue", FieldValue.delete().toString());
    constants.put("serverTimestampFieldValue", FieldValue.serverTimestamp().toString());
    return constants;
  }
}
