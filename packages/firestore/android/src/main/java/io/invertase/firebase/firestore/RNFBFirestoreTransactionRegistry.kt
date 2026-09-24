package io.invertase.firebase.firestore

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
 * Transaction handler map. Unique [put]; begin uses [putOrSkip] (atomic
 * [RNFBHandleMap.putIfAbsentOrSame]). Callers [take] or [takeAllAndAbort] then `abort()` outside
 * the HandleMap lock.
 */
internal class RNFBFirestoreTransactionRegistry {
  private val map = RNFBHandleMap<Int, ReactNativeFirebaseFirestoreTransactionHandler?>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    transactionId: Int,
    handler: ReactNativeFirebaseFirestoreTransactionHandler?,
  ) {
    map.put(transactionId, handler)
  }

  /**
   * Unique put for begin. Same-value retry returns true without re-put. Occupied by a different
   * value returns false and leaves the existing mapping. Single HandleMap lock via
   * [RNFBHandleMap.putIfAbsentOrSame].
   */
  fun putOrSkip(
    transactionId: Int,
    handler: ReactNativeFirebaseFirestoreTransactionHandler?,
  ): Boolean = map.putIfAbsentOrSame(transactionId, handler)

  fun get(transactionId: Int): ReactNativeFirebaseFirestoreTransactionHandler? = map.get(transactionId)

  fun take(transactionId: Int): ReactNativeFirebaseFirestoreTransactionHandler? = map.take(transactionId)

  fun takeAndAbort(transactionId: Int) {
    val handler = map.take(transactionId)
    handler?.abort()
  }

  fun takeAllAndAbort() {
    val remaining = map.takeAll()
    for (handler in remaining) {
      handler?.abort()
    }
  }
}
