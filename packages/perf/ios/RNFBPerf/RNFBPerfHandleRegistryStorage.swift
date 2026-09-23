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

/// Perf registry storage. Composes `RNFBHandleMapStorage`; `putOrDiscard` is first-wins
/// (`putIfAbsent`). Unique `put` collision errors stay on the ObjC façade.
@objc(RNFBPerfHandleRegistryStorage)
public final class RNFBPerfHandleRegistryStorage: NSObject {
  private let storage = RNFBHandleMapStorage()

  @objc(putOrDiscard:value:)
  public func putOrDiscard(_ key: AnyObject, value: AnyObject) -> Bool {
    storage.putIfAbsent(key, value: value)
  }

  @objc(putReplacing:value:)
  public func putReplacing(_ key: AnyObject, value: AnyObject) -> AnyObject? {
    storage.putReplacing(key, value: value)
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

  @objc
  public func takeAll() -> [AnyObject] {
    storage.takeAll()
  }
}
