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

public class ReactNativeFirebaseDatabaseQueryModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "DatabaseQuery";
  private HashMap<String, ReactNativeFirebaseDatabaseQuery> queryMap = new HashMap<>();

  ReactNativeFirebaseDatabaseQueryModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();

    Iterator refIterator = queryMap.entrySet().iterator();
    while (refIterator.hasNext()) {
      Map.Entry pair = (Map.Entry) refIterator.next();
      ReactNativeFirebaseDatabaseQuery databaseQuery =
          (ReactNativeFirebaseDatabaseQuery) pair.getValue();
      databaseQuery.removeAllEventListeners();
      refIterator.remove(); // avoids a ConcurrentModificationException
    }
  }

  /**
   * Returns an uncached ReactNativeFirebaseDatabaseQuery instance, used when no cleanup is needed
   * (e.g. once).
   *
   * @param reference
   * @param modifiers
   */
  private ReactNativeFirebaseDatabaseQuery getDatabaseQueryInstance(
      DatabaseReference reference, ReadableArray modifiers) {
    return new ReactNativeFirebaseDatabaseQuery(reference, modifiers);
  }

  /**
   * Caches a ReactNativeFirebaseDatabaseQuery instance from the query key and caches it for later
   * use (e.g. on/off)
   *
   * @param reference
   * @param modifiers
   */
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

  /**
   * ref().once('value')
   *
   * @param databaseQuery
   * @param promise
   */
  private void addOnceValueEventListener(
      ReactNativeFirebaseDatabaseQuery databaseQuery, Promise promise) {
    ValueEventListener onceValueEventListener =
        new ValueEventListener() {
          @Override
          public void onDataChange(@Nonnull DataSnapshot dataSnapshot) {
            Tasks.call(getExecutor(), () -> snapshotToMap(dataSnapshot))
                .addOnCompleteListener(
                    task -> {
                      if (task.isSuccessful()) {
                        promise.resolve(task.getResult());
                      } else {
                        rejectPromiseWithExceptionMap(promise, task.getException());
                      }
                    });
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

  /**
   * ref().once('child_*') handler
   *
   * @param eventType
   * @param databaseQuery
   * @param promise
   */
  private void addChildOnceEventListener(
      String eventType, ReactNativeFirebaseDatabaseQuery databaseQuery, Promise promise) {
    ChildEventListener childEventListener =
        new ChildEventListener() {
          @Override
          public void onChildAdded(@Nonnull DataSnapshot dataSnapshot, String previousChildName) {
            if ("child_added".equals(eventType)) {
              databaseQuery.removeEventListener(this);
              Tasks.call(
                      getExecutor(),
                      () -> snapshotWithPreviousChildToMap(dataSnapshot, previousChildName))
                  .addOnCompleteListener(
                      task -> {
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
              databaseQuery.removeEventListener(this);
              Tasks.call(
                      getExecutor(),
                      () -> snapshotWithPreviousChildToMap(dataSnapshot, previousChildName))
                  .addOnCompleteListener(
                      task -> {
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
              databaseQuery.removeEventListener(this);
              Tasks.call(getExecutor(), () -> snapshotWithPreviousChildToMap(dataSnapshot, null))
                  .addOnCompleteListener(
                      task -> {
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
              databaseQuery.removeEventListener(this);
              Tasks.call(
                      getExecutor(),
                      () -> snapshotWithPreviousChildToMap(dataSnapshot, previousChildName))
                  .addOnCompleteListener(
                      task -> {
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
            databaseQuery.removeEventListener(this);
            rejectPromiseDatabaseException(
                promise,
                new UniversalDatabaseException(
                    error.getCode(), error.getMessage(), error.toException()));
          }
        };

    databaseQuery.addSingleChildEventListener(childEventListener);
  }

  /**
   * ref().on('value') handler
   *
   * @param key
   * @param databaseQuery
   * @param registration
   */
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

  /**
   * Handles value/child update events.
   *
   * @param eventType
   * @param dataSnapshot
   * @param previousChildName
   */
  private void handleDatabaseEvent(
      final String key,
      final String eventType,
      final ReadableMap registration,
      DataSnapshot dataSnapshot,
      @Nullable String previousChildName) {
    final String eventRegistrationKey = registration.getString("eventRegistrationKey");
    Tasks.call(
            getTransactionalExecutor(eventRegistrationKey),
            () -> {
              if (eventType.equals("value")) {
                return snapshotToMap(dataSnapshot);
              } else {
                return snapshotWithPreviousChildToMap(dataSnapshot, previousChildName);
              }
            })
        .addOnCompleteListener(
            getExecutor(),
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
  }

  /**
   * Handles a database listener cancellation error.
   *
   * @param registration
   * @param error
   */
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

  /**
   * ref().once('*')
   *
   * @param app
   * @param dbURL
   * @param path
   * @param modifiers
   * @param eventType
   * @param promise
   */
  @ReactMethod
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

  /**
   * ref().on('*')
   *
   * @param app
   * @param dbURL
   * @param props
   */
  @ReactMethod
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

  /** ref().off('*') */
  @ReactMethod
  public void off(String queryKey, String eventRegistrationKey) {
    ReactNativeFirebaseDatabaseQuery databaseQuery = queryMap.get(queryKey);

    if (databaseQuery != null) {
      databaseQuery.removeEventListener(eventRegistrationKey);
      removeEventListeningExecutor(eventRegistrationKey);

      if (!databaseQuery.hasListeners()) {
        queryMap.remove(queryKey);
      }
    }
  }

  /**
   * ref().keepSynced('*')
   *
   * @param app
   * @param dbURL
   * @param path
   * @param modifiers
   * @param bool
   * @param promise
   */
  @ReactMethod
  public void keepSynced(
      String app,
      String dbURL,
      String key,
      String path,
      ReadableArray modifiers,
      Boolean bool,
      Promise promise) {
    DatabaseReference reference = getDatabaseForApp(app, dbURL).getReference(path);
    getDatabaseQueryInstance(key, reference, modifiers).query.keepSynced(bool);
    promise.resolve(null);
  }
}
