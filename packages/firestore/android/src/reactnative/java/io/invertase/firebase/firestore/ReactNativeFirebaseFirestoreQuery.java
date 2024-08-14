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

import static io.invertase.firebase.common.RCTConvertFirebase.toArrayList;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.*;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.FieldPath;
import com.google.firebase.firestore.Filter;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.Source;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Executor;

public class ReactNativeFirebaseFirestoreQuery {
  String appName;
  String databaseId;
  Query query;

  ReactNativeFirebaseFirestoreQuery(
      String appName,
      String databaseId,
      Query query,
      ReadableArray filters,
      ReadableArray orders,
      ReadableMap options) {
    this.appName = appName;
    this.query = query;
    applyFilters(filters);
    applyOrders(orders);
    applyOptions(options);
  }

  public Task<WritableMap> get(Executor executor, Source source) {
    return Tasks.call(
        executor,
        () -> {
          QuerySnapshot querySnapshot = Tasks.await(query.get(source));
          return snapshotToWritableMap(this.appName, this.databaseId, "get", querySnapshot, null);
        });
  }

  private void applyFilters(ReadableArray filters) {
    for (int i = 0; i < filters.size(); i++) {
      ReadableMap filter = filters.getMap(i);

      if (filter.hasKey("fieldPath")) {
        ArrayList<Object> fieldPathArray =
            Objects.requireNonNull(Objects.requireNonNull(filter).getArray("fieldPath"))
                .toArrayList();
        String[] segmentArray = (String[]) fieldPathArray.toArray(new String[0]);

        FieldPath fieldPath = FieldPath.of(Objects.requireNonNull(segmentArray));
        String operator = filter.getString("operator");
        ReadableArray arrayValue = filter.getArray("value");
        Object value = parseTypeMap(query.getFirestore(), Objects.requireNonNull(arrayValue));

        switch (Objects.requireNonNull(operator)) {
          case "EQUAL":
            query = query.whereEqualTo(Objects.requireNonNull(fieldPath), value);
            break;
          case "NOT_EQUAL":
            query = query.whereNotEqualTo(Objects.requireNonNull(fieldPath), value);
            break;
          case "GREATER_THAN":
            query =
                query.whereGreaterThan(
                    Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
            break;
          case "GREATER_THAN_OR_EQUAL":
            query =
                query.whereGreaterThanOrEqualTo(
                    Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
            break;
          case "LESS_THAN":
            query =
                query.whereLessThan(
                    Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
            break;
          case "LESS_THAN_OR_EQUAL":
            query =
                query.whereLessThanOrEqualTo(
                    Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
            break;
          case "ARRAY_CONTAINS":
            query =
                query.whereArrayContains(
                    Objects.requireNonNull(fieldPath), Objects.requireNonNull(value));
            break;
          case "ARRAY_CONTAINS_ANY":
            query =
                query.whereArrayContainsAny(
                    Objects.requireNonNull(fieldPath),
                    Objects.requireNonNull((List<Object>) value));
            break;
          case "IN":
            query =
                query.whereIn(
                    Objects.requireNonNull(fieldPath),
                    Objects.requireNonNull((List<Object>) value));
            break;
          case "NOT_IN":
            query =
                query.whereNotIn(
                    Objects.requireNonNull(fieldPath),
                    Objects.requireNonNull((List<Object>) value));
            break;
        }
      } else if (filter.hasKey("operator") && filter.hasKey("queries")) {
        query = query.where(applyFilterQueries(filter));
      }
    }
  }

  private Filter applyFilterQueries(ReadableMap filter) {
    if (filter.hasKey("fieldPath")) {
      String operator =
          (String) Objects.requireNonNull(Objects.requireNonNull(filter).getString("operator"));
      ReadableMap fieldPathMap = Objects.requireNonNull(filter.getMap("fieldPath"));
      ReadableArray segments = Objects.requireNonNull(fieldPathMap.getArray("_segments"));
      int arraySize = segments.size();
      String[] segmentArray = new String[arraySize];

      for (int i = 0; i < arraySize; i++) {
        segmentArray[i] = segments.getString(i);
      }
      FieldPath fieldPath = FieldPath.of(segmentArray);
      ReadableArray arrayValue = filter.getArray("value");

      Object value = parseTypeMap(query.getFirestore(), Objects.requireNonNull(arrayValue));

      switch (operator) {
        case "EQUAL":
          return Filter.equalTo(fieldPath, value);
        case "NOT_EQUAL":
          return Filter.notEqualTo(fieldPath, value);
        case "LESS_THAN":
          return Filter.lessThan(fieldPath, value);
        case "LESS_THAN_OR_EQUAL":
          return Filter.lessThanOrEqualTo(fieldPath, value);
        case "GREATER_THAN":
          return Filter.greaterThan(fieldPath, value);
        case "GREATER_THAN_OR_EQUAL":
          return Filter.greaterThanOrEqualTo(fieldPath, value);
        case "ARRAY_CONTAINS":
          return Filter.arrayContains(fieldPath, value);
        case "ARRAY_CONTAINS_ANY":
          assert value != null;
          return Filter.arrayContainsAny(fieldPath, (List<?>) value);
        case "IN":
          assert value != null;
          return Filter.inArray(fieldPath, (List<?>) value);
        case "NOT_IN":
          assert value != null;
          return Filter.notInArray(fieldPath, (List<?>) value);
        default:
          throw new Error("Invalid operator");
      }
    }

    String operator = Objects.requireNonNull(filter).getString("operator");
    ReadableArray queries =
        Objects.requireNonNull(Objects.requireNonNull(filter).getArray("queries"));
    ArrayList<Filter> parsedFilters = new ArrayList<>();
    int arraySize = queries.size();
    for (int i = 0; i < arraySize; i++) {
      ReadableMap map = queries.getMap(i);
      parsedFilters.add(applyFilterQueries(map));
    }

    if (operator.equals("AND")) {
      return Filter.and(parsedFilters.toArray(new Filter[0]));
    }

    if (operator.equals("OR")) {
      return Filter.or(parsedFilters.toArray(new Filter[0]));
    }

    throw new Error("Missing 'Filter' instance return");
  }

  private void applyOrders(ReadableArray orders) {
    List<Object> ordersList = toArrayList(orders);

    for (Object o : ordersList) {
      Map<String, Object> order = (Map) o;

      if (order.get("fieldPath") instanceof List) {
        ArrayList fieldPathArray = (ArrayList) order.get("fieldPath");
        String[] segmentArray = (String[]) fieldPathArray.toArray(new String[0]);
        FieldPath fieldPath = FieldPath.of(segmentArray);
        String direction = (String) order.get("direction");

        query =
            query.orderBy(Objects.requireNonNull(fieldPath), Query.Direction.valueOf(direction));
      } else {
        String fieldPath = (String) order.get("fieldPath");
        String direction = (String) order.get("direction");

        query =
            query.orderBy(Objects.requireNonNull(fieldPath), Query.Direction.valueOf(direction));
      }
    }
  }

  private void applyOptions(ReadableMap options) {
    if (options.hasKey("limit")) {
      int limit = options.getInt("limit");
      query = query.limit(limit);
    }

    if (options.hasKey("limitToLast")) {
      int limitToLast = options.getInt("limitToLast");
      query = query.limitToLast(limitToLast);
    }

    if (options.hasKey("startAt")) {
      List<Object> fieldList =
          parseReadableArray(query.getFirestore(), options.getArray("startAt"));
      query = query.startAt(Objects.requireNonNull(fieldList.toArray()));
    }

    if (options.hasKey("startAfter")) {
      List<Object> fieldList =
          parseReadableArray(query.getFirestore(), options.getArray("startAfter"));
      query = query.startAfter(Objects.requireNonNull(fieldList.toArray()));
    }

    if (options.hasKey("endAt")) {
      List<Object> fieldList = parseReadableArray(query.getFirestore(), options.getArray("endAt"));
      query = query.endAt(Objects.requireNonNull(fieldList.toArray()));
    }

    if (options.hasKey("endBefore")) {
      List<Object> fieldList =
          parseReadableArray(query.getFirestore(), options.getArray("endBefore"));
      query = query.endBefore(Objects.requireNonNull(fieldList.toArray()));
    }
  }
}
