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

final class RNFBAppInitializeOptionsMapperTests: XCTestCase {
  // MARK: - Name resolution

  func testResolveNameNilUsesDefaultAndIsDefaultApp() {
    let result = RNFBAppInitializeOptionsMapper.resolveName(from: [:])
    XCTAssertNil(result.appName)
    XCTAssertEqual(result.jsAppName, "[DEFAULT]")
    XCTAssertTrue(result.isDefaultApp)
  }

  func testResolveNameEmptyStringUsesDefaultJsNameButNotDefaultApp() {
    let result = RNFBAppInitializeOptionsMapper.resolveName(from: ["name": ""])
    XCTAssertEqual(result.appName, "")
    XCTAssertEqual(result.jsAppName, "[DEFAULT]")
    XCTAssertFalse(result.isDefaultApp)
  }

  func testResolveNameDisplayNameIsDefaultApp() {
    let result = RNFBAppInitializeOptionsMapper.resolveName(from: ["name": "[DEFAULT]"])
    XCTAssertEqual(result.appName, "[DEFAULT]")
    XCTAssertEqual(result.jsAppName, "[DEFAULT]")
    XCTAssertTrue(result.isDefaultApp)
  }

  func testResolveNameSecondary() {
    let result = RNFBAppInitializeOptionsMapper.resolveName(from: ["name": "secondary"])
    XCTAssertEqual(result.appName, "secondary")
    XCTAssertEqual(result.jsAppName, "secondary")
    XCTAssertFalse(result.isDefaultApp)
  }

  // MARK: - Options mapping

  func testBuildOptionsMapsAllInitializeAppFields() {
    let factory = StubFIROptionsFactory()
    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
      "apiKey": "api-key",
      "projectId": "project-id",
      "databaseURL": "https://example.firebaseio.com",
      "storageBucket": "example.appspot.com",
      "iosBundleId": "com.example.app",
      "iosClientId": "ios-client-id",
      "appGroupId": "group.com.example",
    ]

    let result = RNFBAppInitializeOptionsMapper.buildOptions(
      from: raw,
      optionsFactory: factory
    )

    XCTAssertTrue(result === factory.options)
    XCTAssertEqual(factory.lastGoogleAppID, "app-id")
    XCTAssertEqual(factory.lastGCMSenderID, "sender-id")
    XCTAssertEqual(factory.options.APIKey, "api-key")
    XCTAssertEqual(factory.options.projectID, "project-id")
    XCTAssertEqual(factory.options.databaseURL, "https://example.firebaseio.com")
    XCTAssertEqual(factory.options.storageBucket, "example.appspot.com")
    XCTAssertEqual(factory.options.bundleID, "com.example.app")
    XCTAssertEqual(factory.options.clientID, "ios-client-id")
    XCTAssertEqual(factory.options.appGroupID, "group.com.example")
  }

  func testBuildOptionsSkipsNSNullOptionalFields() {
    let factory = StubFIROptionsFactory()
    factory.options.databaseURL = "pre-existing"
    factory.options.storageBucket = "pre-existing-bucket"
    factory.options.bundleID = "pre-existing-bundle"
    factory.options.clientID = "pre-existing-client"
    factory.options.appGroupID = "pre-existing-group"

    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
      "apiKey": "api-key",
      "projectId": "project-id",
      "databaseURL": NSNull(),
      "storageBucket": NSNull(),
      "iosBundleId": NSNull(),
      "iosClientId": NSNull(),
      "appGroupId": NSNull(),
    ]

    _ = RNFBAppInitializeOptionsMapper.buildOptions(from: raw, optionsFactory: factory)

    XCTAssertEqual(factory.options.APIKey, "api-key")
    XCTAssertEqual(factory.options.projectID, "project-id")
    XCTAssertEqual(factory.options.databaseURL, "pre-existing")
    XCTAssertEqual(factory.options.storageBucket, "pre-existing-bucket")
    XCTAssertEqual(factory.options.bundleID, "pre-existing-bundle")
    XCTAssertEqual(factory.options.clientID, "pre-existing-client")
    XCTAssertEqual(factory.options.appGroupID, "pre-existing-group")
  }

  func testBuildOptionsMissingOptionalKeysAssignNil() {
    let factory = StubFIROptionsFactory()
    factory.options.databaseURL = "pre-existing"
    factory.options.bundleID = "pre-existing-bundle"

    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
    ]

    _ = RNFBAppInitializeOptionsMapper.buildOptions(from: raw, optionsFactory: factory)

    XCTAssertNil(factory.options.databaseURL)
    XCTAssertNil(factory.options.storageBucket)
    XCTAssertNil(factory.options.bundleID)
    XCTAssertNil(factory.options.clientID)
    XCTAssertNil(factory.options.appGroupID)
  }

  func testBuildOptionsDoesNotUseClientIdOrConvertRawKeys() {
    let factory = StubFIROptionsFactory()
    let raw: NSDictionary = [
      "appId": "app-id",
      "messagingSenderId": "sender-id",
      "clientId": "js-client-id",
      "iosClientId": "ios-client-id",
    ]

    _ = RNFBAppInitializeOptionsMapper.buildOptions(from: raw, optionsFactory: factory)

    XCTAssertEqual(factory.options.clientID, "ios-client-id")
  }

  // MARK: - authDomain

  func testAuthDomainExtractsString() {
    let domain = RNFBAppInitializeOptionsMapper.authDomain(
      from: ["authDomain": "example.firebaseapp.com"]
    )
    XCTAssertEqual(domain, "example.firebaseapp.com")
  }

  func testAuthDomainNilWhenMissing() {
    XCTAssertNil(RNFBAppInitializeOptionsMapper.authDomain(from: [:]))
  }

  func testAuthDomainNilWhenNSNull() {
    XCTAssertNil(RNFBAppInitializeOptionsMapper.authDomain(from: ["authDomain": NSNull()]))
  }
}
