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

final class RNFBMetaStorageTests: XCTestCase {
  private func storage(_ plist: [String: Any]) -> RNFBMetaStorage {
    RNFBMetaStorage(infoDictionary: plist)
  }

  func testMissingKeysUseDefaultsAndAreNotContained() {
    let meta = storage([:])

    XCTAssertFalse(meta.contains("missing"))
    XCTAssertTrue(meta.getBooleanValue("missing", defaultValue: true))
    XCTAssertFalse(meta.getBooleanValue("missing", defaultValue: false))
    XCTAssertEqual(meta.getStringValue("missing", defaultValue: "fallback"), "fallback")
    XCTAssertEqual(meta.getAll() as NSDictionary, NSDictionary())
  }

  func testPrefixIsAppliedAndUnprefixedKeysAreIgnored() {
    let meta = storage([
      "rnfirebase_present": "value",
      "other_key": "ignored",
      "rnfirebase": "not-prefixed-enough",
    ])

    XCTAssertTrue(meta.contains("present"))
    XCTAssertFalse(meta.contains("other_key"))
    XCTAssertEqual(meta.getStringValue("present", defaultValue: "fallback"), "value")
    XCTAssertEqual(meta.getStringValue("other_key", defaultValue: "fallback"), "fallback")

    let all = meta.getAll()
    XCTAssertEqual(all as NSDictionary, ["rnfirebase_present": "value"] as NSDictionary)
    XCTAssertNil(all["other_key"])
    XCTAssertNil(all["rnfirebase"])
  }

  func testGetAllReturnsPrefixedKeysUnstripped() {
    let meta = storage([
      "rnfirebase_string": "abc",
      "rnfirebase_boolean_true": true,
      "rnfirebase_boolean_false": false,
      "unrelated": 1,
    ])

    let all = meta.getAll()
    XCTAssertEqual(Set(all.keys), Set([
      "rnfirebase_string",
      "rnfirebase_boolean_true",
      "rnfirebase_boolean_false",
    ]))
    XCTAssertEqual(all["rnfirebase_string"] as? String, "abc")
    XCTAssertEqual(all["rnfirebase_boolean_true"] as? Bool, true)
    XCTAssertEqual(all["rnfirebase_boolean_false"] as? Bool, false)
  }

  func testPresentBooleanFalseAndNumericZeroOverrideDefaultYes() {
    let meta = storage([
      "rnfirebase_boolFalse": false,
      "rnfirebase_numericZero": 0,
      "rnfirebase_boolTrue": true,
      "rnfirebase_numericOne": 1,
      "rnfirebase_boolStringYes": "YES",
      "rnfirebase_boolStringNo": "0",
    ])

    XCTAssertTrue(meta.contains("boolFalse"))
    XCTAssertTrue(meta.contains("numericZero"))
    XCTAssertFalse(meta.getBooleanValue("boolFalse", defaultValue: true))
    XCTAssertFalse(meta.getBooleanValue("numericZero", defaultValue: true))
    XCTAssertTrue(meta.getBooleanValue("boolTrue", defaultValue: false))
    XCTAssertTrue(meta.getBooleanValue("numericOne", defaultValue: false))
    XCTAssertTrue(meta.getBooleanValue("boolStringYes", defaultValue: false))
    XCTAssertFalse(meta.getBooleanValue("boolStringNo", defaultValue: true))
  }

  func testStringLookupPreservesPresentValues() {
    let meta = storage([
      "rnfirebase_string": "abc",
    ])

    XCTAssertEqual(meta.getStringValue("string", defaultValue: "fallback"), "abc")
  }

  func testDefaultInitializerUsesMainBundleInfoDictionary() {
    let production = RNFBMetaStorage()
    let fromBundle = RNFBMetaStorage(infoDictionary: Bundle.main.infoDictionary ?? [:])

    XCTAssertEqual(production.getAll() as NSDictionary, fromBundle.getAll() as NSDictionary)
  }
}
