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

final class RNFBInitializeAppArgumentsTests: XCTestCase {
  private func nullSentinel() -> NSDictionary {
    ["__rnfbNull": true] as NSDictionary
  }

  private func requiredOptions() -> NSDictionary {
    [
      "apiKey": "key",
      "appId": "1:123:ios:abc",
      "messagingSenderId": "123",
      "projectId": "project",
    ] as NSDictionary
  }

  private func optionsByAdding(_ extra: [String: Any]) -> NSDictionary {
    let options = NSMutableDictionary(dictionary: requiredOptions())
    options.addEntries(from: extra)
    return options
  }

  func testOptions_sentinelIosBundleId_isDropped() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["iosBundleId": nullSentinel()])
    )!
    XCTAssertNil(result["iosBundleId"])
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "iosBundleId" })
  }

  func testOptions_sentinelIosClientId_isDropped() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["iosClientId": nullSentinel()])
    )!
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "iosClientId" })
  }

  func testOptions_sentinelAppGroupId_isDropped() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["appGroupId": nullSentinel()])
    )!
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "appGroupId" })
  }

  func testOptions_sentinelAuthDomain_isDropped() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["authDomain": nullSentinel()])
    )!
    XCTAssertNil(result["authDomain"])
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "authDomain" })
  }

  func testOptions_sentinelDatabaseUrlAndStorageBucket_areDropped() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["databaseURL": nullSentinel(), "storageBucket": nullSentinel()])
    )!
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "databaseURL" })
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "storageBucket" })
  }

  func testOptions_plainNSNullOptionalKey_isDropped() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["iosBundleId": NSNull()])
    )!
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "iosBundleId" })
  }

  func testOptions_allOptionalKeysNull_onlyRequiredKeysRemain() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding([
        "databaseURL": nullSentinel(),
        "storageBucket": nullSentinel(),
        "iosBundleId": nullSentinel(),
        "iosClientId": nullSentinel(),
        "appGroupId": nullSentinel(),
        "authDomain": nullSentinel(),
      ])
    )
    XCTAssertEqual(result, requiredOptions())
  }

  func testOptions_realStrings_areUnchanged() {
    let input = optionsByAdding([
      "databaseURL": "https://db.firebaseio.com",
      "storageBucket": "bucket.appspot.com",
      "iosBundleId": "com.example.app",
      "iosClientId": "client-id",
      "appGroupId": "group.com.example",
      "authDomain": "example.firebaseapp.com",
    ])
    XCTAssertEqual(RNFBInitializeAppArguments.normalizedOptions(input), input)
  }

  func testOptions_nullOptionalKeyDoesNotAffectSiblingStrings() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding([
        "iosBundleId": nullSentinel(),
        "iosClientId": "client-id",
        "authDomain": "example.firebaseapp.com",
      ])
    )!
    XCTAssertFalse(result.allKeys.contains { ($0 as? String) == "iosBundleId" })
    XCTAssertEqual(result["iosClientId"] as? String, "client-id")
    XCTAssertEqual(result["authDomain"] as? String, "example.firebaseapp.com")
    XCTAssertEqual(result["apiKey"] as? String, "key")
  }

  func testOptions_nonOptionalKeyWithNull_isLeftAsNSNull() {
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["projectId": nullSentinel()])
    )!
    XCTAssertTrue(result["projectId"] is NSNull)
    XCTAssertEqual(result["apiKey"] as? String, "key")
  }

  func testOptions_oneKeyDictionaryThatIsNotSentinel_isUnchanged() {
    let input = ["apiKey": "key"] as NSDictionary
    XCTAssertEqual(RNFBInitializeAppArguments.normalizedOptions(input), input)
  }

  func testOptions_sentinelLookalikeValueForOptionalKey_isNotDropped() {
    let notSentinel = ["__rnfbNull": false] as NSDictionary
    let result = RNFBInitializeAppArguments.normalizedOptions(
      optionsByAdding(["iosBundleId": notSentinel])
    )!
    XCTAssertEqual(result["iosBundleId"] as? NSDictionary, notSentinel)
  }

  func testOptions_nil_returnsNil() {
    XCTAssertNil(RNFBInitializeAppArguments.normalizedOptions(nil))
  }

  func testOptions_rootSentinel_returnsNil() {
    XCTAssertNil(RNFBInitializeAppArguments.normalizedOptions(nullSentinel()))
  }

  func testOptions_doesNotMutateInput() {
    let input = optionsByAdding(["iosBundleId": nullSentinel()])
    let copy = input.copy() as! NSDictionary
    _ = RNFBInitializeAppArguments.normalizedOptions(input)
    XCTAssertEqual(input, copy)
  }

  func testAppConfig_sentinelName_isDropped_andSentinelDataCollection_becomesNo() {
    let result = RNFBInitializeAppArguments.normalizedAppConfig([
      "name": nullSentinel(),
      "automaticDataCollectionEnabled": nullSentinel(),
    ])!
    XCTAssertEqual(result.count, 1)
    XCTAssertNil(result["name"])
    XCTAssertEqual(result["automaticDataCollectionEnabled"] as? Bool, false)
  }

  func testAppConfig_nsNullDataCollection_becomesNo() {
    let result = RNFBInitializeAppArguments.normalizedAppConfig([
      "automaticDataCollectionEnabled": NSNull(),
    ])!
    XCTAssertEqual(result["automaticDataCollectionEnabled"] as? Bool, false)
  }

  func testAppConfig_omittedDataCollection_staysOmitted() {
    let result = RNFBInitializeAppArguments.normalizedAppConfig(["name": "secondary"])!
    XCTAssertNil(result["automaticDataCollectionEnabled"])
  }

  func testAppConfig_realValues_areUnchanged() {
    let input = ["name": "secondary", "automaticDataCollectionEnabled": true] as NSDictionary
    XCTAssertEqual(RNFBInitializeAppArguments.normalizedAppConfig(input), input)
  }

  func testAppConfig_unknownKeyWithNull_isLeftAsNSNull() {
    let result = RNFBInitializeAppArguments.normalizedAppConfig([
      "name": "secondary",
      "extra": nullSentinel(),
    ])!
    XCTAssertEqual(result["name"] as? String, "secondary")
    XCTAssertTrue(result["extra"] is NSNull)
  }

  func testAppConfig_nil_returnsNil() {
    XCTAssertNil(RNFBInitializeAppArguments.normalizedAppConfig(nil))
  }

  func testAppConfig_rootSentinel_returnsNil() {
    XCTAssertNil(RNFBInitializeAppArguments.normalizedAppConfig(nullSentinel()))
  }

  func testAutoDataCollection_yes_returnsYes() {
    XCTAssertEqual(
      RNFBInitializeAppArguments.automaticDataCollectionEnabled(fromAppConfig: [
        "automaticDataCollectionEnabled": true,
      ]),
      NSNumber(value: true)
    )
  }

  func testAutoDataCollection_explicitNo_returnsNo() {
    let result = RNFBInitializeAppArguments.automaticDataCollectionEnabled(fromAppConfig: [
      "automaticDataCollectionEnabled": false,
    ])
    XCTAssertNotNil(result)
    XCTAssertFalse(result!.boolValue)
  }

  func testAutoDataCollection_absentKey_returnsNil() {
    XCTAssertNil(
      RNFBInitializeAppArguments.automaticDataCollectionEnabled(fromAppConfig: ["name": "secondary"])
    )
  }

  func testAutoDataCollection_nilAppConfig_returnsNil() {
    XCTAssertNil(RNFBInitializeAppArguments.automaticDataCollectionEnabled(fromAppConfig: nil))
  }

  func testAutoDataCollection_NSNull_returnsNil() {
    XCTAssertNil(
      RNFBInitializeAppArguments.automaticDataCollectionEnabled(fromAppConfig: [
        "automaticDataCollectionEnabled": NSNull(),
      ])
    )
  }

  func testAutoDataCollection_sentinelNormalizedUpstream_returnsNo() {
    let normalized = RNFBInitializeAppArguments.normalizedAppConfig([
      "automaticDataCollectionEnabled": nullSentinel(),
    ])
    let result = RNFBInitializeAppArguments.automaticDataCollectionEnabled(fromAppConfig: normalized)
    XCTAssertNotNil(result)
    XCTAssertFalse(result!.boolValue)
  }

  func testAutoDataCollection_nonNumberValue_returnsNil() {
    XCTAssertNil(
      RNFBInitializeAppArguments.automaticDataCollectionEnabled(fromAppConfig: [
        "automaticDataCollectionEnabled": "true",
      ])
    )
  }
}
