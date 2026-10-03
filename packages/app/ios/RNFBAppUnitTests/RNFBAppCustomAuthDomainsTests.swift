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

final class RNFBAppCustomAuthDomainsTests: XCTestCase {
  override func tearDown() {
    RNFBAppCustomAuthDomains.resetCustomDomainsForTesting()
    super.tearDown()
  }

  func testGetMissingKeyReturnsNil() {
    XCTAssertNil(RNFBAppCustomAuthDomains.getCustomDomain("missing"))
  }

  func testSetNonNilStoresUnderAppName() {
    RNFBAppCustomAuthDomains.setCustomDomain("auth.example.com", forAppName: "secondary")
    XCTAssertEqual(
      RNFBAppCustomAuthDomains.getCustomDomain("secondary"),
      "auth.example.com"
    )
  }

  func testSetNilRemovesKey() {
    RNFBAppCustomAuthDomains.setCustomDomain("auth.example.com", forAppName: "secondary")
    RNFBAppCustomAuthDomains.setCustomDomain(nil, forAppName: "secondary")
    XCTAssertNil(RNFBAppCustomAuthDomains.getCustomDomain("secondary"))
  }

  func testSetNilWhenDictionaryUnsetIsNoOp() {
    RNFBAppCustomAuthDomains.resetCustomDomainsForTesting()
    RNFBAppCustomAuthDomains.setCustomDomain(nil, forAppName: "never-set")
    XCTAssertNil(RNFBAppCustomAuthDomains.getCustomDomain("never-set"))
  }

  func testLazyInitOnFirstNonNilSet() {
    RNFBAppCustomAuthDomains.resetCustomDomainsForTesting()
    XCTAssertNil(RNFBAppCustomAuthDomains.getCustomDomain("app"))
    RNFBAppCustomAuthDomains.setCustomDomain("first.example.com", forAppName: "app")
    XCTAssertEqual(RNFBAppCustomAuthDomains.getCustomDomain("app"), "first.example.com")
  }

  func testResetClearsAllDomains() {
    RNFBAppCustomAuthDomains.setCustomDomain("a.example.com", forAppName: "a")
    RNFBAppCustomAuthDomains.setCustomDomain("b.example.com", forAppName: "b")
    RNFBAppCustomAuthDomains.resetCustomDomainsForTesting()
    XCTAssertNil(RNFBAppCustomAuthDomains.getCustomDomain("a"))
    XCTAssertNil(RNFBAppCustomAuthDomains.getCustomDomain("b"))
  }

  func testOverwriteExistingKey() {
    RNFBAppCustomAuthDomains.setCustomDomain("old.example.com", forAppName: "app")
    RNFBAppCustomAuthDomains.setCustomDomain("new.example.com", forAppName: "app")
    XCTAssertEqual(RNFBAppCustomAuthDomains.getCustomDomain("app"), "new.example.com")
  }
}
