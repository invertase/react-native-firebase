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

private final class StubFIRAppToken: NSObject {
  let label: String
  init(label: String) {
    self.label = label
  }
}

private final class StubFIRAppRegistry: NSObject, RNFBFIRAppLookingUp {
  var defaultAppValue: AnyObject?
  var namedApps: [String: AnyObject] = [:]
  var lastNamedLookup: String?

  func defaultApp() -> AnyObject? {
    defaultAppValue
  }

  func appNamed(_ name: String) -> AnyObject? {
    lastNamedLookup = name
    return namedApps[name]
  }
}

final class RCTConvertFIRAppTests: XCTestCase {
  func testDefaultDisplayNameReturnsDefaultApp() {
    let registry = StubFIRAppRegistry()
    let defaultApp = StubFIRAppToken(label: "default")
    registry.defaultAppValue = defaultApp
    registry.namedApps["[DEFAULT]"] = StubFIRAppToken(label: "should-not-use")

    let result = RCTConvertFIRApp.firApp(fromString: "[DEFAULT]", registry: registry)

    XCTAssertTrue(result === defaultApp)
    XCTAssertNil(registry.lastNamedLookup)
  }

  func testNamedAppUsesAppNamed() {
    let registry = StubFIRAppRegistry()
    let named = StubFIRAppToken(label: "secondary")
    registry.namedApps["secondary"] = named
    registry.defaultAppValue = StubFIRAppToken(label: "default")

    let result = RCTConvertFIRApp.firApp(fromString: "secondary", registry: registry)

    XCTAssertTrue(result === named)
    XCTAssertEqual(registry.lastNamedLookup, "secondary")
  }

  func testMissingNamedAppReturnsNil() {
    let registry = StubFIRAppRegistry()
    let result = RCTConvertFIRApp.firApp(fromString: "missing", registry: registry)
    XCTAssertNil(result)
    XCTAssertEqual(registry.lastNamedLookup, "missing")
  }
}
