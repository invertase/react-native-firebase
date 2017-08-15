package io.invertase.firebase.database;

import java.util.Map;
import java.util.List;

import android.util.Log;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
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

class RNFirebaseDatabaseReference {
  private static final String TAG = "RNFirebaseDBReference";

  private String key;
  private Query query;
  private String path;
  private String appName;
  private ReactContext reactContext;


  Query getQuery() {
    return query;
  }

  /**
   * @param context
   * @param app
   * @param refKey
   * @param refPath
   * @param modifiersArray
   */
  RNFirebaseDatabaseReference(ReactContext context, String app, String refKey, String refPath, ReadableArray modifiersArray) {
    key = refKey;
    appName = app;
    path = refPath;
    reactContext = context;
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
        WritableMap data = Utils.snapshotToMap(dataSnapshot, null);
        promise.resolve(data);
      }

      @Override
      public void onCancelled(DatabaseError error) {
        RNFirebaseDatabase.handlePromise(promise, error);
      }
    };

    query.addListenerForSingleValueEvent(onceValueEventListener);

    Log.d(TAG, "Added OnceValueEventListener for key: " + key);
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
          WritableMap data = Utils.snapshotToMap(dataSnapshot, previousChildName);
          promise.resolve(data);
        }
      }

      @Override
      public void onChildChanged(DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_changed".equals(eventName)) {
          query.removeEventListener(this);
          WritableMap data = Utils.snapshotToMap(dataSnapshot, previousChildName);
          promise.resolve(data);
        }
      }

      @Override
      public void onChildRemoved(DataSnapshot dataSnapshot) {
        if ("child_removed".equals(eventName)) {
          query.removeEventListener(this);
          WritableMap data = Utils.snapshotToMap(dataSnapshot, null);
          promise.resolve(data);
        }
      }

      @Override
      public void onChildMoved(DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_moved".equals(eventName)) {
          query.removeEventListener(this);
          WritableMap data = Utils.snapshotToMap(dataSnapshot, previousChildName);
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
   *
   * @param database
   * @param registration
   */
  void on(RNFirebaseDatabase database, String eventType, ReadableMap registration) {
    if (eventType.equals("value")) {
      addValueEventListener(registration, database);
    } else {
      addChildEventListener(registration, eventType, database);
    }
  }

  /**
   * Handles a React Native JS 'once' request.
   *
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


  /**
   * @param registration
   * @param eventType
   * @param database
   */
  private void addChildEventListener(final ReadableMap registration, final String eventType, final RNFirebaseDatabase database) {
    final String eventRegistrationKey = registration.getString("eventRegistrationKey");
    final String registrationCancellationKey = registration.getString("registrationCancellationKey");

    if (!database.hasChildEventListener(eventRegistrationKey)) {
      ChildEventListener childEventListener = new ChildEventListener() {
        @Override
        public void onChildAdded(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_added".equals(eventType)) {
            handleDatabaseEvent("child_added", registration, dataSnapshot, previousChildName);
          }
        }

        @Override
        public void onChildChanged(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_changed".equals(eventType)) {
            handleDatabaseEvent("child_changed", registration, dataSnapshot, previousChildName);
          }
        }

        @Override
        public void onChildRemoved(DataSnapshot dataSnapshot) {
          if ("child_removed".equals(eventType)) {
            handleDatabaseEvent("child_removed", registration, dataSnapshot, null);
          }
        }

        @Override
        public void onChildMoved(DataSnapshot dataSnapshot, String previousChildName) {
          if ("child_moved".equals(eventType)) {
            handleDatabaseEvent("child_moved", registration, dataSnapshot, previousChildName);
          }
        }

        @Override
        public void onCancelled(DatabaseError error) {
          query.removeEventListener(this);
          database.removeChildEventListener(eventRegistrationKey);
          handleDatabaseError(registration, error);
        }
      };

      database.addChildEventListener(eventRegistrationKey, childEventListener);
      query.addChildEventListener(childEventListener);
    }
  }

  /**
   * @param registration
   */
  private void addValueEventListener(final ReadableMap registration, final RNFirebaseDatabase database) {
    final String eventRegistrationKey = registration.getString("eventRegistrationKey");
    final String registrationCancellationKey = registration.getString("registrationCancellationKey");

    if (!database.hasValueEventListener(eventRegistrationKey)) {
      ValueEventListener valueEventListener = new ValueEventListener() {
        @Override
        public void onDataChange(DataSnapshot dataSnapshot) {
          handleDatabaseEvent("value", registration, dataSnapshot, null);
        }

        @Override
        public void onCancelled(DatabaseError error) {
          query.removeEventListener(this);
          database.removeValueEventListener(eventRegistrationKey);
          handleDatabaseError(registration, error);
        }
      };

      database.addValueEventListener(eventRegistrationKey, valueEventListener);
      query.addValueEventListener(valueEventListener);
    }
  }


  /**
   * @param eventType
   * @param dataSnapshot
   * @param previousChildName
   */
  private void handleDatabaseEvent(String eventType, ReadableMap registration, DataSnapshot dataSnapshot, @Nullable String previousChildName) {
    WritableMap event = Arguments.createMap();
    WritableMap data = Utils.snapshotToMap(dataSnapshot, previousChildName);

    event.putMap("data", data);
    event.putString("key", key);
    event.putString("eventType", eventType);
    event.putMap("registration", Utils.readableMapToWritableMap(registration));

    Utils.sendEvent(reactContext, "database_sync_event", event);
  }

  /**
   * Handles a database listener cancellation error.
   *
   * @param error
   */
  private void handleDatabaseError(ReadableMap registration, DatabaseError error) {
    WritableMap event = Arguments.createMap();

    event.putString("key", key);
    event.putMap("error", RNFirebaseDatabase.getJSError(error));
    event.putMap("registration", Utils.readableMapToWritableMap(registration));

    Utils.sendEvent(reactContext, "database_sync_event", event);
  }


  // todo cleanup below

//  void removeEventListener(int listenerId, String eventName) {
//    if ("value".equals(eventName)) {
//      removeValueEventListener(listenerId);
//    } else {
//      removeChildEventListener(listenerId);
//    }
//  }

//  boolean hasListeners() {
//    return childEventListeners.size() > 0 || valueEventListeners.size() > 0;
//  }
//
//  public void cleanup() {
//    Log.d(TAG, "cleaning up database reference " + this);
//    this.removeChildEventListener(null);
//    this.removeValueEventListener(null);
//  }

//  private void removeChildEventListener(Integer listenerId) {
//    ChildEventListener listener = childEventListeners.get(listenerId);
//    if (listener != null) {
//      query.removeEventListener(listener);
//      childEventListeners.remove(listenerId);
//    }
//  }
//
//  private void removeValueEventListener(Integer listenerId) {
//    ValueEventListener listener = valueEventListeners.get(listenerId);
//    if (listener != null) {
//      query.removeEventListener(listener);
//      valueEventListeners.delete(listenerId);
//    }
//  }


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
