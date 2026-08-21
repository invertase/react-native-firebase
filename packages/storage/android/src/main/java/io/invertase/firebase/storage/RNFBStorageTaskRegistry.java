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
import java.util.function.Predicate;

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
    if (map.putIfAbsent(taskId, handle)) {
      return true;
    }
    if (handle != null) {
      handle.cancel();
    }
    return false;
  }

  StoragePendingHandle get(int taskId) {
    return map.get(taskId);
  }

  StoragePendingHandle take(int taskId) {
    return map.take(taskId);
  }

  StoragePendingHandle takeIf(int taskId, Predicate<StoragePendingHandle> shouldTake) {
    return map.takeIf(taskId, shouldTake);
  }

  /**
   * Cancel outside the HandleMap lock; remove the mapping only when cancel succeeds. Returns {@code
   * false} when no mapping existed or cancel failed. Trailing unregister is identity-gated so a
   * replacement put after {@code cancel()} (e.g. production {@code destroyTask}) is not stolen.
   *
   * <p>Shape: get → cancel → identity takeIf on success (keep mapping when cancel returns false).
   * iOS registry mirrors get → cancel → identity takeIf, but FIRStorage cancel is void so there is
   * no keep-on-false path — see {@code RNFBStorageTaskRegistry.takeAndCancel:} / helper {@code
   * setTaskStatus}.
   */
  boolean takeAndCancel(int taskId) {
    StoragePendingHandle handle = map.get(taskId);
    if (handle == null) {
      return false;
    }
    boolean cancelled = handle.cancel();
    if (cancelled) {
      map.takeIf(taskId, h -> h == handle);
    }
    return cancelled;
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
