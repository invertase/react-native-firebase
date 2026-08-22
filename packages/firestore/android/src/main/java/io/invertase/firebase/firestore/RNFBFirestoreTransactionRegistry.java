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

import io.invertase.firebase.common.RNFBHandleCollisionException;
import io.invertase.firebase.common.RNFBHandleMap;
import java.util.List;

/**
 * Transaction handler map. Unique {@link #put}; begin uses {@link #putOrSkip} (retry-get vs
 * collision). Callers {@link #take} or {@link #takeAllAndAbort} then {@code abort()} outside the
 * HandleMap lock.
 */
final class RNFBFirestoreTransactionRegistry {
  private final RNFBHandleMap<Integer, ReactNativeFirebaseFirestoreTransactionHandler> map =
      new RNFBHandleMap<>();

  void put(int transactionId, ReactNativeFirebaseFirestoreTransactionHandler handler)
      throws RNFBHandleCollisionException {
    map.put(transactionId, handler);
  }

  /**
   * Unique put for begin. Same-value retry returns true without re-put. Occupied by a different
   * value returns false and leaves the existing mapping.
   */
  boolean putOrSkip(int transactionId, ReactNativeFirebaseFirestoreTransactionHandler handler) {
    if (map.get(transactionId) == handler) {
      return true;
    }
    try {
      map.put(transactionId, handler);
      return true;
    } catch (RNFBHandleCollisionException collision) {
      return false;
    }
  }

  ReactNativeFirebaseFirestoreTransactionHandler get(int transactionId) {
    return map.get(transactionId);
  }

  ReactNativeFirebaseFirestoreTransactionHandler take(int transactionId) {
    return map.take(transactionId);
  }

  void takeAndAbort(int transactionId) {
    ReactNativeFirebaseFirestoreTransactionHandler handler = map.take(transactionId);
    if (handler != null) {
      handler.abort();
    }
  }

  void takeAllAndAbort() {
    List<ReactNativeFirebaseFirestoreTransactionHandler> remaining = map.takeAll();
    for (ReactNativeFirebaseFirestoreTransactionHandler handler : remaining) {
      if (handler != null) {
        handler.abort();
      }
    }
  }
}
