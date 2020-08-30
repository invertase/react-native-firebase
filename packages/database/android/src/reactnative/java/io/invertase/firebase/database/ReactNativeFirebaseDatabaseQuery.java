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

import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReadableArray;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.Query;
import com.google.firebase.database.ValueEventListener;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import static io.invertase.firebase.common.RCTConvertFirebase.toArrayList;

public class ReactNativeFirebaseDatabaseQuery {

  public Query query;
  private HashMap<String, ChildEventListener> childEventListeners = new HashMap<>();
  private HashMap<String, ValueEventListener> valueEventListeners = new HashMap<>();

  ReactNativeFirebaseDatabaseQuery(DatabaseReference reference, ReadableArray modifiers) {
    this.query = reference;

    for (Object m : toArrayList(modifiers)) {
      Map modifier = (Map) m;
      String type = (String) modifier.get("type");
      String name = (String) modifier.get("name");

      if ("orderBy".equals(type)) {
        applyOrderByModifier(name, modifier);
      } else if ("limit".equals(type)) {
        applyLimitModifier(name, modifier);
      } else if ("filter".equals(type)) {
        applyFilterModifier(name, modifier);
      }
    }
  }

  /**
   * Attaches a single single value event listener to the query
   *
   * @param eventListener
   */
  public void addSingleValueEventListener(ValueEventListener eventListener) {
    query.addListenerForSingleValueEvent(eventListener);
  }

  /**
   * Attaches a child event listener to the query
   *
   * @param eventListener
   */
  public void addSingleChildEventListener(ChildEventListener eventListener) {
    query.addChildEventListener(eventListener);
  }

  /**
   * Adds a value event listener and stores the query key
   *
   * @param eventRegistrationKey
   * @param listener
   */
  public void addEventListener(String eventRegistrationKey, ValueEventListener listener) {
    valueEventListeners.put(eventRegistrationKey, listener);
    query.addValueEventListener(listener);
  }

  /**
   * Adds a value event listener and stores the query key
   *
   * @param eventRegistrationKey
   * @param listener
   */
  public void addEventListener(String eventRegistrationKey, ChildEventListener listener) {
    childEventListeners.put(eventRegistrationKey, listener);
    query.addChildEventListener(listener);
  }

  /**
   * Removes a value event listener
   *
   * @param listener
   */
  public void removeEventListener(@NonNull ValueEventListener listener) {
    query.removeEventListener(listener);
  }

  /**
   * Removes a child event listener
   *
   * @param listener
   */
  public void removeEventListener(@NonNull ChildEventListener listener) {
    query.removeEventListener(listener);
  }

  /**
   * Removes a value or child event listener by query key
   *
   * @param eventRegistrationKey
   */
  public void removeEventListener(String eventRegistrationKey) {
    if (valueEventListeners.containsKey(eventRegistrationKey)) {
      query.removeEventListener(valueEventListeners.get(eventRegistrationKey));
      valueEventListeners.remove(eventRegistrationKey);
    }

    if (childEventListeners.containsKey(eventRegistrationKey)) {
      query.removeEventListener(childEventListeners.get(eventRegistrationKey));
      childEventListeners.remove(eventRegistrationKey);
    }
  }

  /**
   * Iterates over all current event listeners on the current query and
   * removes each one
   */
  public void removeAllEventListeners() {
    if (hasListeners()) {
      Iterator valueIterator = valueEventListeners.entrySet().iterator();

      while (valueIterator.hasNext()) {
        Map.Entry pair = (Map.Entry) valueIterator.next();
        ValueEventListener valueEventListener = (ValueEventListener) pair.getValue();
        query.removeEventListener(valueEventListener);
        valueIterator.remove();
      }

      Iterator childIterator = childEventListeners.entrySet().iterator();

      while (childIterator.hasNext()) {
        Map.Entry pair = (Map.Entry) childIterator.next();
        ChildEventListener childEventListener = (ChildEventListener) pair.getValue();
        query.removeEventListener(childEventListener);
        childIterator.remove();
      }
    }
  }

  /**
   * Returns true/false whether this internal ref has a specific listener by eventRegistrationKey.
   *
   * @param eventRegistrationKey
   * @return
   */
  public Boolean hasEventListener(String eventRegistrationKey) {
    return valueEventListeners.containsKey(eventRegistrationKey) || childEventListeners.containsKey(
      eventRegistrationKey);
  }

  /**
   * Returns true/false whether this internal ref has any child or value listeners.
   *
   * @return
   */
  public Boolean hasListeners() {
    return valueEventListeners.size() > 0 || childEventListeners.size() > 0;
  }

  /**
   * ref().orderBy*(key?)
   *
   * @param name
   * @param modifier
   */
  private void applyOrderByModifier(String name, Map modifier) {
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
  }

  /**
   * ref().limitTo*(number)
   *
   * @param name
   * @param modifier
   */
  private Query applyLimitModifier(String name, Map modifier) {
    int limit = ((Double) modifier.get("value")).intValue();
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
  private void applyFilterModifier(String name, Map modifier) {
    String valueType = (String) modifier.get("valueType");
    String key = (String) modifier.get("key");

    // Note: equalTo() is handled in JS land by setting startAt() & endAt() to the same
    // value (see https://github.com/firebase/firebase-js-sdk/blob/master/packages/database/src/api/Query.ts#L570)
    if ("endAt".equals(name)) {
      applyEndAtFilter(key, valueType, modifier);
    } else if ("startAt".equals(name)) {
      applyStartAtFilter(key, valueType, modifier);
    }
  }

  /**
   * ref().endAt(value, key?)
   *
   * @param key
   * @param valueType
   * @param modifier
   */
  private void applyEndAtFilter(String key, String valueType, Map modifier) {
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
    } else if ("null".equals(valueType)) {
      if (key == null) {
        query = query.endAt(null);
      } else {
        query = query.endAt(null, key);
      }
    }
  }

  /**
   * ref().startAt(value, key?)
   *
   * @param key
   * @param valueType
   * @param modifier
   */
  private void applyStartAtFilter(String key, String valueType, Map modifier) {
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
    } else if ("null".equals(valueType)) {
      if (key == null) {
        query = query.startAt(null);
      } else {
        query = query.startAt(null, key);
      }
    }
  }
}
