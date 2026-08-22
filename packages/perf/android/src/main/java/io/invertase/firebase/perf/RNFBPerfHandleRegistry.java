package io.invertase.firebase.perf;

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
import java.util.List;
import java.util.function.Consumer;

/**
 * Perf id → metric handle map (traces, screen traces, HTTP metrics). Unique {@link #put} / {@link
 * #putOrDiscard}; callers {@link #take} or {@link #takeAll} then stop outside the HandleMap lock.
 * Tear-down discards via {@link #takeAll} without stopping (matches prior SparseArray clear).
 */
final class RNFBPerfHandleRegistry<V> {
  private final RNFBHandleMap<Integer, V> map = new RNFBHandleMap<>();

  void put(int id, V handle) throws RNFBHandleCollisionException {
    map.put(id, handle);
  }

  /**
   * Unique put. On collision, invoke {@code discardIncoming} for the incoming handle (if both are
   * non-null) and leave the existing mapping.
   *
   * @return true if stored
   */
  boolean putOrDiscard(int id, V handle, Consumer<V> discardIncoming) {
    try {
      map.put(id, handle);
      return true;
    } catch (RNFBHandleCollisionException collision) {
      if (handle != null && discardIncoming != null) {
        discardIncoming.accept(handle);
      }
      return false;
    }
  }

  V take(int id) {
    return map.take(id);
  }

  List<V> takeAll() {
    return map.takeAll();
  }
}
