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

#if canImport(RNFBFirebase)
import RNFBFirebase
#else
import FirebaseCore
#endif
import Foundation

/**
 * FIRApp registry previously hard-wired to `[FIRApp defaultApp]` / `[FIRApp appNamed:]`.
 *
 * Production adapts live `FIRApp` class methods; unit tests inject a registry double.
 */
@objc public protocol RNFBFIRAppLookingUp: AnyObject {
  @objc(defaultApp)
  func defaultApp() -> AnyObject?

  @objc(appNamed:)
  func appNamed(_ name: String) -> AnyObject?
}

/**
 * Adapts `FirebaseApp.app()` / `FirebaseApp.app(name:)` (`+[FIRApp defaultApp]` /
 * `+[FIRApp appNamed:]`) for `RCTConvertFIRApp`.
 */
@objc(RNFBFIRAppRegistryAdapter)
final class RNFBFIRAppRegistryAdapter: NSObject, RNFBFIRAppLookingUp {
  @objc static let shared = RNFBFIRAppRegistryAdapter()

  func defaultApp() -> AnyObject? {
#if canImport(RNFBFirebase)
    RNFBFirebaseAppClient.defaultApp()
#else
    FirebaseApp.app()
#endif
  }

  func appNamed(_ name: String) -> AnyObject? {
#if canImport(RNFBFirebase)
    RNFBFirebaseAppClient.app(named: name)
#else
    FirebaseApp.app(name: name)
#endif
  }
}

/**
 * FIRApp name → instance lookup previously inline in `RCTConvert+FIRApp.m`.
 *
 * Mirrors pre-port:
 * - `DEFAULT_APP_DISPLAY_NAME` (`[DEFAULT]`) → `defaultApp`
 * - any other name → `appNamed:`
 */
@objc(RCTConvertFIRApp)
public final class RCTConvertFIRApp: NSObject {
  /// Matches `DEFAULT_APP_DISPLAY_NAME` in `RNFBSharedUtils.m`.
  private static let defaultAppDisplayName = "[DEFAULT]"

  @objc(firAppFromString:)
  public static func firApp(fromString appName: String) -> AnyObject? {
    firApp(fromString: appName, registry: RNFBFIRAppRegistryAdapter.shared)
  }

  @objc(firAppFromString:registry:)
  public static func firApp(fromString appName: String, registry: RNFBFIRAppLookingUp) -> AnyObject? {
    if appName == defaultAppDisplayName {
      return registry.defaultApp()
    }
    return registry.appNamed(appName)
  }
}
