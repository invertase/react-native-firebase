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
 * FIROptions fields needed by `firAppToDictionary`.
 *
 * Production adapts live `FIROptions`; unit tests inject doubles.
 */
@objc public protocol RNFBFIROptionsProviding: AnyObject {
  var apiKey: String? { get }
  var googleAppID: String? { get }
  var projectID: String? { get }
  var databaseURL: String? { get }
  var storageBucket: String? { get }
  var gcmSenderID: String? { get }
  var clientID: String? { get }
}

/**
 * FIRApp fields needed by SharedUtils FIR helpers.
 *
 * Production adapts live `FIRApp`; unit tests inject doubles.
 */
@objc public protocol RNFBFIRAppProviding: AnyObject {
  var name: String { get }
  var options: RNFBFIROptionsProviding { get }

  @objc(isDataCollectionDefaultEnabled)
  func isDataCollectionDefaultEnabled() -> Bool
}

/**
 * Custom auth-domain lookup previously hard-wired to `RNFBAppModule getCustomDomain:`.
 */
@objc public protocol RNFBCustomDomainProviding: AnyObject {
  @objc(getCustomDomain:)
  func getCustomDomain(_ appName: String) -> String?
}

/**
 * JS event sink previously hard-wired to `RNFBRCTEventEmitter.shared`.
 */
@objc public protocol RNFBJSEventSending: AnyObject {
  @objc(sendEventWithName:body:)
  func sendEvent(name: String, body: Any?)
}

/**
 * FIR app dictionary / JS-event helpers previously inline in `RNFBSharedUtils.m`.
 *
 * Mirrors pre-port:
 * - `__FIRAPP_DEFAULT` → `[DEFAULT]` for `appConfig.name`
 * - options keys from FIROptions; `authDomain` only when custom-domain provider returns non-nil
 * - `sendJSEventForApp` mutably copies body, injects `appName` via JS name mapping, forwards to sender
 */
@objc(RNFBSharedUtilsFIRApp)
public final class RNFBSharedUtilsFIRApp: NSObject {
  /// Matches `DEFAULT_APP_NAME` in `RNFBSharedUtils.m`.
  private static let defaultAppName = "__FIRAPP_DEFAULT"
  /// Matches `DEFAULT_APP_DISPLAY_NAME` in `RNFBSharedUtils.m`.
  private static let defaultAppDisplayName = "[DEFAULT]"

  @objc(firAppToDictionary:customDomainProvider:)
  public static func firAppToDictionary(
    _ app: RNFBFIRAppProviding,
    customDomainProvider: RNFBCustomDomainProviding
  ) -> NSDictionary {
    let firAppDictionary = NSMutableDictionary()
    let firAppOptions = NSMutableDictionary()
    let firAppConfig = NSMutableDictionary()

    var name = app.name
    if name == defaultAppName {
      name = defaultAppDisplayName
    }

    firAppConfig["name"] = name
    firAppConfig["automaticDataCollectionEnabled"] = NSNumber(
      value: app.isDataCollectionDefaultEnabled()
    )

    let options = app.options
    firAppOptions["apiKey"] = options.apiKey
    firAppOptions["appId"] = options.googleAppID
    firAppOptions["projectId"] = options.projectID
    firAppOptions["databaseURL"] = options.databaseURL
    firAppOptions["storageBucket"] = options.storageBucket
    firAppOptions["messagingSenderId"] = options.gcmSenderID
    // missing from android sdk - ios only:
    firAppOptions["clientId"] = options.clientID
    // not in FIROptions API but in JS SDK and project config JSON
    if let customAuthDomain = customDomainProvider.getCustomDomain(name) {
      firAppOptions["authDomain"] = customAuthDomain
    }

    firAppDictionary["options"] = firAppOptions
    firAppDictionary["appConfig"] = firAppConfig
    return firAppDictionary
  }

  @objc(sendJSEventForApp:name:body:eventSender:)
  public static func sendJSEvent(
    forApp app: RNFBFIRAppProviding,
    name: String,
    body: NSDictionary,
    eventSender: RNFBJSEventSending
  ) {
    let newBody = NSMutableDictionary(dictionary: body)
    newBody["appName"] = RNFBSharedUtilsFormatting.getAppJavaScriptName(app.name)
    eventSender.sendEvent(name: name, body: newBody)
  }
}
