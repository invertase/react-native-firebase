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

final class RNFBMessagingSerializerStorageTests: XCTestCase {
  // MARK: - APNS token

  func testAPNSTokenData_emptyOrOddLength_returnsNil() {
    XCTAssertNil(RNFBMessagingSerializerStorage.apnsTokenData(from: ""))
    XCTAssertNil(RNFBMessagingSerializerStorage.apnsTokenData(from: "abc"))
  }

  func testAPNSTokenData_invalidHex_returnsNil() {
    XCTAssertNil(RNFBMessagingSerializerStorage.apnsTokenData(from: "gg"))
    XCTAssertNil(RNFBMessagingSerializerStorage.apnsTokenData(from: "0g"))
    XCTAssertNil(RNFBMessagingSerializerStorage.apnsTokenData(from: "g0"))
  }

  func testAPNSTokenData_validHex_roundTripsUppercase() {
    let data = RNFBMessagingSerializerStorage.apnsTokenData(from: "a1b2")
    XCTAssertEqual(data, Data([0xA1, 0xB2]))
    XCTAssertEqual(RNFBMessagingSerializerStorage.apnsToken(from: data!), "A1B2")
  }

  func testAPNSTokenData_upperInputLowercased() {
    let data = RNFBMessagingSerializerStorage.apnsTokenData(from: "A1B2")
    XCTAssertEqual(data, Data([0xA1, 0xB2]))
  }

  func testAPNSTokenFromData_empty() {
    XCTAssertEqual(RNFBMessagingSerializerStorage.apnsToken(from: Data()), "")
  }

  // MARK: - remoteMessageUserInfoToDict top-level fields

  func testMessageIdVariants() {
    for key in ["gcm.message_id", "google.message_id", "message_id"] {
      let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([key: "mid-1"])
      XCTAssertEqual(result["messageId"] as? String, "mid-1")
      XCTAssertEqual((result["data"] as? NSDictionary)?.count, 0)
    }
  }

