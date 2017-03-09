package io.invertase.firebase.database;

import java.util.HashSet;
import java.util.List;
import android.util.Log;
import java.util.ListIterator;
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
  private String mPath;
  private String mModifiersString;
  private ChildEventListener mEventListener;
  private ValueEventListener mValueListener;
  private ReactContext mReactContext;
  private Set<String> childEventListeners = new HashSet<>();

  public RNFirebaseDatabaseReference(final ReactContext context,
                                    final FirebaseDatabase firebaseDatabase,
                                    final String path,
                                    final ReadableArray modifiersArray,
                                    final String modifiersString) {
    mReactContext = context;
    mPath = path;
    mModifiersString = modifiersString;
    mQuery = this.buildDatabaseQueryAtPathAndModifiers(firebaseDatabase, path, modifiersArray);
  }

  public void addChildEventListener(final String eventName) {
    if (mEventListener == null) {
      mEventListener = new ChildEventListener() {
        @Override
        public void onChildAdded(DataSnapshot dataSnapshot, String previousChildName) {
          handleDatabaseEvent("child_added", dataSnapshot);
        }

        @Override
        public void onChildChanged(DataSnapshot dataSnapshot, String previousChildName) {
          handleDatabaseEvent("child_changed", dataSnapshot);
        }

        @Override
        public void onChildRemoved(DataSnapshot dataSnapshot) {
          handleDatabaseEvent("child_removed", dataSnapshot);
        }

        @Override
        public void onChildMoved(DataSnapshot dataSnapshot, String previousChildName) {
          handleDatabaseEvent("child_moved", dataSnapshot);
        }

        @Override
        public void onCancelled(DatabaseError error) {
          removeChildEventListener();
          handleDatabaseError(error);
        }
      };
      mQuery.addChildEventListener(mEventListener);
      Log.d(TAG, "Added ChildEventListener for path: " + mPath + " with modifiers: "+ mModifiersString);
    } else {
      Log.w(TAG, "Trying to add duplicate ChildEventListener for path: " + mPath + " with modifiers: "+ mModifiersString);
    }
    //Keep track of the events that the JS is interested in knowing about
    childEventListeners.add(eventName);
  }

  public void addValueEventListener() {
    if (mValueListener == null) {
      mValueListener = new ValueEventListener() {
        @Override
        public void onDataChange(DataSnapshot dataSnapshot) {
          handleDatabaseEvent("value", dataSnapshot);
        }

        @Override
        public void onCancelled(DatabaseError error) {
          removeValueEventListener();
          handleDatabaseError(error);
        }
      };
      mQuery.addValueEventListener(mValueListener);
      Log.d(TAG, "Added ValueEventListener for path: " + mPath + " with modifiers: "+ mModifiersString);
      //this.setListeningTo(mPath, modifiersString, "value");
    } else {
      Log.w(TAG, "Trying to add duplicate ValueEventListener for path: " + mPath + " with modifiers: "+ mModifiersString);
    }
  }

  public void addOnceValueEventListener(final Callback callback) {
    final ValueEventListener onceValueEventListener = new ValueEventListener() {
      @Override
      public void onDataChange(DataSnapshot dataSnapshot) {
        WritableMap data = Utils.dataSnapshotToMap("value", mPath, mModifiersString, dataSnapshot);
        callback.invoke(null, data);
      }

      @Override
      public void onCancelled(DatabaseError error) {
        WritableMap err = Arguments.createMap();
        err.putString("path", mPath);
        err.putInt("code", error.getCode());
        err.putString("modifiers", mModifiersString);
        err.putString("details", error.getDetails());
        err.putString("message", error.getMessage());
        callback.invoke(err);
      }
    };
    mQuery.addListenerForSingleValueEvent(onceValueEventListener);
    Log.d(TAG, "Added OnceValueEventListener for path: " + mPath + " with modifiers " + mModifiersString);
  }

  public void removeEventListener(String eventName) {
    if ("value".equals(eventName)) {
      this.removeValueEventListener();
    } else {
      childEventListeners.remove(eventName);
      if (childEventListeners.isEmpty()) {
        this.removeChildEventListener();
      }
    }
  }

  public boolean hasListeners() {
    return mEventListener != null || mValueListener != null;
  }

  public void cleanup() {
    Log.d(TAG, "cleaning up database reference " + this);
    childEventListeners.clear();
    this.removeChildEventListener();
    this.removeValueEventListener();
  }

  private void removeChildEventListener() {
    if (mEventListener != null) {
      mQuery.removeEventListener(mEventListener);
      mEventListener = null;
    }
  }

  private void removeValueEventListener() {
    if (mValueListener != null) {
      mQuery.removeEventListener(mValueListener);
      mValueListener = null;
    }
  }

  private void handleDatabaseEvent(final String name, final DataSnapshot dataSnapshot) {
    WritableMap data = Utils.dataSnapshotToMap(name, mPath, mModifiersString, dataSnapshot);
    WritableMap evt = Arguments.createMap();
    evt.putString("eventName", name);
    evt.putMap("body", data);

    Utils.sendEvent(mReactContext, "database_event", evt);
  }

  private void handleDatabaseError(final DatabaseError error) {
    WritableMap errMap = Arguments.createMap();

    errMap.putString("path", mPath);
    errMap.putInt("code", error.getCode());
    errMap.putString("modifiers", mModifiersString);
    errMap.putString("details", error.getDetails());
    errMap.putString("message", error.getMessage());

    Utils.sendEvent(mReactContext, "database_error", errMap);
  }

  private Query buildDatabaseQueryAtPathAndModifiers(final FirebaseDatabase firebaseDatabase,
                                                     final String path,
                                                     final ReadableArray modifiers) {
    Query query = firebaseDatabase.getReference(path);
    List<Object> strModifiers = Utils.recursivelyDeconstructReadableArray(modifiers);

    for (Object strModifier : strModifiers) {
      String str = (String) strModifier;

      String[] strArr = str.split(":");
      String methStr = strArr[0];

      if (methStr.equalsIgnoreCase("orderByKey")) {
        query = query.orderByKey();
      } else if (methStr.equalsIgnoreCase("orderByValue")) {
        query = query.orderByValue();
      } else if (methStr.equalsIgnoreCase("orderByPriority")) {
        query = query.orderByPriority();
      } else if (methStr.contains("orderByChild")) {
        String key = strArr[1];
        Log.d(TAG, "orderByChild: " + key);
        query = query.orderByChild(key);
      } else if (methStr.contains("limitToLast")) {
        String key = strArr[1];
        int limit = Integer.parseInt(key);
        Log.d(TAG, "limitToLast: " + limit);
        query = query.limitToLast(limit);
      } else if (methStr.contains("limitToFirst")) {
        String key = strArr[1];
        int limit = Integer.parseInt(key);
        Log.d(TAG, "limitToFirst: " + limit);
        query = query.limitToFirst(limit);
      } else if (methStr.contains("equalTo")) {
        String value = strArr[1];
        String type = strArr[2];
        if ("number".equals(type)) {
          double doubleValue = Double.parseDouble(value);
          if (strArr.length > 3) {
            query = query.equalTo(doubleValue, strArr[3]);
          } else {
            query = query.equalTo(doubleValue);
          }
        } else if ("boolean".equals(type)) {
          boolean booleanValue = Boolean.parseBoolean(value);
          if (strArr.length > 3) {
            query = query.equalTo(booleanValue, strArr[3]);
          } else {
            query = query.equalTo(booleanValue);
          }
        } else {
          if (strArr.length > 3) {
            query = query.equalTo(value, strArr[3]);
          } else {
            query = query.equalTo(value);
          }
        }
      } else if (methStr.contains("endAt")) {
        String value = strArr[1];
        String type = strArr[2];
        if ("number".equals(type)) {
          double doubleValue = Double.parseDouble(value);
          if (strArr.length > 3) {
            query = query.endAt(doubleValue, strArr[3]);
          } else {
            query = query.endAt(doubleValue);
          }
        } else if ("boolean".equals(type)) {
          boolean booleanValue = Boolean.parseBoolean(value);
          if (strArr.length > 3) {
            query = query.endAt(booleanValue, strArr[3]);
          } else {
            query = query.endAt(booleanValue);
          }
        } else {
          if (strArr.length > 3) {
            query = query.endAt(value, strArr[3]);
          } else {
            query = query.endAt(value);
          }
        }
      } else if (methStr.contains("startAt")) {
        String value = strArr[1];
        String type = strArr[2];
        if ("number".equals(type)) {
          double doubleValue = Double.parseDouble(value);
          if (strArr.length > 3) {
            query = query.startAt(doubleValue, strArr[3]);
          } else {
            query = query.startAt(doubleValue);
          }
        } else if ("boolean".equals(type)) {
          boolean booleanValue = Boolean.parseBoolean(value);
          if (strArr.length > 3) {
            query = query.startAt(booleanValue, strArr[3]);
          } else {
            query = query.startAt(booleanValue);
          }
        } else {
          if (strArr.length > 3) {
            query = query.startAt(value, strArr[3]);
          } else {
            query = query.startAt(value);
          }
        }
      }
    }

    return query;
  }
}
