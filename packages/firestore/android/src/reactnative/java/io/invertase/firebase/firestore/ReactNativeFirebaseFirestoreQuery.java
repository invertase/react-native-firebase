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
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FieldPath;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.MetadataChanges;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.Source;
import com.google.firebase.firestore.model.value.ReferenceValue;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Executor;

import static io.invertase.firebase.common.RCTConvertFirebase.readableMapToFirebaseApp;
import static io.invertase.firebase.common.RCTConvertFirebase.toArrayList;
import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.parseReadableArray;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.parseTypeMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreSerialize.snapshotToWritableMap;

public class ReactNativeFirebaseFirestoreQuery {

  FirebaseFirestore firebaseFirestore;
  Query query;

  ReactNativeFirebaseFirestoreQuery(
    FirebaseFirestore firebaseFirestore,
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
      QuerySnapshot querySnapshot = Tasks.await(this.query.get(source));
      return snapshotToWritableMap(querySnapshot);
    });
  }

  private void applyFilters(ReadableArray filters) {
    for (int i = 0; i < filters.size(); i++) {
      ReadableMap filter = filters.getMap(i);
      ReadableMap fieldPathMap = Objects.requireNonNull(filter).getMap("fieldPath");
      String fieldPathType = Objects.requireNonNull(fieldPathMap).getString("type");

      String operator = filter.getString("operator");
      ReadableMap jsValue = filter.getMap("value");
      Object value = parseTypeMap(firebaseFirestore, Objects.requireNonNull(jsValue));

      if (Objects.requireNonNull(fieldPathType).equals("string")) {
        String fieldPath = Objects.requireNonNull(fieldPathMap.getString("string"));
        switch (Objects.requireNonNull(operator)) {
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
          case "ARRAY_CONTAINS":
            query = query.whereArrayContains(fieldPath, value);
            break;
        }
      } else {
        ReadableArray fieldPathElements = fieldPathMap.getArray("elements");
        String[] fieldPathArray = new String[fieldPathElements.size()];
        for (int j = 0; j < fieldPathElements.size(); j++) {
          fieldPathArray[j] = fieldPathElements.getString(j);
        }
        FieldPath fieldPath = FieldPath.of(fieldPathArray);
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
          case "ARRAY_CONTAINS":
            query = query.whereArrayContains(fieldPath, value);
            break;
        }
      }
    }
  }

  private void applyOrders(ReadableArray orders) {
    List<Object> ordersList = toArrayList(orders);
    for (Object o : ordersList) {
      Map<String, Object> order = (Map) o;
      String direction = (String) order.get("direction");
      Map<String, Object> fieldPathMap = (Map) order.get("fieldPath");
      String fieldPathType = (String) fieldPathMap.get("type");

      if (fieldPathType.equals("string")) {
        String fieldPath = (String) fieldPathMap.get("string");
        query = query.orderBy(fieldPath, Query.Direction.valueOf(direction));
      } else {
        List<String> fieldPathElements = (List) fieldPathMap.get("elements");
        FieldPath fieldPath = FieldPath.of(fieldPathElements.toArray(new String[fieldPathElements.size()]));
        query = query.orderBy(fieldPath, Query.Direction.valueOf(direction));
      }
    }
  }

  private void applyOptions(ReadableMap options) {
    if (options.hasKey("limit")) {
      int limit = options.getInt("limit");
      query = query.limit(limit);
    }

    if (options.hasKey("endAt")) {
      List<Object> endAtList = parseReadableArray(
        firebaseFirestore,
        options.getArray("endAt")
      );
      query = query.endAt(Objects.requireNonNull(endAtList.toArray()));
    }
  }
}
