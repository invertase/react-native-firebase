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

private final class StubFIROptions: NSObject, RNFBFIROptionsProviding {
  var apiKey: String?
  var googleAppID: String?
  var projectID: String?
  var databaseURL: String?
  var storageBucket: String?
  var gcmSenderID: String?
  var clientID: String?
}

private final class StubFIRApp: NSObject, RNFBFIRAppProviding {
  var name: String
  var options: RNFBFIROptionsProviding
  var dataCollectionEnabled = false

  init(name: String, options: RNFBFIROptionsProviding) {
    self.name = name
    self.options = options
  }

  func isDataCollectionDefaultEnabled() -> Bool {
    dataCollectionEnabled
  }
}

private final class StubCustomDomainProvider: NSObject, RNFBCustomDomainProviding {
  var domains: [String: String] = [:]
  var lastRequestedName: String?

  func getCustomDomain(_ appName: String) -> String? {
    lastRequestedName = appName
    return domains[appName]
  }
}

private final class RecordingEventSender: NSObject, RNFBJSEventSending {
  var lastName: String?
  var lastBody: Any?

  func sendEvent(name: String, body: Any?) {
    lastName = name
    lastBody = body
  }
}

final class RNFBSharedUtilsFIRAppTests: XCTestCase {
  private func fullyPopulatedOptions() -> StubFIROptions {
    let options = StubFIROptions()
    options.apiKey = "api-key"
    options.googleAppID = "app-id"
    options.projectID = "project-id"
    options.databaseURL = "https://example.firebaseio.com"
    options.storageBucket = "example.appspot.com"
    options.gcmSenderID = "sender-id"
    options.clientID = "client-id"
    return options
  }

  func testDefaultAppNameMapsToDisplayName() {
    let app = StubFIRApp(name: "__FIRAPP_DEFAULT", options: fullyPopulatedOptions())
    app.dataCollectionEnabled = true
    let domains = StubCustomDomainProvider()

    let result = RNFBSharedUtilsFIRApp.firAppToDictionary(app, customDomainProvider: domains)
    let appConfig = result["appConfig"] as? NSDictionary

    XCTAssertEqual(appConfig?["name"] as? String, "[DEFAULT]")
    XCTAssertEqual(appConfig?["automaticDataCollectionEnabled"] as? Bool, true)
    XCTAssertEqual(domains.lastRequestedName, "[DEFAULT]")
  }

  func testNamedAppPreservesName() {
    let app = StubFIRApp(name: "secondary", options: fullyPopulatedOptions())
    let domains = StubCustomDomainProvider()

    let result = RNFBSharedUtilsFIRApp.firAppToDictionary(app, customDomainProvider: domains)
    let appConfig = result["appConfig"] as? NSDictionary

    XCTAssertEqual(appConfig?["name"] as? String, "secondary")
    XCTAssertEqual(domains.lastRequestedName, "secondary")
  }

  func testOptionsFieldMapping() {
    let app = StubFIRApp(name: "secondary", options: fullyPopulatedOptions())
    let domains = StubCustomDomainProvider()

    let result = RNFBSharedUtilsFIRApp.firAppToDictionary(app, customDomainProvider: domains)
    let options = result["options"] as? NSDictionary

    XCTAssertEqual(options?["apiKey"] as? String, "api-key")
    XCTAssertEqual(options?["appId"] as? String, "app-id")
    XCTAssertEqual(options?["projectId"] as? String, "project-id")
    XCTAssertEqual(options?["databaseURL"] as? String, "https://example.firebaseio.com")
    XCTAssertEqual(options?["storageBucket"] as? String, "example.appspot.com")
    XCTAssertEqual(options?["messagingSenderId"] as? String, "sender-id")
    XCTAssertEqual(options?["clientId"] as? String, "client-id")
    XCTAssertNil(options?["authDomain"])
  }

  func testAuthDomainPresentWhenProviderReturnsValue() {
    let app = StubFIRApp(name: "secondary", options: fullyPopulatedOptions())
    let domains = StubCustomDomainProvider()
    domains.domains["secondary"] = "custom.example.com"

    let result = RNFBSharedUtilsFIRApp.firAppToDictionary(app, customDomainProvider: domains)
    let options = result["options"] as? NSDictionary

    XCTAssertEqual(options?["authDomain"] as? String, "custom.example.com")
  }

  func testAuthDomainAbsentWhenProviderReturnsNil() {
    let app = StubFIRApp(name: "__FIRAPP_DEFAULT", options: fullyPopulatedOptions())
    let domains = StubCustomDomainProvider()

    let result = RNFBSharedUtilsFIRApp.firAppToDictionary(app, customDomainProvider: domains)
    let options = result["options"] as? NSDictionary

    XCTAssertNil(options?["authDomain"])
    XCTAssertEqual(domains.lastRequestedName, "[DEFAULT]")
  }

  func testSendJSEventInjectsAppNameAndForwards() {
    let app = StubFIRApp(name: "__FIRAPP_DEFAULT", options: fullyPopulatedOptions())
    let sender = RecordingEventSender()
    let body: NSDictionary = ["foo": "bar"]

    RNFBSharedUtilsFIRApp.sendJSEvent(
      forApp: app,
      name: "app_event",
      body: body,
      eventSender: sender
    )

    XCTAssertEqual(sender.lastName, "app_event")
    let forwarded = sender.lastBody as? NSDictionary
    XCTAssertEqual(forwarded?["foo"] as? String, "bar")
    XCTAssertEqual(forwarded?["appName"] as? String, "[DEFAULT]")
  }

  func testSendJSEventPreservesNamedAppName() {
    let app = StubFIRApp(name: "secondary", options: fullyPopulatedOptions())
    let sender = RecordingEventSender()

    RNFBSharedUtilsFIRApp.sendJSEvent(
      forApp: app,
      name: "named_event",
      body: [:],
      eventSender: sender
    )

    let forwarded = sender.lastBody as? NSDictionary
    XCTAssertEqual(forwarded?["appName"] as? String, "secondary")
  }
}
