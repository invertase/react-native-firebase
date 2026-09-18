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
 *
 */

import Foundation
#if canImport(RNFBFirebase)
import RNFBFirebase
#else
import FirebaseAnalytics
#endif

/// Swift-side facade for every `FIRAnalytics` call `RNFBAnalyticsModule.mm` needs.
///
/// Exists so that `.mm` (Objective-C++) source never has to `#import`/`@import`
/// FirebaseAnalytics directly. Under the local dynamic SPM umbrella
/// (`RNFBFirebase`), the individual Firebase framework headers are not on the
/// Clang header search path -- only this pod's own generated `-Swift.h` header
/// is. A plain Swift `import` (this file) is unaffected by that; `.mm` files
/// only ever see this facade via `#import "RNFBAnalytics-Swift.h"`.
///
/// See `RNFBFunctionsCallHandler` (packages/functions) for the pattern this
/// follows, and `packages/app/ios/RNFBFirebase/Package.swift` for the umbrella
/// itself.
@objcMembers public class RNFBAnalyticsFacade: NSObject {

  // MARK: - Parameter cleaning (moved from RNFBAnalyticsModule.mm so the .mm
  // file no longer needs the `kFIRParameter*` constants, which live in
  // FirebaseAnalytics headers)

  private static let longNumericParameterKeys: [String] = [
    AnalyticsParameterQuantity,
    AnalyticsParameterIndex,
    AnalyticsParameterLevel,
    AnalyticsParameterNumberOfNights,
    AnalyticsParameterNumberOfPassengers,
    AnalyticsParameterNumberOfRooms,
    AnalyticsParameterScore,
  ]

  private static func coerceLongNumericParameters(_ dict: inout [String: Any]) {
    for key in longNumericParameterKeys {
      if let value = dict[key] as? NSNumber {
        dict[key] = NSNumber(value: value.intValue)
      }
    }
  }

  private static func coerceSuccessParameter(_ dict: inout [String: Any]) {
    guard let value = dict[AnalyticsParameterSuccess] else {
      return
    }

    var success = 0
    if let stringValue = value as? String {
      let lower = stringValue.lowercased()
      if lower == "true" || lower == "yes" || lower == "1" {
        success = 1
      }
    } else if let numberValue = value as? NSNumber {
      success = numberValue.boolValue ? 1 : 0
    }
    dict[AnalyticsParameterSuccess] = NSNumber(value: success)
  }

  private static func cleanParameters(_ params: [String: Any]?) -> [String: Any]? {
    guard let params = params else {
      return nil
    }
    var newParams = params

    if let items = newParams[AnalyticsParameterItems] as? [[String: Any]] {
      newParams[AnalyticsParameterItems] = items.map { item -> [String: Any] in
        var mutableItem = item
        coerceLongNumericParameters(&mutableItem)
        return mutableItem
      }
    }

    coerceLongNumericParameters(&newParams)
    coerceSuccessParameter(&newParams)

    if let extendSession = newParams[AnalyticsParameterExtendSession] as? NSNumber,
      extendSession.intValue == 1
    {
      newParams[AnalyticsParameterExtendSession] = true
    }

    return newParams
  }

  // MARK: - FIRAnalytics facade

  @objc(logEventWithName:parameters:)
  public static func logEvent(name: String, parameters: [String: Any]?) {
    Analytics.logEvent(name, parameters: cleanParameters(parameters))
  }

  @objc(setAnalyticsCollectionEnabled:)
  public static func setAnalyticsCollectionEnabled(_ enabled: Bool) {
    Analytics.setAnalyticsCollectionEnabled(enabled)
  }

  @objc(setUserID:)
  public static func setUserID(_ userID: String?) {
    Analytics.setUserID(userID)
  }

  @objc(setUserPropertyString:forName:)
  public static func setUserPropertyString(_ value: String?, forName name: String) {
    Analytics.setUserProperty(value, forName: name)
  }

  @objc(resetAnalyticsData)
  public static func resetAnalyticsData() {
    Analytics.resetAnalyticsData()
  }

  @objc(setSessionTimeoutInterval:)
  public static func setSessionTimeoutInterval(_ interval: TimeInterval) {
    Analytics.setSessionTimeoutInterval(interval)
  }

  @objc(appInstanceID)
  public static func appInstanceID() -> String? {
    return Analytics.appInstanceID()
  }

  /// Mirrors the historical `.mm` behaviour exactly: `completion(nil)` only on
  /// an SDK error, `completion(<value>)` otherwise -- including when
  /// `sessionID == 0` (the prior ObjC `[NSNumber numberWithLongLong:sessionID]
  /// == 0` guard for firebase-ios-sdk#15258 always compared a non-nil object
  /// pointer to `0`, so it never actually took effect; preserved as-is here
  /// rather than silently changing behaviour as part of this import-routing
  /// refactor). Timeout handling stays in `RNFBAnalyticsModule.mm`
  /// (dispatch/timing, not a Firebase call).
  @objc(sessionIDWithCompletion:)
  public static func sessionID(completion: @escaping (NSNumber?) -> Void) {
    Analytics.sessionID { sessionID, error in
      if error != nil {
        completion(nil)
      } else {
        completion(NSNumber(value: sessionID))
      }
    }
  }

  @objc(setDefaultEventParameters:)
  public static func setDefaultEventParameters(_ parameters: [String: Any]?) {
    Analytics.setDefaultEventParameters(cleanParameters(parameters))
  }

  @objc(initiateOnDeviceConversionMeasurementWithEmailAddress:)
  public static func initiateOnDeviceConversionMeasurement(emailAddress: String) {
    Analytics.initiateOnDeviceConversionMeasurement(emailAddress: emailAddress)
  }

  @objc(initiateOnDeviceConversionMeasurementWithHashedEmailAddress:)
  public static func initiateOnDeviceConversionMeasurement(hashedEmailAddress: Data) {
    Analytics.initiateOnDeviceConversionMeasurement(hashedEmailAddress: hashedEmailAddress)
  }

  @objc(initiateOnDeviceConversionMeasurementWithPhoneNumber:)
  public static func initiateOnDeviceConversionMeasurement(phoneNumber: String) {
    Analytics.initiateOnDeviceConversionMeasurement(phoneNumber: phoneNumber)
  }

  @objc(initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:)
  public static func initiateOnDeviceConversionMeasurement(hashedPhoneNumber: Data) {
    Analytics.initiateOnDeviceConversionMeasurement(hashedPhoneNumber: hashedPhoneNumber)
  }

  @objc(setConsentWithAnalyticsStorage:adStorage:adUserData:adPersonalization:)
  public static func setConsent(
    analyticsStorage: NSNumber?,
    adStorage: NSNumber?,
    adUserData: NSNumber?,
    adPersonalization: NSNumber?
  ) {
    var consent: [ConsentType: ConsentStatus] = [:]
    if let value = analyticsStorage {
      consent[.analyticsStorage] = value.boolValue ? .granted : .denied
    }
    if let value = adStorage {
      consent[.adStorage] = value.boolValue ? .granted : .denied
    }
    if let value = adUserData {
      consent[.adUserData] = value.boolValue ? .granted : .denied
    }
    if let value = adPersonalization {
      consent[.adPersonalization] = value.boolValue ? .granted : .denied
    }
    Analytics.setConsent(consent)
  }
}
