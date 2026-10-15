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
 * Foundation-only normalisation of the `options` and `appConfig` dictionaries passed to
 * `initializeApp`. Decodes `{__rnfbNull: true}` sentinels and drops optional keys whose
 * value is `NSNull` (except `automaticDataCollectionEnabled`, where null means false).
 */
@objc(RNFBInitializeAppArguments)
public final class RNFBInitializeAppArguments: NSObject {
  @objc(normalizedOptions:)
  public static func normalizedOptions(_ options: NSDictionary?) -> NSDictionary? {
    decodedDictionary(
      options,
      optionalKeys: [
        "databaseURL",
        "storageBucket",
        "iosBundleId",
        "iosClientId",
        "appGroupId",
        "authDomain",
      ],
      nullReplacements: [:]
    )
  }

  @objc(normalizedAppConfig:)
  public static func normalizedAppConfig(_ appConfig: NSDictionary?) -> NSDictionary? {
    decodedDictionary(
      appConfig,
      optionalKeys: ["name"],
      nullReplacements: ["automaticDataCollectionEnabled": NSNumber(value: false)]
    )
  }

  @objc(automaticDataCollectionEnabledFromAppConfig:)
  public static func automaticDataCollectionEnabled(fromAppConfig appConfig: NSDictionary?) -> NSNumber? {
    guard let value = appConfig?["automaticDataCollectionEnabled"] as? NSNumber else {
      return nil
    }
    return NSNumber(value: value.boolValue)
  }

  private static func decodedDictionary(
    _ dictionary: NSDictionary?,
    optionalKeys: [String],
    nullReplacements: [String: Any]
  ) -> NSDictionary? {
    let decoded = RNFBNullSentinelDecoder.decodeNullSentinels(dictionary)
    guard let decodedDict = decoded as? NSDictionary else {
      return nil
    }

    let normalized = NSMutableDictionary(dictionary: decodedDict)
    for key in optionalKeys {
      if normalized[key] is NSNull {
        normalized.removeObject(forKey: key)
      }
    }
    for (key, replacement) in nullReplacements {
      if normalized[key] is NSNull {
        normalized[key] = replacement
      }
    }
    return normalized
  }
}
