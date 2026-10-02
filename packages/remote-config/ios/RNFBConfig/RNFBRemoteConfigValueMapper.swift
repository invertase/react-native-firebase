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
 * Subset of `FIRRemoteConfigValue` fields used by
 * `convertFIRRemoteConfigValueToNSDictionary` in `RNFBConfigHelper.m`.
 *
 * Protocol-shaped so unit tests can stub without linking FirebaseRemoteConfig.
 * Production passes `FIRRemoteConfigValue` (conforms via selectors).
 */
@objc public protocol RNFBRemoteConfigValueReading: AnyObject {
  var stringValue: String? { get }
  var source: Int { get }
}

/**
 * Builds the JS-facing config-value dictionary previously constructed inline
 * in `RNFBConfigHelper.m`'s `convertFIRRemoteConfigValueToNSDictionary`.
 *
 * Pre-port contracts:
 * - `value` key: `stringValue` when non-nil, otherwise `NSNull`
 * - `source` key: `RNFBRemoteConfigEnumMapper.string(forSource:)` for `source`
 */
@objc(RNFBRemoteConfigValueMapper)
public final class RNFBRemoteConfigValueMapper: NSObject {
  @objc(dictionaryForValue:)
  public static func dictionary(for value: RNFBRemoteConfigValueReading) -> NSDictionary {
    [
      "value": (value.stringValue as Any?) ?? NSNull(),
      "source": RNFBRemoteConfigEnumMapper.string(forSource: value.source),
    ]
  }
}
