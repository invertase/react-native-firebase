package io.invertase.firebase.firestore;

import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.firestore.WriteBatch;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.ErrorUtils;
import io.invertase.firebase.Utils;


public class RNFirebaseFirestore extends ReactContextBaseJavaModule {
  private static final String TAG = "RNFirebaseFirestore";
  // private SparseArray<RNFirebaseTransactionHandler> transactionHandlers = new SparseArray<>();

  RNFirebaseFirestore(ReactApplicationContext reactContext) {
    super(reactContext);
  }


  /*
   * REACT NATIVE METHODS
   */
  @ReactMethod
  public void collectionGet(String appName, String path, ReadableArray filters,
                            ReadableArray orders, ReadableMap options, final Promise promise) {
    RNFirebaseFirestoreCollectionReference ref = getCollectionForAppPath(appName, path, filters, orders, options);
    ref.get(promise);
  }

  @ReactMethod
  public void collectionOffSnapshot(String appName, String path, ReadableArray filters,
                                    ReadableArray orders, ReadableMap options, String listenerId) {
    RNFirebaseFirestoreCollectionReference.offSnapshot(listenerId);
  }

  @ReactMethod
  public void collectionOnSnapshot(String appName, String path, ReadableArray filters,
                                   ReadableArray orders, ReadableMap options, String listenerId,
                                   ReadableMap queryListenOptions) {
    RNFirebaseFirestoreCollectionReference ref = getCollectionForAppPath(appName, path, filters, orders, options);
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
          if (options != null && options.containsKey("merge") && (boolean)options.get("merge")) {
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
          RNFirebaseFirestore.promiseRejectException(promise, (FirebaseFirestoreException)task.getException());
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
  public void documentGet(String appName, String path, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.get(promise);
  }

  @ReactMethod
  public void documentGetAll(String appName, ReadableArray documents, final Promise promise) {
    // Not supported on Android out of the box
  }

  @ReactMethod
  public void documentOffSnapshot(String appName, String path, String listenerId) {
    RNFirebaseFirestoreDocumentReference.offSnapshot(listenerId);
  }

  @ReactMethod
  public void documentOnSnapshot(String appName, String path, String listenerId,
                                 ReadableMap docListenOptions) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.onSnapshot(listenerId, docListenOptions);
  }

  @ReactMethod
  public void documentSet(String appName, String path, ReadableMap data, ReadableMap options, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.set(data, options, promise);
  }

  @ReactMethod
  public void documentUpdate(String appName, String path, ReadableMap data, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.update(data, promise);
  }

  /*
   * INTERNALS/UTILS
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
   * @param appName
   * @return
   */
  static FirebaseFirestore getFirestoreForApp(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    return FirebaseFirestore.getInstance(firebaseApp);
  }

  /**
   * Get a collection reference for a specific app and path
   *
   * @param appName
   * @param filters
   * @param orders
   * @param options
   * @param path  @return
   */
  private RNFirebaseFirestoreCollectionReference getCollectionForAppPath(String appName, String path,
                                                                         ReadableArray filters,
                                                                         ReadableArray orders,
                                                                         ReadableMap options) {
    return new RNFirebaseFirestoreCollectionReference(this.getReactApplicationContext(), appName, path, filters, orders, options);
  }

  /**
   * Get a document reference for a specific app and path
   *
   * @param appName
   * @param path
   * @return
   */
  private RNFirebaseFirestoreDocumentReference getDocumentForAppPath(String appName, String path) {
    return new RNFirebaseFirestoreDocumentReference(this.getReactApplicationContext(), appName, path);
  }

  /**
   * Convert as firebase DatabaseError instance into a writable map
   * with the correct web-like error codes.
   *
   * @param nativeException
   * @return
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
        message = ErrorUtils.getMessageWithService("Unknown error or an error from a different error domain.", service, code);
        break;
      case INVALID_ARGUMENT:
        code = ErrorUtils.getCodeWithService(service, "invalid-argument");
        message = ErrorUtils.getMessageWithService("Client specified an invalid argument.", service, code);
        break;
      case DEADLINE_EXCEEDED:
        code = ErrorUtils.getCodeWithService(service, "deadline-exceeded");
        message = ErrorUtils.getMessageWithService("Deadline expired before operation could complete.", service, code);
        break;
      case NOT_FOUND:
        code = ErrorUtils.getCodeWithService(service, "not-found");
        message = ErrorUtils.getMessageWithService("Some requested document was not found.", service, code);
        break;
      case ALREADY_EXISTS:
        code = ErrorUtils.getCodeWithService(service, "already-exists");
        message = ErrorUtils.getMessageWithService("Some document that we attempted to create already exists.", service, code);
        break;
      case PERMISSION_DENIED:
        code = ErrorUtils.getCodeWithService(service, "permission-denied");
        message = ErrorUtils.getMessageWithService("The caller does not have permission to execute the specified operation.", service, code);
        break;
      case RESOURCE_EXHAUSTED:
        code = ErrorUtils.getCodeWithService(service, "resource-exhausted");
        message = ErrorUtils.getMessageWithService("Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.", service, code);
        break;
      case FAILED_PRECONDITION:
        code = ErrorUtils.getCodeWithService(service, "failed-precondition");
        message = ErrorUtils.getMessageWithService("Operation was rejected because the system is not in a state required for the operation`s execution.", service, code);
        break;
      case ABORTED:
        code = ErrorUtils.getCodeWithService(service, "aborted");
        message = ErrorUtils.getMessageWithService("The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.", service, code);
        break;
      case OUT_OF_RANGE:
        code = ErrorUtils.getCodeWithService(service, "out-of-range");
        message = ErrorUtils.getMessageWithService("Operation was attempted past the valid range.", service, code);
        break;
      case UNIMPLEMENTED:
        code = ErrorUtils.getCodeWithService(service, "unimplemented");
        message = ErrorUtils.getMessageWithService("Operation is not implemented or not supported/enabled.", service, code);
        break;
      case INTERNAL:
        code = ErrorUtils.getCodeWithService(service, "internal");
        message = ErrorUtils.getMessageWithService("Internal errors.", service, code);
        break;
      case UNAVAILABLE:
        code = ErrorUtils.getCodeWithService(service, "unavailable");
        message = ErrorUtils.getMessageWithService("The service is currently unavailable.", service, code);
        break;
      case DATA_LOSS:
        code = ErrorUtils.getCodeWithService(service, "data-loss");
        message = ErrorUtils.getMessageWithService("Unrecoverable data loss or corruption.", service, code);
        break;
      case UNAUTHENTICATED:
        code = ErrorUtils.getCodeWithService(service, "unauthenticated");
        message = ErrorUtils.getMessageWithService("The request does not have valid authentication credentials for the operation.", service, code);
        break;
      default:
        code = ErrorUtils.getCodeWithService(service, "unknown");
        message = ErrorUtils.getMessageWithService("An unknown error occurred.", service, code);
    }

    errorMap.putString("code", code);
    errorMap.putString("message", message);
    return errorMap;
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
