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

#if canImport(RNFBFirebase)
/**
 * Foundation snapshot from `RNFBFirebaseAppClient`, shaped as `RNFBFIROptionsProviding`.
 */
private final class RNFBOpaqueOptionsProvider: NSObject, RNFBFIROptionsProviding {
  let apiKey: String?
  let googleAppID: String?
  let projectID: String?
  let databaseURL: String?
  let storageBucket: String?
  let gcmSenderID: String?
  let clientID: String?

  init(_ snapshot: RNFBFirebaseAppSnapshot) {
    apiKey = snapshot.apiKey
    googleAppID = snapshot.googleAppID
    projectID = snapshot.projectID
    databaseURL = snapshot.databaseURL
    storageBucket = snapshot.storageBucket
    gcmSenderID = snapshot.gcmSenderID
    clientID = snapshot.clientID
  }
}

/**
 * Foundation snapshot from `RNFBFirebaseAppClient`, shaped as `RNFBFIRAppProviding`.
 */
private final class RNFBOpaqueAppProvider: NSObject, RNFBFIRAppProviding {
  let name: String
  let options: RNFBFIROptionsProviding
  private let dataCollectionEnabled: Bool

  init(_ snapshot: RNFBFirebaseAppSnapshot) {
    name = snapshot.name
    options = RNFBOpaqueOptionsProvider(snapshot)
    dataCollectionEnabled = snapshot.isDataCollectionDefaultEnabled
  }

  @objc(isDataCollectionDefaultEnabled)
  func isDataCollectionDefaultEnabled() -> Bool {
    dataCollectionEnabled
  }
}
#else
/**
 * Adapts live `FirebaseOptions` (`FIROptions`) to `RNFBFIROptionsProviding`.
 *
 * Field mapping matches
 * https://github.com/firebase/firebase-ios-sdk/blob/main/FirebaseCore/Sources/Public/FirebaseCore/FIROptions.h
 * (`apiKey`, `googleAppID`, `projectID`, `databaseURL`, `storageBucket`, `gcmSenderID`, `clientID`).
 */
@objc(RNFBFIROptionsAdapter)
final class RNFBFIROptionsAdapter: NSObject, RNFBFIROptionsProviding {
  private let options: FirebaseOptions

  init(options: FirebaseOptions) {
    self.options = options
  }

  var apiKey: String? { options.apiKey }
  var googleAppID: String? { options.googleAppID }
  var projectID: String? { options.projectID }
  var databaseURL: String? { options.databaseURL }
  var storageBucket: String? { options.storageBucket }
  var gcmSenderID: String? { options.gcmSenderID }
  var clientID: String? { options.clientID }
}

/**
 * Adapts live `FirebaseApp` (`FIRApp`) to `RNFBFIRAppProviding`.
 *
 * Uses `name`, `options`, and `isDataCollectionDefaultEnabled` from
 * https://github.com/firebase/firebase-ios-sdk/blob/main/FirebaseCore/Sources/Public/FirebaseCore/FIRApp.h
 */
@objc(RNFBFIRAppAdapter)
final class RNFBFIRAppAdapter: NSObject, RNFBFIRAppProviding {
  private let app: FirebaseApp
  private let optionsAdapter: RNFBFIROptionsAdapter

  init(app: FirebaseApp) {
    self.app = app
    optionsAdapter = RNFBFIROptionsAdapter(options: app.options)
  }

  var name: String { app.name }

  var options: RNFBFIROptionsProviding { optionsAdapter }

  @objc(isDataCollectionDefaultEnabled)
  func isDataCollectionDefaultEnabled() -> Bool {
    app.isDataCollectionDefaultEnabled
  }
}
#endif

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

  /// Live `FIRApp` entry used by `RNFBSharedUtils`.
  @objc(firAppToDictionaryFromFIRApp:customDomainProvider:)
  public static func firAppToDictionary(
    fromFIRApp firApp: NSObject,
    customDomainProvider: RNFBCustomDomainProviding
  ) -> NSDictionary {
#if canImport(RNFBFirebase)
    firAppToDictionary(
      RNFBOpaqueAppProvider(RNFBFirebaseAppClient.snapshot(of: firApp)),
      customDomainProvider: customDomainProvider
    )
#else
    firAppToDictionary(
      RNFBFIRAppAdapter(app: firApp as! FirebaseApp),
      customDomainProvider: customDomainProvider
    )
#endif
  }

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

  /// Live `FIRApp` entry used by `RNFBSharedUtils`.
  @objc(sendJSEventForFIRApp:name:body:eventSender:)
  public static func sendJSEvent(
    forFIRApp firApp: NSObject,
    name: String,
    body: NSDictionary,
    eventSender: RNFBJSEventSending
  ) {
#if canImport(RNFBFirebase)
    sendJSEvent(
      forApp: RNFBOpaqueAppProvider(RNFBFirebaseAppClient.snapshot(of: firApp)),
      name: name,
      body: body,
      eventSender: eventSender
    )
#else
    sendJSEvent(
      forApp: RNFBFIRAppAdapter(app: firApp as! FirebaseApp),
      name: name,
      body: body,
      eventSender: eventSender
    )
#endif
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
