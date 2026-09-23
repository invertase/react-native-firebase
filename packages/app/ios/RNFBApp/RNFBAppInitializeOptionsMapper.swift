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
 * Name resolution for `-[RNFBAppModule initializeApp:appConfig:resolve:reject:]`.
 *
 * Mirrors pre-port:
 * - `jsAppName` = `name` when `name.length > 0`, else `DEFAULT_APP_DISPLAY_NAME` (`[DEFAULT]`)
 * - `isDefaultApp` when `!name` or name equals `[DEFAULT]`
 *   (empty string → `jsAppName` `[DEFAULT]` but `isDefaultApp` == false)
 */
@objc(RNFBAppInitializeNameResolution)
public final class RNFBAppInitializeNameResolution: NSObject {
  @objc public let appName: String?
  @objc public let jsAppName: String
  @objc public let isDefaultApp: Bool

  @objc public init(appName: String?, jsAppName: String, isDefaultApp: Bool) {
    self.appName = appName
    self.jsAppName = jsAppName
    self.isDefaultApp = isDefaultApp
    super.init()
  }
}

/**
 * Name / FIROptions / authDomain mapping previously inline in
 * `-[RNFBAppModule initializeApp:appConfig:resolve:reject:]`.
 *
 * Distinct from `RCTConvertFIROptions.convertRawOptions`:
 * - optional fields skip assignment when value `isEqual:[NSNull null]`
 * - uses JS keys `iosBundleId` / `iosClientId` / `appGroupId` (not `clientId` + bundle provider)
 */
@objc(RNFBAppInitializeOptionsMapper)
public final class RNFBAppInitializeOptionsMapper: NSObject {
  /// Matches `DEFAULT_APP_DISPLAY_NAME` in `RNFBSharedUtils.m`.
  private static let defaultAppDisplayName = "[DEFAULT]"

  @objc(resolveNameFromAppConfig:)
  public static func resolveName(from appConfig: NSDictionary) -> RNFBAppInitializeNameResolution {
    let appName = appConfig.value(forKey: "name") as? String
    let jsAppName: String
    if let appName, appName.count > 0 {
      jsAppName = appName
    } else {
      jsAppName = defaultAppDisplayName
    }
    let isDefaultApp = appName == nil || appName == defaultAppDisplayName
    return RNFBAppInitializeNameResolution(
      appName: appName,
      jsAppName: jsAppName,
      isDefaultApp: isDefaultApp
    )
  }

  @objc(buildOptionsFrom:optionsFactory:)
  public static func buildOptions(
    from options: NSDictionary,
    optionsFactory: RNFBFIROptionsCreating
  ) -> RNFBFIROptionsConfiguring {
    let firOptions = optionsFactory.create(
      googleAppID: options.value(forKey: "appId") as? String,
      gcmSenderID: options.value(forKey: "messagingSenderId") as? String
    )
    firOptions.APIKey = options.value(forKey: "apiKey") as? String
    firOptions.projectID = options.value(forKey: "projectId") as? String
    if shouldAssignOptionalField(options.value(forKey: "databaseURL")) {
      firOptions.databaseURL = options.value(forKey: "databaseURL") as? String
    }
    if shouldAssignOptionalField(options.value(forKey: "storageBucket")) {
      firOptions.storageBucket = options.value(forKey: "storageBucket") as? String
    }
    if shouldAssignOptionalField(options.value(forKey: "iosBundleId")) {
      firOptions.bundleID = options.value(forKey: "iosBundleId") as? String
    }
    if shouldAssignOptionalField(options.value(forKey: "iosClientId")) {
      firOptions.clientID = options.value(forKey: "iosClientId") as? String
    }
    if shouldAssignOptionalField(options.value(forKey: "appGroupId")) {
      firOptions.appGroupID = options.value(forKey: "appGroupId") as? String
    }
    return firOptions
  }

  @objc(authDomainFromOptions:)
  public static func authDomain(from options: NSDictionary) -> String? {
    options.value(forKey: "authDomain") as? String
  }

  /// Pre-port: `![[options valueForKey:key] isEqual:[NSNull null]]`
  /// (missing/nil → assign; `NSNull` → skip).
  private static func shouldAssignOptionalField(_ value: Any?) -> Bool {
    guard let value else {
      return true
    }
    return !(value as AnyObject).isEqual(NSNull())
  }
}
