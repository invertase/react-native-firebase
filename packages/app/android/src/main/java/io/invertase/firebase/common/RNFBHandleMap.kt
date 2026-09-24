package io.invertase.firebase.common

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

import java.util.function.Predicate

/**
 * Thread-safe id → handle registry. The lock only moves pointers; this class never invokes methods
 * on stored values (no SDK `cancel`/`remove`). Callers [take] or [takeAll], then act on the returned
 * object(s) outside the lock.
 *
 * [put] is unique: an occupied id throws [RNFBHandleCollisionException]. There is no upsert. Use
 * [putIfAbsent] (first wins), [putIfAbsentOrSame] (first wins or same instance), or [putReplacing]
 * (last wins) for atomic upsert. Replace at the call site with `take` then `put` only when neither
 * helper fits.
 *
 * **Do not lock on the map or on a [RNFBHandleMap] instance.** Callers that synchronize on `this`
 * (or on the internal map) can deadlock with the dedicated monitor. Android uses a private [lock]
 * object; never expose it and never `synchronized(this)` around these methods.
 */
open class RNFBHandleMap<K, V> {
  private val lock = Any()
  private val map = HashMap<K, V>()

  /**
   * Registers [handle] under [id].
   *
   * @throws RNFBHandleCollisionException if [id] is already occupied
   */
  @Throws(RNFBHandleCollisionException::class)
  open fun put(
    id: K,
    handle: V,
  ) {
    synchronized(lock) {
      if (map.containsKey(id)) {
        throw RNFBHandleCollisionException(id)
      }
      map[id] = handle
    }
  }

  /**
   * Stores [handle] under [id] only when the id is free (first wins).
   *
   * @return `true` if stored, `false` if [id] was already occupied
   */
  open fun putIfAbsent(
    id: K,
    handle: V,
  ): Boolean =
    synchronized(lock) {
      if (map.containsKey(id)) {
        false
      } else {
        map[id] = handle
        true
      }
    }

  /**
   * Under one lock: stores [handle] when the id is free, or returns `true` when the existing mapping
   * is the same instance (`===`). Returns `false` when occupied by a different handle.
   */
  open fun putIfAbsentOrSame(
    id: K,
    handle: V,
  ): Boolean =
    synchronized(lock) {
      if (!map.containsKey(id)) {
        map[id] = handle
        true
      } else {
        map[id] === handle
      }
    }

  /**
   * Atomically replaces the mapping for [id] (last wins). Returns the previous handle, or `null` if
   * the id was free.
   */
  open fun putReplacing(
    id: K,
    handle: V,
  ): V? = synchronized(lock) { map.put(id, handle) }

  /**
   * Peeks at the handle for [id] without removing it (for emit while still registered).
   *
   * @return the handle, or `null` if absent
   */
  open fun get(id: K): V? = synchronized(lock) { map[id] }

  /**
   * Removes and returns the handle for [id].
   *
   * @return the handle, or `null` if absent
   */
  open fun take(id: K): V? = synchronized(lock) { map.remove(id) }

  /**
   * When [id] is mapped and [shouldTake] accepts the handle, removes and returns it; otherwise
   * returns `null` and leaves the map unchanged. Lookup, predicate, and removal run under one lock —
   * use for check-and-take that must not race with concurrent [put] / [take] on the same id.
   *
   * The predicate runs under this map's lock; keep it lightweight (no SDK cancel/remove).
   */
  open fun takeIf(
    id: K,
    shouldTake: Predicate<V>,
  ): V? =
    synchronized(lock) {
      val value = map[id]
      if (value != null && shouldTake.test(value)) {
        map.remove(id)
      } else {
        null
      }
    }

  /**
   * Snapshot of current values, then clear. Cancel/remove each returned object after this method
   * returns, not under this map's lock.
   */
  open fun takeAll(): List<V> =
    synchronized(lock) {
      val values = ArrayList(map.values)
      map.clear()
      values
    }
}
