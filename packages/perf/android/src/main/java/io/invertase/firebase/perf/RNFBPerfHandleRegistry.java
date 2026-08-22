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
import java.util.function.Predicate;

/**
 * Perf id → metric handle map (traces, screen traces, HTTP metrics). Module start paths use {@link
 * #putReplacing} (last wins, stop displaced outside lock). Unique {@link #put} / {@link
 * #putOrDiscard} remain for tests. Callers {@link #get} then {@link #take} then stop outside the
 * HandleMap lock. Tear-down discards via {@link #takeAll} without stopping (matches prior
 * SparseArray clear).
 */
final class RNFBPerfHandleRegistry<V> {
  private final RNFBHandleMap<Integer, V> map = new RNFBHandleMap<>();

  void put(int id, V handle) throws RNFBHandleCollisionException {
    map.put(id, handle);
  }

  /**
   * Unique put. On collision, drop the incoming handle without stopping and leave the existing
   * mapping.
   *
   * @return true if stored
   */
  boolean putOrDiscard(int id, V handle) {
    return map.putIfAbsent(id, handle);
  }

  /**
   * Atomically replaces the mapping for {@code id} (last wins). Returns the displaced handle, or
   * {@code null} if the id was free. Stop the displaced handle after this method returns.
   */
  V putReplacing(int id, V handle) {
    return map.putReplacing(id, handle);
  }

  V get(int id) {
    return map.get(id);
  }

  V take(int id) {
    return map.take(id);
  }

  V takeIf(int id, Predicate<V> shouldTake) {
    return map.takeIf(id, shouldTake);
  }

  List<V> takeAll() {
    return map.takeAll();
  }
}
