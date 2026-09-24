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

/// Functions streaming listener map storage. Composes `RNFBHandleMapStorage`.
/// Unique `put` collision errors and `shouldForwardEvent` stay on the ObjC façade.
/// `takeAndCancel` / `cancelAll` take then call `cancel` if the value responds.
@objc(RNFBFunctionsStreamingRegistryStorage)
public final class RNFBFunctionsStreamingRegistryStorage: NSObject {
  private static let cancelSelector = Selector(("cancel"))

  private let storage = RNFBHandleMapStorage()

  /// Calls `-cancel` via `responds(to:)` + `perform` (avoids Swift protocol cast requiring
  /// formal conformance — ObjC test fakes without `@objc` protocol adoption stay safe).
  private func cancelHandle(_ handle: AnyObject?) {
    guard let handle = handle, handle.responds(to: Self.cancelSelector) else {
      return
    }
    _ = handle.perform(Self.cancelSelector)
  }

  /// First-wins store. Used by façade `put` / `putOrCollisionMessage`.
  @objc(putIfAbsent:value:)
  public func putIfAbsent(_ key: AnyObject, value: AnyObject) -> Bool {
    storage.putIfAbsent(key, value: value)
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

  /// Take then cancel outside the map lock (pre-port shape).
  @objc(takeAndCancel:)
  public func takeAndCancel(_ key: AnyObject) {
    cancelHandle(storage.take(key))
  }

  @objc
  public func cancelAll() {
    for handle in storage.takeAll() {
      cancelHandle(handle)
    }
  }
}
