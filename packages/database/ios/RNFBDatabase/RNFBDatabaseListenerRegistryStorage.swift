/**
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
 */

import Foundation

#if canImport(RNFBApp)
import RNFBApp
#endif

/// Per-query listener handle map storage. Composes `RNFBHandleMapStorage` and tracks
/// occupancy for `hasListeners`. Unique-put collision errors stay on the ObjC façade.
@objc(RNFBDatabaseListenerRegistryStorage)
public final class RNFBDatabaseListenerRegistryStorage: NSObject {
  private let storage = RNFBHandleMapStorage()
  private let lock = NSRecursiveLock()
  private var occupancy = 0

  /// First-wins store. Increments occupancy only on success.
  @objc(putIfAbsent:value:)
  public func putIfAbsent(_ key: AnyObject, value: AnyObject) -> Bool {
    lock.withLock {
      guard storage.putIfAbsent(key, value: value) else {
        return false
      }
      occupancy += 1
      return true
    }
  }

  @objc(get:)
  public func get(_ key: AnyObject) -> AnyObject? {
    storage.get(key)
  }

  /// Removes and returns the value. Decrements occupancy when non-nil.
  @objc(take:)
  public func take(_ key: AnyObject) -> AnyObject? {
    lock.withLock {
      let value = storage.take(key)
      if value != nil {
        occupancy -= 1
      }
      return value
    }
  }

  /// Snapshot then clear. Decrements occupancy by `remaining.count`.
  @objc
  public func takeAll() -> [AnyObject] {
    lock.withLock {
      let remaining = storage.takeAll()
      occupancy -= remaining.count
      return remaining
    }
  }

  @objc(hasEventListener:)
  public func hasEventListener(_ key: AnyObject) -> Bool {
    storage.get(key) != nil
  }

  @objc
  public var hasListeners: Bool {
    lock.withLock {
      occupancy > 0
    }
  }
}
