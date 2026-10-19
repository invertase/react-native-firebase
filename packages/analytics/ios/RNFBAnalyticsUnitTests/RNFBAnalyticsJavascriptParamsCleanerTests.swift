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

final class RNFBAnalyticsJavascriptParamsCleanerTests: XCTestCase {
  // MARK: - convertNSNullToNil

  func testConvertNSNullToNil_nsNull_returnsNil() {
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.convertNSNullToNil(NSNull()))
  }

  func testConvertNSNullToNil_nil_returnsNil() {
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.convertNSNullToNil(nil))
  }

  func testConvertNSNullToNil_string_returnsString() {
    XCTAssertEqual(RNFBAnalyticsJavascriptParamsCleaner.convertNSNullToNil("user-1"), "user-1")
  }

  // MARK: - dataFromSHA256HexString

  func testDataFromSHA256HexString_nilOrWrongLength_returnsNil() {
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(nil))
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(""))
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(String(repeating: "a", count: 63)))
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(String(repeating: "a", count: 65)))
  }

  func testDataFromSHA256HexString_invalidHex_returnsNil() {
    let bad = String(repeating: "g", count: 64)
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(bad))

    var almost = String(repeating: "a", count: 64)
    let idx = almost.index(almost.startIndex, offsetBy: 10)
    almost.replaceSubrange(idx...idx, with: "z")
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(almost))
  }

  func testDataFromSHA256HexString_validLowerAndUpper_parses32Bytes() {
    let lower = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    let upper = "0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    let lowerData = RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(lower)
    let upperData = RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(upper)
    XCTAssertEqual(lowerData?.count, 32)
    XCTAssertEqual(upperData, lowerData)
    XCTAssertEqual(lowerData?[0], 0x01)
    XCTAssertEqual(lowerData?[1], 0x23)
    XCTAssertEqual(lowerData?[8], 0x01)
  }

  func testDataFromSHA256HexString_mixedCaseValid() {
    let mixed = "aA0FbB1CcC2DdD3EeE4FfF5678901234567890abcdefABCDEF0123456789abcd"
    XCTAssertEqual(mixed.count, 64)
    let data = RNFBAnalyticsJavascriptParamsCleaner.dataFromSHA256HexString(mixed)
    XCTAssertEqual(data?.count, 32)
    XCTAssertEqual(data?[0], 0xAA)
    XCTAssertEqual(data?[1], 0x0F)
  }

  // MARK: - longNumericParameterKeys

  func testLongNumericParameterKeys_matchFirebaseConstants() {
    XCTAssertEqual(
      RNFBAnalyticsJavascriptParamsCleaner.longNumericParameterKeys,
      [
        "quantity",
        "index",
        "level",
        "number_of_nights",
        "number_of_passengers",
        "number_of_rooms",
        "score",
      ])
  }

  // MARK: - cleanJavascriptParams

  func testCleanJavascriptParams_nil_returnsNil() {
    XCTAssertNil(RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams(nil))
  }

  func testCleanJavascriptParams_empty_returnsEmpty() {
    let result = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([:])
    XCTAssertEqual(result?.count, 0)
  }

  func testCleanJavascriptParams_coercesLongNumericKeys() {
    let result = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "quantity": 1.7,
      "index": "3",
      "level": NSNumber(value: 4.2),
      "number_of_nights": 2.9,
      "number_of_passengers": "11",
      "number_of_rooms": 1.1,
      "score": "4200",
      "other": 9.5,
    ] as NSDictionary)!

    XCTAssertEqual(result["quantity"] as? Int, 1)
    XCTAssertEqual(result["index"] as? Int, 3)
    XCTAssertEqual(result["level"] as? Int, 4)
    XCTAssertEqual(result["number_of_nights"] as? Int, 2)
    XCTAssertEqual(result["number_of_passengers"] as? Int, 11)
    XCTAssertEqual(result["number_of_rooms"] as? Int, 1)
    XCTAssertEqual(result["score"] as? Int, 4200)
    XCTAssertEqual(result["other"] as? Double, 9.5)
  }

  func testCleanJavascriptParams_skipsNilAndNSNullLongNumeric() {
    let result = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "quantity": NSNull(),
      "index": 2,
    ] as NSDictionary)!
    XCTAssertTrue(result["quantity"] is NSNull)
    XCTAssertEqual(result["index"] as? Int, 2)
  }

  func testCleanJavascriptParams_coercesItemsNestedLongNumeric() {
    let result = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "items": [
        ["quantity": 2.8, "item_id": "sku"],
        ["index": "5"],
      ],
      "quantity": 1.2,
    ] as NSDictionary)!

    let items = result["items"] as! [NSDictionary]
    XCTAssertEqual(items[0]["quantity"] as? Int, 2)
    XCTAssertEqual(items[0]["item_id"] as? String, "sku")
    XCTAssertEqual(items[1]["index"] as? Int, 5)
    XCTAssertEqual(result["quantity"] as? Int, 1)
  }

  func testCleanJavascriptParams_successStringTrueYesOne() {
    for raw in ["true", "TRUE", "yes", "YES", "1"] {
      let result = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
        "success": raw,
      ] as NSDictionary)!
      XCTAssertEqual(result["success"] as? Int, 1, "raw=\(raw)")
    }
  }

  func testCleanJavascriptParams_successStringOther_isZero() {
    let result = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "success": "nope",
    ] as NSDictionary)!
    XCTAssertEqual(result["success"] as? Int, 0)
  }

  func testCleanJavascriptParams_successBoolNumber() {
    let yes = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "success": true,
    ] as NSDictionary)!
    let no = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "success": false,
    ] as NSDictionary)!
    XCTAssertEqual(yes["success"] as? Int, 1)
    XCTAssertEqual(no["success"] as? Int, 0)
  }

  func testCleanJavascriptParams_successNilOrNSNull_unchanged() {
    let missing = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "foo": "bar",
    ] as NSDictionary)!
    XCTAssertNil(missing["success"])

    let nullSuccess = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "success": NSNull(),
    ] as NSDictionary)!
    XCTAssertTrue(nullSuccess["success"] is NSNull)
  }

  func testCleanJavascriptParams_extendSessionOne_becomesYes() {
    let result = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "extend_session": 1,
    ] as NSDictionary)!
    XCTAssertEqual(result["extend_session"] as? Bool, true)
  }

  func testCleanJavascriptParams_extendSessionOther_unchanged() {
    let zero = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "extend_session": 0,
    ] as NSDictionary)!
    XCTAssertEqual(zero["extend_session"] as? Int, 0)

    let two = RNFBAnalyticsJavascriptParamsCleaner.cleanJavascriptParams([
      "extend_session": 2,
    ] as NSDictionary)!
    XCTAssertEqual(two["extend_session"] as? Int, 2)
  }
}
