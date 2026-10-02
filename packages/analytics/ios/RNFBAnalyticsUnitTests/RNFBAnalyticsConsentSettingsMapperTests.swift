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

import XCTest

final class RNFBAnalyticsConsentSettingsMapperTests: XCTestCase {
  func testConsentTypeStatusConstants_matchFirebaseStrings() {
    XCTAssertEqual(
      RNFBAnalyticsConsentSettingsMapper.consentTypeAnalyticsStorageValue, "analytics_storage")
    XCTAssertEqual(RNFBAnalyticsConsentSettingsMapper.consentTypeAdStorageValue, "ad_storage")
    XCTAssertEqual(RNFBAnalyticsConsentSettingsMapper.consentTypeAdUserDataValue, "ad_user_data")
    XCTAssertEqual(
      RNFBAnalyticsConsentSettingsMapper.consentTypeAdPersonalizationValue, "ad_personalization")
    XCTAssertEqual(RNFBAnalyticsConsentSettingsMapper.consentStatusGrantedValue, "granted")
    XCTAssertEqual(RNFBAnalyticsConsentSettingsMapper.consentStatusDeniedValue, "denied")
  }

  func testConsentDictionary_nilSettings_returnsEmpty() {
    let result = RNFBAnalyticsConsentSettingsMapper.consentDictionary(from: nil)
    XCTAssertEqual(result.count, 0)
  }

  func testConsentDictionary_emptySettings_returnsEmpty() {
    let result = RNFBAnalyticsConsentSettingsMapper.consentDictionary(from: [:])
    XCTAssertEqual(result.count, 0)
  }

  func testConsentDictionary_omitsMissingKeys() {
    let result = RNFBAnalyticsConsentSettingsMapper.consentDictionary(from: [
      "analytics_storage": true
    ] as NSDictionary)
    XCTAssertEqual(result.count, 1)
    XCTAssertEqual(result["analytics_storage"] as? String, "granted")
    XCTAssertNil(result["ad_storage"])
    XCTAssertNil(result["ad_user_data"])
    XCTAssertNil(result["ad_personalization"])
  }

  func testConsentDictionary_trueBecomesGranted_falseBecomesDenied() {
    let result = RNFBAnalyticsConsentSettingsMapper.consentDictionary(from: [
      "analytics_storage": true,
      "ad_storage": false,
      "ad_user_data": NSNumber(value: true),
      "ad_personalization": NSNumber(value: 0),
    ] as NSDictionary)

    XCTAssertEqual(result["analytics_storage"] as? String, "granted")
    XCTAssertEqual(result["ad_storage"] as? String, "denied")
    XCTAssertEqual(result["ad_user_data"] as? String, "granted")
    XCTAssertEqual(result["ad_personalization"] as? String, "denied")
  }

  func testConsentDictionary_ignoresUnknownKeys() {
    let result = RNFBAnalyticsConsentSettingsMapper.consentDictionary(from: [
      "analytics_storage": true,
      "security_storage": true,
      "other": false,
    ] as NSDictionary)
    XCTAssertEqual(result.count, 1)
    XCTAssertEqual(result["analytics_storage"] as? String, "granted")
    XCTAssertNil(result["security_storage"])
    XCTAssertNil(result["other"])
  }

  func testConsentDictionary_allFourKeys() {
    let result = RNFBAnalyticsConsentSettingsMapper.consentDictionary(from: [
      "analytics_storage": false,
      "ad_storage": true,
      "ad_user_data": false,
      "ad_personalization": true,
    ] as NSDictionary)
    XCTAssertEqual(result.count, 4)
    XCTAssertEqual(result["analytics_storage"] as? String, "denied")
    XCTAssertEqual(result["ad_storage"] as? String, "granted")
    XCTAssertEqual(result["ad_user_data"] as? String, "denied")
    XCTAssertEqual(result["ad_personalization"] as? String, "granted")
  }
}
