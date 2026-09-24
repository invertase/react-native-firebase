package io.invertase.firebase.database

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
 * Cached query map. Unique [put]; callers [take], [takeIfIdle], or [takeAllAndRemove] then
 * `removeAllEventListeners()` outside the HandleMap lock.
 *
 * Null-key note: [get]/[take]/[takeIfIdle] accept `String?` and return null / no-op for a null key
 * (Java `HashMap` interop). TurboModule `off(queryKey, …)` can pass a null `queryKey`. Put keys stay
 * non-null `String`.
 */
internal class RNFBDatabaseQueryRegistry {
  private val map = RNFBHandleMap<String, DatabaseQueryHandle?>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    queryKey: String,
    query: DatabaseQueryHandle?,
  ) {
    map.put(queryKey, query)
  }

  fun get(queryKey: String?): DatabaseQueryHandle? = if (queryKey == null) null else map.get(queryKey)

  fun take(queryKey: String?): DatabaseQueryHandle? = if (queryKey == null) null else map.take(queryKey)

  /**
   * Removes the mapping when the query has no listeners. Reads [DatabaseQueryHandle.hasListeners]
   * outside the HandleMap lock (avoids nesting `occupancyLock`), then identity-takes and put-backs if
   * listeners appeared.
   */
  fun takeIfIdle(queryKey: String?) {
    if (queryKey == null) {
      return
    }
    val query = map.get(queryKey) ?: return
    if (query.hasListeners() == true) {
      return
    }
    val taken = map.takeIf(queryKey) { q -> q === query } ?: return
    if (taken.hasListeners() == true) {
      // Prefer put-back so an active query stays registered. If a concurrent put claimed the
      // slot, putIfAbsent fails and this taken query would be an orphan with listeners — clear
      // them so SDK callbacks are not left attached outside the registry.
      if (!map.putIfAbsent(queryKey, taken)) {
        taken.removeAllEventListeners()
      }
    }
  }

  fun takeAllAndRemove() {
    val remaining = map.takeAll()
    for (query in remaining) {
      query?.removeAllEventListeners()
    }
  }
}
