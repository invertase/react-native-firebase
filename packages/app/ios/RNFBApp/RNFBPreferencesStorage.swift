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

private let RNFBPreferencesDomainIdentifier = "io.invertase.firebase"

@objc(RNFBPreferencesStorage)
public final class RNFBPreferencesStorage: NSObject {
  private let userDefaults: UserDefaults
  private let domainIdentifier: String

  public override convenience init() {
    self.init(
      userDefaults: UserDefaults(suiteName: RNFBPreferencesDomainIdentifier)!,
      domainIdentifier: RNFBPreferencesDomainIdentifier
    )
  }

  @objc(initWithUserDefaults:domainIdentifier:)
  public init(userDefaults: UserDefaults, domainIdentifier: String) {
    self.userDefaults = userDefaults
    self.domainIdentifier = domainIdentifier
    super.init()
  }

  @objc(contains:)
  public func contains(_ key: String) -> Bool {
    userDefaults.object(forKey: key) != nil
  }

  @objc(getBooleanValue:defaultValue:)
  public func getBooleanValue(_ key: String, defaultValue: Bool) -> Bool {
    guard contains(key) else {
      return defaultValue
    }
    return userDefaults.bool(forKey: key)
  }

  @objc(setBooleanValue:boolValue:)
  public func setBooleanValue(_ key: String, boolValue: Bool) {
    userDefaults.set(boolValue, forKey: key)
    userDefaults.synchronize()
  }

  @objc(setIntegerValue:integerValue:)
  public func setIntegerValue(_ key: String, integerValue: Int) {
    userDefaults.set(integerValue, forKey: key)
    userDefaults.synchronize()
  }

  @objc(getIntegerValue:defaultValue:)
  public func getIntegerValue(_ key: String, defaultValue: Int) -> Int {
    guard contains(key) else {
      return defaultValue
    }
    return userDefaults.integer(forKey: key)
  }

  @objc(getStringValue:defaultValue:)
  public func getStringValue(_ key: String, defaultValue: String) -> String? {
    guard contains(key) else {
      return defaultValue
    }
    return userDefaults.string(forKey: key)
  }

  @objc(setStringValue:stringValue:)
  public func setStringValue(_ key: String, stringValue: String) {
    userDefaults.set(stringValue, forKey: key)
    userDefaults.synchronize()
  }

  @objc
  public func getAll() -> [String: Any] {
    userDefaults.dictionaryRepresentation()
  }

  @objc
  public func clearAll() {
    userDefaults.removePersistentDomain(forName: domainIdentifier)
  }

  @objc(remove:)
  public func remove(_ key: String) {
    userDefaults.removeObject(forKey: key)
  }
}
