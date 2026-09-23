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

private final class StubFIROptions: NSObject, RNFBFIROptionsConfiguring {
  var googleAppID: String?
  var gcmSenderID: String?
  var APIKey: String?
  var projectID: String?
  var clientID: String?
  var databaseURL: String?
  var storageBucket: String?
  var bundleID: String?
  var appGroupID: String?
}

private final class StubFIROptionsFactory: NSObject, RNFBFIROptionsCreating {
  var lastGoogleAppID: String?
  var lastGCMSenderID: String?
  let options = StubFIROptions()

  func create(googleAppID: String?, gcmSenderID: String?) -> RNFBFIROptionsConfiguring {
    lastGoogleAppID = googleAppID
    lastGCMSenderID = gcmSenderID
    options.googleAppID = googleAppID
    options.gcmSenderID = gcmSenderID
    return options
  }
}

private final class StubBundleIDProvider: NSObject, RNFBBundleIdentifierProviding {
  var bundleIdentifier: String?

  init(bundleIdentifier: String?) {
    self.bundleIdentifier = bundleIdentifier
  }
}

final class RCTConvertFIROptionsTests: XCTestCase {
  func testConvertRawOptionsMapsAllFields() {
    let factory = StubFIROptionsFactory()
    let bundle = StubBundleIDProvider(bundleIdentifier: "com.example.app")
    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
      "apiKey": "api-key",
      "projectId": "project-id",
      "clientId": "client-id",
      "databaseURL": "https://example.firebaseio.com",
      "storageBucket": "example.appspot.com",
    ]

    let result = RCTConvertFIROptions.convertRawOptions(
      raw,
      optionsFactory: factory,
      bundleIDProvider: bundle
    )

    XCTAssertTrue(result === factory.options)
    XCTAssertEqual(factory.lastGoogleAppID, "app-id")
    XCTAssertEqual(factory.lastGCMSenderID, "sender-id")
    XCTAssertEqual(factory.options.APIKey, "api-key")
    XCTAssertEqual(factory.options.projectID, "project-id")
    XCTAssertEqual(factory.options.clientID, "client-id")
    XCTAssertEqual(factory.options.databaseURL, "https://example.firebaseio.com")
    XCTAssertEqual(factory.options.storageBucket, "example.appspot.com")
    XCTAssertEqual(factory.options.bundleID, "com.example.app")
  }

  func testConvertRawOptionsUsesInjectableBundleID() {
    let factory = StubFIROptionsFactory()
    let bundle = StubBundleIDProvider(bundleIdentifier: "injected.bundle.id")
    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
    ]

    let result = RCTConvertFIROptions.convertRawOptions(
      raw,
      optionsFactory: factory,
      bundleIDProvider: bundle
    )

    XCTAssertEqual(result.bundleID, "injected.bundle.id")
    XCTAssertNil(result.APIKey)
    XCTAssertNil(result.projectID)
  }

  func testConvertRawOptionsNilBundleID() {
    let factory = StubFIROptionsFactory()
    let bundle = StubBundleIDProvider(bundleIdentifier: nil)
    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
    ]

    let result = RCTConvertFIROptions.convertRawOptions(
      raw,
      optionsFactory: factory,
      bundleIDProvider: bundle
    )

    XCTAssertNil(result.bundleID)
  }
}
