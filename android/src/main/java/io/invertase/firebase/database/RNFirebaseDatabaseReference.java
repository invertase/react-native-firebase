package io.invertase.firebase.database;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import android.util.Log;

import java.util.Map;
import java.util.Set;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
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

  private Query mQuery;
  private int mRefId;
  private String mPath;
  private Map<Integer, ChildEventListener> mChildEventListeners = new HashMap<>();
  private Map<Integer, ValueEventListener> mValueEventListeners = new HashMap<>();
  private ReactContext mReactContext;

  public RNFirebaseDatabaseReference(final ReactContext context,
                                     final FirebaseDatabase firebaseDatabase,
                                     final int refId,
                                     final String path,
                                     final ReadableArray modifiersArray) {
    mReactContext = context;
    mRefId = refId;
    mPath = path;
    mQuery = this.buildDatabaseQueryAtPathAndModifiers(firebaseDatabase, path, modifiersArray);
  }

  public void addChildEventListener(final int listenerId, final String eventName) {
    if (!mChildEventListeners.containsKey(listenerId)) {
      ChildEventListener childEventListener = new ChildEventListener() {
        @Override
        public void onChildAdded(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_added".equals(eventName)) {
            handleDatabaseEvent("child_added", listenerId, dataSnapshot);
          }
        }

        @Override
        public void onChildChanged(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_changed".equals(eventName)) {
            handleDatabaseEvent("child_changed", listenerId, dataSnapshot);
          }
        }

        @Override
        public void onChildRemoved(DataSnapshot dataSnapshot) {
          if ("child_removed".equals(eventName)) {
            handleDatabaseEvent("child_removed", listenerId, dataSnapshot);
          }
        }

        @Override
        public void onChildMoved(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_moved".equals(eventName)) {
            handleDatabaseEvent("child_moved", listenerId, dataSnapshot);
          }
        }

        @Override
        public void onCancelled(DatabaseError error) {
          removeChildEventListener(listenerId);
          handleDatabaseError(listenerId, error);
        }
      };
      mChildEventListeners.put(listenerId, childEventListener);
      mQuery.addChildEventListener(childEventListener);
      Log.d(TAG, "Added ChildEventListener for refId: " + mRefId + " listenerId: " + listenerId);
    } else {
      Log.d(TAG, "ChildEventListener for refId: " + mRefId + " listenerId: " + listenerId + " already exists");
    }
  }

  public void addValueEventListener(final int listenerId) {
    if (!mValueEventListeners.containsKey(listenerId)) {
      ValueEventListener valueEventListener = new ValueEventListener() {
        @Override
        public void onDataChange(DataSnapshot dataSnapshot) {
          handleDatabaseEvent("value", listenerId, dataSnapshot);
        }

        @Override
        public void onCancelled(DatabaseError error) {
          removeValueEventListener(listenerId);
          handleDatabaseError(listenerId, error);
        }
      };
      mValueEventListeners.put(listenerId, valueEventListener);
      mQuery.addValueEventListener(valueEventListener);
      Log.d(TAG, "Added ValueEventListener for refId: " + mRefId + " listenerId: " + listenerId);
    } else {
      Log.d(TAG, "ValueEventListener for refId: " + mRefId + " listenerId: " + listenerId + " already exists");
    }
  }

  public void addOnceValueEventListener(final Callback callback) {
    final ValueEventListener onceValueEventListener = new ValueEventListener() {
      @Override
      public void onDataChange(DataSnapshot dataSnapshot) {
        WritableMap data = Utils.snapshotToMap("value", mRefId, null, mPath, dataSnapshot);
        callback.invoke(null, data);
      }

      @Override
      public void onCancelled(DatabaseError error) {
        WritableMap err = Arguments.createMap();
        err.putInt("refId", mRefId);
        err.putString("path", mPath);
        err.putInt("code", error.getCode());
        err.putString("details", error.getDetails());
        err.putString("message", error.getMessage());
        callback.invoke(err);
      }
    };
    mQuery.addListenerForSingleValueEvent(onceValueEventListener);
    Log.d(TAG, "Added OnceValueEventListener for refId: " + mRefId);
  }

  public void removeEventListener(int listenerId, String eventName) {
    if ("value".equals(eventName)) {
      this.removeValueEventListener(listenerId);
    } else {
      this.removeChildEventListener(listenerId);
    }
  }

  public boolean hasListeners() {
    return !mChildEventListeners.isEmpty() || !mValueEventListeners.isEmpty();
  }

  public void cleanup() {
    Log.d(TAG, "cleaning up database reference " + this);
    this.removeChildEventListener(null);
    this.removeValueEventListener(null);
  }

  private void removeChildEventListener(Integer listenerId) {
    ChildEventListener listener = mChildEventListeners.remove(listenerId);
    if (listener != null) {
      mQuery.removeEventListener(listener);
    }
  }

  private void removeValueEventListener(Integer listenerId) {
    ValueEventListener listener = mValueEventListeners.remove(listenerId);
    if (listener != null) {
      mQuery.removeEventListener(listener);
    }
  }

  private void handleDatabaseEvent(final String name, final Integer listenerId, final DataSnapshot dataSnapshot) {
    WritableMap data = Utils.snapshotToMap(name, mRefId, listenerId, mPath, dataSnapshot);
    WritableMap evt = Arguments.createMap();
    evt.putString("eventName", name);
    evt.putMap("body", data);

    Utils.sendEvent(mReactContext, "database_event", evt);
  }

  private void handleDatabaseError(final Integer listenerId, final DatabaseError error) {
    WritableMap errMap = Arguments.createMap();

    errMap.putInt("refId", mRefId);
    if (listenerId != null) {
      errMap.putInt("listenerId", listenerId);
    }
    errMap.putString("path", mPath);
    errMap.putInt("code", error.getCode());
    errMap.putString("details", error.getDetails());
    errMap.putString("message", error.getMessage());

    Utils.sendEvent(mReactContext, "database_error", errMap);
  }

  private Query buildDatabaseQueryAtPathAndModifiers(final FirebaseDatabase firebaseDatabase,
                                                     final String path,
                                                     final ReadableArray modifiers) {
    Query query = firebaseDatabase.getReference(path);
    List<Object> modifiersList = Utils.recursivelyDeconstructReadableArray(modifiers);

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
        int limit = (Integer) modifier.get("limit");
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
