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
  private HashMap<String, RNFirebaseFirestoreCollectionReference> collectionReferences = new HashMap<>();
  private HashMap<String, RNFirebaseFirestoreDocumentReference> documentReferences = new HashMap<>();
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
  public void documentBatch(final String appName, final ReadableArray writes,
                            final ReadableMap commitOptions, final Promise promise) {
    FirebaseFirestore firestore = getFirestoreForApp(appName);
    WriteBatch batch = firestore.batch();
    final List<Object> writesArray = Utils.recursivelyDeconstructReadableArray(writes);

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
          Log.d(TAG, "set:onComplete:success");
          WritableArray result = Arguments.createArray();
          for (Object w : writesArray) {
            // Missing fields from web SDK
            // writeTime
            result.pushMap(Arguments.createMap());
          }
          promise.resolve(result);
        } else {
          Log.e(TAG, "set:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, (FirebaseFirestoreException)task.getException());
        }
      }
    });
  }

  @ReactMethod
  public void documentCollections(String appName, String path, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.collections(promise);
  }

  @ReactMethod
  public void documentCreate(String appName, String path, ReadableMap data, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.create(data, promise);
  }

  @ReactMethod
  public void documentDelete(String appName, String path, ReadableMap options, final Promise promise) {
    RNFirebaseFirestoreDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.delete(options, promise);
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
  public void documentOffSnapshot(String appName, String path, int listenerId) {
    RNFirebaseFirestoreDocumentReference ref = getCachedDocumentForAppPath(appName, path);
    ref.offSnapshot(listenerId);

    if (!ref.hasListeners()) {
      clearCachedDocumentForAppPath(appName, path);
    }
  }

  @ReactMethod
  public void documentOnSnapshot(String appName, String path, int listenerId) {
    RNFirebaseFirestoreDocumentReference ref = getCachedDocumentForAppPath(appName, path);
    ref.onSnapshot(listenerId);
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
    return new RNFirebaseFirestoreCollectionReference(appName, path, filters, orders, options);
  }

  /**
   * Get a cached document reference for a specific app and path
   *
   * @param appName
   * @param path
   * @return
   */
  private RNFirebaseFirestoreDocumentReference getCachedDocumentForAppPath(String appName, String path) {
    String key = appName + "/" + path;
    RNFirebaseFirestoreDocumentReference ref = documentReferences.get(key);
    if (ref == null) {
      ref = getDocumentForAppPath(appName, path);
      documentReferences.put(key, ref);
    }
    return ref;
  }

  /**
   * Clear a cached document reference for a specific app and path
   *
   * @param appName
   * @param path
   * @return
   */
  private void clearCachedDocumentForAppPath(String appName, String path) {
    String key = appName + "/" + path;
    documentReferences.remove(key);
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
        message = ErrorUtils.getMessageWithService("Cancelled.", service, code);
        break;
      case UNKNOWN:
        code = ErrorUtils.getCodeWithService(service, "unknown");
        message = ErrorUtils.getMessageWithService("An unknown error occurred.", service, code);
        break;
      case INVALID_ARGUMENT:
        code = ErrorUtils.getCodeWithService(service, "invalid-argument");
        message = ErrorUtils.getMessageWithService("Invalid argument.", service, code);
        break;
      case NOT_FOUND:
        code = ErrorUtils.getCodeWithService(service, "not-found");
        message = ErrorUtils.getMessageWithService("Not found.", service, code);
        break;
      case ALREADY_EXISTS:
        code = ErrorUtils.getCodeWithService(service, "already-exists");
        message = ErrorUtils.getMessageWithService("Already exists.", service, code);
        break;
      case PERMISSION_DENIED:
        code = ErrorUtils.getCodeWithService(service, "permission-denied");
        message = ErrorUtils.getMessageWithService("Permission denied.", service, code);
        break;
      case RESOURCE_EXHAUSTED:
        code = ErrorUtils.getCodeWithService(service, "resource-exhausted");
        message = ErrorUtils.getMessageWithService("Resource exhausted.", service, code);
        break;
      case FAILED_PRECONDITION:
        code = ErrorUtils.getCodeWithService(service, "failed-precondition");
        message = ErrorUtils.getMessageWithService("Failed precondition.", service, code);
        break;
      case ABORTED:
        code = ErrorUtils.getCodeWithService(service, "aborted");
        message = ErrorUtils.getMessageWithService("Aborted.", service, code);
        break;
      case OUT_OF_RANGE:
        code = ErrorUtils.getCodeWithService(service, "out-of-range");
        message = ErrorUtils.getMessageWithService("Out of range.", service, code);
        break;
      case UNIMPLEMENTED:
        code = ErrorUtils.getCodeWithService(service, "unimplemented");
        message = ErrorUtils.getMessageWithService("Unimplemented.", service, code);
        break;
      case INTERNAL:
        code = ErrorUtils.getCodeWithService(service, "internal");
        message = ErrorUtils.getMessageWithService("Internal.", service, code);
        break;
      case UNAVAILABLE:
        code = ErrorUtils.getCodeWithService(service, "unavailable");
        message = ErrorUtils.getMessageWithService("Unavailable.", service, code);
        break;
      case DATA_LOSS:
        code = ErrorUtils.getCodeWithService(service, "data-loss");
        message = ErrorUtils.getMessageWithService("Data loss.", service, code);
        break;
      case UNAUTHENTICATED:
        code = ErrorUtils.getCodeWithService(service, "unauthenticated");
        message = ErrorUtils.getMessageWithService("Unauthenticated.", service, code);
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
