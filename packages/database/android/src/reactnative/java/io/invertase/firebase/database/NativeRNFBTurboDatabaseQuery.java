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

import static io.invertase.firebase.common.RCTConvertFirebase.readableMapToWritableMap;
import static io.invertase.firebase.database.ReactNativeFirebaseDatabaseCommon.*;
import static io.invertase.firebase.database.UniversalFirebaseDatabaseCommon.getDatabaseForApp;

import androidx.annotation.CallSuper;
import com.facebook.fbreact.specs.NativeRNFBTurboDatabaseQuerySpec;
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.database.*;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class NativeRNFBTurboDatabaseQuery extends NativeRNFBTurboDatabaseQuerySpec {
  private final DatabaseTurboModuleSupport turboSupport =
      new DatabaseTurboModuleSupport("RNFBDatabaseQuery");
  private HashMap<String, ReactNativeFirebaseDatabaseQuery> queryMap = new HashMap<>();

  public NativeRNFBTurboDatabaseQuery(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @CallSuper
  public void invalidate() {
    Iterator refIterator = queryMap.entrySet().iterator();
    while (refIterator.hasNext()) {
      Map.Entry pair = (Map.Entry) refIterator.next();
      ReactNativeFirebaseDatabaseQuery databaseQuery =
          (ReactNativeFirebaseDatabaseQuery) pair.getValue();
      databaseQuery.removeAllEventListeners();
      refIterator.remove();
    }

    turboSupport.invalidate();
    super.invalidate();
  }

  private ReactNativeFirebaseDatabaseQuery getDatabaseQueryInstance(
      DatabaseReference reference, ReadableArray modifiers) {
    return new ReactNativeFirebaseDatabaseQuery(reference, modifiers);
  }

  private ReactNativeFirebaseDatabaseQuery getDatabaseQueryInstance(
      String key, DatabaseReference reference, ReadableArray modifiers) {
    ReactNativeFirebaseDatabaseQuery cachedDatabaseQuery = queryMap.get(key);

    if (cachedDatabaseQuery != null) {
      return cachedDatabaseQuery;
    }

    ReactNativeFirebaseDatabaseQuery databaseQuery =
        new ReactNativeFirebaseDatabaseQuery(reference, modifiers);

    queryMap.put(key, databaseQuery);
    return databaseQuery;
  }

  private void addOnceValueEventListener(
      ReactNativeFirebaseDatabaseQuery databaseQuery, Promise promise) {
    ValueEventListener onceValueEventListener =
        new ValueEventListener() {
          @Override
          public void onDataChange(@Nonnull DataSnapshot dataSnapshot) {
            try {
              Tasks.call(turboSupport.getExecutor(), () -> snapshotToMap(dataSnapshot))
                  .addOnCompleteListener(
                      task -> {
                        if (task.isSuccessful()) {
                          promise.resolve(task.getResult());
                        } else {
                          ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(
                              promise, task.getException());
                        }
                      });
            } catch (java.util.concurrent.RejectedExecutionException e) {
              ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(promise, e);
            }
          }

          @Override
          public void onCancelled(@Nonnull DatabaseError error) {
            rejectPromiseDatabaseException(
                promise,
                new UniversalDatabaseException(
                    error.getCode(), error.getMessage(), error.toException()));
          }
        };

    databaseQuery.addSingleValueEventListener(onceValueEventListener);
  }

  private void addChildOnceEventListener(
      String eventType, ReactNativeFirebaseDatabaseQuery databaseQuery, Promise promise) {
    ChildEventListener childEventListener =
        new ChildEventListener() {
          @Override
          public void onChildAdded(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
            if ("child_added".equals(eventType)) {
              databaseQuery.removeEventListener(this);
              try {
                Tasks.call(
                        turboSupport.getExecutor(),
                        () -> snapshotWithPreviousChildToMap(dataSnapshot, previousChildName))
                    .addOnCompleteListener(
                        task -> {
                          if (task.isSuccessful()) {
                            promise.resolve(task.getResult());
                          } else {
                            ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(
                                promise, task.getException());
                          }
                        });
              } catch (java.util.concurrent.RejectedExecutionException e) {
                ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(promise, e);
              }
            }
          }

          @Override
          public void onChildChanged(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
            if ("child_changed".equals(eventType)) {
              databaseQuery.removeEventListener(this);
              try {
                Tasks.call(
                        turboSupport.getExecutor(),
                        () -> snapshotWithPreviousChildToMap(dataSnapshot, previousChildName))
                    .addOnCompleteListener(
                        task -> {
                          if (task.isSuccessful()) {
                            promise.resolve(task.getResult());
                          } else {
                            ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(
                                promise, task.getException());
                          }
                        });
              } catch (java.util.concurrent.RejectedExecutionException e) {
                ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(promise, e);
              }
            }
          }

          @Override
          public void onChildRemoved(@Nonnull DataSnapshot dataSnapshot) {
            if ("child_removed".equals(eventType)) {
              databaseQuery.removeEventListener(this);
              try {
                Tasks.call(
                        turboSupport.getExecutor(),
                        () -> snapshotWithPreviousChildToMap(dataSnapshot, null))
                    .addOnCompleteListener(
                        task -> {
                          if (task.isSuccessful()) {
                            promise.resolve(task.getResult());
                          } else {
                            ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(
                                promise, task.getException());
                          }
                        });
              } catch (java.util.concurrent.RejectedExecutionException e) {
                ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(promise, e);
              }
            }
          }

          @Override
          public void onChildMoved(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
            if ("child_moved".equals(eventType)) {
              databaseQuery.removeEventListener(this);
              try {
                Tasks.call(
                        turboSupport.getExecutor(),
                        () -> snapshotWithPreviousChildToMap(dataSnapshot, previousChildName))
                    .addOnCompleteListener(
                        task -> {
                          if (task.isSuccessful()) {
                            promise.resolve(task.getResult());
                          } else {
                            ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(
                                promise, task.getException());
                          }
                        });
              } catch (java.util.concurrent.RejectedExecutionException e) {
                ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(promise, e);
              }
            }
          }

          @Override
          public void onCancelled(@Nonnull DatabaseError error) {
            databaseQuery.removeEventListener(this);
            rejectPromiseDatabaseException(
                promise,
                new UniversalDatabaseException(
                    error.getCode(), error.getMessage(), error.toException()));
          }
        };

    databaseQuery.addSingleChildEventListener(childEventListener);
  }

  private void addValueEventListener(
      String key, ReactNativeFirebaseDatabaseQuery databaseQuery, ReadableMap registration) {
    final String eventRegistrationKey = registration.getString("eventRegistrationKey");

    if (!databaseQuery.hasEventListener(eventRegistrationKey)) {
      ValueEventListener valueEventListener =
          new ValueEventListener() {
            @Override
            public void onDataChange(@Nonnull DataSnapshot dataSnapshot) {
              handleDatabaseEvent(key, "value", registration, dataSnapshot, null);
            }

            @Override
            public void onCancelled(@Nonnull DatabaseError error) {
              databaseQuery.removeEventListener(eventRegistrationKey);
              handleDatabaseEventError(key, registration, error);
            }
          };

      databaseQuery.addEventListener(eventRegistrationKey, valueEventListener);
    }
  }

  private void addChildEventListener(
      String key,
      String eventType,
      ReactNativeFirebaseDatabaseQuery databaseQuery,
      ReadableMap registration) {
    final String eventRegistrationKey = registration.getString("eventRegistrationKey");

    if (!databaseQuery.hasEventListener(eventRegistrationKey)) {
      ChildEventListener childEventListener =
          new ChildEventListener() {
            @Override
            public void onChildAdded(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
              if ("child_added".equals(eventType)) {
                handleDatabaseEvent(
                    key, "child_added", registration, dataSnapshot, previousChildName);
              }
            }

            @Override
            public void onChildChanged(
                @Nonnull DataSnapshot dataSnapshot, String previousChildName) {
              if ("child_changed".equals(eventType)) {
                handleDatabaseEvent(
                    key, "child_changed", registration, dataSnapshot, previousChildName);
              }
            }

            @Override
            public void onChildRemoved(@Nonnull DataSnapshot dataSnapshot) {
              if ("child_removed".equals(eventType)) {
                handleDatabaseEvent(key, "child_removed", registration, dataSnapshot, null);
              }
            }

            @Override
            public void onChildMoved(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
              if ("child_moved".equals(eventType)) {
                handleDatabaseEvent(
                    key, "child_moved", registration, dataSnapshot, previousChildName);
              }
            }

            @Override
            public void onCancelled(@Nonnull DatabaseError error) {
              databaseQuery.removeEventListener(eventRegistrationKey);
              handleDatabaseEventError(key, registration, error);
            }
          };

      databaseQuery.addEventListener(eventRegistrationKey, childEventListener);
    }
  }

  private void handleDatabaseEvent(
      final String key,
      final String eventType,
      final ReadableMap registration,
      DataSnapshot dataSnapshot,
      @Nullable String previousChildName) {
    final String eventRegistrationKey = registration.getString("eventRegistrationKey");
    try {
      Tasks.call(
              turboSupport.getTransactionalExecutor(eventRegistrationKey),
              () -> {
                if (eventType.equals("value")) {
                  return snapshotToMap(dataSnapshot);
                } else {
                  return snapshotWithPreviousChildToMap(dataSnapshot, previousChildName);
                }
              })
          .addOnCompleteListener(
              turboSupport.getExecutor(),
              task -> {
                if (task.isSuccessful()) {
                  WritableMap data = task.getResult();
                  WritableMap event = Arguments.createMap();
                  event.putMap("data", data);
                  event.putString("key", key);
                  event.putString("eventType", eventType);
                  event.putMap("registration", readableMapToWritableMap(registration));

                  ReactNativeFirebaseEventEmitter emitter =
                      ReactNativeFirebaseEventEmitter.getSharedInstance();

                  emitter.sendEvent(
                      new ReactNativeFirebaseDatabaseEvent(
                          ReactNativeFirebaseDatabaseEvent.EVENT_SYNC, event));
                }
              });
    } catch (java.util.concurrent.RejectedExecutionException e) {
      // Event arrived after module invalidation shut down an executor.
    }
  }

  private void handleDatabaseEventError(String key, ReadableMap registration, DatabaseError error) {
    WritableMap event = Arguments.createMap();
    UniversalDatabaseException databaseException =
        new UniversalDatabaseException(error.getCode(), error.getMessage(), error.toException());

    WritableMap errorMap = Arguments.createMap();
    errorMap.putString("code", databaseException.getCode());
    errorMap.putString("message", databaseException.getMessage());

    event.putString("key", key);
    event.putMap("error", errorMap);
    event.putMap("registration", readableMapToWritableMap(registration));

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    emitter.sendEvent(
        new ReactNativeFirebaseDatabaseEvent(ReactNativeFirebaseDatabaseEvent.EVENT_SYNC, event));
  }

  @Override
  public void once(
      String app,
      String dbURL,
      String path,
      ReadableArray modifiers,
      String eventType,
      Promise promise) {
    DatabaseReference reference = getDatabaseForApp(app, dbURL).getReference(path);

    if (eventType.equals("value")) {
      addOnceValueEventListener(getDatabaseQueryInstance(reference, modifiers), promise);
    } else {
      addChildOnceEventListener(eventType, getDatabaseQueryInstance(reference, modifiers), promise);
    }
  }

  @Override
  public void on(String app, String dbURL, ReadableMap props) {
    String key = props.getString("key");
    ReadableArray modifiers = props.getArray("modifiers");
    String path = Objects.requireNonNull(props.getString("path"));
    String eventType = Objects.requireNonNull(props.getString("eventType"));
    ReadableMap registration = Objects.requireNonNull(props.getMap("registration"));

    DatabaseReference reference = getDatabaseForApp(app, dbURL).getReference(path);

    if (eventType.equals("value")) {
      addValueEventListener(key, getDatabaseQueryInstance(key, reference, modifiers), registration);
    } else {
      addChildEventListener(
          key, eventType, getDatabaseQueryInstance(key, reference, modifiers), registration);
    }
  }

  @Override
  public void off(String queryKey, String eventRegistrationKey) {
    ReactNativeFirebaseDatabaseQuery databaseQuery = queryMap.get(queryKey);

    if (databaseQuery != null) {
      databaseQuery.removeEventListener(eventRegistrationKey);
      turboSupport.removeEventListeningExecutor(eventRegistrationKey);

      if (!databaseQuery.hasListeners()) {
        queryMap.remove(queryKey);
      }
    }
  }

  @Override
  public void keepSynced(
      String app,
      String dbURL,
      String key,
      String path,
      ReadableArray modifiers,
      boolean enabled,
      Promise promise) {
    DatabaseReference reference = getDatabaseForApp(app, dbURL).getReference(path);
    getDatabaseQueryInstance(key, reference, modifiers).query.keepSynced(enabled);
    promise.resolve(null);
  }
}
