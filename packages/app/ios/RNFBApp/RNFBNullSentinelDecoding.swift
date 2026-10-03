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

/**
 * Decodes `{ "__rnfbNull": true }` sentinel dictionaries produced by the JS bridge
 * into `NSNull`, walking nested arrays/dictionaries iteratively.
 *
 * Mirrors the pre-port `+[RNFBSharedUtils decodeNullSentinels:]` algorithm.
 */
@objc(RNFBNullSentinelDecoder)
public final class RNFBNullSentinelDecoder: NSObject {
  private static let sentinelKey = "__rnfbNull"

  @objc(decode:)
  public static func decode(_ value: Any?) -> Any? {
    guard let value else {
      return nil
    }

    // Non-container values are returned as-is (identity preserved).
    guard value is NSDictionary || value is NSArray else {
      return value
    }

    if let dict = value as? NSDictionary, isNullSentinel(dict) {
      return NSNull()
    }

    let rootMutable: AnyObject
    if let dict = value as? NSDictionary {
      rootMutable = NSMutableDictionary(capacity: dict.count)
    } else {
      let array = value as! NSArray
      rootMutable = NSMutableArray(capacity: array.count)
    }

    // Stack frames: (original container, mutable container)
    var stack: [(original: AnyObject, mutable: AnyObject)] = [
      (value as AnyObject, rootMutable),
    ]

    while let frame = stack.popLast() {
      if let origDict = frame.original as? NSDictionary {
        let mutableDict = frame.mutable as! NSMutableDictionary
        for key in origDict.allKeys {
          let child = origDict[key]
          processChild(
            child,
            parentMutable: mutableDict,
            key: (key as! any NSCopying),
            isParentDict: true,
            stack: &stack
          )
        }
      } else if let origArray = frame.original as? NSArray {
        let mutableArray = frame.mutable as! NSMutableArray
        for child in origArray {
          processChild(
            child,
            parentMutable: mutableArray,
            key: nil,
            isParentDict: false,
            stack: &stack
          )
        }
      }
    }

    return rootMutable
  }

  /// Pre-port: `dict.count == 1 && flag != nil && [flag boolValue]`.
  private static func isNullSentinel(_ dict: NSDictionary) -> Bool {
    guard dict.count == 1, let flag = dict[sentinelKey] else {
      return false
    }
    if let number = flag as? NSNumber {
      return number.boolValue
    }
    if let string = flag as? NSString {
      return string.boolValue
    }
    return false
  }

  private static func processChild(
    _ child: Any?,
    parentMutable: AnyObject,
    key: NSCopying?,
    isParentDict: Bool,
    stack: inout [(original: AnyObject, mutable: AnyObject)]
  ) {
    let processedValue: AnyObject

    if let childDict = child as? NSDictionary {
      if isNullSentinel(childDict) {
        processedValue = NSNull()
      } else {
        let childMut = NSMutableDictionary(capacity: childDict.count)
        processedValue = childMut
        stack.append((childDict, childMut))
      }
    } else if let childArray = child as? NSArray {
      let childMut = NSMutableArray(capacity: childArray.count)
      processedValue = childMut
      stack.append((childArray, childMut))
    } else {
      // Preserve primitives; nil → NSNull (pre-port: `child ?: [NSNull null]`).
      processedValue = (child as AnyObject?) ?? NSNull()
    }

    if isParentDict {
      let mutDict = parentMutable as! NSMutableDictionary
      // NSDictionary can't store nil; pre-port only assigned when processedValue was non-nil.
      mutDict[key!] = processedValue
    } else {
      let mutArray = parentMutable as! NSMutableArray
      mutArray.add(processedValue)
    }
  }
}
