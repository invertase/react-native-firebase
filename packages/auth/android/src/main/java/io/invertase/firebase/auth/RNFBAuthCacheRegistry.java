package io.invertase.firebase.auth;

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

/**
 * Credential / MFA cache map (data only — no SDK cancel). Unique {@link #put}; callers that
 * previously HashMap-upserted use {@link #putReplacing} ({@code take} then {@code put}, last wins).
 * Peek with {@link #get}; remove with {@link #take}; invalidate with {@link #clear}.
 *
 * <p><strong>Collision vs prior HashMap.put upsert:</strong> unique {@link #put} throws; replace at
 * call sites is {@link #putReplacing} (last wins). {@link #putOrDiscard} keeps the first mapping.
 */
final class RNFBAuthCacheRegistry<V> {
  private final RNFBHandleMap<String, V> map = new RNFBHandleMap<>();

  void put(String key, V value) throws RNFBHandleCollisionException {
    map.put(key, value);
  }

  /**
   * Unique put. On collision, leave the existing mapping and discard the incoming value (data
   * only).
   *
   * @return true if stored
   */
  boolean putOrDiscard(String key, V value) {
    try {
      map.put(key, value);
      return true;
    } catch (RNFBHandleCollisionException collision) {
      return false;
    }
  }

  /**
   * Replace = take then unique put. Preserves prior HashMap {@code put} upsert (last wins). Taken
   * value is discarded (data only). Concurrent collision after take leaves the existing mapping via
   * {@link #putOrDiscard}.
   */
  void putReplacing(String key, V value) {
    map.take(key);
    putOrDiscard(key, value);
  }

  V get(String key) {
    return map.get(key);
  }

  V take(String key) {
    return map.take(key);
  }

  void clear() {
    map.takeAll();
  }
}
