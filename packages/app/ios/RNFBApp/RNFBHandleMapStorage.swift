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

@objc(RNFBHandleMapStorage)
public final class RNFBHandleMapStorage: NSObject {
  private let map = NSMutableDictionary()
  private let lock = NSRecursiveLock()

  @objc(putIfAbsent:value:)
  public func putIfAbsent(_ key: AnyObject, value: AnyObject) -> Bool {
    lock.withLock {
      guard map.object(forKey: key) == nil else {
        return false
      }
      map[key] = value
      return true
    }
  }

  @objc(putIfAbsentOrSame:value:)
  public func putIfAbsentOrSame(_ key: AnyObject, value: AnyObject) -> Bool {
    lock.withLock {
      guard let existing = map.object(forKey: key) as AnyObject? else {
        map[key] = value
        return true
      }
      return existing === value
    }
  }

  @objc(putReplacing:value:)
  public func putReplacing(_ key: AnyObject, value: AnyObject) -> AnyObject? {
    lock.withLock {
      let previous = map.object(forKey: key) as AnyObject?
      map[key] = value
      return previous
    }
  }

  @objc(get:)
  public func get(_ key: AnyObject) -> AnyObject? {
    lock.withLock {
      map.object(forKey: key) as AnyObject?
    }
  }

  @objc(take:)
  public func take(_ key: AnyObject) -> AnyObject? {
    lock.withLock {
      let value = map.object(forKey: key) as AnyObject?
      map.removeObject(forKey: key)
      return value
    }
  }

  @objc(takeIf:when:)
  public func takeIf(_ key: AnyObject, when condition: (AnyObject) -> Bool) -> AnyObject? {
    lock.withLock {
      guard let value = map.object(forKey: key) as AnyObject?, condition(value) else {
        return nil
      }
      map.removeObject(forKey: key)
      return value
    }
  }

  @objc
  public func takeAll() -> [AnyObject] {
    lock.withLock {
      let values = map.allValues as [AnyObject]
      map.removeAllObjects()
      return values
    }
  }
}
