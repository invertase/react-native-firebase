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

/// Auth-state / id-token listener map storage. Composes `RNFBHandleMapStorage`.
/// `putOrDiscard` is first-wins and calls `remove` on the incoming value on collision.
/// Unique `put` collision errors stay on the ObjC façade.
@objc(RNFBAuthListenerRegistryStorage)
public final class RNFBAuthListenerRegistryStorage: NSObject {
  private static let removeSelector = Selector(("remove"))

  private let storage = RNFBHandleMapStorage()

  private func removeHandle(_ handle: AnyObject?) {
    guard let handle = handle, handle.responds(to: Self.removeSelector) else {
      return
    }
    _ = handle.perform(Self.removeSelector)
  }

  /// First-wins store without discarding the incoming value. Used by façade `put`.
  @objc(putIfAbsent:value:)
  public func putIfAbsent(_ key: AnyObject, value: AnyObject) -> Bool {
    storage.putIfAbsent(key, value: value)
  }

  /// Unique put. On collision, `remove`s the incoming value and leaves the existing mapping.
  @objc(putOrDiscard:value:)
  public func putOrDiscard(_ key: AnyObject, value: AnyObject) -> Bool {
    if storage.putIfAbsent(key, value: value) {
      return true
    }
    removeHandle(value)
    return false
  }

  @objc(get:)
  public func get(_ key: AnyObject) -> AnyObject? {
    storage.get(key)
  }

  @objc(take:)
  public func take(_ key: AnyObject) -> AnyObject? {
    storage.take(key)
  }

  @objc(takeAndRemove:)
  public func takeAndRemove(_ key: AnyObject) {
    removeHandle(storage.take(key))
  }

  @objc
  public func removeAll() {
    for handle in storage.takeAll() {
      removeHandle(handle)
    }
  }
}
