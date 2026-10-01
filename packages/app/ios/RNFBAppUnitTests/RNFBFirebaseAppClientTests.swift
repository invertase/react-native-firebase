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

import FirebaseCore
import Foundation
import RNFBFirebase
import XCTest

final class RNFBFirebaseAppClientTests: XCTestCase {
  override func tearDown() {
    FirebaseApp.resetRegistryForTesting()
    FirebaseConfiguration.resetForTesting()
    super.tearDown()
  }

  func testInstallationsLinkageAnchorIsDistinctFromNSObject() {
    XCTAssertTrue(RNFBFirebaseUmbrella.firebaseInstallationsLinked())
  }

  func testCreateOptionsPreservesNilIdentifiersAndDeallocates() {
    weak var released: FirebaseOptions?
    autoreleasepool {
      let created = RNFBFirebaseOptionsClient.create(googleAppID: nil, gcmSenderID: nil)
      let options = created as! FirebaseOptions
      released = options
      XCTAssertNil(RNFBFirebaseOptionsClient.googleAppID(created))
      XCTAssertNil(RNFBFirebaseOptionsClient.gcmSenderID(created))
    }
    XCTAssertNil(released)
  }

  func testOptionsClientRoundTripsMutableFields() {
    let created = RNFBFirebaseOptionsClient.create(googleAppID: "app-id", gcmSenderID: "sender-id")
    XCTAssertEqual(RNFBFirebaseOptionsClient.googleAppID(created), "app-id")
    XCTAssertEqual(RNFBFirebaseOptionsClient.gcmSenderID(created), "sender-id")

    RNFBFirebaseOptionsClient.setAPIKey("api-key", on: created)
    RNFBFirebaseOptionsClient.setProjectID("project-id", on: created)
    RNFBFirebaseOptionsClient.setClientID("client-id", on: created)
    RNFBFirebaseOptionsClient.setDatabaseURL("https://example.firebaseio.com", on: created)
    RNFBFirebaseOptionsClient.setStorageBucket("example.appspot.com", on: created)
    RNFBFirebaseOptionsClient.setBundleID("com.example.app", on: created)
    RNFBFirebaseOptionsClient.setAppGroupID("group.com.example", on: created)

    XCTAssertEqual(RNFBFirebaseOptionsClient.apiKey(created), "api-key")
    XCTAssertEqual(RNFBFirebaseOptionsClient.projectID(created), "project-id")
    XCTAssertEqual(RNFBFirebaseOptionsClient.clientID(created), "client-id")
    XCTAssertEqual(RNFBFirebaseOptionsClient.databaseURL(created), "https://example.firebaseio.com")
    XCTAssertEqual(RNFBFirebaseOptionsClient.storageBucket(created), "example.appspot.com")
    XCTAssertEqual(RNFBFirebaseOptionsClient.bundleID(created), "com.example.app")
    XCTAssertEqual(RNFBFirebaseOptionsClient.appGroupID(created), "group.com.example")

    RNFBFirebaseOptionsClient.setBundleID(nil, on: created)
    RNFBFirebaseOptionsClient.setAppGroupID(nil, on: created)
    XCTAssertEqual(RNFBFirebaseOptionsClient.bundleID(created), "")
    XCTAssertNil(RNFBFirebaseOptionsClient.appGroupID(created))
  }

  func testDefaultConfigureRegistersTheStubApp() {
    RNFBFirebaseAppClient.configure()
    let app = RNFBFirebaseAppClient.defaultApp()
    XCTAssertEqual(RNFBFirebaseAppClient.snapshot(of: app!).googleAppID, "stub-app-id")
  }

