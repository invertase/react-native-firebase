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

final class RNFBAppCheckRejectCodeMapperTests: XCTestCase {
  private let domain = "io.invertase.firebase.app-check.test"

  private func error(code: Any?, underlying: Error? = nil) -> NSError {
    var userInfo: [String: Any] = [:]
    if let code {
      userInfo["code"] = code
    }
    if let underlying {
      userInfo[NSUnderlyingErrorKey] = underlying
    }
    return NSError(domain: domain, code: 1, userInfo: userInfo)
  }

  func testRejectCode_nilError_returnsTokenError() {
    XCTAssertEqual(RNFBAppCheckRejectCodeMapper.rejectCode(for: nil), "token-error")
  }

  func testRejectCode_emptyUserInfo_returnsTokenError() {
    let err = NSError(domain: domain, code: 1, userInfo: nil)
    XCTAssertEqual(RNFBAppCheckRejectCodeMapper.rejectCode(for: err), "token-error")
  }

  func testRejectCode_topLevelProviderNotReady() {
    let err = error(code: "provider-not-ready")
    XCTAssertEqual(
      RNFBAppCheckRejectCodeMapper.rejectCode(for: err), "provider-not-ready")
  }

  func testRejectCode_otherStringCode_returnsTokenError() {
    let err = error(code: "token-null")
    XCTAssertEqual(RNFBAppCheckRejectCodeMapper.rejectCode(for: err), "token-error")
  }

  func testRejectCode_nonStringCode_returnsTokenError() {
    let err = error(code: NSNumber(value: 42))
    XCTAssertEqual(RNFBAppCheckRejectCodeMapper.rejectCode(for: err), "token-error")
  }

  func testRejectCode_underlyingProviderNotReady() {
    let inner = error(code: "provider-not-ready")
    let outer = error(code: "wrapped", underlying: inner)
    XCTAssertEqual(
      RNFBAppCheckRejectCodeMapper.rejectCode(for: outer), "provider-not-ready")
  }

  func testRejectCode_deepChain_providerNotReadyInMiddle() {
    let leaf = error(code: "other")
    let middle = error(code: "provider-not-ready", underlying: leaf)
    let outer = error(code: "sdk-wrap", underlying: middle)
    XCTAssertEqual(
      RNFBAppCheckRejectCodeMapper.rejectCode(for: outer), "provider-not-ready")
  }

  func testRejectCode_nonErrorUnderlying_stopsWalk() {
    var userInfo: [String: Any] = ["code": "wrapped"]
    userInfo[NSUnderlyingErrorKey] = "not-an-error"
    let err = NSError(domain: domain, code: 1, userInfo: userInfo)
    XCTAssertEqual(RNFBAppCheckRejectCodeMapper.rejectCode(for: err), "token-error")
  }

  func testRejectCode_underlyingWithoutProviderCode_returnsTokenError() {
    let inner = error(code: "network")
    let outer = error(code: nil, underlying: inner)
    XCTAssertEqual(RNFBAppCheckRejectCodeMapper.rejectCode(for: outer), "token-error")
  }
}
