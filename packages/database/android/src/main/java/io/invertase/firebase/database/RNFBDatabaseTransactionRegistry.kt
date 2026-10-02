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
 * Transaction handler map. Unique [put] (occupied id aborts the incoming handler, then throws);
 * callers [take] or [takeAllAndAbort] then `abort()` outside the HandleMap lock. Replace is
 * [registerReplacing] (atomic last wins).
 */
internal class RNFBDatabaseTransactionRegistry {
  private val map = RNFBHandleMap<Int, DatabaseAbortable?>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    transactionId: Int,
    handler: DatabaseAbortable?,
  ) {
    try {
      map.put(transactionId, handler)
    } catch (collision: RNFBHandleCollisionException) {
      handler?.abort()
      throw collision
    }
  }

  /** Atomic replace (last wins). The replaced handler is not aborted (Firebase retry). */
  fun registerReplacing(
    transactionId: Int,
    handler: DatabaseAbortable?,
  ) {
    map.putReplacing(transactionId, handler)
  }

  fun get(transactionId: Int): DatabaseAbortable? = map.get(transactionId)

  fun take(transactionId: Int): DatabaseAbortable? = map.take(transactionId)

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
