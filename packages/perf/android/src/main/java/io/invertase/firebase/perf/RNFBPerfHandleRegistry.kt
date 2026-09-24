package io.invertase.firebase.perf

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

import io.invertase.firebase.common.RNFBHandleCollisionException
import io.invertase.firebase.common.RNFBHandleMap
import java.util.function.Predicate

/**
 * Perf id → metric handle map (traces, screen traces, HTTP metrics). Module start paths use
 * [putReplacing] (last wins, stop displaced outside lock). Unique [put] / [putOrDiscard] remain for
 * tests. Callers [get] then [take] then stop outside the HandleMap lock. Tear-down discards via
 * [takeAll] without stopping (matches prior SparseArray clear).
 */
internal class RNFBPerfHandleRegistry<V> {
  private val map = RNFBHandleMap<Int, V>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    id: Int,
    handle: V,
  ) {
    map.put(id, handle)
  }

  /**
   * Unique put. On collision, drop the incoming handle without stopping and leave the existing
   * mapping.
   *
   * @return true if stored
   */
  fun putOrDiscard(
    id: Int,
    handle: V,
  ): Boolean = map.putIfAbsent(id, handle)

  /**
   * Atomically replaces the mapping for [id] (last wins). Returns the displaced handle, or `null`
   * if the id was free. Stop the displaced handle after this method returns.
   */
  fun putReplacing(
    id: Int,
    handle: V,
  ): V? = map.putReplacing(id, handle)

  fun get(id: Int): V? = map.get(id)

  fun take(id: Int): V? = map.take(id)

  fun takeIf(
    id: Int,
    shouldTake: Predicate<V>,
  ): V? = map.takeIf(id, shouldTake)

  fun takeAll(): List<V> = map.takeAll()
}
