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

final class RNFBUtilsHelpersTests: XCTestCase {
  func testPathForDirectoryReturnsSearchPathFirstObject() {
    let caches = RNFBUtilsHelpers.path(
      forDirectory: Int32(FileManager.SearchPathDirectory.cachesDirectory.rawValue)
    )
    let expected = NSSearchPathForDirectoriesInDomains(.cachesDirectory, .userDomainMask, true)
      .first
    XCTAssertEqual(caches, expected)
    XCTAssertNotNil(caches)
  }

  func testUtilsConstantsDictionaryIncludesRequiredKeys() {
    let constants = RNFBUtilsHelpers.utilsConstantsDictionary(
      bundlePath: "/App.app",
      appVersion: "1.2.3",
      pathProvider: { directory in "path-\(directory)" },
      temporaryDirectory: "/tmp/rnfb"
    )

    XCTAssertEqual(constants["isRunningInTestLab"] as? Bool, false)
    XCTAssertEqual(constants["MAIN_BUNDLE"] as? String, "/App.app")
    XCTAssertEqual(
      constants["CACHES_DIRECTORY"] as? String,
      "path-\(FileManager.SearchPathDirectory.cachesDirectory.rawValue)"
    )
    XCTAssertEqual(
      constants["DOCUMENT_DIRECTORY"] as? String,
      "path-\(FileManager.SearchPathDirectory.documentDirectory.rawValue)"
    )
    XCTAssertEqual(
      constants["PICTURES_DIRECTORY"] as? String,
      "path-\(FileManager.SearchPathDirectory.picturesDirectory.rawValue)"
    )
    XCTAssertEqual(
      constants["MOVIES_DIRECTORY"] as? String,
      "path-\(FileManager.SearchPathDirectory.moviesDirectory.rawValue)"
    )
    XCTAssertEqual(constants["TEMP_DIRECTORY"] as? String, "/tmp/rnfb")
    XCTAssertEqual(
      constants["LIBRARY_DIRECTORY"] as? String,
      "path-\(FileManager.SearchPathDirectory.libraryDirectory.rawValue)"
    )
    XCTAssertEqual(constants["appVersion"] as? String, "1.2.3")
  }

  func testUtilsConstantsDictionaryOmitsAppVersionWhenMissingEmptyOrNonString() {
    let pathProvider: RNFBUtilsPathProvider = { _ in "/p" }

    let missing = RNFBUtilsHelpers.utilsConstantsDictionary(
      bundlePath: "/b",
      appVersion: nil,
      pathProvider: pathProvider,
      temporaryDirectory: "/t"
    )
    XCTAssertNil(missing["appVersion"])

    let empty = RNFBUtilsHelpers.utilsConstantsDictionary(
      bundlePath: "/b",
      appVersion: "",
      pathProvider: pathProvider,
      temporaryDirectory: "/t"
    )
    XCTAssertNil(empty["appVersion"])

    let nonString = RNFBUtilsHelpers.utilsConstantsDictionary(
      bundlePath: "/b",
      appVersion: NSNumber(value: 42),
      pathProvider: pathProvider,
      temporaryDirectory: "/t"
    )
    XCTAssertNil(nonString["appVersion"])
  }

  func testUtilsConstantsDictionaryDefaultUsesMainBundle() {
    let constants = RNFBUtilsHelpers.utilsConstantsDictionary()
    XCTAssertEqual(constants["MAIN_BUNDLE"] as? String, Bundle.main.bundlePath)
    XCTAssertEqual(constants["isRunningInTestLab"] as? Bool, false)
    XCTAssertNotNil(constants["CACHES_DIRECTORY"])
    XCTAssertNotNil(constants["TEMP_DIRECTORY"])
  }

  func testIsRemoteAssetPrefixChecks() {
    XCTAssertTrue(RNFBUtilsHelpers.isRemoteAsset("assets-library://asset/foo"))
    XCTAssertTrue(RNFBUtilsHelpers.isRemoteAsset("ph://LOCAL-ID"))
    XCTAssertFalse(RNFBUtilsHelpers.isRemoteAsset("file:///tmp/x.jpg"))
    XCTAssertFalse(RNFBUtilsHelpers.isRemoteAsset(""))
    XCTAssertFalse(RNFBUtilsHelpers.isRemoteAsset(nil))
  }

  func testUnusedIsHeicCaseInsensitiveAndNilMessaging() {
    XCTAssertTrue(RNFBUtilsHelpers.unusedIsHeic("photo.heic"))
    XCTAssertTrue(RNFBUtilsHelpers.unusedIsHeic("photo.HEIC"))
    XCTAssertTrue(RNFBUtilsHelpers.unusedIsHeic("photo.Heic"))
    XCTAssertFalse(RNFBUtilsHelpers.unusedIsHeic("photo.jpg"))
    XCTAssertFalse(RNFBUtilsHelpers.unusedIsHeic("heic"))
    // Pre-port ObjC nil messaging → YES
    XCTAssertTrue(RNFBUtilsHelpers.unusedIsHeic(nil))
  }

  func testValueForKeyFromQueryItemsUsesNamePredicateAndFirstObject() {
    let items = [
      URLQueryItem(name: "other", value: "a"),
      URLQueryItem(name: "id", value: "first-id"),
      URLQueryItem(name: "id", value: "second-id"),
    ]

    XCTAssertEqual(
      RNFBUtilsHelpers.value(forKey: "id", fromQueryItems: items),
      "first-id"
    )
    XCTAssertEqual(
      RNFBUtilsHelpers.value(forKey: "other", fromQueryItems: items),
      "a"
    )
    XCTAssertNil(RNFBUtilsHelpers.value(forKey: "missing", fromQueryItems: items))
    XCTAssertNil(RNFBUtilsHelpers.value(forKey: "id", fromQueryItems: nil))
    XCTAssertNil(RNFBUtilsHelpers.value(forKey: "id", fromQueryItems: []))
    XCTAssertNil(
      RNFBUtilsHelpers.value(
        forKey: "id",
        fromQueryItems: [URLQueryItem(name: "id", value: nil)]
      )
    )
  }
}
