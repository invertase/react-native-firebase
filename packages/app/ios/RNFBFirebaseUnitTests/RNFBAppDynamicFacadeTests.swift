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

private final class DynamicDomainProvider: NSObject, RNFBCustomDomainProviding {
  var domains: [String: String] = [:]

  func getCustomDomain(_ appName: String) -> String? {
    domains[appName]
  }
}

private final class DynamicEventSender: NSObject, RNFBJSEventSending {
  var name: String?
  var body: NSDictionary?

  func sendEvent(name: String, body: Any?) {
    self.name = name
    self.body = body as? NSDictionary
  }
}

/// Compiles RNFBApp with `RNFB_DYNAMIC_FIREBASE_PROBE` so the opaque facade branch is executed.
final class RNFBAppDynamicFacadeTests: XCTestCase {
  override func tearDown() {
    FirebaseApp.resetRegistryForTesting()
    FirebaseConfiguration.resetForTesting()
    RNFBAppModuleFirebase.resetRegisterLibraryOnceForTesting()
    RNFBAppCustomAuthDomains.resetCustomDomainsForTesting()
    super.tearDown()
  }

  func testGeneratedPublicInterfaceHidesFirebaseModules() throws {
    let products = Bundle(for: RNFBAppDynamicFacadeTests.self).bundleURL.deletingLastPathComponent()
    let moduleDir = products.appendingPathComponent(
      "RNFBFirebase.framework/Modules/RNFBFirebase.swiftmodule"
    )
    let interfaces = try FileManager.default.contentsOfDirectory(at: moduleDir, includingPropertiesForKeys: nil)
      .filter { $0.pathExtension == "swiftinterface" }
    XCTAssertFalse(interfaces.isEmpty, "missing swiftinterface under \(moduleDir.path)")
    let text = try interfaces.map { try String(contentsOf: $0, encoding: .utf8) }.joined(separator: "\n")
    let forbidden = try NSRegularExpression(
      pattern: #"\b(?:import Firebase\w*|FirebaseCore|FirebaseInstallations|FirebaseOptions|FirebaseApp|FirebaseConfiguration|FirebaseLoggerLevel|FIROptions|FIRApp)\b"#
    )
    let range = NSRange(text.startIndex..<text.endIndex, in: text)
    let match = forbidden.firstMatch(in: text, range: range)
    XCTAssertNil(match, "public interface names a Firebase SDK type")
  }

  func testFacadeOptionsRoundTripNilBundleAndDeallocation() {
    weak var released: FirebaseOptions?
    autoreleasepool {
      let configured = RNFBFIROptionsFactoryAdapter.shared.create(googleAppID: nil, gcmSenderID: nil)
      let adapter = configured as! RNFBFIROptionsConfiguringAdapter
      released = adapter.options as? FirebaseOptions
      XCTAssertNil(adapter.options.value(forKey: "googleAppID") as? String)
      XCTAssertNil(adapter.options.value(forKey: "GCMSenderID") as? String)

      adapter.APIKey = "api-key"
      adapter.projectID = "project-id"
      adapter.clientID = "client-id"
      adapter.databaseURL = "https://example.firebaseio.com"
      adapter.storageBucket = "example.appspot.com"
      adapter.bundleID = "com.example.app"
      adapter.appGroupID = "group.com.example"
      XCTAssertEqual(adapter.APIKey, "api-key")
      XCTAssertEqual(adapter.projectID, "project-id")
      XCTAssertEqual(adapter.clientID, "client-id")
      XCTAssertEqual(adapter.databaseURL, "https://example.firebaseio.com")
      XCTAssertEqual(adapter.storageBucket, "example.appspot.com")
      XCTAssertEqual(adapter.bundleID, "com.example.app")
      XCTAssertEqual(adapter.appGroupID, "group.com.example")
      adapter.bundleID = nil
      adapter.appGroupID = nil
      XCTAssertNil(adapter.bundleID)
      XCTAssertNil(adapter.appGroupID)
    }
    XCTAssertNil(released)

    let moduleConfigured = RNFBAppModuleFirebase.optionsFactory().create(
      googleAppID: "module-app",
      gcmSenderID: "module-sender"
    )
    let moduleAdapter = moduleConfigured as! RNFBFIROptionsConfiguringAdapter
    XCTAssertEqual(moduleAdapter.options.value(forKey: "googleAppID") as? String, "module-app")
    XCTAssertEqual(moduleAdapter.options.value(forKey: "GCMSenderID") as? String, "module-sender")
  }

