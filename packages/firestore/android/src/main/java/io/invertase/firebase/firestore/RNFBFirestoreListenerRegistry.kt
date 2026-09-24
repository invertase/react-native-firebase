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

import com.google.firebase.firestore.ListenerRegistration
import io.invertase.firebase.common.RNFBHandleCollisionException
import io.invertase.firebase.common.RNFBHandleMap

/**
 * Document / collection / snapshots-in-sync listener map. Unique [put] / [putOrDiscard]; callers
 * [take] or [takeAllAndRemove] then `remove()` outside the HandleMap lock. Skip-if-registered is
 * `get(id) != null`.
 */
internal class RNFBFirestoreListenerRegistry {
  private val map = RNFBHandleMap<Int, ListenerRegistration?>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    listenerId: Int,
    registration: ListenerRegistration?,
  ) {
    map.put(listenerId, registration)
  }

  /**
   * Unique put. On collision, `remove()` the incoming registration and leave the existing mapping.
   *
   * @return true if stored
   */
  fun putOrDiscard(
    listenerId: Int,
    registration: ListenerRegistration?,
  ): Boolean {
    try {
      map.put(listenerId, registration)
      return true
    } catch (_: RNFBHandleCollisionException) {
      registration?.remove()
      return false
    }
  }

  fun get(listenerId: Int): ListenerRegistration? = map.get(listenerId)

  fun take(listenerId: Int): ListenerRegistration? = map.take(listenerId)

  fun takeAndRemove(listenerId: Int) {
    val registration = map.take(listenerId)
    registration?.remove()
  }

  fun takeAllAndRemove() {
    val remaining = map.takeAll()
    for (registration in remaining) {
      registration?.remove()
    }
  }
}
