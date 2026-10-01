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

private final class StubFIRAppLifecycle: NSObject, RNFBFIRAppLifecycle {
  var defaultAppValue: AnyObject?
  var namedApps: [String: AnyObject] = [:]
  var allAppsValue: [AnyHashable: Any]?
  var lastConfigureOptions: AnyObject?
  var lastConfigureName: String?
  var configureDefaultCalled = false

  func defaultApp() -> AnyObject? {
    defaultAppValue
  }

  func appNamed(_ name: String) -> AnyObject? {
    namedApps[name]
  }

  func allApps() -> [AnyHashable: Any]? {
    allAppsValue
  }

  func configure(withOptions options: AnyObject) {
    configureDefaultCalled = true
    lastConfigureOptions = options
    let app = StubFIRAppToken(label: "configured-default")
    defaultAppValue = app
  }

  func configure(withName name: String, options: AnyObject) {
    lastConfigureName = name
    lastConfigureOptions = options
    let app = StubFIRAppToken(label: "configured-\(name)")
    namedApps[name] = app
  }
}

private final class StubFIRLibraryRegistrar: NSObject, RNFBFIRLibraryRegistering {
  var names: [String] = []
  var versions: [String] = []

  func registerLibrary(_ name: String, withVersion version: String) {
    names.append(name)
    versions.append(version)
  }
}

private final class StubFIRLoggerConfiguration: NSObject, RNFBFIRLoggerConfiguring {
  var levels: [Int] = []

  func setLoggerLevel(_ level: Int) {
    levels.append(level)
  }
}

private final class StubFIRAppMutating: NSObject, RNFBFIRAppMutating {
  var dataCollectionEnabled: Bool?
  var deleteResults: [Bool]
  var deleteCallCount = 0

  init(deleteResults: [Bool] = [true]) {
    self.deleteResults = deleteResults
  }

  func setDataCollectionDefaultEnabled(_ enabled: Bool) {
    dataCollectionEnabled = enabled
  }

  func deleteApp(_ completion: @escaping (Bool) -> Void) {
    let index = min(deleteCallCount, deleteResults.count - 1)
    let result = deleteResults[index]
    deleteCallCount += 1
    completion(result)
  }
}

final class RNFBAppModuleFirebaseTests: XCTestCase {
  override func tearDown() {
    RNFBAppModuleFirebase.resetRegisterLibraryOnceForTesting()
    RNFBAppCustomAuthDomains.resetCustomDomainsForTesting()
    super.tearDown()
  }

  func testAllAppsReturnsValuesWhenPresent() {
    let lifecycle = StubFIRAppLifecycle()
    let appA = StubFIRAppToken(label: "a")
    let appB = StubFIRAppToken(label: "b")
    lifecycle.allAppsValue = ["a": appA, "b": appB]

    let result = RNFBAppModuleFirebase.allApps(lifecycle: lifecycle)

    XCTAssertEqual(result.count, 2)
    XCTAssertTrue(result.contains { $0 === appA })
    XCTAssertTrue(result.contains { $0 === appB })
  }

  func testAllAppsReturnsEmptyWhenNil() {
    let lifecycle = StubFIRAppLifecycle()
    XCTAssertEqual(RNFBAppModuleFirebase.allApps(lifecycle: lifecycle).count, 0)
  }

  func testConfigureOrReuseDefaultReusesExisting() {
    let lifecycle = StubFIRAppLifecycle()
    let existing = StubFIRAppToken(label: "existing-default")
    lifecycle.defaultAppValue = existing
    let names = RNFBAppInitializeNameResolution(
      appName: "[DEFAULT]",
      jsAppName: "[DEFAULT]",
      isDefaultApp: true
    )

    let result = RNFBAppModuleFirebase.configureOrReuseApp(
      options: ConfiguringOptionsStub(),
      nameResolution: names,
      lifecycle: lifecycle
    )

    XCTAssertTrue(result === existing)
    XCTAssertFalse(lifecycle.configureDefaultCalled)
  }

  func testConfigureOrReuseDefaultConfiguresWhenMissing() {
    let lifecycle = StubFIRAppLifecycle()
    let names = RNFBAppInitializeNameResolution(
      appName: nil,
      jsAppName: "[DEFAULT]",
      isDefaultApp: true
    )
    let configuring = ConfiguringOptionsStub()
    let result = RNFBAppModuleFirebase.configureOrReuseApp(
      options: configuring,
      nameResolution: names,
      lifecycle: lifecycle
    )

    XCTAssertTrue(lifecycle.configureDefaultCalled)
    XCTAssertTrue(result === lifecycle.defaultAppValue)
  }

  func testConfigureOrReuseNamedUsesConfigureWithName() {
    let lifecycle = StubFIRAppLifecycle()
    let names = RNFBAppInitializeNameResolution(
      appName: "secondary",
      jsAppName: "secondary",
      isDefaultApp: false
    )
    let configuring = ConfiguringOptionsStub()

    let result = RNFBAppModuleFirebase.configureOrReuseApp(
      options: configuring,
      nameResolution: names,
      lifecycle: lifecycle
    )

    XCTAssertEqual(lifecycle.lastConfigureName, "secondary")
    XCTAssertTrue(result === lifecycle.namedApps["secondary"])
  }

