package io.invertase.firebase.firestore;


import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.Utils;

public class RNFirebaseFirestoreCollectionReference {
  private static final String TAG = "RNFSCollectionReference";
  private static Map<String, ListenerRegistration> collectionSnapshotListeners = new HashMap<>();

  private final String appName;
  private final String path;
  private final ReadableArray filters;
  private final ReadableArray orders;
  private final ReadableMap options;
  private final Query query;
  private ReactContext reactContext;

  RNFirebaseFirestoreCollectionReference(ReactContext reactContext, String appName, String path,
                                         ReadableArray filters, ReadableArray orders,
                                         ReadableMap options) {
    this.appName = appName;
    this.path = path;
    this.filters = filters;
    this.orders = orders;
    this.options = options;
    this.query = buildQuery();
    this.reactContext = reactContext;
  }

  void get(final Promise promise) {
    query.get().addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
      @Override
      public void onComplete(@NonNull Task<QuerySnapshot> task) {
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
    ListenerRegistration listenerRegistration = collectionSnapshotListeners.remove(listenerId);
    if (listenerRegistration != null) {
      listenerRegistration.remove();
    }
  }

  public void onSnapshot(final String listenerId) {
    if (!collectionSnapshotListeners.containsKey(listenerId)) {
      final EventListener<QuerySnapshot> listener = new EventListener<QuerySnapshot>() {
        @Override
        public void onEvent(QuerySnapshot querySnapshot, FirebaseFirestoreException exception) {
          if (exception == null) {
            handleQuerySnapshotEvent(listenerId, querySnapshot);
          } else {
            ListenerRegistration listenerRegistration = collectionSnapshotListeners.remove(listenerId);
            if (listenerRegistration != null) {
              listenerRegistration.remove();
            }
            handleQuerySnapshotError(listenerId, exception);
          }
        }
      };
      ListenerRegistration listenerRegistration = this.query.addSnapshotListener(listener);
      collectionSnapshotListeners.put(listenerId, listenerRegistration);
    }
  }

  /*
   * INTERNALS/UTILS
   */

  boolean hasListeners() {
    return !collectionSnapshotListeners.isEmpty();
  }

  private Query buildQuery() {
    Query query = RNFirebaseFirestore.getFirestoreForApp(appName).collection(path);
    query = applyFilters(query);
    query = applyOrders(query);
    query = applyOptions(query);

    return query;
  }

  private Query applyFilters(Query query) {
    List<Object> filtersList = Utils.recursivelyDeconstructReadableArray(filters);

    for (Object f : filtersList) {
      Map<String, Object> filter = (Map) f;
      String fieldPath = (String) filter.get("fieldPath");
      String operator = (String) filter.get("operator");
      Object value = filter.get("value");

      switch (operator) {
        case "EQUAL":
          query = query.whereEqualTo(fieldPath, value);
          break;
        case "GREATER_THAN":
          query = query.whereGreaterThan(fieldPath, value);
          break;
        case "GREATER_THAN_OR_EQUAL":
          query = query.whereGreaterThanOrEqualTo(fieldPath, value);
          break;
        case "LESS_THAN":
          query = query.whereLessThan(fieldPath, value);
          break;
        case "LESS_THAN_OR_EQUAL":
          query = query.whereLessThanOrEqualTo(fieldPath, value);
          break;
      }
    }
    return query;
  }

  private Query applyOrders(Query query) {
    List<Object> ordersList = Utils.recursivelyDeconstructReadableArray(orders);
    for (Object o : ordersList) {
      Map<String, Object> order = (Map) o;
      String direction = (String) order.get("direction");
      String fieldPath = (String) order.get("fieldPath");

      query = query.orderBy(fieldPath, Query.Direction.valueOf(direction));
    }
    return query;
  }

  private Query applyOptions(Query query) {
    if (options.hasKey("endAt")) {
      ReadableArray endAtArray = options.getArray("endAt");
      query = query.endAt(Utils.recursivelyDeconstructReadableArray(endAtArray));
    }
    if (options.hasKey("endBefore")) {
      ReadableArray endBeforeArray = options.getArray("endBefore");
      query = query.endBefore(Utils.recursivelyDeconstructReadableArray(endBeforeArray));
    }
    if (options.hasKey("limit")) {
      int limit = options.getInt("limit");
      query = query.limit(limit);
    }
    if (options.hasKey("offset")) {
      // Android doesn't support offset
    }
    if (options.hasKey("selectFields")) {
      // Android doesn't support selectFields
    }
    if (options.hasKey("startAfter")) {
      ReadableArray startAfterArray = options.getArray("startAfter");
      query = query.startAfter(Utils.recursivelyDeconstructReadableArray(startAfterArray));
    }
    if (options.hasKey("startAt")) {
      ReadableArray startAtArray = options.getArray("startAt");
      query = query.startAt(Utils.recursivelyDeconstructReadableArray(startAtArray));
    }
    return query;
  }

  /**
   * Handles documentSnapshot events.
   *
   * @param listenerId
   * @param querySnapshot
   */
  private void handleQuerySnapshotEvent(String listenerId, QuerySnapshot querySnapshot) {
    WritableMap event = Arguments.createMap();
    WritableMap data = FirestoreSerialize.snapshotToWritableMap(querySnapshot);

    event.putString("appName", appName);
    event.putString("path", path);
    event.putString("listenerId", listenerId);
    event.putMap("querySnapshot", data);

    Utils.sendEvent(reactContext, "firestore_collection_sync_event", event);
  }

  /**
   * Handles a documentSnapshot error event
   *
   * @param listenerId
   * @param exception
   */
  private void handleQuerySnapshotError(String listenerId, FirebaseFirestoreException exception) {
    WritableMap event = Arguments.createMap();

    event.putString("appName", appName);
    event.putString("path", path);
    event.putString("listenerId", listenerId);
    event.putMap("error", RNFirebaseFirestore.getJSError(exception));

    Utils.sendEvent(reactContext, "firestore_collection_sync_event", event);
  }
}
