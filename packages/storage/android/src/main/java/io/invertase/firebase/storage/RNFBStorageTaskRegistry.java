package io.invertase.firebase.storage;

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
 * Pending upload/download task map. Unique {@link #put}; callers {@link #take} or {@link
 * #takeAllAndCancel} then cancel outside the HandleMap lock.
 */
final class RNFBStorageTaskRegistry {
  private final RNFBHandleMap<Integer, StoragePendingHandle> map = new RNFBHandleMap<>();

  void put(int taskId, StoragePendingHandle handle) throws RNFBHandleCollisionException {
    map.put(taskId, handle);
  }

  /**
   * Unique put. On collision, {@code cancel()} the incoming handle and leave the existing mapping.
   *
   * @return true if stored
   */
  boolean putOrDiscard(int taskId, StoragePendingHandle handle) {
    try {
      map.put(taskId, handle);
      return true;
    } catch (RNFBHandleCollisionException collision) {
      if (handle != null) {
        handle.cancel();
      }
      return false;
    }
  }

  StoragePendingHandle get(int taskId) {
    return map.get(taskId);
  }

  StoragePendingHandle take(int taskId) {
    return map.take(taskId);
  }

  /** Take then cancel outside the HandleMap lock. Returns {@code false} when no mapping existed. */
  boolean takeAndCancel(int taskId) {
    StoragePendingHandle handle = map.take(taskId);
    if (handle == null) {
      return false;
    }
    handle.cancel();
    return true;
  }

  void takeAllAndCancel() {
    List<StoragePendingHandle> remaining = map.takeAll();
    for (StoragePendingHandle handle : remaining) {
      if (handle != null) {
        handle.cancel();
      }
    }
  }
}