  func testMessageTypeCollapseFromTo() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "message_type": "type-a",
      "collapse_key": "ck",
      "from": "sender",
      "to": "dest",
      "custom": "keep",
    ])
    XCTAssertEqual(result["messageType"] as? String, "type-a")
    XCTAssertEqual(result["collapseKey"] as? String, "ck")
    XCTAssertEqual(result["from"] as? String, "sender")
    XCTAssertEqual(result["to"] as? String, "dest")
    XCTAssertEqual((result["data"] as? NSDictionary)?["custom"] as? String, "keep")
  }

  func testFromAndToGoogleAliases() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "google.c.sender.id": "sid",
      "google.to": "gto",
    ])
    XCTAssertEqual(result["from"] as? String, "sid")
    XCTAssertEqual(result["to"] as? String, "gto")
  }

  func testSkipsApsGcmGooglePrefixesFromData() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["badge": 1],
      "gcm.foo": "x",
      "google.bar": "y",
      "ok": "z",
    ] as NSDictionary)
    let data = result["data"] as? NSDictionary
    XCTAssertEqual(data?["ok"] as? String, "z")
    XCTAssertNil(data?["gcm.foo"])
    XCTAssertNil(data?["google.bar"])
    XCTAssertNil(data?["aps"])
  }

  // MARK: - sentTime

  func testSentTimeStringAndNumber() {
    for timestamp: Any in ["1522880044", NSNumber(value: 1_522_880_044)] {
      let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
        "google.c.a.ts": timestamp,
      ])
      XCTAssertEqual(result["sentTime"] as? NSNumber, NSNumber(value: 1_522_880_044_000))
    }
  }

  func testSentTimeMalformedIgnored() {
    for timestamp: Any in ["", "-1", "1.5", "1522880044invalid", NSNull(), ["x": 1]] {
      let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
        "google.c.a.ts": timestamp,
      ])
      XCTAssertNil(result["sentTime"], "timestamp \(timestamp)")
    }
  }

  func testSentTimeZeroAndOverflowIgnored() {
    let zero = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "google.c.a.ts": "0",
    ])
    XCTAssertNil(zero["sentTime"])

    let overflowSeconds = String(Int64.max / 1000 + 1)
    let overflow = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "google.c.a.ts": overflowSeconds,
    ])
    XCTAssertNil(overflow["sentTime"])
  }

  // MARK: - aps notification mapping

  func testApsCategoryThreadContentMutable() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": [
        "category": "cat",
        "thread-id": "tid",
        "content-available": 1,
        "mutable-content": 1,
      ],
    ])
    XCTAssertEqual(result["category"] as? String, "cat")
    XCTAssertEqual(result["threadId"] as? String, "tid")
    XCTAssertEqual(result["contentAvailable"] as? NSNumber, NSNumber(value: true))
    XCTAssertEqual(result["mutableContent"] as? NSNumber, NSNumber(value: true))
  }

  func testMutableContentNotOneSkipped() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["mutable-content": 0],
    ])
    XCTAssertNil(result["mutableContent"])
  }

  func testBadgeAsString() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["badge": 7],
    ])
    let notification = result["notification"] as? NSDictionary
    let ios = notification?["ios"] as? NSDictionary
    XCTAssertEqual(ios?["badge"] as? String, "7")
  }

  func testAlertStringBecomesTitle() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["alert": "hello"],
    ])
    let notification = result["notification"] as? NSDictionary
    XCTAssertEqual(notification?["title"] as? String, "hello")
    XCTAssertNil(notification?["ios"])
  }

  func testAlertDictionaryFullFields() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": [
        "alert": [
          "title": "t",
          "title-loc-key": "tlk",
          "title-loc-args": ["a"],
          "body": "b",
          "loc-key": "blk",
          "loc-args": ["c"],
          "subtitle": "s",
          "subtitle-loc-key": "slk",
          "subtitle-loc-args": ["d"],
        ],
      ],
    ])
    let notification = result["notification"] as? NSDictionary
    XCTAssertEqual(notification?["title"] as? String, "t")
    XCTAssertEqual(notification?["titleLocKey"] as? String, "tlk")
    XCTAssertEqual(notification?["titleLocArgs"] as? [String], ["a"])
    XCTAssertEqual(notification?["body"] as? String, "b")
    XCTAssertEqual(notification?["bodyLocKey"] as? String, "blk")
    XCTAssertEqual(notification?["bodyLocArgs"] as? [String], ["c"])
    let ios = notification?["ios"] as? NSDictionary
    XCTAssertEqual(ios?["subtitle"] as? String, "s")
    XCTAssertEqual(ios?["subtitleLocKey"] as? String, "slk")
    XCTAssertEqual(ios?["subtitleLocArgs"] as? [String], ["d"])
  }

  func testSoundStringAndDictionary() {
    let stringSound = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["sound": "tone.aiff"],
    ])
    XCTAssertEqual(
      (stringSound["notification"] as? NSDictionary)?["ios"] as? NSDictionary,
      ["sound": "tone.aiff"] as NSDictionary
    )

    let dictSound = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": [
        "sound": [
          "name": "critical.caf",
          "critical": 1,
          "volume": 0.8,
        ],
      ],
    ])
    let sound =
      ((dictSound["notification"] as? NSDictionary)?["ios"] as? NSDictionary)?["sound"]
      as? NSDictionary
    XCTAssertEqual(sound?["name"] as? String, "critical.caf")
    XCTAssertEqual(sound?["critical"] as? NSNumber, NSNumber(value: true))
    XCTAssertEqual(sound?["volume"] as? NSNumber, NSNumber(value: 0.8))
  }

  func testContentAvailableBoolFromString() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["content-available": "YES"],
    ])
    XCTAssertEqual(result["contentAvailable"] as? NSNumber, NSNumber(value: true))
  }

  func testContentAvailableNonConvertibleIsFalse() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["content-available": ["nope"]],
    ])
    XCTAssertEqual(result["contentAvailable"] as? NSNumber, NSNumber(value: false))
  }

  func testMutableContentStringOne() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["mutable-content": "1"],
    ])
    XCTAssertEqual(result["mutableContent"] as? NSNumber, NSNumber(value: true))
  }

  func testMutableContentNonNumericSkipped() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["mutable-content": ["x"]],
    ])
    XCTAssertNil(result["mutableContent"])
  }

  func testEmptyUserInfoHasEmptyDataOnly() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([:])
    XCTAssertEqual((result["data"] as? NSDictionary)?.count, 0)
    XCTAssertNil(result["notification"])
    XCTAssertEqual(result.count, 1)
  }

  func testAlertNeitherStringNorDictIgnored() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["alert": 123],
    ])
    XCTAssertNil(result["notification"])
  }

  func testSoundNeitherStringNorDictIgnored() {
    let result = RNFBMessagingSerializerStorage.remoteMessageUserInfoToDict([
      "aps": ["sound": 123],
    ])
    XCTAssertNil(result["notification"])
  }
}
