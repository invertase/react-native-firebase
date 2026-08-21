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
import java.util.List;

/**
 * Cached query map. Unique {@link #put}; callers {@link #take}, {@link #takeIfIdle}, or {@link
 * #takeAllAndRemove} then {@code removeAllEventListeners()} outside the HandleMap lock.
 */
final class RNFBDatabaseQueryRegistry {
  private final RNFBHandleMap<String, DatabaseQueryHandle> map = new RNFBHandleMap<>();

  void put(String queryKey, DatabaseQueryHandle query) throws RNFBHandleCollisionException {
    map.put(queryKey, query);
  }

  DatabaseQueryHandle get(String queryKey) {
    return map.get(queryKey);
  }

  DatabaseQueryHandle take(String queryKey) {
    return map.take(queryKey);
  }

  /**
   * Removes the mapping when the query has no listeners. Reads {@link
   * DatabaseQueryHandle#hasListeners()} outside the HandleMap lock (avoids nesting {@code
   * occupancyLock}), then identity-takes and put-backs if listeners appeared.
   */
  void takeIfIdle(String queryKey) {
    DatabaseQueryHandle query = map.get(queryKey);
    if (query == null) {
      return;
    }
    if (Boolean.TRUE.equals(query.hasListeners())) {
      return;
    }
    DatabaseQueryHandle taken = map.takeIf(queryKey, q -> q == query);
    if (taken == null) {
      return;
    }
    if (Boolean.TRUE.equals(taken.hasListeners())) {
      // Prefer put-back so an active query stays registered. If a concurrent put claimed the
      // slot, putIfAbsent fails and this taken query would be an orphan with listeners — clear
      // them so SDK callbacks are not left attached outside the registry.
      if (!map.putIfAbsent(queryKey, taken)) {
        taken.removeAllEventListeners();
      }
    }
  }

  void takeAllAndRemove() {
    List<DatabaseQueryHandle> remaining = map.takeAll();
    for (DatabaseQueryHandle query : remaining) {
      if (query != null) {
        query.removeAllEventListeners();
      }
    }
  }
}
