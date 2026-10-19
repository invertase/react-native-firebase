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

final class RNFBSharedUtilsFormattingTests: XCTestCase {
  func testDefaultAppNameMapsToDisplayName() {
    XCTAssertEqual(
      RNFBSharedUtilsFormatting.getAppJavaScriptName("__FIRAPP_DEFAULT"),
      "[DEFAULT]"
    )
  }

  func testNonDefaultAppNameIsReturnedUnchanged() {
    XCTAssertEqual(
      RNFBSharedUtilsFormatting.getAppJavaScriptName("secondary"),
      "secondary"
    )
    XCTAssertEqual(
      RNFBSharedUtilsFormatting.getAppJavaScriptName("[DEFAULT]"),
      "[DEFAULT]"
    )
    XCTAssertEqual(RNFBSharedUtilsFormatting.getAppJavaScriptName(""), "")
  }

  func testNilAppNameReturnsNil() {
    XCTAssertNil(RNFBSharedUtilsFormatting.getAppJavaScriptName(nil))
  }

  func testISO8601UsesPOSIXUTCAndTrailingZ() {
    var components = DateComponents()
    components.calendar = Calendar(identifier: .gregorian)
    components.timeZone = TimeZone(abbreviation: "UTC")
    components.year = 2020
    components.month = 1
    components.day = 2
    components.hour = 3
    components.minute = 4
    components.second = 5

    let date = components.date!
    XCTAssertEqual(
      RNFBSharedUtilsFormatting.getISO8601String(date),
      "2020-01-02T03:04:05Z"
    )
  }

  func testISO8601FormatsInUTCRegardlessOfLocalOffset() {
    // 2020-01-02 03:04:05 UTC as absolute instant; format must stay UTC/`Z`.
    let date = Date(timeIntervalSince1970: 1_577_934_245)
    XCTAssertEqual(
      RNFBSharedUtilsFormatting.getISO8601String(date),
      "2020-01-02T03:04:05Z"
    )
  }

  func testISO8601OmitsFractionalSeconds() {
    let date = Date(timeIntervalSince1970: 1_577_934_245.789)
    XCTAssertEqual(
      RNFBSharedUtilsFormatting.getISO8601String(date),
      "2020-01-02T03:04:05Z"
    )
  }

  func testNilDateReturnsNil() {
    XCTAssertNil(RNFBSharedUtilsFormatting.getISO8601String(nil))
  }
}
