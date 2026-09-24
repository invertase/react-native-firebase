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

/// Cached query map storage. Composes `RNFBHandleMapStorage`.
/// Unique `put` collision errors stay on the ObjC façade.
/// `takeIfIdle` reads `hasListeners` outside the HandleMap lock (avoids nesting).
@objc(RNFBDatabaseQueryRegistryStorage)
public final class RNFBDatabaseQueryRegistryStorage: NSObject {
  private static let hasListenersSelector = Selector(("hasListeners"))
  private static let removeAllEventListenersSelector = Selector(("removeAllEventListeners"))

  private let storage = RNFBHandleMapStorage()

  private func removeAllEventListeners(_ query: AnyObject?) {
    guard let query = query, query.responds(to: Self.removeAllEventListenersSelector) else {
      return
    }
    _ = query.perform(Self.removeAllEventListenersSelector)
  }

  /// Calls `-hasListeners` via IMP (avoids Swift protocol cast requiring formal conformance).
  /// Returns `nil` when the selector is absent.
  private func queryHasListeners(_ query: AnyObject) -> Bool? {
    typealias HasListenersIMP = @convention(c) (AnyObject, Selector) -> Bool
    let sel = Self.hasListenersSelector
    guard query.responds(to: sel), let method = class_getInstanceMethod(type(of: query), sel)
    else {
      return nil
    }
    let fn = unsafeBitCast(method_getImplementation(method), to: HasListenersIMP.self)
    return fn(query, sel)
  }

  /// First-wins store. Used by façade `put`.
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

  /// Idle-only take. `hasListeners` is read outside the HandleMap lock; identity-take then
  /// put-back (or orphan cleanup) if listeners appear after the outside check.
  @objc(takeIfIdle:)
  public func takeIfIdle(_ key: AnyObject) -> AnyObject? {
    guard let query = storage.get(key) else {
      return nil
    }
    guard let hasListeners = queryHasListeners(query) else {
      return nil
    }
    if hasListeners {
      return nil
    }
    guard let taken = storage.takeIf(key, when: { $0 === query }) else {
      return nil
    }
    if queryHasListeners(taken) == true {
      // Prefer put-back so an active query stays registered. If a concurrent put claimed the
      // slot, putIfAbsent fails and this taken query would be an orphan with listeners — clear
      // them so SDK callbacks are not left attached outside the registry.
      if !storage.putIfAbsent(key, value: taken) {
        removeAllEventListeners(taken)
      }
      return nil
    }
    return taken
  }

  /// Snapshot then clear; `removeAllEventListeners` on each value that responds.
  @objc
  public func removeAll() {
    for query in storage.takeAll() {
      removeAllEventListeners(query)
    }
  }
}
