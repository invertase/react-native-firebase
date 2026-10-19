package io.invertase.firebase.auth

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

/**
 * Credential / MFA cache map (data only — no SDK cancel). Unique [put]; callers that previously
 * HashMap-upserted use [putReplacing] (atomic last wins). Peek with [get]; remove with [take];
 * invalidate with [clear].
 *
 * Collision vs prior HashMap.put upsert: unique [put] throws; replace at call sites is
 * [putReplacing] (last wins). [putOrDiscard] keeps the first mapping.
 */
internal class RNFBAuthCacheRegistry<V> {
  private val map = RNFBHandleMap<String, V>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    key: String,
    value: V,
  ) {
    map.put(key, value)
  }

  /**
   * Unique put. On collision, leave the existing mapping and discard the incoming value (data
   * only).
   *
   * @return true if stored
   */
  fun putOrDiscard(
    key: String,
    value: V,
  ): Boolean = map.putIfAbsent(key, value)

  /**
   * Atomic replace (last wins). Preserves prior HashMap `put` upsert. Taken value discarded.
   */
  fun putReplacing(
    key: String,
    value: V,
  ) {
    map.putReplacing(key, value)
  }

  /**
   * Peek. Nullable [key] matches prior Java `HashMap.get(null)` → null (no NPE). Java callers such
   * as `promiseRejectAuthException` may pass a null sessionId when the error map has none.
   */
  fun get(key: String?): V? = if (key == null) null else map.get(key)

  /**
   * Remove. Nullable [key] matches prior Java `HashMap.remove(null)` → null (no NPE).
   */
  fun take(key: String?): V? = if (key == null) null else map.take(key)

  fun clear() {
    map.takeAll()
  }
}