  func testRegisterLibraryOnceOnlyRegistersOnce() {
    let registrar = StubFIRLibraryRegistrar()

    RNFBAppModuleFirebase.registerLibraryOnce(
      name: "react-native-firebase",
      version: "1.2.3",
      registrar: registrar
    )
    RNFBAppModuleFirebase.registerLibraryOnce(
      name: "react-native-firebase",
      version: "9.9.9",
      registrar: registrar
    )

    XCTAssertEqual(registrar.names, ["react-native-firebase"])
    XCTAssertEqual(registrar.versions, ["1.2.3"])
  }

  func testSetLoggerLevelForwardsToConfiguration() {
    let configuration = StubFIRLoggerConfiguration()
    RNFBAppModuleFirebase.setLoggerLevel(7, configuration: configuration)
    XCTAssertEqual(configuration.levels, [7])
  }

  func testDeleteAppForwardsToMutating() {
    let mutating = StubFIRAppMutating(deleteResults: [true])
    let app = StubFIRAppToken(label: "app")
    let expectation = expectation(description: "delete")

    RNFBAppModuleFirebase.deleteApp(app, mutating: mutating) { success in
      XCTAssertTrue(success)
      expectation.fulfill()
    }

    waitForExpectations(timeout: 1)
    XCTAssertEqual(mutating.deleteCallCount, 1)
  }
  func testDeleteAppCastFailureCompletesFalse() {
    let expectation = expectation(description: "cast-failure")
    RNFBAppModuleFirebase.deleteApp(StubFIRAppToken(label: "not-firebase")) { success in
      XCTAssertFalse(success)
      expectation.fulfill()
    }
    waitForExpectations(timeout: 1)
  }

  func testDeleteAppNamedResolvesNullWhenMissing() {
    let expectation = expectation(description: "missing")
    RNFBAppModuleFirebase.deleteApp(
      named: "missing",
      resolve: { result in
        XCTAssertTrue(result is NSNull)
        expectation.fulfill()
      },
      reject: { _, _, _ in
        XCTFail("should resolve, not reject")
      },
      appLookup: { _ in nil },
      performDelete: { _, _ in
        XCTFail("should not delete")
      }
    )
    waitForExpectations(timeout: 1)
  }

  func testDeleteAppNamedResolvesOnFirstSuccess() {
    let app = StubFIRAppToken(label: "app")
    var deleteCalls = 0
    RNFBAppCustomAuthDomains.setCustomDomain("auth.example.com", forAppName: "secondary")
    let expectation = expectation(description: "first-success")

    RNFBAppModuleFirebase.deleteApp(
      named: "secondary",
      resolve: { result in
        XCTAssertTrue(result is NSNull)
        expectation.fulfill()
      },
      reject: { _, _, _ in
        XCTFail("should resolve")
      },
      appLookup: { _ in app },
      performDelete: { _, completion in
        deleteCalls += 1
        completion(true)
      }
    )

    waitForExpectations(timeout: 1)
    XCTAssertEqual(deleteCalls, 1)
    XCTAssertNil(RNFBAppCustomAuthDomains.getCustomDomain("secondary"))
  }

  func testDeleteAppNamedRetriesOnceThenResolves() {
    let app = StubFIRAppToken(label: "app")
    var deleteCalls = 0
    let expectation = expectation(description: "retry-success")

    RNFBAppModuleFirebase.deleteApp(
      named: "secondary",
      resolve: { result in
        XCTAssertTrue(result is NSNull)
        expectation.fulfill()
      },
      reject: { _, _, _ in
        XCTFail("should resolve after retry")
      },
      appLookup: { _ in app },
      performDelete: { _, completion in
        deleteCalls += 1
        completion(deleteCalls > 1)
      }
    )

    waitForExpectations(timeout: 1)
    XCTAssertEqual(deleteCalls, 2)
  }

  func testDeleteAppNamedRejectsWhenBothDeletesFail() {
    let app = StubFIRAppToken(label: "app")
    var deleteCalls = 0
    let expectation = expectation(description: "reject")

    RNFBAppModuleFirebase.deleteApp(
      named: "secondary",
      resolve: { _ in
        XCTFail("should reject")
      },
      reject: { code, message, _ in
        XCTAssertEqual(code, "app/delete-app-failed")
        XCTAssertEqual(message, "Failed to delete the specified app.")
        expectation.fulfill()
      },
      appLookup: { _ in app },
      performDelete: { _, completion in
        deleteCalls += 1
        completion(false)
      }
    )

    waitForExpectations(timeout: 1)
    XCTAssertEqual(deleteCalls, 2)
  }

}

private final class ConfiguringOptionsStub: NSObject, RNFBFIROptionsConfiguring {
  var APIKey: String?
  var projectID: String?
  var clientID: String?
  var databaseURL: String?
  var storageBucket: String?
  var bundleID: String?
  var appGroupID: String?
}
