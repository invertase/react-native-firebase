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

final class RNFBFunctionsNativeErrorMappingTests: XCTestCase {
  /// FirebaseAuth's public `FIRAuthErrorDomain` value.
  private static let authDomain = "FIRAuthErrorDomain"

  func testCode_mapsTransportAndAuthErrors() {
    let cases: [(domain: String, code: Int, expected: String?)] = [
      (NSURLErrorDomain, NSURLErrorCannotConnectToHost, "UNAVAILABLE"),
      (NSURLErrorDomain, NSURLErrorCancelled, "UNAVAILABLE"),
      (Self.authDomain, 17020, "UNAVAILABLE"),
      (Self.authDomain, 17005, "UNAUTHENTICATED"),
      (Self.authDomain, 17011, "UNAUTHENTICATED"),
      (Self.authDomain, 17017, "UNAUTHENTICATED"),
      (Self.authDomain, 17021, "UNAUTHENTICATED"),
      (Self.authDomain, 17010, nil),
      ("com.example", NSURLErrorCannotConnectToHost, nil),
      ("com.example", 17020, nil),
    ]

    for (domain, code, expected) in cases {
      let error = NSError(domain: domain, code: code)
      XCTAssertEqual(
        RNFBFunctionsNativeErrorMapping.code(for: error), expected, "\(domain) \(code)")
    }
  }

  func testDetails_carriesNativeDomainAndCodeForTransportAndAuthErrors() {
    let cases: [(domain: String, code: Int)] = [
      (NSURLErrorDomain, NSURLErrorCannotConnectToHost),
      (Self.authDomain, 17020),
      (Self.authDomain, 17010),
    ]

    for (domain, code) in cases {
      let details = RNFBFunctionsNativeErrorMapping.details(for: NSError(domain: domain, code: code))
      XCTAssertEqual(details?.count, 2, "\(domain) \(code)")
      XCTAssertEqual(details?["domain"] as? String, domain)
      XCTAssertEqual(details?["nativeCode"] as? Int, code)
    }
  }

  func testDetails_otherDomain_isNil() {
    XCTAssertNil(RNFBFunctionsNativeErrorMapping.details(for: NSError(domain: "com.example", code: 1)))
  }

  /// `stream()` wraps an Auth ID token failure as `invalidArgument` (3) and a transport failure
  /// as `unavailable` (14), each under `NSUnderlyingErrorKey`.
  func testReportedError_unwrapsStreamPreResponseFailures() {
    let auth = NSError(domain: Self.authDomain, code: 17021)
    let transport = NSError(domain: NSURLErrorDomain, code: NSURLErrorCannotConnectToHost)

    for (wrapperCode, underlying) in [(3, auth), (14, transport)] {
      let wrapped = Self.functionsError(code: wrapperCode, underlying: underlying)
      XCTAssertIdentical(
        RNFBFunctionsNativeErrorMapping.reportedError(for: wrapped), underlying, "\(wrapperCode)")
    }
  }

  func testReportedError_keepsOtherErrors() {
    let auth = NSError(domain: Self.authDomain, code: 17021)
    let cases: [NSError] = [
      // Mid-stream failures are wrapped as dataLoss (15) and keep their own code.
      Self.functionsError(code: 15, underlying: auth),
      // An unmapped Auth error (17010, tooManyRequests) keeps the wrapper's invalidArgument.
      Self.functionsError(code: 3, underlying: NSError(domain: Self.authDomain, code: 17010)),
      Self.functionsError(code: 3, underlying: NSError(domain: "com.example", code: 1)),
      Self.functionsError(code: 3, underlying: nil),
      NSError(domain: "com.example", code: 3, userInfo: [NSUnderlyingErrorKey: auth]),
      auth,
    ]

    for error in cases {
      XCTAssertIdentical(
        RNFBFunctionsNativeErrorMapping.reportedError(for: error), error, "\(error)")
    }
  }

  private static func functionsError(code: Int, underlying: NSError?) -> NSError {
    NSError(
      domain: "com.firebase.functions",
      code: code,
      userInfo: underlying.map { [NSUnderlyingErrorKey: $0] } ?? [:])
  }
}
