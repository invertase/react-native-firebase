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

/// Pending upload/download task map storage. Composes `RNFBHandleMapStorage`.
/// `putOrDiscard` is first-wins and calls `cancel` on the incoming value on collision.
/// Unique `put` collision errors stay on the ObjC façade.
@objc(RNFBStorageTaskRegistryStorage)
public final class RNFBStorageTaskRegistryStorage: NSObject {
  private static let cancelSelector = Selector(("cancel"))

  private let storage = RNFBHandleMapStorage()

  private func cancelHandle(_ handle: AnyObject?) {
    guard let handle = handle, handle.responds(to: Self.cancelSelector) else {
      return
    }
    _ = handle.perform(Self.cancelSelector)
  }

  /// First-wins store without discarding the incoming value. Used by façade `put`.
  @objc(putIfAbsent:value:)
  public func putIfAbsent(_ key: AnyObject, value: AnyObject) -> Bool {
    storage.putIfAbsent(key, value: value)
  }

  /// Unique put. On collision, `cancel`s the incoming value and leaves the existing mapping.
  @objc(putOrDiscard:value:)
  public func putOrDiscard(_ key: AnyObject, value: AnyObject) -> Bool {
    if storage.putIfAbsent(key, value: value) {
      return true
    }
    cancelHandle(value)
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

  @objc(takeIf:when:)
  public func takeIf(_ key: AnyObject, when condition: (AnyObject) -> Bool) -> AnyObject? {
    storage.takeIf(key, when: condition)
  }

  /// get → cancel → identity take (Android shape). FIRStorage cancel is void (no keep-on-false).
  @objc(takeAndCancel:)
  public func takeAndCancel(_ key: AnyObject) -> Bool {
    guard let handle = storage.get(key) else {
      return false
    }
    cancelHandle(handle)
    _ = storage.takeIf(key, when: { $0 === handle })
    return true
  }

  @objc
  public func cancelAll() {
    for handle in storage.takeAll() {
      cancelHandle(handle)
    }
  }
}
