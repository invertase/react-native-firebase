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

final class RNFBStorageErrorCodeMapperTests: XCTestCase {
  /// `FIRStorageErrorCodeUnknown`
  private let codeUnknown = -13000
  /// `FIRStorageErrorCodeObjectNotFound`
  private let codeObjectNotFound = -13010
  /// `FIRStorageErrorCodeBucketNotFound`
  private let codeBucketNotFound = -13011
  /// `FIRStorageErrorCodeProjectNotFound`
  private let codeProjectNotFound = -13012
  /// `FIRStorageErrorCodeQuotaExceeded`
  private let codeQuotaExceeded = -13013
  /// `FIRStorageErrorCodeUnauthenticated`
  private let codeUnauthenticated = -13020
  /// `FIRStorageErrorCodeUnauthorized`
  private let codeUnauthorized = -13021
  /// `FIRStorageErrorCodeRetryLimitExceeded`
  private let codeRetryLimitExceeded = -13030
  /// `FIRStorageErrorCodeNonMatchingChecksum`
  private let codeNonMatchingChecksum = -13031
  /// `FIRStorageErrorCodeDownloadSizeExceeded`
  private let codeDownloadSizeExceeded = -13032
  /// `FIRStorageErrorCodeCancelled`
  private let codeCancelled = -13040

  private func makeError(code: Int, description: String = "native", userInfo: [String: Any] = [:])
    -> NSError
  {
    var info = userInfo
    if info[NSLocalizedDescriptionKey] == nil {
      info[NSLocalizedDescriptionKey] = description
    }
    return NSError(domain: "FIRStorageErrorDomain", code: code, userInfo: info)
  }

  func testNilErrorReturnsUnknownPair() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(for: nil)
    XCTAssertEqual(result, ["unknown", "An unknown error has occurred."])
  }

  func testObjectNotFound() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeObjectNotFound)
    )
    XCTAssertEqual(result, ["object-not-found", "No object exists at the desired reference."])
  }

  func testBucketNotFound() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeBucketNotFound)
    )
    XCTAssertEqual(
      result,
      ["bucket-not-found", "No bucket is configured for Firebase Storage."]
    )
  }

  func testProjectNotFound() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeProjectNotFound)
    )
    XCTAssertEqual(
      result,
      ["project-not-found", "No project is configured for Firebase Storage."]
    )
  }

  func testQuotaExceeded() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeQuotaExceeded)
    )
    XCTAssertEqual(
      result,
      ["quota-exceeded", "Quota on your Firebase Storage bucket has been exceeded."]
    )
  }

  func testUnauthenticated() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeUnauthenticated)
    )
    XCTAssertEqual(
      result,
      ["unauthenticated", "User is unauthenticated. Authenticate and try again."]
    )
  }

  func testUnauthorized() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeUnauthorized)
    )
    XCTAssertEqual(
      result,
      ["unauthorized", "User is not authorized to perform the desired action."]
    )
  }

  func testRetryLimitExceeded() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeRetryLimitExceeded)
    )
    XCTAssertEqual(
      result,
      [
        "retry-limit-exceeded",
        "The maximum time limit on an operation (upload, download, delete, etc.) has been exceeded.",
      ]
    )
  }

  func testNonMatchingChecksum() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeNonMatchingChecksum)
    )
    XCTAssertEqual(
      result,
      [
        "non-matching-checksum",
        "File on the client does not match the checksum of the file received by the server.",
      ]
    )
  }

  func testDownloadSizeExceeded() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeDownloadSizeExceeded)
    )
    XCTAssertEqual(
      result,
      [
        "download-size-exceeded",
        "Size of the downloaded file exceeds the amount of memory allocated for the download.",
      ]
    )
  }

  func testCancelled() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeCancelled)
    )
    XCTAssertEqual(result, ["cancelled", "User cancelled the operation."])
  }

  func testUnknownWithoutExtras() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: codeUnknown, description: "should be replaced")
    )
    XCTAssertEqual(result, ["unknown", "An unknown error has occurred."])
  }

  func testUnknownPermissionDeniedOverride() {
    let underlying = NSError(
      domain: NSPOSIXErrorDomain,
      code: 1,
      userInfo: [
        NSLocalizedDescriptionKey: "The operation couldn’t be completed. Permission denied",
      ]
    )
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(
        code: codeUnknown,
        userInfo: [NSUnderlyingErrorKey: underlying]
      )
    )
    XCTAssertEqual(
      result,
      [
        "invalid-device-file-path",
        "The specified device file path is invalid or is restricted.",
      ]
    )
  }

  func testUnknownResponseBodyMessage() {
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(
        code: codeUnknown,
        userInfo: ["ResponseBody": "quota soft limit"]
      )
    )
    XCTAssertEqual(
      result,
      ["unknown", "An unknown error has occurred. (underlying reason 'quota soft limit')"]
    )
  }

  func testDefaultKeepsLocalizedDescription() {
    // FIRStorageErrorCodeInvalidArgument (-13050) and any unmapped code
    let result = RNFBStorageErrorCodeMapper.codeAndMessage(
      for: makeError(code: -13050, description: "Invalid argument from SDK")
    )
    XCTAssertEqual(result, ["unknown", "Invalid argument from SDK"])
  }
}
