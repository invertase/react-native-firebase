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

final class RNFBNullSentinelDecodingTests: XCTestCase {
  private func decode(_ value: Any?) -> Any? {
    RNFBNullSentinelDecoder.decode(value)
  }

  private func sentinel(_ flag: Any = true) -> NSDictionary {
    ["__rnfbNull": flag] as NSDictionary
  }

  func testNilAndNonContainersPreserveIdentity() {
    XCTAssertNil(decode(nil))

    let number = NSNumber(value: 42)
    let string = "hello" as NSString
    let date = NSDate()
    let null = NSNull()

    XCTAssertTrue(decode(number) as AnyObject === number)
    XCTAssertTrue(decode(string) as AnyObject === string)
    XCTAssertTrue(decode(date) as AnyObject === date)
    XCTAssertTrue(decode(null) as AnyObject === null)
  }

  func testRootSentinelBecomesNSNull() {
    let result = decode(sentinel())
    XCTAssertTrue(result is NSNull)
  }

  func testRootSentinelRequiresExactlyOneKeyAndTruthyFlag() {
    XCTAssertFalse(decode(sentinel(false)) is NSNull)
    XCTAssertEqual(
      decode(sentinel(false)) as? NSDictionary,
      ["__rnfbNull": false] as NSDictionary
    )

    let extraKey = ["__rnfbNull": true, "other": 1] as NSDictionary
    let decodedExtra = decode(extraKey) as! NSDictionary
    XCTAssertEqual(decodedExtra.count, 2)
    XCTAssertEqual(decodedExtra["__rnfbNull"] as? Bool, true)
    XCTAssertEqual(decodedExtra["other"] as? Int, 1)

    let empty = decode(NSDictionary()) as! NSDictionary
    XCTAssertEqual(empty.count, 0)
  }

  func testStringTruthyFlagIsTreatedAsSentinel() {
    XCTAssertTrue(decode(sentinel("YES" as NSString)) is NSNull)
    XCTAssertTrue(decode(sentinel("1" as NSString)) is NSNull)
    XCTAssertFalse(decode(sentinel("0" as NSString)) is NSNull)
  }

  func testNonBoolRespondingFlagIsNotASentinel() {
    let exotic = sentinel(NSDate())
    let decoded = decode(exotic) as! NSDictionary
    XCTAssertEqual(decoded.count, 1)
    XCTAssertTrue(decoded["__rnfbNull"] is NSDate)
  }

  func testNestedDictionarySentinelsBecomeNSNull() {
    let input: NSDictionary = [
      "a": sentinel(),
      "b": "keep",
      "nested": [
        "inner": sentinel(),
        "n": 1,
      ] as NSDictionary,
    ]

    let result = decode(input) as! NSDictionary
    XCTAssertTrue(result["a"] is NSNull)
    XCTAssertEqual(result["b"] as? String, "keep")
    let nested = result["nested"] as! NSDictionary
    XCTAssertTrue(nested["inner"] is NSNull)
    XCTAssertEqual(nested["n"] as? Int, 1)
  }

  func testArrayWalkPreservesNSNullAndReplacesSentinels() {
    let input: NSArray = [
      sentinel(),
      NSNull(),
      "x",
      [sentinel(), 2] as NSArray,
    ]

    let result = decode(input) as! NSArray
    XCTAssertEqual(result.count, 4)
    XCTAssertTrue(result[0] is NSNull)
    XCTAssertTrue(result[1] is NSNull)
    XCTAssertEqual(result[2] as? String, "x")
    let nested = result[3] as! NSArray
    XCTAssertTrue(nested[0] is NSNull)
    XCTAssertEqual(nested[1] as? Int, 2)
  }

  func testContainersReturnNewMutableCopiesEvenWithoutSentinels() {
    let dict = ["k": "v"] as NSDictionary
    let array = ["a", 1] as NSArray

    let decodedDict = decode(dict)
    let decodedArray = decode(array)

    XCTAssertFalse(decodedDict as AnyObject === dict)
    XCTAssertFalse(decodedArray as AnyObject === array)
    XCTAssertTrue(decodedDict is NSMutableDictionary)
    XCTAssertTrue(decodedArray is NSMutableArray)
    XCTAssertEqual(decodedDict as? NSDictionary, dict)
    XCTAssertEqual(decodedArray as? NSArray, array)
  }

  func testDeepNestingDoesNotOverflow() {
    var current: Any = sentinel()
    for _ in 0..<64 {
      current = ["child": current] as NSDictionary
    }

    var cursor = decode(current) as! NSDictionary
    for _ in 0..<63 {
      cursor = cursor["child"] as! NSDictionary
    }
    XCTAssertTrue(cursor["child"] is NSNull)
  }
}
