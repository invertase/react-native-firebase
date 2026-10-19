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
 * Per-query value/child listener maps. Unique [putValue]/[putChild]; callers [takeValue]/
 * [takeChild] or [takeAll] then remove the SDK listener outside the HandleMap lock. Null values are
 * not stored so [hasListeners] can use occupancy.
 *
 * Null-key note: [getValue]/[getChild]/[takeValue]/[takeChild]/[hasEventListener] accept
 * `String?` and return null/false for a null key (Java `HashMap` interop). TurboModule/`ReadableMap`
 * paths can pass a null `eventRegistrationKey` into remove/`hasEventListener`. Put keys stay
 * non-null `String` (null-key put from Java NPEs via Kotlin null-check; swallowed at add call sites).
 */
internal class RNFBDatabaseListenerRegistry {
  private val occupancyLock = Any()
  private val valueListeners = RNFBHandleMap<String, Any>()
  private val childListeners = RNFBHandleMap<String, Any>()
  private var occupancy = 0

  @Throws(RNFBHandleCollisionException::class)
  fun putValue(
    eventRegistrationKey: String,
    listener: Any?,
  ) {
    if (listener == null) {
      throw NullPointerException("listener")
    }
    synchronized(occupancyLock) {
      valueListeners.put(eventRegistrationKey, listener)
      occupancy++
    }
  }

  @Throws(RNFBHandleCollisionException::class)
  fun putChild(
    eventRegistrationKey: String,
    listener: Any?,
  ) {
    if (listener == null) {
      throw NullPointerException("listener")
    }
    synchronized(occupancyLock) {
      childListeners.put(eventRegistrationKey, listener)
      occupancy++
    }
  }

  fun getValue(eventRegistrationKey: String?): Any? = if (eventRegistrationKey == null) null else valueListeners.get(eventRegistrationKey)

  fun getChild(eventRegistrationKey: String?): Any? = if (eventRegistrationKey == null) null else childListeners.get(eventRegistrationKey)

  fun takeValue(eventRegistrationKey: String?): Any? {
    synchronized(occupancyLock) {
      if (eventRegistrationKey == null) {
        return null
      }
      val listener = valueListeners.take(eventRegistrationKey)
      if (listener != null) {
        occupancy--
      }
      return listener
    }
  }

  fun takeChild(eventRegistrationKey: String?): Any? {
    synchronized(occupancyLock) {
      if (eventRegistrationKey == null) {
        return null
      }
      val listener = childListeners.take(eventRegistrationKey)
      if (listener != null) {
        occupancy--
      }
      return listener
    }
  }

  fun takeAllValues(): List<Any> {
    synchronized(occupancyLock) {
      val remaining = valueListeners.takeAll()
      occupancy -= remaining.size
      return remaining
    }
  }

  fun takeAllChildren(): List<Any> {
    synchronized(occupancyLock) {
      val remaining = childListeners.takeAll()
      occupancy -= remaining.size
      return remaining
    }
  }

  fun takeAll(): List<Any> {
    val remaining = ArrayList<Any>()
    remaining.addAll(takeAllValues())
    remaining.addAll(takeAllChildren())
    return remaining
  }

  fun hasEventListener(eventRegistrationKey: String?): Boolean {
    if (eventRegistrationKey == null) {
      return false
    }
    return valueListeners.get(eventRegistrationKey) != null ||
      childListeners.get(eventRegistrationKey) != null
  }

  fun hasListeners(): Boolean {
    synchronized(occupancyLock) {
      return occupancy > 0
    }
  }
}
