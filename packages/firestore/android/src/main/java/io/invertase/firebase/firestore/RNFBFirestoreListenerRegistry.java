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

import com.google.firebase.firestore.ListenerRegistration;
import io.invertase.firebase.common.RNFBHandleCollisionException;
import io.invertase.firebase.common.RNFBHandleMap;
import java.util.List;

/**
 * Document / collection / snapshots-in-sync listener map. Unique {@link #put} / {@link
 * #putOrDiscard}; callers {@link #take} or {@link #takeAllAndRemove} then {@code remove()} outside
 * the HandleMap lock. Skip-if-registered is {@code get(id) != null}.
 */
final class RNFBFirestoreListenerRegistry {
  private final RNFBHandleMap<Integer, ListenerRegistration> map = new RNFBHandleMap<>();

  void put(int listenerId, ListenerRegistration registration) throws RNFBHandleCollisionException {
    map.put(listenerId, registration);
  }

  /**
   * Unique put. On collision, {@code remove()} the incoming registration and leave the existing
   * mapping.
   *
   * @return true if stored
   */
  boolean putOrDiscard(int listenerId, ListenerRegistration registration) {
    try {
      map.put(listenerId, registration);
      return true;
    } catch (RNFBHandleCollisionException collision) {
      if (registration != null) {
        registration.remove();
      }
      return false;
    }
  }

  ListenerRegistration get(int listenerId) {
    return map.get(listenerId);
  }

  ListenerRegistration take(int listenerId) {
    return map.take(listenerId);
  }

  void takeAndRemove(int listenerId) {
    ListenerRegistration registration = map.take(listenerId);
    if (registration != null) {
      registration.remove();
    }
  }

  void takeAllAndRemove() {
    List<ListenerRegistration> remaining = map.takeAll();
    for (ListenerRegistration registration : remaining) {
      if (registration != null) {
        registration.remove();
      }
    }
  }
}
