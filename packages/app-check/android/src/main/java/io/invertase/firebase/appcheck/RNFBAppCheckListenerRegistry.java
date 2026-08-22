package io.invertase.firebase.appcheck;

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
import java.util.List;

/**
 * App Check token listener map. Unique {@link #put} / {@link #putOrDiscard}; callers {@link #take}
 * or {@link #takeAllAndRemove} then {@code remove()} outside the HandleMap lock. Skip-if-registered
 * is {@code get(appName) != null}.
 */
final class RNFBAppCheckListenerRegistry {
  private final RNFBHandleMap<String, AppCheckListenerHandle> map = new RNFBHandleMap<>();

  void put(String appName, AppCheckListenerHandle handle) throws RNFBHandleCollisionException {
    map.put(appName, handle);
  }

  /**
   * Unique put. On collision, {@code remove()} the incoming handle and leave the existing mapping.
   *
   * @return true if stored
   */
  boolean putOrDiscard(String appName, AppCheckListenerHandle handle) {
    try {
      map.put(appName, handle);
      return true;
    } catch (RNFBHandleCollisionException collision) {
      if (handle != null) {
        handle.remove();
      }
      return false;
    }
  }

  AppCheckListenerHandle get(String appName) {
    return map.get(appName);
  }

  AppCheckListenerHandle take(String appName) {
    return map.take(appName);
  }

  void takeAndRemove(String appName) {
    AppCheckListenerHandle handle = map.take(appName);
    if (handle != null) {
      handle.remove();
    }
  }

  void takeAllAndRemove() {
    List<AppCheckListenerHandle> remaining = map.takeAll();
    for (AppCheckListenerHandle handle : remaining) {
      if (handle != null) {
        handle.remove();
      }
    }
  }
}
