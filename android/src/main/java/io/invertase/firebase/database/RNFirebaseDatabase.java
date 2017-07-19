package io.invertase.firebase.database;

import java.util.Map;
import java.util.List;
import java.util.HashMap;

import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import com.facebook.react.bridge.WritableNativeArray;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.MutableData;
import com.google.firebase.database.ServerValue;
import com.google.firebase.database.OnDisconnect;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.DatabaseException;
import com.google.firebase.database.Transaction;

import io.invertase.firebase.Utils;

public class RNFirebaseDatabase extends ReactContextBaseJavaModule {
  private static final String TAG = "RNFirebaseDatabase";
  private HashMap<Integer, RNFirebaseDatabaseReference> mReferences = new HashMap<>();
  private HashMap<String, RNFirebaseTransactionHandler> mTransactionHandlers = new HashMap<>();
  private FirebaseDatabase mFirebaseDatabase;

  public RNFirebaseDatabase(ReactApplicationContext reactContext) {
    super(reactContext);
    mFirebaseDatabase = FirebaseDatabase.getInstance();
  }

  @Override
  public String getName() {
    return TAG;
  }

  // Persistence
  @ReactMethod
  public void enablePersistence(
    final Boolean enable,
    final Callback callback) {
    try {
      mFirebaseDatabase.setPersistenceEnabled(enable);
    } catch (DatabaseException t) {

    }

    WritableMap res = Arguments.createMap();
    res.putString("status", "success");
    callback.invoke(null, res);
  }

  @ReactMethod
  public void keepSynced(
    final String path,
    final Boolean enable,
    final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    ref.keepSynced(enable);

    WritableMap res = Arguments.createMap();
    res.putString("status", "success");
    res.putString("path", path);
    callback.invoke(null, res);
  }

