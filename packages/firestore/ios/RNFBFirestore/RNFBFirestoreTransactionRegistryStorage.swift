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

/// Transaction attempt map storage. Composes `RNFBHandleMapStorage`.
/// Unique `put` collision errors stay on the ObjC façade.
/// `abortAll` abort typing stays on the façade (`rnfb_abortState:`).
@objc(RNFBFirestoreTransactionRegistryStorage)
public final class RNFBFirestoreTransactionRegistryStorage: NSObject {
  private let storage = RNFBHandleMapStorage()

  /// First-wins store. Used by façade `put`.
  @objc(putIfAbsent:value:)
  public func putIfAbsent(_ key: AnyObject, value: AnyObject) -> Bool {
    storage.putIfAbsent(key, value: value)
  }

  /// Store if absent, or YES when existing === value. Used by façade `putOrSkip`.
  @objc(putIfAbsentOrSame:value:)
  public func putIfAbsentOrSame(_ key: AnyObject, value: AnyObject) -> Bool {
    storage.putIfAbsentOrSame(key, value: value)
  }

  @objc(get:)
  public func get(_ key: AnyObject) -> AnyObject? {
    storage.get(key)
  }

  @objc(take:)
  public func take(_ key: AnyObject) -> AnyObject? {
    storage.take(key)
  }

  /// Snapshot then clear. Façade `abortAll` aborts each remaining attempt.
  @objc
  public func takeAll() -> [AnyObject] {
    storage.takeAll()
  }
}
