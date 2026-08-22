package io.invertase.firebase.messaging;

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
 * FCM message-id → notification {@code RemoteMessage} map. Unique {@link #put}; callers that
 * previously HashMap-upserted use {@link #putReplacing} (atomic last wins). Peek with {@link #get};
 * remove with {@link #take} (replaces HashMap {@code remove}).
 *
 * <p><strong>Collision vs prior HashMap.put upsert:</strong> unique {@link #put} throws; production
 * call sites use {@link #putReplacing} (last wins).
 */
final class RNFBMessagingNotificationRegistry<V> {
  private final RNFBHandleMap<String, V> map = new RNFBHandleMap<>();

  void put(String messageId, V message) throws RNFBHandleCollisionException {
    map.put(messageId, message);
  }

  /**
   * Atomic replace (last wins). Preserves prior HashMap {@code put} upsert. Returns displaced
   * value.
   */
  V putReplacing(String messageId, V message) {
    return map.putReplacing(messageId, message);
  }

  V get(String messageId) {
    return map.get(messageId);
  }

  V take(String messageId) {
    return map.take(messageId);
  }
}
