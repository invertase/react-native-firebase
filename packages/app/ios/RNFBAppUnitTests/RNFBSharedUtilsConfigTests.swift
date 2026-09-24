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
import XCTest

private final class RecordingConfigSource: NSObject, RNFBConfigBooleanProviding {
  var containsCalls: [String] = []
  var getBooleanCalls: [(key: String, defaultValue: Bool)] = []
  var containsResult = false
  var booleanResult = false
  /// When true, `getBooleanValue` returns the passed-in `defaultValue` (Meta missing-key path).
  var echoDefaultValue = false

  func contains(_ key: String) -> Bool {
    containsCalls.append(key)
    return containsResult
  }

  func getBooleanValue(_ key: String, defaultValue: Bool) -> Bool {
    getBooleanCalls.append((key, defaultValue))
    if echoDefaultValue {
      return defaultValue
    }
    return booleanResult
  }
}

final class RNFBSharedUtilsConfigTests: XCTestCase {
  private let key = "rnfb.config.waterfall.test"

  func testConfigContainsIsOrOfPreferencesJsonMeta() {
    let preferences = RecordingConfigSource()
    let json = RecordingConfigSource()
    let meta = RecordingConfigSource()

    preferences.containsResult = false
    json.containsResult = false
    meta.containsResult = false
    XCTAssertFalse(
      RNFBSharedUtilsConfig.configContains(
        key,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )

    meta.containsResult = true
    XCTAssertTrue(
      RNFBSharedUtilsConfig.configContains(
        key,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )

    json.containsResult = true
    meta.containsResult = false
    XCTAssertTrue(
      RNFBSharedUtilsConfig.configContains(
        key,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )

    preferences.containsResult = true
    json.containsResult = false
    XCTAssertTrue(
      RNFBSharedUtilsConfig.configContains(
        key,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
  }

  func testConfigContainsShortCircuitsLeftToRight() {
    let preferences = RecordingConfigSource()
    let json = RecordingConfigSource()
    let meta = RecordingConfigSource()
    preferences.containsResult = true

    XCTAssertTrue(
      RNFBSharedUtilsConfig.configContains(
        key,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
    XCTAssertEqual(preferences.containsCalls, [key])
    XCTAssertTrue(json.containsCalls.isEmpty)
    XCTAssertTrue(meta.containsCalls.isEmpty)

    preferences.containsResult = false
    json.containsResult = true
    preferences.containsCalls.removeAll()
    json.containsCalls.removeAll()
    meta.containsCalls.removeAll()

    XCTAssertTrue(
      RNFBSharedUtilsConfig.configContains(
        key,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
    XCTAssertEqual(preferences.containsCalls, [key])
    XCTAssertEqual(json.containsCalls, [key])
    XCTAssertTrue(meta.containsCalls.isEmpty)
  }

  func testGetConfigBooleanValuePreferencesWinsOverJsonAndMeta() {
    let preferences = RecordingConfigSource()
    let json = RecordingConfigSource()
    let meta = RecordingConfigSource()
    preferences.containsResult = true
    preferences.booleanResult = true
    json.containsResult = true
    json.booleanResult = false
    meta.containsResult = true
    meta.booleanResult = false

    XCTAssertTrue(
      RNFBSharedUtilsConfig.getConfigBooleanValue(
        forKey: key,
        defaultValue: false,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
    XCTAssertEqual(preferences.getBooleanCalls.count, 1)
    XCTAssertTrue(json.getBooleanCalls.isEmpty)
    XCTAssertTrue(meta.getBooleanCalls.isEmpty)
  }

  func testGetConfigBooleanValueJsonWinsOverMeta() {
    let preferences = RecordingConfigSource()
    let json = RecordingConfigSource()
    let meta = RecordingConfigSource()
    preferences.containsResult = false
    json.containsResult = true
    json.booleanResult = true
    meta.containsResult = true
    meta.booleanResult = false

    XCTAssertTrue(
      RNFBSharedUtilsConfig.getConfigBooleanValue(
        forKey: key,
        defaultValue: false,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
    XCTAssertTrue(preferences.getBooleanCalls.isEmpty)
    XCTAssertEqual(json.getBooleanCalls.count, 1)
    XCTAssertTrue(meta.getBooleanCalls.isEmpty)
  }

  func testGetConfigBooleanValueMetaPathUsesPassedInDefault() {
    let preferences = RecordingConfigSource()
    let json = RecordingConfigSource()
    let meta = RecordingConfigSource()
    preferences.containsResult = false
    json.containsResult = false
    // Meta missing-key path forwards the caller defaultValue.
    meta.echoDefaultValue = true

    XCTAssertTrue(
      RNFBSharedUtilsConfig.getConfigBooleanValue(
        forKey: key,
        defaultValue: true,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
    XCTAssertFalse(
      RNFBSharedUtilsConfig.getConfigBooleanValue(
        forKey: key,
        defaultValue: false,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
    XCTAssertEqual(meta.getBooleanCalls.count, 2)
    XCTAssertEqual(meta.getBooleanCalls[0].defaultValue, true)
    XCTAssertEqual(meta.getBooleanCalls[1].defaultValue, false)
    XCTAssertTrue(preferences.getBooleanCalls.isEmpty)
    XCTAssertTrue(json.getBooleanCalls.isEmpty)
  }

  func testGetConfigBooleanValueMetaPathReturnsSourceValue() {
    let preferences = RecordingConfigSource()
    let json = RecordingConfigSource()
    let meta = RecordingConfigSource()
    preferences.containsResult = false
    json.containsResult = false
    meta.booleanResult = true

    XCTAssertTrue(
      RNFBSharedUtilsConfig.getConfigBooleanValue(
        forKey: key,
        defaultValue: false,
        preferences: preferences,
        json: json,
        meta: meta
      )
    )
    XCTAssertEqual(meta.getBooleanCalls[0].defaultValue, false)
  }
}