  // RNFirebaseDatabase
  @ReactMethod
  public void set(
    final String path,
    final ReadableMap props,
    final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(props);

    DatabaseReference.CompletionListener listener = new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("set", callback, error);
      }
    };

    ref.setValue(m.get("value"), listener);
  }

  @ReactMethod
  public void priority(
    final String path,
    final ReadableMap priority,
    final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    Map<String, Object> priorityMap = Utils.recursivelyDeconstructReadableMap(priority);

    DatabaseReference.CompletionListener listener = new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("priority", callback, error);
      }
    };

    ref.setPriority(priorityMap.get("value"), listener);
  }

  @ReactMethod
  public void withPriority(
    final String path,
    final ReadableMap data,
    final ReadableMap priority,
    final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    Map<String, Object> dataMap = Utils.recursivelyDeconstructReadableMap(data);
    Map<String, Object> priorityMap = Utils.recursivelyDeconstructReadableMap(priority);

    DatabaseReference.CompletionListener listener = new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("withPriority", callback, error);
      }
    };

    ref.setValue(dataMap.get("value"), priorityMap.get("value"), listener);
  }

  @ReactMethod
  public void update(final String path,
                     final ReadableMap props,
                     final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(props);

    DatabaseReference.CompletionListener listener = new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("update", callback, error);
      }
    };

    ref.updateChildren(m, listener);
  }

  @ReactMethod
  public void remove(final String path,
                     final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    DatabaseReference.CompletionListener listener = new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("remove", callback, error);
      }
    };

    ref.removeValue(listener);
  }

  @ReactMethod
  public void push(final String path,
                   final ReadableMap props,
                   final Callback callback) {

    Log.d(TAG, "Called push with " + path);
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    DatabaseReference newRef = ref.push();

    final Uri url = Uri.parse(newRef.toString());
    final String newPath = url.getPath();

    ReadableMapKeySetIterator iterator = props.keySetIterator();
    if (iterator.hasNextKey()) {
      Log.d(TAG, "Passed value to push");
      // lame way to check if the `props` are empty
      Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(props);

      DatabaseReference.CompletionListener listener = new DatabaseReference.CompletionListener() {
        @Override
        public void onComplete(DatabaseError error, DatabaseReference ref) {
          if (error != null) {
            WritableMap err = Arguments.createMap();
            err.putInt("code", error.getCode());
            err.putString("details", error.getDetails());
            err.putString("description", error.getMessage());
            callback.invoke(err);
          } else {
            WritableMap res = Arguments.createMap();
            res.putString("status", "success");
            res.putString("ref", newPath);
            callback.invoke(null, res);
          }
        }
      };

      newRef.setValue(m.get("value"), listener);
    } else {
      Log.d(TAG, "No value passed to push: " + newPath);
      WritableMap res = Arguments.createMap();
      res.putString("status", "success");
      res.putString("ref", newPath);
      callback.invoke(null, res);
    }
  }

  /**
   * @param path
   * @param id
   * @param applyLocally
   */
  @ReactMethod
  public void startTransaction(final String path, final String id, final Boolean applyLocally) {
    AsyncTask.execute(new Runnable() {
      @Override
      public void run() {
        DatabaseReference transactionRef = FirebaseDatabase.getInstance().getReference(path);

        transactionRef.runTransaction(new Transaction.Handler() {
          @Override
          public Transaction.Result doTransaction(MutableData mutableData) {
            final WritableMap updatesMap = Arguments.createMap();

            updatesMap.putString("id", id);
            updatesMap.putString("type", "update");

            if (!mutableData.hasChildren()) {
              Utils.mapPutValue("value", mutableData.getValue(), updatesMap);
            } else {
              Object value = Utils.castValue(mutableData);
              if (value instanceof WritableNativeArray) {
                updatesMap.putArray("value", (WritableArray) value);
              } else {
                updatesMap.putMap("value", (WritableMap) value);
              }
            }

            RNFirebaseTransactionHandler rnFirebaseTransactionHandler = new RNFirebaseTransactionHandler();
            mTransactionHandlers.put(id, rnFirebaseTransactionHandler);

            AsyncTask.execute(new Runnable() {
              @Override
              public void run() {
                Utils.sendEvent(getReactApplicationContext(), "database_transaction_event", updatesMap);
              }
            });

            try {
              rnFirebaseTransactionHandler.await();
            } catch (InterruptedException e) {
              rnFirebaseTransactionHandler.interrupted = true;
              return Transaction.abort();
            }

            if (rnFirebaseTransactionHandler.abort) {
              return Transaction.abort();
            }

            mutableData.setValue(rnFirebaseTransactionHandler.value);
            return Transaction.success(mutableData);
          }

          @Override
          public void onComplete(DatabaseError databaseError, boolean committed, DataSnapshot dataSnapshot) {
            final WritableMap updatesMap = Arguments.createMap();
            updatesMap.putString("id", id);

            RNFirebaseTransactionHandler rnFirebaseTransactionHandler = mTransactionHandlers.get(id);

            // TODO error conversion util for database to create web sdk codes based on DatabaseError
            if (databaseError != null) {
              updatesMap.putString("type", "error");

              updatesMap.putInt("code", databaseError.getCode());
              updatesMap.putString("message", databaseError.getMessage());
            } else if (rnFirebaseTransactionHandler.interrupted) {
              updatesMap.putString("type", "error");

              updatesMap.putInt("code", 666);
              updatesMap.putString("message", "RNFirebase transaction was interrupted, aborting.");
            } else {
              updatesMap.putString("type", "complete");
              updatesMap.putBoolean("committed", committed);
              updatesMap.putMap("snapshot", Utils.snapshotToMap(dataSnapshot));
            }

            Utils.sendEvent(getReactApplicationContext(), "database_transaction_event", updatesMap);
            mTransactionHandlers.remove(id);
          }
        }, applyLocally);
      }
    });
  }

  /**
   *
   * @param id
   * @param updates
   */
  @ReactMethod
  public void tryCommitTransaction(final String id, final ReadableMap updates) {
    Map<String, Object> updatesReturned = Utils.recursivelyDeconstructReadableMap(updates);
    RNFirebaseTransactionHandler rnFirebaseTransactionHandler = mTransactionHandlers.get(id);

    if (rnFirebaseTransactionHandler != null) {
      rnFirebaseTransactionHandler.signalUpdateReceived(updatesReturned);
    }
  }

  @ReactMethod
  public void on(final int refId, final String path, final ReadableArray modifiers, final int listenerId, final String eventName, final Callback callback) {
    RNFirebaseDatabaseReference ref = this.getDBHandle(refId, path, modifiers);

    if (eventName.equals("value")) {
      ref.addValueEventListener(listenerId);
    } else {
      ref.addChildEventListener(listenerId, eventName);
    }

    WritableMap resp = Arguments.createMap();
    resp.putString("status", "success");
    resp.putInt("refId", refId);
    resp.putString("handle", path);
    callback.invoke(null, resp);
  }

  @ReactMethod
  public void once(final int refId, final String path, final ReadableArray modifiers, final String eventName, final Callback callback) {
    RNFirebaseDatabaseReference ref = this.getDBHandle(refId, path, modifiers);

    if (eventName.equals("value")) {
      ref.addOnceValueEventListener(callback);
    } else {
      ref.addChildOnceEventListener(eventName, callback);
    }
  }

  /**
   * At the time of this writing, off() only gets called when there are no more subscribers to a given path.
   * `mListeners` might therefore be out of sync (though javascript isnt listening for those eventNames, so
   * it doesn't really matter- just polluting the RN bridge a little more than necessary.
   * off() should therefore clean *everything* up
   */
  @ReactMethod
  public void off(
    final int refId,
    final ReadableArray listeners,
    final Callback callback) {

    RNFirebaseDatabaseReference r = mReferences.get(refId);

    if (r != null) {
      List<Object> listenersList = Utils.recursivelyDeconstructReadableArray(listeners);

      for (Object l : listenersList) {
        Map<String, Object> listener = (Map) l;
        int listenerId = ((Double) listener.get("listenerId")).intValue();
        String eventName = (String) listener.get("eventName");
        r.removeEventListener(listenerId, eventName);
        if (!r.hasListeners()) {
          mReferences.remove(refId);
        }
      }
    }

    Log.d(TAG, "Removed listeners refId: " + refId + " ; count: " + listeners.size());
    WritableMap resp = Arguments.createMap();
    resp.putInt("refId", refId);
    resp.putString("status", "success");
    callback.invoke(null, resp);
  }

  @ReactMethod
  public void onDisconnectSet(final String path, final ReadableMap props, final Callback callback) {
    String type = props.getString("type");
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    OnDisconnect od = ref.onDisconnect();
    DatabaseReference.CompletionListener listener = new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("onDisconnectSet", callback, error);
      }
    };

    switch (type) {
      case "object":
        Map<String, Object> map = Utils.recursivelyDeconstructReadableMap(props.getMap("value"));
        od.setValue(map, listener);
        break;
      case "array":
        List<Object> list = Utils.recursivelyDeconstructReadableArray(props.getArray("value"));
        od.setValue(list, listener);
        break;
      case "string":
        od.setValue(props.getString("value"), listener);
        break;
      case "number":
        od.setValue(props.getDouble("value"), listener);
        break;
      case "boolean":
        od.setValue(props.getBoolean("value"), listener);
        break;
      case "null":
        od.setValue(null, listener);
        break;
    }
  }

  @ReactMethod
  public void onDisconnectUpdate(final String path, final ReadableMap props, final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);
    OnDisconnect od = ref.onDisconnect();
    Map<String, Object> map = Utils.recursivelyDeconstructReadableMap(props);
    od.updateChildren(map, new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("onDisconnectUpdate", callback, error);
      }
    });
  }

  @ReactMethod
  public void onDisconnectRemove(final String path, final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);

    OnDisconnect od = ref.onDisconnect();
    od.removeValue(new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("onDisconnectRemove", callback, error);
      }
    });
  }

  @ReactMethod
  public void onDisconnectCancel(final String path, final Callback callback) {
    DatabaseReference ref = mFirebaseDatabase.getReference(path);

    OnDisconnect od = ref.onDisconnect();
    od.cancel(new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        handleCallback("onDisconnectCancel", callback, error);
      }
    });
  }

  @ReactMethod
  public void goOnline() {
    mFirebaseDatabase.goOnline();
  }

  @ReactMethod
  public void goOffline() {
    mFirebaseDatabase.goOffline();
  }

  private void handleCallback(
    final String methodName,
    final Callback callback,
    final DatabaseError databaseError) {
    if (databaseError != null) {
      WritableMap err = Arguments.createMap();
      err.putInt("code", databaseError.getCode());
      err.putString("details", databaseError.getDetails());
      err.putString("description", databaseError.getMessage());
      callback.invoke(err);
    } else {
      WritableMap res = Arguments.createMap();
      res.putString("status", "success");
      res.putString("method", methodName);
      callback.invoke(null, res);
    }
  }

  private RNFirebaseDatabaseReference getDBHandle(final int refId, final String path,
    final ReadableArray modifiers) {
    RNFirebaseDatabaseReference r = mReferences.get(refId);

    if (r == null) {
      ReactContext ctx = getReactApplicationContext();
      r = new RNFirebaseDatabaseReference(ctx, mFirebaseDatabase, refId, path, modifiers);
      mReferences.put(refId, r);
    }

    return r;
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("serverValueTimestamp", ServerValue.TIMESTAMP);
    return constants;
  }
}
