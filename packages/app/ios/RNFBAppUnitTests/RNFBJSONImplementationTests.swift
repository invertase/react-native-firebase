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

final class RNFBJSONImplementationTests: XCTestCase {
  private func base64(_ object: Any) throws -> String {
    try JSONSerialization.data(withJSONObject: object).base64EncodedString()
  }

  func testNilInvalidBase64AndInvalidJSONProduceEmptyDictionaries() {
    let implementations = [
      RNFBJSONImplementation(rawValue: nil),
      RNFBJSONImplementation(rawValue: "not base64"),
      RNFBJSONImplementation(rawValue: Data("{".utf8).base64EncodedString()),
    ]

    for implementation in implementations {
      XCTAssertFalse(implementation.contains("missing"))
      XCTAssertEqual(
        implementation.value(forKey: "missing", defaultValue: "fallback" as NSString) as? String,
        "fallback"
      )
      XCTAssertEqual(implementation.jsonObject() as? NSDictionary, NSDictionary())
    }
  }

  func testValidObjectPreservesFoundationValuesAndDefaultsOnlyForNilLookup() throws {
    let implementation = RNFBJSONImplementation(rawValue: try base64([
      "boolean": true,
      "number": 3,
      "string": "value",
      "array": ["one", 2],
      "object": ["nested": "value"],
      "null": NSNull(),
    ]))

    XCTAssertTrue(implementation.contains("boolean"))
    XCTAssertTrue(implementation.contains("null"))
    XCTAssertFalse(implementation.contains("missing"))
    XCTAssertEqual(
      implementation.value(forKey: "missing", defaultValue: "fallback" as NSString) as? String,
      "fallback"
    )
    XCTAssertTrue(implementation.value(
      forKey: "null",
      defaultValue: "fallback" as NSString
    ) is NSNull)

    let parsed = implementation.jsonObject() as! NSDictionary
    XCTAssertEqual(parsed["boolean"] as? Bool, true)
    XCTAssertEqual(parsed["number"] as? Int, 3)
    XCTAssertEqual(parsed["string"] as? String, "value")
    XCTAssertEqual(parsed["array"] as? NSArray, ["one", 2] as NSArray)
    XCTAssertEqual(parsed["object"] as? NSDictionary, ["nested": "value"] as NSDictionary)
  }

  func testLookupMatchesNSDictionaryKVCForSpecialKeys() {
    let dictionary: NSDictionary = [
      "count": "count value",
      "@count": "at-count value",
      "description": "description value",
    ]
    let implementation = RNFBJSONImplementation(jsonObject: dictionary)

    for key in ["count", "@count", "description"] {
      XCTAssertEqual(
        implementation.value(forKey: key, defaultValue: nil) as? NSObject,
        dictionary.value(forKey: key) as? NSObject
      )
      XCTAssertEqual(implementation.contains(key), dictionary.value(forKey: key) != nil)
    }
  }

  func testValidTopLevelArrayIsPreserved() throws {
    let implementation = RNFBJSONImplementation(rawValue: try base64(["one", 2]))

    XCTAssertEqual(implementation.jsonObject() as? NSArray, ["one", 2] as NSArray)
  }

  func testParsingIsAnInitializationSnapshot() throws {
    let first = RNFBJSONImplementation(rawValue: try base64(["value": "first"]))
    let second = RNFBJSONImplementation(rawValue: try base64(["value": "second"]))

    XCTAssertEqual(first.value(forKey: "value", defaultValue: nil) as? String, "first")
    XCTAssertEqual(second.value(forKey: "value", defaultValue: nil) as? String, "second")
  }

  func testRawJSONPreservesLegacyDecodeBehavior() {
    XCTAssertEqual(RNFBJSONImplementation.rawJSON(from: nil), "{}")
    XCTAssertNil(RNFBJSONImplementation.rawJSON(from: "not base64"))

    let invalidJSON = "not JSON"
    XCTAssertEqual(
      RNFBJSONImplementation.rawJSON(
        from: Data(invalidJSON.utf8).base64EncodedString()
      ),
      invalidJSON
    )

    let invalidUTF8 = Data([0xff, 0xfe]).base64EncodedString()
    XCTAssertNil(RNFBJSONImplementation.rawJSON(from: invalidUTF8))

    let validJSON = #"{"value":true}"#
    XCTAssertEqual(
      RNFBJSONImplementation.rawJSON(
        from: Data(validJSON.utf8).base64EncodedString()
      ),
      validJSON
    )
  }
}
