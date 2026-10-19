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

private let RNFBMetaPrefix = "rnfirebase_"

@objc(RNFBMetaStorage)
public final class RNFBMetaStorage: NSObject {
  private let infoDictionary: NSDictionary

  public override convenience init() {
    self.init(infoDictionary: Bundle.main.infoDictionary ?? [:])
  }

  @objc(initWithInfoDictionary:)
  public init(infoDictionary: [String: Any]) {
    self.infoDictionary = infoDictionary as NSDictionary
    super.init()
  }

  private func prefixed(_ key: String) -> String {
    RNFBMetaPrefix + key
  }

  @objc(contains:)
  public func contains(_ key: String) -> Bool {
    infoDictionary.value(forKey: prefixed(key)) != nil
  }

  @objc(getBooleanValue:defaultValue:)
  public func getBooleanValue(_ key: String, defaultValue: Bool) -> Bool {
    guard let keyValue = infoDictionary.value(forKey: prefixed(key)) else {
      return defaultValue
    }
    // Pre-port: `[NSNumber boolValue]` after KVC lookup (NSString also responds).
    if let number = keyValue as? NSNumber {
      return number.boolValue
    }
    return (keyValue as! NSString).boolValue
  }

  @objc(getStringValue:defaultValue:)
  public func getStringValue(_ key: String, defaultValue: String) -> String {
    guard let keyValue = infoDictionary.value(forKey: prefixed(key)) else {
      return defaultValue
    }
    // Pre-port returned the unchecked `id` typed as `NSString *`.
    return keyValue as! String
  }

  @objc
  public func getAll() -> [String: Any] {
    var allMetaValues: [String: Any] = [:]
    for key in infoDictionary.allKeys {
      guard let key = key as? String, key.hasPrefix(RNFBMetaPrefix) else {
        continue
      }
      allMetaValues[key] = infoDictionary[key]
    }
    return allMetaValues
  }
}
