package io.invertase.firebase.database;

import java.util.Map;
import java.util.List;

import android.util.Log;
import android.support.annotation.Nullable;
import android.util.SparseArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;

import com.google.firebase.database.Query;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.ValueEventListener;

import io.invertase.firebase.Utils;

public class RNFirebaseDatabaseReference {
  private static final String TAG = "RNFirebaseDBReference";

  private int refId;
  private Query query;
  private String path;
  private String appName;
  private ReactContext reactContext;
  private SparseArray<ChildEventListener> childEventListeners;
  private SparseArray<ValueEventListener> valueEventListeners;

  Query getQuery() {
    return query;
  }

  /**
   * @param context
   * @param app
   * @param id
   * @param refPath
   * @param modifiersArray
   */
  RNFirebaseDatabaseReference(ReactContext context, String app, int id, String refPath, ReadableArray modifiersArray) {
    refId = id;
    appName = app;
    path = refPath;
    reactContext = context;
    childEventListeners = new SparseArray<ChildEventListener>();
    valueEventListeners = new SparseArray<ValueEventListener>();
    query = buildDatabaseQueryAtPathAndModifiers(path, modifiersArray);
  }

  /**
   * Listen for a single 'value' event from firebase.
   *
   * @param promise
   */
  private void addOnceValueEventListener(final Promise promise) {
    ValueEventListener onceValueEventListener = new ValueEventListener() {
      @Override
      public void onDataChange(DataSnapshot dataSnapshot) {
        WritableMap data = Utils.snapshotToMap("value", path, dataSnapshot, null, refId, 0);
        promise.resolve(data);
      }

      @Override
      public void onCancelled(DatabaseError error) {
        RNFirebaseDatabase.handlePromise(promise, error);
      }
    };

    query.addListenerForSingleValueEvent(onceValueEventListener);

    Log.d(TAG, "Added OnceValueEventListener for refId: " + refId);
  }

  /**
   * Listen for single 'child_X' event from firebase.
   *
   * @param eventName
   * @param promise
   */
  private void addChildOnceEventListener(final String eventName, final Promise promise) {
    ChildEventListener childEventListener = new ChildEventListener() {
      @Override
      public void onChildAdded(DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_added".equals(eventName)) {
          query.removeEventListener(this);
          WritableMap data = Utils.snapshotToMap("child_added", path, dataSnapshot, previousChildName, refId, 0);
          promise.resolve(data);
        }
      }

      @Override
      public void onChildChanged(DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_changed".equals(eventName)) {
          query.removeEventListener(this);
          WritableMap data = Utils.snapshotToMap("child_changed", path, dataSnapshot, previousChildName, refId, 0);
          promise.resolve(data);
        }
      }

      @Override
      public void onChildRemoved(DataSnapshot dataSnapshot) {
        if ("child_removed".equals(eventName)) {
          query.removeEventListener(this);
          WritableMap data = Utils.snapshotToMap("child_removed", path, dataSnapshot, null, refId, 0);
          promise.resolve(data);
        }
      }

