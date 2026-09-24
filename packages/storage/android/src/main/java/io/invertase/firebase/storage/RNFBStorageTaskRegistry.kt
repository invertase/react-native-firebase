package io.invertase.firebase.storage

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
import java.util.function.Predicate

/**
 * Pending upload/download task map. Unique [put]; callers [take] or [takeAllAndCancel] then cancel
 * outside the HandleMap lock.
 */
internal class RNFBStorageTaskRegistry {
  private val map = RNFBHandleMap<Int, StoragePendingHandle?>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    taskId: Int,
    handle: StoragePendingHandle?,
  ) {
    map.put(taskId, handle)
  }

  /**
   * Unique put. On collision, `cancel()` the incoming handle and leave the existing mapping.
   *
   * @return true if stored
   */
  fun putOrDiscard(
    taskId: Int,
    handle: StoragePendingHandle?,
  ): Boolean {
    if (map.putIfAbsent(taskId, handle)) {
      return true
    }
    handle?.cancel()
    return false
  }

  fun get(taskId: Int): StoragePendingHandle? = map.get(taskId)

  fun take(taskId: Int): StoragePendingHandle? = map.take(taskId)

  fun takeIf(
    taskId: Int,
    shouldTake: Predicate<StoragePendingHandle?>,
  ): StoragePendingHandle? = map.takeIf(taskId, shouldTake)

  /**
   * Cancel outside the HandleMap lock; remove the mapping only when cancel succeeds. Returns `false`
   * when no mapping existed or cancel failed. Trailing unregister is identity-gated so a
   * replacement put after `cancel()` (e.g. production `destroyTask`) is not stolen.
   *
   * Shape: get → cancel → identity takeIf on success (keep mapping when cancel returns false). iOS
   * registry mirrors get → cancel → identity takeIf, but FIRStorage cancel is void so there is no
   * keep-on-false path — see `RNFBStorageTaskRegistry.takeAndCancel:` / helper `setTaskStatus`.
   */
  fun takeAndCancel(taskId: Int): Boolean {
    val handle = map.get(taskId) ?: return false
    val cancelled = handle.cancel()
    if (cancelled) {
      map.takeIf(taskId) { h -> h === handle }
    }
    return cancelled
  }

  fun takeAllAndCancel() {
    val remaining = map.takeAll()
    for (handle in remaining) {
      handle?.cancel()
    }
  }
}
