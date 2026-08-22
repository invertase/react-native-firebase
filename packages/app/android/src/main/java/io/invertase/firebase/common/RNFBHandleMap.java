package io.invertase.firebase.common;

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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Thread-safe id → handle registry. The lock only moves pointers; this class never invokes methods
 * on stored values (no SDK {@code cancel}/{@code remove}). Callers {@link #take} or {@link
 * #takeAll}, then act on the returned object(s) outside the lock.
 *
 * <p>{@link #put} is unique: an occupied id throws {@link RNFBHandleCollisionException}. There is
 * no upsert. Replace at the call site with {@code take} then {@code put}.
 *
 * <p><strong>Do not lock on the map or on a {@code RNFBHandleMap} instance.</strong> Callers that
 * synchronize on {@code this} (or on the internal map) can deadlock with the dedicated monitor.
 * Android uses a private {@code lock} object; never expose it and never {@code synchronized (this)}
 * around these methods.
 */
public class RNFBHandleMap<K, V> {
  private final Object lock = new Object();
  private final HashMap<K, V> map = new HashMap<>();

  /**
   * Registers {@code handle} under {@code id}.
   *
   * @throws RNFBHandleCollisionException if {@code id} is already occupied
   */
  public void put(K id, V handle) throws RNFBHandleCollisionException {
    synchronized (lock) {
      if (map.containsKey(id)) {
        throw new RNFBHandleCollisionException(id);
      }
      map.put(id, handle);
    }
  }

  /**
   * Peeks at the handle for {@code id} without removing it (for emit while still registered).
   *
   * @return the handle, or {@code null} if absent
   */
  public V get(K id) {
    synchronized (lock) {
      return map.get(id);
    }
  }

  /**
   * Removes and returns the handle for {@code id}.
   *
   * @return the handle, or {@code null} if absent
   */
  public V take(K id) {
    synchronized (lock) {
      return map.remove(id);
    }
  }

  /**
   * Snapshot of current values, then clear. Cancel/remove each returned object after this method
   * returns, not under this map's lock.
   */
  public List<V> takeAll() {
    synchronized (lock) {
      List<V> values = new ArrayList<>(map.values());
      map.clear();
      return values;
    }
  }
}