  func testAppLookupConfigureSnapshotAndAllApps() {
    XCTAssertNil(RNFBFirebaseAppClient.defaultApp())
    XCTAssertNil(RNFBFirebaseAppClient.app(named: "missing"))
    XCTAssertNil(RNFBFirebaseAppClient.allApps())

    let options = RNFBFirebaseOptionsClient.create(googleAppID: "app-id", gcmSenderID: "sender-id")
    RNFBFirebaseOptionsClient.setAPIKey("api-key", on: options)
    RNFBFirebaseOptionsClient.setProjectID("project-id", on: options)
    RNFBFirebaseOptionsClient.setClientID("client-id", on: options)
    RNFBFirebaseOptionsClient.setDatabaseURL("https://example.firebaseio.com", on: options)
    RNFBFirebaseOptionsClient.setStorageBucket("example.appspot.com", on: options)

    RNFBFirebaseAppClient.configure(options: options)
    let defaultApp = RNFBFirebaseAppClient.defaultApp()
    XCTAssertNotNil(defaultApp)

    let namedOptions = RNFBFirebaseOptionsClient.create(googleAppID: "named-app", gcmSenderID: "named-sender")
    RNFBFirebaseAppClient.configure(name: "secondary", options: namedOptions)
    let named = RNFBFirebaseAppClient.app(named: "secondary")
    XCTAssertNotNil(named)

    let apps = RNFBFirebaseAppClient.allApps()
    XCTAssertEqual(apps?.count, 2)

    let snapshot = RNFBFirebaseAppClient.snapshot(of: defaultApp!)
    XCTAssertEqual(snapshot.name, "__FIRAPP_DEFAULT")
    XCTAssertEqual(snapshot.googleAppID, "app-id")
    XCTAssertEqual(snapshot.gcmSenderID, "sender-id")
    XCTAssertEqual(snapshot.apiKey, "api-key")
    XCTAssertEqual(snapshot.projectID, "project-id")
    XCTAssertEqual(snapshot.clientID, "client-id")
    XCTAssertEqual(snapshot.databaseURL, "https://example.firebaseio.com")
    XCTAssertEqual(snapshot.storageBucket, "example.appspot.com")
    XCTAssertFalse(snapshot.isDataCollectionDefaultEnabled)

    XCTAssertFalse(RNFBFirebaseAppClient.setDataCollectionDefaultEnabled(true, forApp: NSObject()))
    XCTAssertTrue(RNFBFirebaseAppClient.setDataCollectionDefaultEnabled(true, forApp: defaultApp!))
    XCTAssertTrue(RNFBFirebaseAppClient.snapshot(of: defaultApp!).isDataCollectionDefaultEnabled)
  }

  func testDeleteAppRejectsNonFirebaseAndRemovesLiveApp() {
    var completionCalled = false
    XCTAssertFalse(
      RNFBFirebaseAppClient.deleteApp(NSObject()) { _ in
        completionCalled = true
      }
    )
    XCTAssertFalse(completionCalled)

    let options = RNFBFirebaseOptionsClient.create(googleAppID: "app-id", gcmSenderID: "sender")
    RNFBFirebaseAppClient.configure(name: "secondary", options: options)
    let app = RNFBFirebaseAppClient.app(named: "secondary")!
    let expectation = expectation(description: "delete")
    XCTAssertTrue(
      RNFBFirebaseAppClient.deleteApp(app) { success in
        XCTAssertTrue(success)
        expectation.fulfill()
      }
    )
    waitForExpectations(timeout: 1)
    XCTAssertNil(RNFBFirebaseAppClient.app(named: "secondary"))
  }

  func testLoggerLevelPassesThroughKnownAndUnknownValues() {
    RNFBFirebaseAppClient.setLoggerLevel(7)
    XCTAssertEqual(FirebaseConfiguration.shared.loggerLevel, unsafeBitCast(7, to: FirebaseLoggerLevel.self))
    RNFBFirebaseAppClient.setLoggerLevel(99)
    XCTAssertEqual(FirebaseConfiguration.shared.loggerLevel, unsafeBitCast(99, to: FirebaseLoggerLevel.self))
  }

  func testRegisterLibrarySkipsMissingSelectorAndRecordsWhenPresent() {
    RNFBFirebaseAppClient.registerLibraryIfAvailable(name: "skipped", version: "0", on: NSObject.self)
    XCTAssertNil(FirebaseApp.lastRegisteredLibraryNameForTesting())

    FirebaseApp.setRegisterLibraryAvailableForTesting(false)
    RNFBFirebaseAppClient.registerLibrary(name: "skipped-c", version: "0")
    XCTAssertNil(FirebaseApp.lastRegisteredLibraryNameForTesting())
    FirebaseApp.setRegisterLibraryAvailableForTesting(true)

    RNFBFirebaseAppClient.registerLibraryIfAvailable(
      name: "react-native-firebase",
      version: "9.9.9",
      on: FirebaseApp.self
    )
    RNFBFirebaseAppClient.registerLibrary(name: "react-native-firebase", version: "9.9.9")
    XCTAssertEqual(FirebaseApp.lastRegisteredLibraryNameForTesting(), "react-native-firebase")
    XCTAssertEqual(FirebaseApp.lastRegisteredLibraryVersionForTesting(), "9.9.9")
  }
}
