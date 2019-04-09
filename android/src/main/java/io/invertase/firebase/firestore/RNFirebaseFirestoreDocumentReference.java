package io.invertase.firebase.firestore;

import android.annotation.SuppressLint;
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

import javax.annotation.Nonnull;

import io.invertase.firebase.Utils;

public class RNFirebaseFirestoreDocumentReference {
  private static final String TAG = "RNFBFSDocumentReference";
  private static Map<String, ListenerRegistration> documentSnapshotListeners = new HashMap<>();

  private final String appName;
  private final String path;
  private final DocumentReference ref;
  private ReactContext reactContext;

  RNFirebaseFirestoreDocumentReference(ReactContext reactContext, String appName, String path) {
    this.path = path;
    this.appName = appName;
    this.reactContext = reactContext;
    this.ref = RNFirebaseFirestore
      .getFirestoreForApp(appName)
      .document(path);
  }

  static void offSnapshot(final String listenerId) {
    ListenerRegistration listenerRegistration = documentSnapshotListeners.remove(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
    }
  }

  void delete(final Promise promise) {
    this.ref
      .delete()
      .addOnCompleteListener(new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@Nonnull Task<Void> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "delete:onComplete:success");
            promise.resolve(null);
          } else {
            Log.e(TAG, "delete:onComplete:failure", task.getException());
            RNFirebaseFirestore.promiseRejectException(
              promise,
              (FirebaseFirestoreException) task.getException()
            );
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

    @SuppressLint("StaticFieldLeak") final DocumentSnapshotSerializeAsyncTask serializeAsyncTask = new DocumentSnapshotSerializeAsyncTask(
      reactContext, this
    ) {
      @Override
      protected void onPostExecute(WritableMap writableMap) {
        promise.resolve(writableMap);
      }
    };

    this.ref
      .get(source)
      .addOnCompleteListener(new OnCompleteListener<DocumentSnapshot>() {
        @Override
        public void onComplete(@Nonnull Task<DocumentSnapshot> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "get:onComplete:success");
            serializeAsyncTask.execute(task.getResult());
          } else {
            Log.e(TAG, "get:onComplete:failure", task.getException());
            RNFirebaseFirestore.promiseRejectException(
              promise,
              (FirebaseFirestoreException) task.getException()
            );
          }
        }
      });
  }

  void onSnapshot(final String listenerId, final ReadableMap docListenOptions) {
    if (!documentSnapshotListeners.containsKey(listenerId)) {
      final EventListener<DocumentSnapshot> listener = new EventListener<DocumentSnapshot>() {
        @Override
        public void onEvent(
          DocumentSnapshot documentSnapshot,
          FirebaseFirestoreException exception
        ) {
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

      ListenerRegistration listenerRegistration = this.ref.addSnapshotListener(
        metadataChanges,
        listener
      );

      documentSnapshotListeners.put(listenerId, listenerRegistration);
    }
  }

  public void set(final ReadableMap data, final ReadableMap options, final Promise promise) {
    Task<Void> task;

    Map<String, Object> map = FirestoreSerialize.parseReadableMap(
      RNFirebaseFirestore.getFirestoreForApp(appName),
      data
    );

    if (options != null && options.hasKey("merge") && options.getBoolean("merge")) {
      task = this.ref.set(map, SetOptions.merge());
    } else {
      task = this.ref.set(map);
    }

    task.addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@Nonnull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "set:onComplete:success");
          promise.resolve(null);
        } else {
          Log.e(TAG, "set:onComplete:failure", task.getException());
          RNFirebaseFirestore.promiseRejectException(
            promise,
            (FirebaseFirestoreException) task.getException()
          );
        }
      }
    });
  }

  void update(final ReadableMap data, final Promise promise) {
    Map<String, Object> map = FirestoreSerialize.parseReadableMap(
      RNFirebaseFirestore.getFirestoreForApp(appName),
      data
    );

    this.ref
      .update(map)
      .addOnCompleteListener(new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@Nonnull Task<Void> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "update:onComplete:success");
            promise.resolve(null);
          } else {
            Log.e(TAG, "update:onComplete:failure", task.getException());
            RNFirebaseFirestore.promiseRejectException(
              promise,
              (FirebaseFirestoreException) task.getException()
            );
          }
        }
      });
  }

  /*
   * INTERNALS/UTILS
   */

  DocumentReference getRef() {
    return ref;
  }

  boolean hasListeners() {
    return !documentSnapshotListeners.isEmpty();
  }

  /**
   * Handles documentSnapshot events.
   *
   * @param listenerId       id
   * @param documentSnapshot snapshot
   */
  private void handleDocumentSnapshotEvent(
    final String listenerId,
    DocumentSnapshot documentSnapshot
  ) {
    @SuppressLint("StaticFieldLeak") final DocumentSnapshotSerializeAsyncTask serializeAsyncTask = new DocumentSnapshotSerializeAsyncTask(
      reactContext, this
    ) {
      @Override
      protected void onPostExecute(WritableMap writableMap) {
        WritableMap event = Arguments.createMap();
        event.putString("path", path);
        event.putString("appName", appName);
        event.putString("listenerId", listenerId);
        event.putMap("documentSnapshot", writableMap);
        Utils.sendEvent(reactContext, "firestore_document_sync_event", event);
      }
    };

    serializeAsyncTask.execute(documentSnapshot);
  }

  /**
   * Handles a documentSnapshot error event
   *
   * @param listenerId id
   * @param exception  exception
   */
  private void handleDocumentSnapshotError(
    String listenerId,
    FirebaseFirestoreException exception
  ) {
    WritableMap event = Arguments.createMap();

    event.putString("path", path);
    event.putString("appName", appName);
    event.putString("listenerId", listenerId);
    event.putMap("error", RNFirebaseFirestore.getJSError(exception));

    Utils.sendEvent(reactContext, "firestore_document_sync_event", event);
  }
}
