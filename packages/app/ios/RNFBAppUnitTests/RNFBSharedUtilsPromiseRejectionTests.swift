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

final class RNFBSharedUtilsPromiseRejectionTests: XCTestCase {
  private let expectedDomain = "RNFBErrorDomain"
  private let expectedCode = 666

  func testExceptionPathRejectArgsAndUserInfo() {
    let exception = NSException(
      name: NSExceptionName("SomeException"),
      reason: "boom reason",
      userInfo: nil
    )

    var capturedCode: String?
    var capturedMessage: String?
    var capturedError: NSError?

    RNFBSharedUtilsPromiseRejection.rejectPromise(withException: { code, message, error in
      capturedCode = code
      capturedMessage = message
      capturedError = error as NSError?
    }, exception: exception)

    XCTAssertEqual(capturedCode, "SomeException")
    XCTAssertEqual(capturedMessage, "boom reason")
    XCTAssertEqual(capturedError?.domain, expectedDomain)
    XCTAssertEqual(capturedError?.code, expectedCode)

    let userInfo = capturedError?.userInfo ?? [:]
    XCTAssertEqual(userInfo["fatal"] as? Bool, true)
    XCTAssertEqual(userInfo["code"] as? String, "unknown")
    XCTAssertEqual(userInfo["message"] as? String, "boom reason")
    XCTAssertEqual(userInfo["nativeErrorCode"] as? String, "SomeException")
    XCTAssertEqual(userInfo["nativeErrorMessage"] as? String, "boom reason")
  }

  func testExceptionPathNilReasonOmitsMessageKeys() {
    let exception = NSException(
      name: NSExceptionName("NilReason"),
      reason: nil,
      userInfo: nil
    )

    var capturedMessage: String?
    var capturedError: NSError?

    RNFBSharedUtilsPromiseRejection.rejectPromise(withException: { _, message, error in
      capturedMessage = message
      capturedError = error as NSError?
    }, exception: exception)

    XCTAssertNil(capturedMessage)
    let userInfo = capturedError?.userInfo ?? [:]
    XCTAssertNil(userInfo["message"])
    XCTAssertNil(userInfo["nativeErrorMessage"])
    XCTAssertEqual(userInfo["fatal"] as? Bool, true)
    XCTAssertEqual(userInfo["code"] as? String, "unknown")
    XCTAssertEqual(userInfo["nativeErrorCode"] as? String, "NilReason")
  }

  func testNSErrorPathRejectArgsAndUserInfo() {
    let source = NSError(
      domain: "SourceDomain",
      code: 42,
      userInfo: [NSLocalizedDescriptionKey: "localized fail"]
    )

    var capturedCode: String?
    var capturedMessage: String?
    var capturedError: NSError?

    RNFBSharedUtilsPromiseRejection.rejectPromise(withNSError: { code, message, error in
      capturedCode = code
      capturedMessage = message
      capturedError = error as NSError?
    }, error: source)

    XCTAssertEqual(capturedCode, "unknown")
    XCTAssertEqual(capturedMessage, "localized fail")
    XCTAssertEqual(capturedError?.domain, expectedDomain)
    XCTAssertEqual(capturedError?.code, expectedCode)

    let userInfo = capturedError?.userInfo ?? [:]
    XCTAssertEqual(userInfo["fatal"] as? Bool, false)
    XCTAssertEqual(userInfo["code"] as? String, "unknown")
    XCTAssertEqual(userInfo["message"] as? String, "localized fail")
    XCTAssertEqual(userInfo["nativeErrorCode"] as? NSNumber, NSNumber(value: 42))
    XCTAssertEqual(userInfo["nativeErrorMessage"] as? String, "localized fail")
  }

  func testUserInfoPathRejectArgsAndError() {
    let userInfo: NSMutableDictionary = [
      "code": "auth/invalid",
      "message": "bad creds",
      "extra": "kept",
    ]

    var capturedCode: String?
    var capturedMessage: String?
    var capturedError: NSError?

    RNFBSharedUtilsPromiseRejection.rejectPromise(withUserInfo: { code, message, error in
      capturedCode = code
      capturedMessage = message
      capturedError = error as NSError?
    }, userInfo: userInfo)

    XCTAssertEqual(capturedCode, "auth/invalid")
    XCTAssertEqual(capturedMessage, "bad creds")
    XCTAssertEqual(capturedError?.domain, expectedDomain)
    XCTAssertEqual(capturedError?.code, expectedCode)
    XCTAssertEqual(capturedError?.userInfo["code"] as? String, "auth/invalid")
    XCTAssertEqual(capturedError?.userInfo["message"] as? String, "bad creds")
    XCTAssertEqual(capturedError?.userInfo["extra"] as? String, "kept")
  }
}
