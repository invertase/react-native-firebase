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

import io.invertase.firebase.common.RNFBHandleCollisionException;
import io.invertase.firebase.common.RNFBHandleMap;
import java.util.ArrayList;
import java.util.List;

/**
 * Per-query value/child listener maps. Unique {@link #putValue}/{@link #putChild}; callers {@link
 * #takeValue}/{@link #takeChild} or {@link #takeAll} then remove the SDK listener outside the
 * HandleMap lock. Null values are not stored so {@link #hasListeners} can use occupancy.
 */
final class RNFBDatabaseListenerRegistry {
  private final Object occupancyLock = new Object();
  private final RNFBHandleMap<String, Object> valueListeners = new RNFBHandleMap<>();
  private final RNFBHandleMap<String, Object> childListeners = new RNFBHandleMap<>();
  private int occupancy;

  void putValue(String eventRegistrationKey, Object listener) throws RNFBHandleCollisionException {
    if (listener == null) {
      throw new NullPointerException("listener");
    }
    synchronized (occupancyLock) {
      valueListeners.put(eventRegistrationKey, listener);
      occupancy++;
    }
  }

  void putChild(String eventRegistrationKey, Object listener) throws RNFBHandleCollisionException {
    if (listener == null) {
      throw new NullPointerException("listener");
    }
    synchronized (occupancyLock) {
      childListeners.put(eventRegistrationKey, listener);
      occupancy++;
    }
  }

  Object getValue(String eventRegistrationKey) {
    return valueListeners.get(eventRegistrationKey);
  }

  Object getChild(String eventRegistrationKey) {
    return childListeners.get(eventRegistrationKey);
  }

  Object takeValue(String eventRegistrationKey) {
    synchronized (occupancyLock) {
      Object listener = valueListeners.take(eventRegistrationKey);
      if (listener != null) {
        occupancy--;
      }
      return listener;
    }
  }

  Object takeChild(String eventRegistrationKey) {
    synchronized (occupancyLock) {
      Object listener = childListeners.take(eventRegistrationKey);
      if (listener != null) {
        occupancy--;
      }
      return listener;
    }
  }

  List<Object> takeAllValues() {
    synchronized (occupancyLock) {
      List<Object> remaining = valueListeners.takeAll();
      occupancy -= remaining.size();
      return remaining;
    }
  }

  List<Object> takeAllChildren() {
    synchronized (occupancyLock) {
      List<Object> remaining = childListeners.takeAll();
      occupancy -= remaining.size();
      return remaining;
    }
  }

  List<Object> takeAll() {
    List<Object> remaining = new ArrayList<>();
    remaining.addAll(takeAllValues());
    remaining.addAll(takeAllChildren());
    return remaining;
  }

  boolean hasEventListener(String eventRegistrationKey) {
    return valueListeners.get(eventRegistrationKey) != null
        || childListeners.get(eventRegistrationKey) != null;
  }

  boolean hasListeners() {
    synchronized (occupancyLock) {
      return occupancy > 0;
    }
  }
}
