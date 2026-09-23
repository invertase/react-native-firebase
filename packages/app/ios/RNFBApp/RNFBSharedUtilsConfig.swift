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
 * Boolean config source used by the SharedUtils config waterfall.
 *
 * Production passes `RNFBPreferences` / `RNFBJSON` instances and a Meta adapter;
 * unit tests inject recording stubs to assert precedence and `||` short-circuit.
 */
@objc public protocol RNFBConfigBooleanProviding: AnyObject {
  @objc(contains:)
  func contains(_ key: String) -> Bool

  @objc(getBooleanValue:defaultValue:)
  func getBooleanValue(_ key: String, defaultValue: Bool) -> Bool
}

/**
 * Config waterfall previously inline in `RNFBSharedUtils.m`.
 *
 * Mirrors pre-port:
 * - `configContains` is Preferences.contains || JSON.contains || Meta.contains
 *   (left-to-right short-circuit, same as ObjC `||`)
 * - `getConfigBooleanValue` prefers Preferences if contains, else JSON if contains,
 *   else Meta (Meta path always used as final, with the passed-in `defaultValue`)
 */
@objc(RNFBSharedUtilsConfig)
public final class RNFBSharedUtilsConfig: NSObject {
  @objc(configContainsKey:preferences:json:meta:)
  public static func configContains(
    _ key: String,
    preferences: RNFBConfigBooleanProviding,
    json: RNFBConfigBooleanProviding,
    meta: RNFBConfigBooleanProviding
  ) -> Bool {
    preferences.contains(key) || json.contains(key) || meta.contains(key)
  }

  @objc(getConfigBooleanValueForKey:defaultValue:preferences:json:meta:)
  public static func getConfigBooleanValue(
    forKey key: String,
    defaultValue: Bool,
    preferences: RNFBConfigBooleanProviding,
    json: RNFBConfigBooleanProviding,
    meta: RNFBConfigBooleanProviding
  ) -> Bool {
    if preferences.contains(key) {
      return preferences.getBooleanValue(key, defaultValue: defaultValue)
    }
    if json.contains(key) {
      return json.getBooleanValue(key, defaultValue: defaultValue)
    }
    // Note that if we're here, and the key is not set on the app's bundle, our final
    // default is the one passed in (pre-port Meta path behaviour).
    return meta.getBooleanValue(key, defaultValue: defaultValue)
  }
}
