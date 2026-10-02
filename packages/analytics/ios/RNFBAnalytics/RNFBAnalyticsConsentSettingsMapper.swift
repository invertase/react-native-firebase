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
 * Builds the Firebase Analytics consent dictionary previously assembled
 * inline in `RNFBAnalyticsModule.mm` (`RNFBAnalyticsAddConsentStatus`).
 *
 * Pre-port contracts:
 * - JS keys `analytics_storage` / `ad_storage` / `ad_user_data` /
 *   `ad_personalization` map to `FIRConsentType*` dictionary keys
 * - Present value → `boolValue` → `FIRConsentStatusGranted` / `Denied`
 * - Omit key when the settings value is nil
 *
 * Consent type/status strings match Firebase Analytics `FIRConsentType*` /
 * `FIRConsentStatus*` values (Foundation-only so unit tests do not link
 * the Analytics SDK). `[FIRAnalytics setConsent:]` stays on
 * `RNFBAnalyticsHelper.m`.
 */
@objc(RNFBAnalyticsConsentSettingsMapper)
public final class RNFBAnalyticsConsentSettingsMapper: NSObject {
  // MARK: - Firebase Analytics consent type strings (FIRConsentType*)

  private static let consentTypeAnalyticsStorage = "analytics_storage"
  private static let consentTypeAdStorage = "ad_storage"
  private static let consentTypeAdUserData = "ad_user_data"
  private static let consentTypeAdPersonalization = "ad_personalization"

  // MARK: - Firebase Analytics consent status strings (FIRConsentStatus*)

  private static let consentStatusGranted = "granted"
  private static let consentStatusDenied = "denied"

  /// Same string values as `FIRConsentType*` / HostStub constants.
  @objc public static var consentTypeAnalyticsStorageValue: String {
    consentTypeAnalyticsStorage
  }

  @objc public static var consentTypeAdStorageValue: String { consentTypeAdStorage }

  @objc public static var consentTypeAdUserDataValue: String { consentTypeAdUserData }

  @objc public static var consentTypeAdPersonalizationValue: String {
    consentTypeAdPersonalization
  }

  @objc public static var consentStatusGrantedValue: String { consentStatusGranted }

  @objc public static var consentStatusDeniedValue: String { consentStatusDenied }

  /// Builds `[FIRConsentType: FIRConsentStatus]` from JS consent settings.
  @objc(consentDictionaryFromSettings:)
  public static func consentDictionary(from settings: NSDictionary?) -> NSDictionary {
    let consent = NSMutableDictionary(capacity: 4)
    guard let settings else {
      return consent.copy() as! NSDictionary
    }

    addConsentStatus(
      consent, settings: settings, key: "analytics_storage", type: consentTypeAnalyticsStorage)
    addConsentStatus(consent, settings: settings, key: "ad_storage", type: consentTypeAdStorage)
    addConsentStatus(
      consent, settings: settings, key: "ad_user_data", type: consentTypeAdUserData)
    addConsentStatus(
      consent, settings: settings, key: "ad_personalization", type: consentTypeAdPersonalization)

    return consent.copy() as! NSDictionary
  }

  /// Pre-port `RNFBAnalyticsAddConsentStatus`.
  private static func addConsentStatus(
    _ consent: NSMutableDictionary,
    settings: NSDictionary,
    key: String,
    type: String
  ) {
    // Pre-port: `NSNumber *value = consentSettings[key]; if (value != nil) …`
    guard let value = settings[key] else {
      return
    }
    // Pre-port: `value.boolValue ? FIRConsentStatusGranted : FIRConsentStatusDenied`
    consent[type] = (value as AnyObject).boolValue ? consentStatusGranted : consentStatusDenied
  }
}
