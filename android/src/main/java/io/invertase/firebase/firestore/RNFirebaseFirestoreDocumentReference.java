package io.invertase.firebase.firestore;

import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.MetadataChanges;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.firestore.Source;

import java.util.HashMap;
import java.util.Map;

import io.invertase.firebase.Utils;


public class RNFirebaseFirestoreDocumentReference {
  private static final String TAG = "RNFBFSDocumentReference";
  private static Map<String, ListenerRegistration> documentSnapshotListeners = new HashMap<>();

  private final String appName;
  private final String path;
  private ReactContext reactContext;
  private final DocumentReference ref;

  RNFirebaseFirestoreDocumentReference(ReactContext reactContext, String appName, String path) {
    this.appName = appName;
    this.path = path;
    this.reactContext = reactContext;
    this.ref = RNFirebaseFirestore.getFirestoreForApp(appName).document(path);
  }

  public void delete(final Promise promise) {
    this.ref.delete().addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "delete:onComplete:success");
          promise.resolve(null);
        } else {
          Log.e(TAG, "delete:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, (FirebaseFirestoreException)task.getException());
        }
      }
    });
  }

  void get(final ReadableMap getOptions, final Promise promise) {
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
    this.ref.get(source).addOnCompleteListener(new OnCompleteListener<DocumentSnapshot>() {
      @Override
      public void onComplete(@NonNull Task<DocumentSnapshot> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "get:onComplete:success");
          WritableMap data = FirestoreSerialize.snapshotToWritableMap(task.getResult());
          promise.resolve(data);
        } else {
          Log.e(TAG, "get:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, (FirebaseFirestoreException)task.getException());
        }
      }
    });
  }

  public static void offSnapshot(final String listenerId) {
    ListenerRegistration listenerRegistration = documentSnapshotListeners.remove(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
    }
  }

  public void onSnapshot(final String listenerId, final ReadableMap docListenOptions) {
    if (!documentSnapshotListeners.containsKey(listenerId)) {
      final EventListener<DocumentSnapshot> listener = new EventListener<DocumentSnapshot>() {
        @Override
        public void onEvent(DocumentSnapshot documentSnapshot, FirebaseFirestoreException exception) {
          if (exception == null) {
            handleDocumentSnapshotEvent(listenerId, documentSnapshot);
          } else {
            ListenerRegistration listenerRegistration = documentSnapshotListeners.remove(listenerId);
            if (listenerRegistration != null) {
              listenerRegistration.remove();
            }
            handleDocumentSnapshotError(listenerId, exception);
          }
        }
      };
      MetadataChanges metadataChanges;
      if (docListenOptions != null
        && docListenOptions.hasKey("includeMetadataChanges")
        && docListenOptions.getBoolean("includeMetadataChanges")) {
        metadataChanges = MetadataChanges.INCLUDE;
      } else {
        metadataChanges = MetadataChanges.EXCLUDE;
      }
      ListenerRegistration listenerRegistration = this.ref.addSnapshotListener(metadataChanges, listener);
      documentSnapshotListeners.put(listenerId, listenerRegistration);
    }
  }

  public void set(final ReadableMap data, final ReadableMap options, final Promise promise) {
    Map<String, Object> map = FirestoreSerialize.parseReadableMap(RNFirebaseFirestore.getFirestoreForApp(appName), data);
    Task<Void> task;
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
          promise.resolve(null);
        } else {
          Log.e(TAG, "set:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, (FirebaseFirestoreException)task.getException());
        }
      }
    });
  }

  public void update(final ReadableMap data, final Promise promise) {
    Map<String, Object> map = FirestoreSerialize.parseReadableMap(RNFirebaseFirestore.getFirestoreForApp(appName), data);
    this.ref.update(map).addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "update:onComplete:success");
          promise.resolve(null);
        } else {
          Log.e(TAG, "update:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(promise, (FirebaseFirestoreException)task.getException());
        }
      }
    });
  }

  /*
   * INTERNALS/UTILS
   */

  public DocumentReference getRef() {
    return ref;
  }

  boolean hasListeners() {
    return !documentSnapshotListeners.isEmpty();
  }

  /**
   * Handles documentSnapshot events.
   *
   * @param listenerId
   * @param documentSnapshot
   */
  private void handleDocumentSnapshotEvent(String listenerId, DocumentSnapshot documentSnapshot) {
    WritableMap event = Arguments.createMap();
    WritableMap data = FirestoreSerialize.snapshotToWritableMap(documentSnapshot);

    event.putString("appName", appName);
    event.putString("path", path);
    event.putString("listenerId", listenerId);
    event.putMap("documentSnapshot", data);

    Utils.sendEvent(reactContext, "firestore_document_sync_event", event);
  }

  /**
   * Handles a documentSnapshot error event
   *
   * @param listenerId
   * @param exception
   */
  private void handleDocumentSnapshotError(String listenerId, FirebaseFirestoreException exception) {
    WritableMap event = Arguments.createMap();

    event.putString("appName", appName);
    event.putString("path", path);
    event.putString("listenerId", listenerId);
    event.putMap("error", RNFirebaseFirestore.getJSError(exception));

    Utils.sendEvent(reactContext, "firestore_document_sync_event", event);
  }
}
