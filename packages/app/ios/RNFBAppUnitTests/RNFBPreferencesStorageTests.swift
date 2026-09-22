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

final class RNFBPreferencesStorageTests: XCTestCase {
  private var domainIdentifier: String!
  private var userDefaults: UserDefaults!
  private var storage: RNFBPreferencesStorage!

  override func setUp() {
    super.setUp()
    domainIdentifier = "io.invertase.firebase.tests.\(UUID().uuidString)"
    userDefaults = UserDefaults(suiteName: domainIdentifier)
    userDefaults.removePersistentDomain(forName: domainIdentifier)
    storage = RNFBPreferencesStorage(
      userDefaults: userDefaults,
      domainIdentifier: domainIdentifier
    )
  }

  override func tearDown() {
    userDefaults.removePersistentDomain(forName: domainIdentifier)
    storage = nil
    userDefaults = nil
    domainIdentifier = nil
    super.tearDown()
  }

  func testMissingKeysUseDefaultsAndAreNotContained() {
    XCTAssertFalse(storage.contains("missing"))
    XCTAssertTrue(storage.getBooleanValue("missing", defaultValue: true))
    XCTAssertEqual(storage.getIntegerValue("missing", defaultValue: Int.max), Int.max)
    XCTAssertEqual(storage.getStringValue("missing", defaultValue: "fallback"), "fallback")
  }

  func testSettersAndGettersPreserveValuesAndDictionaryRepresentation() {
    storage.setBooleanValue("bool", boolValue: true)
    storage.setIntegerValue("integer", integerValue: Int.max)
    storage.setStringValue("string", stringValue: "value")

    XCTAssertTrue(storage.contains("bool"))
    XCTAssertTrue(storage.getBooleanValue("bool", defaultValue: false))
    XCTAssertEqual(storage.getIntegerValue("integer", defaultValue: 0), Int.max)
    XCTAssertEqual(storage.getStringValue("string", defaultValue: "fallback"), "value")

    let all = storage.getAll()
    XCTAssertEqual(all["bool"] as? Bool, true)
    XCTAssertEqual(all["integer"] as? Int, Int.max)
    XCTAssertEqual(all["string"] as? String, "value")
  }

  func testStringForPresentNonStringValueMatchesNSUserDefaults() {
    userDefaults.set(["value"], forKey: "notString")

    XCTAssertTrue(storage.contains("notString"))
    XCTAssertNil(storage.getStringValue("notString", defaultValue: "fallback"))
  }

  func testRemoveAndClearAllUseTheConfiguredPersistentDomain() {
    storage.setStringValue("first", stringValue: "one")
    storage.setStringValue("second", stringValue: "two")

    storage.remove("first")
    XCTAssertFalse(storage.contains("first"))
    XCTAssertTrue(storage.contains("second"))

    storage.clearAll()
    XCTAssertFalse(storage.contains("second"))
    let clearedDomain = userDefaults.persistentDomain(forName: domainIdentifier)
    XCTAssertTrue(
      clearedDomain == nil || clearedDomain?.isEmpty == true,
      "clearAll must leave the persistent domain nil or empty; got \(String(describing: clearedDomain))"
    )
  }

  func testDefaultInitializerUsesRNFBPreferencesSuite() {
    let suiteName = "io.invertase.firebase"
    let productionDefaults = UserDefaults(suiteName: suiteName)!
    let key = "RNFBPreferencesStorageTests.\(UUID().uuidString)"
    productionDefaults.removeObject(forKey: key)
    defer {
      productionDefaults.removeObject(forKey: key)
    }

    let productionStorage = RNFBPreferencesStorage()
    productionStorage.setStringValue(key, stringValue: "suite-value")

    XCTAssertEqual(productionDefaults.string(forKey: key), "suite-value")
  }
}
