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
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.firestore.WriteBatch;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.Utils;


public class RNFirebaseFirestore extends ReactContextBaseJavaModule {
  private static final String TAG = "RNFirebaseFirestore";
  // private HashMap<String, RNFirebaseDatabaseReference> references = new HashMap<>();
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
    RNFirebaseCollectionReference ref = getCollectionForAppPath(appName, path, filters, orders, options);
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
          SetOptions setOptions = null;
          if (options != null && options.containsKey("merge") && (boolean)options.get("merge")) {
            setOptions = SetOptions.merge();
          }
          batch = batch.set(ref, data, setOptions);
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
          RNFirebaseFirestore.promiseRejectException(promise, task.getException());
        }
      }
    });
  }

  @ReactMethod
  public void documentCollections(String appName, String path, final Promise promise) {
    RNFirebaseDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.collections(promise);
  }

  @ReactMethod
  public void documentCreate(String appName, String path, ReadableMap data, final Promise promise) {
    RNFirebaseDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.create(data, promise);
  }

  @ReactMethod
  public void documentDelete(String appName, String path, ReadableMap options, final Promise promise) {
    RNFirebaseDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.delete(options, promise);
  }

  @ReactMethod
  public void documentGet(String appName, String path, final Promise promise) {
    RNFirebaseDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.get(promise);
  }

  @ReactMethod
  public void documentGetAll(String appName, ReadableArray documents, final Promise promise) {
    // Not supported on Android out of the box
  }

  @ReactMethod
  public void documentSet(String appName, String path, ReadableMap data, ReadableMap options, final Promise promise) {
    RNFirebaseDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.set(data, options, promise);
  }

  @ReactMethod
  public void documentUpdate(String appName, String path, ReadableMap data, ReadableMap options, final Promise promise) {
    RNFirebaseDocumentReference ref = getDocumentForAppPath(appName, path);
    ref.update(data, options, promise);
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
  static void promiseRejectException(Promise promise, Exception exception) {
    // TODO
    // WritableMap jsError = getJSError(exception);
    promise.reject(
      "TODO", // jsError.getString("code"),
      exception.getMessage(), // jsError.getString("message"),
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
  private RNFirebaseCollectionReference getCollectionForAppPath(String appName, String path,
                                                                ReadableArray filters,
                                                                ReadableArray orders,
                                                                ReadableMap options) {
    return new RNFirebaseCollectionReference(appName, path, filters, orders, options);
  }

  /**
   * Get a document reference for a specific app and path
   *
   * @param appName
   * @param path
   * @return
   */
  private RNFirebaseDocumentReference getDocumentForAppPath(String appName, String path) {
    return new RNFirebaseDocumentReference(appName, path);
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
    constants.put("deleteFieldValue", FieldValue.delete());
    constants.put("serverTimestampFieldValue", FieldValue.serverTimestamp());
    return constants;
  }
}
