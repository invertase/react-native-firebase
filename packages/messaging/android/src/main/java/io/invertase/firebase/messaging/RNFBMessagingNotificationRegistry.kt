package io.invertase.firebase.messaging

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
 * FCM message-id → notification `RemoteMessage` map. Unique [put]; callers that previously
 * HashMap-upserted use [putReplacing] (atomic last wins). Peek with [get]; remove with [take]
 * (replaces HashMap `remove`).
 *
 * Collision vs prior HashMap.put upsert: unique [put] throws; production call sites use
 * [putReplacing] (last wins).
 */
internal class RNFBMessagingNotificationRegistry<V> {
  private val map = RNFBHandleMap<String, V>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    messageId: String,
    message: V,
  ) {
    map.put(messageId, message)
  }

  /**
   * Atomic replace (last wins). Preserves prior HashMap `put` upsert. Returns displaced value.
   */
  fun putReplacing(
    messageId: String,
    message: V,
  ): V? = map.putReplacing(messageId, message)

  fun get(messageId: String): V? = map.get(messageId)

  fun take(messageId: String): V? = map.take(messageId)
}