  func testConvertRawOptionsReturnsLiveOptions() {
    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
      "apiKey": "api-key",
      "projectId": "project-id",
      "clientId": "client-id",
      "databaseURL": "https://example.firebaseio.com",
      "storageBucket": "example.appspot.com",
    ]
    let result = RCTConvertFIROptions.convertRawOptions(raw) as! FirebaseOptions
    XCTAssertEqual(result.googleAppID, "app-id")
    XCTAssertEqual(result.gcmSenderID, "sender-id")
    XCTAssertEqual(result.apiKey, "api-key")
    XCTAssertEqual(result.projectID, "project-id")
    XCTAssertEqual(result.clientID, "client-id")
    XCTAssertEqual(result.databaseURL, "https://example.firebaseio.com")
    XCTAssertEqual(result.storageBucket, "example.appspot.com")
  }

  func testAppLookupConfigureReuseAndAllApps() {
    XCTAssertNil(RCTConvertFIRApp.firApp(fromString: "missing"))
    XCTAssertEqual(RNFBAppModuleFirebase.allApps().count, 0)

    let options = RNFBFIROptionsFactoryAdapter.shared.create(googleAppID: "app-id", gcmSenderID: "sender")
    let missingDefault = RNFBAppInitializeNameResolution(
      appName: nil,
      jsAppName: "[DEFAULT]",
      isDefaultApp: true
    )
    let created = RNFBAppModuleFirebase.configureOrReuseApp(
      options: options,
      nameResolution: missingDefault
    )
    XCTAssertTrue(created === FirebaseApp.app())
    XCTAssertTrue(RCTConvertFIRApp.firApp(fromString: "[DEFAULT]") === FirebaseApp.app())

    let reused = RNFBAppModuleFirebase.configureOrReuseApp(
      options: options,
      nameResolution: missingDefault
    )
    XCTAssertTrue(reused === created)

    let named = RNFBAppInitializeNameResolution(
      appName: "secondary",
      jsAppName: "secondary",
      isDefaultApp: false
    )
    let secondary = RNFBAppModuleFirebase.configureOrReuseApp(
      options: RNFBFIROptionsFactoryAdapter.shared.create(googleAppID: "named", gcmSenderID: "named-sender"),
      nameResolution: named
    )
    XCTAssertTrue(secondary === FirebaseApp.app(name: "secondary"))
    XCTAssertTrue(RNFBAppModuleFirebase.app(forName: "secondary") === secondary)
    XCTAssertEqual(RNFBAppModuleFirebase.allApps().count, 2)
  }

  func testDictionaryAndEventUseFacadeSnapshot() {
    let options = FirebaseOptions(googleAppID: "app-id", gcmSenderID: "sender-id")
    options.apiKey = "api-key"
    options.projectID = "project-id"
    options.databaseURL = "https://example.firebaseio.com"
    options.storageBucket = "example.appspot.com"
    options.clientID = "client-id"
    let app = FirebaseApp(name: "__FIRAPP_DEFAULT", options: options)
    app.isDataCollectionDefaultEnabled = true

    let domains = DynamicDomainProvider()
    domains.domains["[DEFAULT]"] = "auth.example.com"
    let result = RNFBSharedUtilsFIRApp.firAppToDictionary(fromFIRApp: app, customDomainProvider: domains)
    let appConfig = result["appConfig"] as! NSDictionary
    let mapped = result["options"] as! NSDictionary
    XCTAssertEqual(appConfig["name"] as? String, "[DEFAULT]")
    XCTAssertEqual(appConfig["automaticDataCollectionEnabled"] as? Bool, true)
    XCTAssertEqual(mapped["apiKey"] as? String, "api-key")
    XCTAssertEqual(mapped["appId"] as? String, "app-id")
    XCTAssertEqual(mapped["projectId"] as? String, "project-id")
    XCTAssertEqual(mapped["databaseURL"] as? String, "https://example.firebaseio.com")
    XCTAssertEqual(mapped["storageBucket"] as? String, "example.appspot.com")
    XCTAssertEqual(mapped["messagingSenderId"] as? String, "sender-id")
    XCTAssertEqual(mapped["clientId"] as? String, "client-id")
    XCTAssertEqual(mapped["authDomain"] as? String, "auth.example.com")

    let sender = DynamicEventSender()
    RNFBSharedUtilsFIRApp.sendJSEvent(
      forFIRApp: app,
      name: "app-ready",
      body: ["ok": true],
      eventSender: sender
    )
    XCTAssertEqual(sender.name, "app-ready")
    XCTAssertEqual(sender.body?["appName"] as? String, "[DEFAULT]")
    XCTAssertEqual(sender.body?["ok"] as? Bool, true)
  }

  func testLoggerRegistrationDataCollectionAndDelete() {
    RNFBAppModuleFirebase.setLoggerLevel(7)
    XCTAssertEqual(FirebaseConfiguration.shared.loggerLevel, unsafeBitCast(7, to: FirebaseLoggerLevel.self))
    RNFBAppModuleFirebase.setLoggerLevel(99)
    XCTAssertEqual(FirebaseConfiguration.shared.loggerLevel, unsafeBitCast(99, to: FirebaseLoggerLevel.self))

    RNFBAppModuleFirebase.registerLibraryOnce(name: "react-native-firebase", version: "9.9.9")
    RNFBAppModuleFirebase.registerLibraryOnce(name: "react-native-firebase", version: "ignored")
    XCTAssertEqual(FirebaseApp.lastRegisteredLibraryNameForTesting(), "react-native-firebase")
    XCTAssertEqual(FirebaseApp.lastRegisteredLibraryVersionForTesting(), "9.9.9")

    let options = FirebaseOptions(googleAppID: "app-id", gcmSenderID: "sender")
    let app = FirebaseApp(name: "secondary", options: options)
    FirebaseApp.register(forTesting: app)
    RNFBAppModuleFirebase.setAutomaticDataCollectionEnabled(true, forAppName: "missing")
    XCTAssertFalse(app.isDataCollectionDefaultEnabled)
    RNFBAppModuleFirebase.setAutomaticDataCollectionEnabled(true, forAppName: "secondary")
    XCTAssertTrue(app.isDataCollectionDefaultEnabled)

    RNFBAppModuleFirebase.setDataCollectionDefaultEnabled(false, forApp: NSObject())
    XCTAssertTrue(app.isDataCollectionDefaultEnabled)
    RNFBAppModuleFirebase.setDataCollectionDefaultEnabled(false, forApp: app)
    XCTAssertFalse(app.isDataCollectionDefaultEnabled)

    let castFailure = expectation(description: "cast-failure")
    RNFBAppModuleFirebase.deleteApp(NSObject()) { success in
      XCTAssertFalse(success)
      castFailure.fulfill()
    }
    waitForExpectations(timeout: 1)

    let deleted = expectation(description: "deleted")
    RNFBAppModuleFirebase.deleteApp(app) { success in
      XCTAssertTrue(success)
      deleted.fulfill()
    }
    waitForExpectations(timeout: 1)
    XCTAssertNil(FirebaseApp.app(name: "secondary"))
  }
}
