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
    RNFBNullSentinelDecoder.decodeNullSentinels(value)
  }

  private func sentinel(_ flag: Any = true) -> NSDictionary {
    ["__rnfbNull": flag] as NSDictionary
  }

  private func serverTimestamp() -> NSDictionary {
    [".sv": "timestamp"] as NSDictionary
  }

  func testNilAndNonContainersPreserveIdentity() {
    XCTAssertNil(decode(nil))

    let number = NSNumber(value: 42)
    let string = "hello" as NSString
    let date = NSDate()
    let data = NSData()
    let null = NSNull()

    XCTAssertTrue(decode(number) as AnyObject === number)
    XCTAssertTrue(decode(string) as AnyObject === string)
    XCTAssertTrue(decode(date) as AnyObject === date)
    XCTAssertTrue(decode(data) as AnyObject === data)
    XCTAssertTrue(decode(null) as AnyObject === null)
  }

  func testDecodeAndDecodeNullSentinelsSelectorsAreEquivalent() {
    let input: NSDictionary = ["a": sentinel(), "b": "keep"]
    let viaCanonical = RNFBNullSentinelDecoder.decodeNullSentinels(input) as! NSDictionary
    let viaAlias = RNFBNullSentinelDecoder.decode(input) as! NSDictionary
    XCTAssertEqual(viaCanonical, viaAlias)
    XCTAssertTrue(viaCanonical["a"] is NSNull)
    XCTAssertEqual(viaCanonical["b"] as? String, "keep")
  }

  func testRootSentinelBecomesNSNull() {
    XCTAssertTrue(decode(sentinel()) is NSNull)
    XCTAssertTrue(decode(sentinel(NSNumber(value: 1))) is NSNull)
  }

  func testRootSentinelRequiresExactlyOneKeyAndTruthyFlag() {
    XCTAssertFalse(decode(sentinel(false)) is NSNull)
    XCTAssertEqual(decode(sentinel(false)) as? NSDictionary, ["__rnfbNull": false] as NSDictionary)

    let extraKey = ["__rnfbNull": true, "other": 1] as NSDictionary
    XCTAssertEqual(decode(extraKey) as? NSDictionary, extraKey)

    let empty = decode(NSDictionary()) as! NSDictionary
    XCTAssertEqual(empty.count, 0)
    XCTAssertTrue(empty is NSMutableDictionary)
  }

  func testStringFlagIsNotASentinel() {
    for flag in ["true", "YES", "yes", "1"] as [NSString] {
      let input = sentinel(flag)
      XCTAssertEqual(decode(input) as? NSDictionary, input)
    }
  }

  func testNonBoolRespondingFlagIsNotASentinel() {
    let exotic = sentinel(NSDate())
    let decoded = decode(exotic) as! NSDictionary
    XCTAssertEqual(decoded.count, 1)
    XCTAssertTrue(decoded["__rnfbNull"] is NSDate)
  }

  func testRootSentinelFlagNonNumberUnchangedWithoutCrash() {
    let nullFlag = ["__rnfbNull": NSNull()] as NSDictionary
    let dictFlag = ["__rnfbNull": ["a": 1] as NSDictionary] as NSDictionary
    let arrayFlag = ["__rnfbNull": [1] as NSArray] as NSDictionary

    XCTAssertEqual(decode(nullFlag) as? NSDictionary, nullFlag)
    XCTAssertEqual(decode(dictFlag) as? NSDictionary, dictFlag)
    XCTAssertEqual(decode(arrayFlag) as? NSDictionary, arrayFlag)
  }

  func testRootServerValueUnchanged() {
    let input = serverTimestamp()
    XCTAssertEqual(decode(input) as? NSDictionary, input)
  }

  func testNestedDictionarySentinelsBecomeNSNull() {
    let input: NSDictionary = [
      "a": sentinel(),
      "b": "keep",
      "nested": [
        "inner": sentinel(),
        "n": 1,
        "falseFlag": sentinel(false),
        "empty": NSDictionary(),
      ] as NSDictionary,
    ]

    let result = decode(input) as! NSDictionary
    XCTAssertTrue(result["a"] is NSNull)
    XCTAssertEqual(result["b"] as? String, "keep")
    let nested = result["nested"] as! NSDictionary
    XCTAssertTrue(nested["inner"] is NSNull)
    XCTAssertEqual(nested["n"] as? Int, 1)
    XCTAssertEqual(nested["falseFlag"] as? NSDictionary, ["__rnfbNull": false] as NSDictionary)
    XCTAssertEqual((nested["empty"] as? NSDictionary)?.count, 0)
  }

  func testNestedSentinelWithExtraKeysUnchanged() {
    let input: NSDictionary = ["child": ["__rnfbNull": true, "other": "x"] as NSDictionary]
    XCTAssertEqual(decode(input) as? NSDictionary, input)
  }

  func testNestedSentinelFlagNonNumberUnchanged() {
    let input: NSDictionary = [
      "nullFlag": ["__rnfbNull": NSNull()] as NSDictionary,
      "dictFlag": ["__rnfbNull": ["a": 1] as NSDictionary] as NSDictionary,
      "arrayFlag": ["__rnfbNull": [1] as NSArray] as NSDictionary,
      "stringFlag": ["__rnfbNull": "true"] as NSDictionary,
    ]
    XCTAssertEqual(decode(input) as? NSDictionary, input)

    let arrayInput: NSArray = [
      ["__rnfbNull": NSNull()] as NSDictionary,
      ["__rnfbNull": ["a": 1] as NSDictionary] as NSDictionary,
      ["__rnfbNull": [1] as NSArray] as NSDictionary,
      ["__rnfbNull": "true"] as NSDictionary,
    ]
    XCTAssertEqual(decode(arrayInput) as? NSArray, arrayInput)
  }

  func testValidSentinelSiblingDecodedWhileNonNumberFlagPassesThrough() {
    let input: NSDictionary = [
      "valid": sentinel(),
      "guarded": ["__rnfbNull": NSNull()] as NSDictionary,
      "list": [sentinel(), ["__rnfbNull": [1] as NSArray] as NSDictionary] as NSArray,
    ]
    let result = decode(input) as! NSDictionary
    XCTAssertTrue(result["valid"] is NSNull)
    XCTAssertEqual(result["guarded"] as? NSDictionary, ["__rnfbNull": NSNull()] as NSDictionary)
    let list = result["list"] as! NSArray
    XCTAssertTrue(list[0] is NSNull)
    XCTAssertEqual(list[1] as? NSDictionary, ["__rnfbNull": [1] as NSArray] as NSDictionary)
  }

  func testArrayWalkPreservesNSNullAndReplacesSentinels() {
    let input: NSArray = [
      sentinel(),
      NSNull(),
      "x",
      3,
      serverTimestamp(),
      [sentinel(), 2] as NSArray,
    ]

    let result = decode(input) as! NSArray
    XCTAssertEqual(result.count, 6)
    XCTAssertTrue(result[0] is NSNull)
    XCTAssertTrue(result[1] is NSNull)
    XCTAssertEqual(result[2] as? String, "x")
    XCTAssertEqual(result[3] as? Int, 3)
    XCTAssertEqual(result[4] as? NSDictionary, serverTimestamp())
    let nested = result[5] as! NSArray
    XCTAssertTrue(nested[0] is NSNull)
    XCTAssertEqual(nested[1] as? Int, 2)
    XCTAssertTrue(result is NSMutableArray)
  }

  func testRootEmptyArrayReturnsEmptyMutableArray() {
    let decoded = decode([] as NSArray) as! NSArray
    XCTAssertEqual(decoded.count, 0)
    XCTAssertTrue(decoded is NSMutableArray)
  }

  func testNestedArraysSentinelsDecodedAtEveryLevel() {
    let input: NSArray = [[sentinel(), [sentinel(), "leaf"] as NSArray] as NSArray, [] as NSArray]
    let result = decode(input) as! NSArray
    let first = result[0] as! NSArray
    XCTAssertTrue(first[0] is NSNull)
    XCTAssertTrue((first[1] as! NSArray)[0] is NSNull)
    XCTAssertEqual((first[1] as! NSArray)[1] as? String, "leaf")
    XCTAssertEqual((result[1] as! NSArray).count, 0)
  }

  func testArrayInsideDictionaryAndMixedMatrixDecoded() {
    let input: NSDictionary = [
      "list": [sentinel(), "x", [sentinel()] as NSArray] as NSArray,
      "items": [
        ["id": 1, "note": sentinel()] as NSDictionary,
        ["id": 2, "tags": [sentinel()] as NSArray] as NSDictionary,
      ] as NSArray,
    ]
    let result = decode(input) as! NSDictionary
    let list = result["list"] as! NSArray
    XCTAssertTrue(list[0] is NSNull)
    XCTAssertEqual(list[1] as? String, "x")
    XCTAssertTrue((list[2] as! NSArray)[0] is NSNull)

    let items = result["items"] as! NSArray
    XCTAssertTrue((items[0] as! NSDictionary)["note"] is NSNull)
    XCTAssertTrue(((items[1] as! NSDictionary)["tags"] as! NSArray)[0] is NSNull)
  }

  func testChildAndParentTypeMatrix() {
    let dictInput: NSDictionary = [
      "dictChild": ["k": 1] as NSDictionary,
      "arrayChild": ["leaf", [2] as NSArray, sentinel(), NSNull()] as NSArray,
      "primitiveChild": "text",
      "nullChild": NSNull(),
    ]
    let arrayRoot: NSArray = [
      ["inner": sentinel()] as NSDictionary,
      ["nested"] as NSArray,
      3,
      sentinel(),
      NSNull(),
    ]

    let decodedDict = decode(dictInput) as! NSDictionary
    XCTAssertEqual(decodedDict["dictChild"] as? NSDictionary, ["k": 1] as NSDictionary)
    let arrayChild = decodedDict["arrayChild"] as! NSArray
    XCTAssertEqual(arrayChild[0] as? String, "leaf")
    XCTAssertTrue(arrayChild[2] is NSNull)
    XCTAssertTrue(decodedDict["nullChild"] is NSNull)

    let decodedArray = decode(arrayRoot) as! NSArray
    XCTAssertTrue((decodedArray[0] as! NSDictionary)["inner"] is NSNull)
    XCTAssertTrue(decodedArray[3] is NSNull)
    XCTAssertTrue(decodedArray[4] is NSNull)
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

  func testCountOneNumberFalseIsNotSentinel() {
    let input: NSDictionary = [
      "a": ["__rnfbNull": false] as NSDictionary,
      "b": ["__rnfbNull": NSNumber(value: 0)] as NSDictionary,
    ]
    XCTAssertEqual(decode(input) as? NSDictionary, input)
  }

  func testDeepNestingDoesNotOverflow() {
    let depth = 1000
    var leaf: Any = ["value": sentinel()] as NSDictionary
    for _ in 0..<depth {
      leaf = ["child": leaf] as NSDictionary
    }

    var cursor = decode(leaf) as! NSDictionary
    for _ in 0..<depth {
      XCTAssertTrue(cursor is NSMutableDictionary)
      cursor = cursor["child"] as! NSDictionary
    }
    XCTAssertTrue(cursor["value"] is NSNull)
  }
}
