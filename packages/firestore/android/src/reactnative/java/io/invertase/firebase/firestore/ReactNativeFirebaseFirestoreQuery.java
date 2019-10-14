package io.invertase.firebase.firestore;

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

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.Source;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Executor;

import static io.invertase.firebase.common.RCTConvertFirebase.toArrayList;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.*;

public class ReactNativeFirebaseFirestoreQuery {
  Query query;

  ReactNativeFirebaseFirestoreQuery(
    Query query,
    ReadableArray filters,
    ReadableArray orders,
    ReadableMap options
  ) {
    this.query = query;
    applyFilters(filters);
    applyOrders(orders);
    applyOptions(options);
  }

  public Task<WritableMap> get(Executor executor, Source source) {
    return Tasks.call(executor, () -> {
      QuerySnapshot querySnapshot = Tasks.await(query.get(source));
      return snapshotToWritableMap("get", querySnapshot, null);
    });
  }

  private void applyFilters(ReadableArray filters) {
    for (int i = 0; i < filters.size(); i++) {
      ReadableMap filter = filters.getMap(i);

      String fieldPath = Objects.requireNonNull(filter).getString("fieldPath");
      String operator = filter.getString("operator");
      ReadableArray arrayValue = filter.getArray("value");
      Object value = parseTypeMap(query.getFirestore(), Objects.requireNonNull(arrayValue));

      switch (Objects.requireNonNull(operator)) {
        case "EQUAL":
          query = query.whereEqualTo(Objects.requireNonNull(fieldPath), value);
          break;
        case "GREATER_THAN":
          query = query.whereGreaterThan(Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
          break;
        case "GREATER_THAN_OR_EQUAL":
          query = query.whereGreaterThanOrEqualTo(Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
          break;
        case "LESS_THAN":
          query = query.whereLessThan(Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
          break;
        case "LESS_THAN_OR_EQUAL":
          query = query.whereLessThanOrEqualTo(Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
          break;
        case "ARRAY_CONTAINS":
          query = query.whereArrayContains(Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
          break;
      }
    }
  }

  private void applyOrders(ReadableArray orders) {
    List<Object> ordersList = toArrayList(orders);

    for (Object o : ordersList) {
      Map<String, String> order = (Map) o;

      String fieldPath = order.get("fieldPath");
      String direction = order.get("direction");

      query = query.orderBy(Objects.requireNonNull(fieldPath), Query.Direction.valueOf(direction));
    }
  }

  private void applyOptions(ReadableMap options) {
    if (options.hasKey("limit")) {
      int limit = options.getInt("limit");
      query = query.limit(limit);
    }

    if (options.hasKey("startAt")) {
      List<Object> fieldList = parseReadableArray(query.getFirestore(), options.getArray("startAt"));
      query = query.startAt(Objects.requireNonNull(fieldList.toArray()));
    }

    if (options.hasKey("startAfter")) {
      List<Object> fieldList = parseReadableArray(query.getFirestore(), options.getArray("startAfter"));
      query = query.startAfter(Objects.requireNonNull(fieldList.toArray()));
    }

    if (options.hasKey("endAt")) {
      List<Object> fieldList = parseReadableArray(query.getFirestore(), options.getArray("endAt"));
      query = query.endAt(Objects.requireNonNull(fieldList.toArray()));
    }

    if (options.hasKey("endBefore")) {
      List<Object> fieldList = parseReadableArray(query.getFirestore(), options.getArray("endBefore"));
      query = query.endBefore(Objects.requireNonNull(fieldList.toArray()));
    }
  }
}
