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
 * Transaction handler map. Unique {@link #put} (occupied id aborts the incoming handler, then
 * throws); callers {@link #take} or {@link #takeAllAndAbort} then {@code abort()} outside the
 * HandleMap lock. Replace is {@link #registerReplacing} (atomic last wins).
 */
final class RNFBDatabaseTransactionRegistry {
  private final RNFBHandleMap<Integer, DatabaseAbortable> map = new RNFBHandleMap<>();

  void put(int transactionId, DatabaseAbortable handler) throws RNFBHandleCollisionException {
    try {
      map.put(transactionId, handler);
    } catch (RNFBHandleCollisionException collision) {
      if (handler != null) {
        handler.abort();
      }
      throw collision;
    }
  }

  /** Atomic replace (last wins). The replaced handler is not aborted (Firebase retry). */
  void registerReplacing(int transactionId, DatabaseAbortable handler) {
    map.putReplacing(transactionId, handler);
  }

  DatabaseAbortable get(int transactionId) {
    return map.get(transactionId);
  }

  DatabaseAbortable take(int transactionId) {
    return map.take(transactionId);
  }

  void takeAndAbort(int transactionId) {
    DatabaseAbortable handler = map.take(transactionId);
    if (handler != null) {
      handler.abort();
    }
  }

  void takeAllAndAbort() {
    List<DatabaseAbortable> remaining = map.takeAll();
    for (DatabaseAbortable handler : remaining) {
      if (handler != null) {
        handler.abort();
      }
    }
  }
}
