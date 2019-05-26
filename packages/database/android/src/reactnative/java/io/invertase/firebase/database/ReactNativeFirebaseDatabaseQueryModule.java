package io.invertase.firebase.database;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.Query;
import com.google.firebase.database.ValueEventListener;

import java.util.Map;

import javax.annotation.Nonnull;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static io.invertase.firebase.common.RCTConvertFirebase.toArrayList;
import static io.invertase.firebase.database.ReactNativeFirebaseDatabaseCommon.snapshotToMap;
//import static io.invertase.firebase.database.UniversalFirebaseDatabaseCommon.getDatabaseErrorCodeAndMessage;
import static io.invertase.firebase.database.UniversalFirebaseDatabaseCommon.getDatabaseForApp;

public class ReactNativeFirebaseDatabaseQueryModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "DatabaseQuery";

  ReactNativeFirebaseDatabaseQueryModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  /**
   * Assign a reference query modifiers and return the query
   *
   * @param reference
   * @param modifiers
   */
  private Query getQueryInstance(DatabaseReference reference, ReadableArray modifiers) {
    Query query = reference;

    for (Object m : toArrayList(modifiers)) {
      Map modifier = (Map) m;
      String type = (String) modifier.get("type");
      String name = (String) modifier.get("name");

      if ("orderBy".equals(type)) {
        query = applyOrderByModifier(query, name, modifier);
      } else if ("limit".equals(type)) {
        query = applyLimitModifier(query, name, modifier);
      } else if ("filter".equals(type)) {
        query = applyFilterModifier(query, name, modifier);
      }
    }

    return query;
  }

  /**
   * ref().orderBy*(key?)
   *
   * @param query
   * @param name
   * @param modifier
   */
  private Query applyOrderByModifier(Query query, String name, Map modifier) {
    switch (name) {
      case "orderByKey":
        query = query.orderByKey();
        break;
      case "orderByPriority":
        query = query.orderByPriority();
        break;
      case "orderByValue":
        query = query.orderByValue();
        break;
      case "orderByChild":
        String key = (String) modifier.get("key");
        query = query.orderByChild(key);
    }

    return query;
  }

  /**
   * ref().limitTo*(number)
   *
   * @param query
   * @param name
   * @param modifier
   */
  private Query applyLimitModifier(Query query, String name, Map modifier) {
    int limit = ((Double) modifier.get("limit")).intValue();
    if ("limitToLast".equals(name)) {
      query = query.limitToLast(limit);
    } else if ("limitToFirst".equals(name)) {
      query = query.limitToFirst(limit);
    }
    return query;
  }

  /**
   * ref().equalTo(), ref().endAt(), ref().startAt();
   *
   * @param name
   * @param modifier
   */
  private Query applyFilterModifier(Query query, String name, Map modifier) {
    String valueType = (String) modifier.get("valueType");
    String key = (String) modifier.get("key");
    if ("equalTo".equals(name)) {
      query = applyEqualToFilter(query, key, valueType, modifier);
    } else if ("endAt".equals(name)) {
      query = applyEndAtFilter(query, key, valueType, modifier);
    } else if ("startAt".equals(name)) {
      query = applyStartAtFilter(query, key, valueType, modifier);
    }

    return query;
  }

  /**
   * ref().equalTo(value, key?)
   *
   * @param key
   * @param valueType
   * @param modifier
   */
  private Query applyEqualToFilter(Query query, String key, String valueType, Map modifier) {
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

    return query;
  }

  /**
   * ref().endAt(value, key?)
   *
   * @param key
   * @param valueType
   * @param modifier
   */
  private Query applyEndAtFilter(Query query, String key, String valueType, Map modifier) {
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

    return query;
  }

  /**
   * ref().startAt(value, key?)
   *
   * @param key
   * @param valueType
   * @param modifier
   */
  private Query applyStartAtFilter(Query query, String key, String valueType, Map modifier) {
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

    return query;
  }

  /**
   * ref().once('value')
   *
   * @param query
   * @param promise
   */
  private void addOnceValueEventListener(Query query, Promise promise) {
    ValueEventListener onceValueEventListener = new ValueEventListener() {
      @Override
      public void onDataChange(@Nonnull DataSnapshot dataSnapshot) {
        Tasks.call(getExecutor(), () -> snapshotToMap(dataSnapshot))
          .addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
              promise.resolve(task.getResult());
            } else {
              rejectPromiseWithExceptionMap(promise, task.getException());
            }
          });
      }

      @Override
      public void onCancelled(@Nonnull DatabaseError error) {
        rejectPromiseWithExceptionMap(promise, error.toException());
//        Map<String, String> errorCodeAndMessage = getDatabaseErrorCodeAndMessage(error);
//        rejectPromiseWithCodeAndMessage(
//          promise,
//          errorCodeAndMessage.get("code"),
//          errorCodeAndMessage.get("message")
//        );
      }
    };

    query.addListenerForSingleValueEvent(onceValueEventListener);
  }

  /**
   * ref().once('child_*') handler
   *
   * @param eventType
   * @param query
   * @param promise
   */
  private void addChildOnceEventListener(String eventType, Query query, Promise promise) {
    ChildEventListener childEventListener = new ChildEventListener() {
      @Override
      public void onChildAdded(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_added".equals(eventType)) {
          query.removeEventListener(this);
          Tasks.call(() -> snapshotToMap(dataSnapshot, previousChildName))
            .addOnCompleteListener(task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
        }
      }

      @Override
      public void onChildChanged(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_changed".equals(eventType)) {
          query.removeEventListener(this);
          Tasks.call(() -> snapshotToMap(dataSnapshot, previousChildName))
            .addOnCompleteListener(task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
        }
      }

      @Override
      public void onChildRemoved(@Nonnull DataSnapshot dataSnapshot) {
        if ("child_removed".equals(eventType)) {
          query.removeEventListener(this);
          Tasks.call(() -> snapshotToMap(dataSnapshot, null))
            .addOnCompleteListener(task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
        }
      }

      @Override
      public void onChildMoved(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
        if ("child_moved".equals(eventType)) {
          query.removeEventListener(this);
          Tasks.call(() -> snapshotToMap(dataSnapshot, previousChildName))
            .addOnCompleteListener(task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
        }
      }

      @Override
      public void onCancelled(@Nonnull DatabaseError error) {
        query.removeEventListener(this);
        rejectPromiseWithExceptionMap(promise, error.toException());
//        Map<String, String> errorCodeAndMessage = getDatabaseErrorCodeAndMessage(error);
//        rejectPromiseWithCodeAndMessage(
//          promise,
//          errorCodeAndMessage.get("code"),
//          errorCodeAndMessage.get("message")
//        );
      }
    };

    query.addChildEventListener(childEventListener);
  }

  /**
   * ref().once('*')
   *
   * @param app
   * @param dbURL
   * @param key
   * @param path
   * @param modifiers
   * @param eventType
   * @param promise
   */
  @ReactMethod
  public void once(String app, String dbURL, String key, String path, ReadableArray modifiers, String eventType, Promise promise) {
    DatabaseReference reference = getDatabaseForApp(app, dbURL).getReference(path);

    if (eventType.equals("value")) {
      addOnceValueEventListener(getQueryInstance(reference, modifiers), promise);
    } else {
      addChildOnceEventListener(eventType, getQueryInstance(reference, modifiers), promise);
    }
  }

  @ReactMethod
  public void on(String app, String dbURL, String key, String path, ReadableArray modifiers, String eventType, Promise promise) {
    // TODO
  }

  @ReactMethod
  public void off(String app, String dbURL, String key, String path, ReadableArray modifiers, String eventType, Promise promise) {
    // TODO
  }
}