      @Override
      public void onChildMoved(DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_moved".equals(eventName)) {
          query.removeEventListener(this);
          WritableMap data = Utils.snapshotToMap("child_moved", path, dataSnapshot, previousChildName, refId, 0);
          promise.resolve(data);
        }
      }

      @Override
      public void onCancelled(DatabaseError error) {
        query.removeEventListener(this);
        RNFirebaseDatabase.handlePromise(promise, error);
      }
    };

    query.addChildEventListener(childEventListener);
  }


  /**
   * Handles a React Native JS 'on' request and initializes listeners.
   * @param eventName
   */
  void on(String eventName) {

  }

  /**
   * Handles a React Native JS 'once' request.
   * @param eventName
   * @param promise
   */
  void once(String eventName, Promise promise) {
    if (eventName.equals("value")) {
      addOnceValueEventListener(promise);
    } else {
      addChildOnceEventListener(eventName, promise);
    }
  }


  // todo cleanup all below

  void addChildEventListener(final int listenerId, final String eventName) {
    if (childEventListeners.get(listenerId) != null) {
      ChildEventListener childEventListener = new ChildEventListener() {
        @Override
        public void onChildAdded(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_added".equals(eventName)) {
            handleDatabaseEvent("child_added", listenerId, dataSnapshot, previousChildName);
          }
        }

        @Override
        public void onChildChanged(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_changed".equals(eventName)) {
            handleDatabaseEvent("child_changed", listenerId, dataSnapshot, previousChildName);
          }
        }

        @Override
        public void onChildRemoved(DataSnapshot dataSnapshot) {
          if ("child_removed".equals(eventName)) {
            handleDatabaseEvent("child_removed", listenerId, dataSnapshot, null);
          }
        }

        @Override
        public void onChildMoved(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_moved".equals(eventName)) {
            handleDatabaseEvent("child_moved", listenerId, dataSnapshot, previousChildName);
          }
        }

        @Override
        public void onCancelled(DatabaseError error) {
          removeChildEventListener(listenerId);
          handleDatabaseError(listenerId, error);
        }
      };

      childEventListeners.put(listenerId, childEventListener);
      query.addChildEventListener(childEventListener);
      Log.d(TAG, "Added ChildEventListener for refId: " + refId + " listenerId: " + listenerId);
    } else {
      Log.d(TAG, "ChildEventListener for refId: " + refId + " listenerId: " + listenerId + " already exists");
    }
  }

  void addValueEventListener(final int listenerId) {
    if (valueEventListeners.get(listenerId) != null) {
      ValueEventListener valueEventListener = new ValueEventListener() {
        @Override
        public void onDataChange(DataSnapshot dataSnapshot) {
          handleDatabaseEvent("value", listenerId, dataSnapshot, null);
        }

        @Override
        public void onCancelled(DatabaseError error) {
          removeValueEventListener(listenerId);
          handleDatabaseError(listenerId, error);
        }
      };

      valueEventListeners.put(listenerId, valueEventListener);
      query.addValueEventListener(valueEventListener);
      Log.d(TAG, "Added ValueEventListener for refId: " + refId + " listenerId: " + listenerId);
    } else {
      Log.d(TAG, "ValueEventListener for refId: " + refId + " listenerId: " + listenerId + " already exists");
    }
  }


  void removeEventListener(int listenerId, String eventName) {
    if ("value".equals(eventName)) {
      this.removeValueEventListener(listenerId);
    } else {
      this.removeChildEventListener(listenerId);
    }
  }

  boolean hasListeners() {
    return childEventListeners.size() > 0 || valueEventListeners.size() > 0;
  }

  public void cleanup() {
    Log.d(TAG, "cleaning up database reference " + this);
    this.removeChildEventListener(null);
    this.removeValueEventListener(null);
  }

  private void removeChildEventListener(Integer listenerId) {
    ChildEventListener listener = childEventListeners.get(listenerId);
    if (listener != null) {
      query.removeEventListener(listener);
      childEventListeners.delete(listenerId);
    }
  }

  private void removeValueEventListener(Integer listenerId) {
    ValueEventListener listener = valueEventListeners.get(listenerId);
    if (listener != null) {
      query.removeEventListener(listener);
      valueEventListeners.delete(listenerId);
    }
  }

  private void handleDatabaseEvent(final String name, final Integer listenerId, final DataSnapshot dataSnapshot, @Nullable String previousChildName) {
    WritableMap data = Utils.snapshotToMap(name, path, dataSnapshot, previousChildName, refId, listenerId);
    WritableMap evt = Arguments.createMap();
    evt.putString("eventName", name);
    evt.putMap("body", data);

    Utils.sendEvent(reactContext, "database_event", evt);
  }

  private void handleDatabaseError(final Integer listenerId, final DatabaseError error) {
    WritableMap errMap = Arguments.createMap();

    errMap.putInt("refId", refId);
    if (listenerId != null) {
      errMap.putInt("listenerId", listenerId);
    }
    errMap.putString("path", path);
    errMap.putInt("code", error.getCode());
    errMap.putString("details", error.getDetails());
    errMap.putString("message", error.getMessage());

    Utils.sendEvent(reactContext, "database_error", errMap);
  }

  private Query buildDatabaseQueryAtPathAndModifiers(String path, ReadableArray modifiers) {
    FirebaseDatabase firebaseDatabase = RNFirebaseDatabase.getDatabaseForApp(appName);

    Query query = firebaseDatabase.getReference(path);
    List<Object> modifiersList = Utils.recursivelyDeconstructReadableArray(modifiers);

    // todo cleanup into utils
    for (Object m : modifiersList) {
      Map<String, Object> modifier = (Map) m;
      String type = (String) modifier.get("type");
      String name = (String) modifier.get("name");

      if ("orderBy".equals(type)) {
        if ("orderByKey".equals(name)) {
          query = query.orderByKey();
        } else if ("orderByPriority".equals(name)) {
          query = query.orderByPriority();
        } else if ("orderByValue".equals(name)) {
          query = query.orderByValue();
        } else if ("orderByChild".equals(name)) {
          String key = (String) modifier.get("key");
          query = query.orderByChild(key);
        }
      } else if ("limit".equals(type)) {
        int limit = ((Double) modifier.get("limit")).intValue();
        if ("limitToLast".equals(name)) {
          query = query.limitToLast(limit);
        } else if ("limitToFirst".equals(name)) {
          query = query.limitToFirst(limit);
        }
      } else if ("filter".equals(type)) {
        String valueType = (String) modifier.get("valueType");
        String key = (String) modifier.get("key");
        if ("equalTo".equals(name)) {
          if ("number".equals(valueType)) {
            double value = (Double) modifier.get("value");
            if (key == null) {
              query = query.equalTo(value);
            } else {
              query = query.equalTo(value, key);
            }
          } else if ("boolean".equals(valueType)) {
            boolean value = (Boolean) modifier.get("value");
            if (key == null) {
              query = query.equalTo(value);
            } else {
              query = query.equalTo(value, key);
            }
          } else if ("string".equals(valueType)) {
            String value = (String) modifier.get("value");
            if (key == null) {
              query = query.equalTo(value);
            } else {
              query = query.equalTo(value, key);
            }
          }
        } else if ("endAt".equals(name)) {
          if ("number".equals(valueType)) {
            double value = (Double) modifier.get("value");
            if (key == null) {
              query = query.endAt(value);
            } else {
              query = query.endAt(value, key);
            }
          } else if ("boolean".equals(valueType)) {
            boolean value = (Boolean) modifier.get("value");
            if (key == null) {
              query = query.endAt(value);
            } else {
              query = query.endAt(value, key);
            }
          } else if ("string".equals(valueType)) {
            String value = (String) modifier.get("value");
            if (key == null) {
              query = query.endAt(value);
            } else {
              query = query.endAt(value, key);
            }
          }
        } else if ("startAt".equals(name)) {
          if ("number".equals(valueType)) {
            double value = (Double) modifier.get("value");
            if (key == null) {
              query = query.startAt(value);
            } else {
              query = query.startAt(value, key);
            }
          } else if ("boolean".equals(valueType)) {
            boolean value = (Boolean) modifier.get("value");
            if (key == null) {
              query = query.startAt(value);
            } else {
              query = query.startAt(value, key);
            }
          } else if ("string".equals(valueType)) {
            String value = (String) modifier.get("value");
            if (key == null) {
              query = query.startAt(value);
            } else {
              query = query.startAt(value, key);
            }
          }
        }
      }
    }

    return query;
  }
}
