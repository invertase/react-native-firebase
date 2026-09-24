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

final class RNFBRemoteConfigEnumMapperTests: XCTestCase {
  // MARK: - FIRRemoteConfigFetchStatus raw values

  /// `FIRRemoteConfigFetchStatusNoFetchYet`
  private let fetchStatusNoFetchYet = 0
  /// `FIRRemoteConfigFetchStatusSuccess`
  private let fetchStatusSuccess = 1
  /// `FIRRemoteConfigFetchStatusFailure`
  private let fetchStatusFailure = 2
  /// `FIRRemoteConfigFetchStatusThrottled`
  private let fetchStatusThrottled = 3

  // MARK: - FIRRemoteConfigSource raw values

  /// `FIRRemoteConfigSourceRemote`
  private let sourceRemote = 0
  /// `FIRRemoteConfigSourceDefault`
  private let sourceDefault = 1
  /// `FIRRemoteConfigSourceStatic`
  private let sourceStatic = 2

  // MARK: - FIRRemoteConfigUpdateError raw values

  /// `FIRRemoteConfigUpdateErrorStreamError`
  private let updateErrorStreamError = 8001
  /// `FIRRemoteConfigUpdateErrorNotFetched`
  private let updateErrorNotFetched = 8002
  /// `FIRRemoteConfigUpdateErrorMessageInvalid`
  private let updateErrorMessageInvalid = 8003
  /// `FIRRemoteConfigUpdateErrorUnavailable`
  private let updateErrorUnavailable = 8004

  private let throttledDescription =
    "fetch() operation cannot be completed successfully, due to throttling."
  private let defaultFetchFailureDescription =
    "fetch() operation cannot be completed successfully."

  // MARK: - string(forFetchStatus:)

  func testFetchStatusKnownBranches() {
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forFetchStatus: fetchStatusNoFetchYet),
      "no_fetch_yet"
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forFetchStatus: fetchStatusSuccess),
      "success"
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forFetchStatus: fetchStatusThrottled),
      "throttled"
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forFetchStatus: fetchStatusFailure),
      "failure"
    )
  }

  func testFetchStatusUnknownDefaultsToUnknown() {
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forFetchStatus: -1), "unknown")
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forFetchStatus: 99), "unknown")
  }

  // MARK: - description(forFetchStatus:)

  func testFetchStatusDescriptionThrottled() {
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.description(forFetchStatus: fetchStatusThrottled),
      throttledDescription
    )
  }

  func testFetchStatusDescriptionDefaultBranches() {
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.description(forFetchStatus: fetchStatusNoFetchYet),
      defaultFetchFailureDescription
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.description(forFetchStatus: fetchStatusSuccess),
      defaultFetchFailureDescription
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.description(forFetchStatus: fetchStatusFailure),
      defaultFetchFailureDescription
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.description(forFetchStatus: -1),
      defaultFetchFailureDescription
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.description(forFetchStatus: 99),
      defaultFetchFailureDescription
    )
  }

  // MARK: - string(forSource:)

  func testSourceKnownBranches() {
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forSource: sourceDefault), "default")
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forSource: sourceRemote), "remote")
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forSource: sourceStatic), "static")
  }

  func testSourceUnknownDefaultsToUnknown() {
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forSource: -1), "unknown")
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forSource: 99), "unknown")
  }

  // MARK: - string(forUpdateError:)

  func testUpdateErrorKnownBranches() {
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forUpdateError: updateErrorStreamError),
      "config_update_stream_error"
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forUpdateError: updateErrorMessageInvalid),
      "config_update_message_invalid"
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forUpdateError: updateErrorNotFetched),
      "config_update_not_fetched"
    )
    XCTAssertEqual(
      RNFBRemoteConfigEnumMapper.string(forUpdateError: updateErrorUnavailable),
      "config_update_unavailable"
    )
  }

  func testUpdateErrorUnknownDefaultsToInternal() {
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forUpdateError: 0), "internal")
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forUpdateError: 8000), "internal")
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forUpdateError: 9999), "internal")
    XCTAssertEqual(RNFBRemoteConfigEnumMapper.string(forUpdateError: -1), "internal")
  }
}
