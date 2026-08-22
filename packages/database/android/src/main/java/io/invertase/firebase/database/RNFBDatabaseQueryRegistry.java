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

  void takeIfIdle(String queryKey) {
    DatabaseQueryHandle query = map.get(queryKey);
    if (query != null && !query.hasListeners()) {
      map.take(queryKey);
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
