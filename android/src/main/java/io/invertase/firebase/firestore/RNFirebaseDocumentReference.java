package io.invertase.firebase.firestore;

import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.SetOptions;

import java.util.Map;

import io.invertase.firebase.Utils;


public class RNFirebaseDocumentReference {
  private static final String TAG = "RNFBDocumentReference";
  private final String appName;
  private final String path;
  private final DocumentReference ref;

  RNFirebaseDocumentReference(String appName, String path) {
    this.appName = appName;
    this.path = path;
    this.ref = RNFirebaseFirestore.getFirestoreForApp(appName).document(path);
  }

  public void create(ReadableMap data, Promise promise) {
    // Not supported on Android out of the box
  }

  public void delete(final ReadableMap options, final Promise promise) {
    this.ref.delete().addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "delete:onComplete:success");
          // Missing fields from web SDK
          // writeTime
          promise.resolve(Arguments.createMap());
        } else {
          Log.e(TAG, "delete:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, task.getException());
        }
      }
    });
  }

  void get(final Promise promise) {
    this.ref.get().addOnCompleteListener(new OnCompleteListener<DocumentSnapshot>() {
      @Override
      public void onComplete(@NonNull Task<DocumentSnapshot> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "get:onComplete:success");
          WritableMap data = FirestoreSerialize.snapshotToWritableMap(task.getResult());
          promise.resolve(data);
        } else {
          Log.e(TAG, "get:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, task.getException());
        }
      }
    });
  }

  public void set(final ReadableMap data, final ReadableMap options, final Promise promise) {
    Map<String, Object> map = Utils.recursivelyDeconstructReadableMap(data);
    Task<Void> task;
    SetOptions setOptions = null;
    if (options != null && options.hasKey("merge") && options.getBoolean("merge")) {
      task = this.ref.set(map, SetOptions.merge());
    } else {
      task = this.ref.set(map);
    }
    task.addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "set:onComplete:success");
          // Missing fields from web SDK
          // writeTime
          promise.resolve(Arguments.createMap());
        } else {
          Log.e(TAG, "set:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, task.getException());
        }
      }
    });
  }

  public void update(final ReadableMap data, final Promise promise) {
    Map<String, Object> map = Utils.recursivelyDeconstructReadableMap(data);
    this.ref.update(map).addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "update:onComplete:success");
          // Missing fields from web SDK
          // writeTime
          promise.resolve(Arguments.createMap());
        } else {
          Log.e(TAG, "update:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, task.getException());
        }
      }
    });
  }

  public void collections(Promise promise) {
    // Not supported on Android out of the box
  }
}
