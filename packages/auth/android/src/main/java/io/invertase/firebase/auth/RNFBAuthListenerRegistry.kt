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
 * Auth-state / id-token listener map. Unique [put] / [putOrDiscard]; callers [take] or
 * [takeAllAndRemove] then `remove()` outside the HandleMap lock. Skip-if-registered is
 * `get(appName) != null`.
 *
 * Null-key note: [get]/[take]/[takeAndRemove] keep non-null [String] keys. Call sites always
 * pass TurboModule `appName` (never null). Unlike [RNFBAuthCacheRegistry], no Java path passes a
 * null lookup key.
 */
internal class RNFBAuthListenerRegistry {
  private val map = RNFBHandleMap<String, AuthListenerHandle?>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    appName: String,
    handle: AuthListenerHandle?,
  ) {
    map.put(appName, handle)
  }

  /**
   * Unique put. On collision, `remove()` the incoming handle and leave the existing mapping.
   *
   * @return true if stored
   */
  fun putOrDiscard(
    appName: String,
    handle: AuthListenerHandle?,
  ): Boolean {
    try {
      map.put(appName, handle)
      return true
    } catch (_: RNFBHandleCollisionException) {
      handle?.remove()
      return false
    }
  }

  fun get(appName: String): AuthListenerHandle? = map.get(appName)

  fun take(appName: String): AuthListenerHandle? = map.take(appName)

  fun takeAndRemove(appName: String) {
    val handle = map.take(appName)
    handle?.remove()
  }

  fun takeAllAndRemove() {
    val remaining = map.takeAll()
    for (handle in remaining) {
      handle?.remove()
    }
  }
}
