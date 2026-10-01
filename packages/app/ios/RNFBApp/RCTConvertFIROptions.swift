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
#if canImport(RNFBFirebase)
import RNFBFirebase
#else
import FirebaseCore
#endif

/**
 * Mutable FIROptions fields set by `convertRawOptions`.
 *
 * Production adapts live `FIROptions`; unit tests inject doubles.
 */
@objc public protocol RNFBFIROptionsConfiguring: AnyObject {
  var APIKey: String? { get set }
  var projectID: String? { get set }
  var clientID: String? { get set }
  var databaseURL: String? { get set }
  var storageBucket: String? { get set }
  var bundleID: String? { get set }
  /// Set by `initializeApp` options mapping (`appGroupId`); unused by `convertRawOptions`.
  var appGroupID: String? { get set }
}

/**
 * Creates a FIROptions-like object from Google App ID + GCM sender ID.
 *
 * Production wraps `[[FIROptions alloc] initWithGoogleAppID:GCMSenderID:]`.
 */
@objc public protocol RNFBFIROptionsCreating: AnyObject {
  @objc(createWithGoogleAppID:gcmSenderID:)
  func create(googleAppID: String?, gcmSenderID: String?) -> RNFBFIROptionsConfiguring
}

/**
 * Bundle identifier source previously hard-wired to
 * `[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIdentifier"]`.
 */
@objc public protocol RNFBBundleIdentifierProviding: AnyObject {
  @objc(bundleIdentifier)
  var bundleIdentifier: String? { get }
}

/**
 * Single FIROptions alloc path. Dynamic mode asks the opaque facade; shipped mode
 * calls `alloc` / `initWithGoogleAppID:GCMSenderID:` and balances both +1 results
 * with `takeRetainedValue()`.
 */
enum RNFBFIROptionsAllocation {
  static func create(googleAppID: String?, gcmSenderID: String?) -> NSObject {
#if canImport(RNFBFirebase)
    RNFBFirebaseOptionsClient.create(googleAppID: googleAppID, gcmSenderID: gcmSenderID)
#else
    // Pre-port forwarded nil into `initWithGoogleAppID:GCMSenderID:`. The Swift
    // `FirebaseOptions(googleAppID:gcmSenderID:)` overlay requires non-optional String,
    // so call the ObjC initializer directly to preserve nil.
    let allocated = FirebaseOptions.perform(NSSelectorFromString("alloc"))!
      .takeRetainedValue() as! NSObject
    // `perform` returns +0. The extra retain is what `takeRetainedValue()` consumes
    // when `init` returns the same instance, so the object is not over-released and
    // still deallocated with its last owner.
    _ = Unmanaged.passRetained(allocated)
    return allocated.perform(
      NSSelectorFromString("initWithGoogleAppID:GCMSenderID:"),
      with: googleAppID,
      with: gcmSenderID
    )!.takeRetainedValue() as! NSObject
#endif
  }
}

#if canImport(RNFBFirebase)
/**
 * Wraps a live options object from `RNFBFirebaseOptionsClient` without naming Firebase types.
 */
@objc(RNFBFIROptionsConfiguringAdapter)
final class RNFBFIROptionsConfiguringAdapter: NSObject, RNFBFIROptionsConfiguring {
  @objc let options: NSObject

  init(_ options: NSObject) {
    self.options = options
  }

  var APIKey: String? {
    get { RNFBFirebaseOptionsClient.apiKey(options) }
    set { RNFBFirebaseOptionsClient.setAPIKey(newValue, on: options) }
  }

  var projectID: String? {
    get { RNFBFirebaseOptionsClient.projectID(options) }
    set { RNFBFirebaseOptionsClient.setProjectID(newValue, on: options) }
  }

  var clientID: String? {
    get { RNFBFirebaseOptionsClient.clientID(options) }
    set { RNFBFirebaseOptionsClient.setClientID(newValue, on: options) }
  }

  var databaseURL: String? {
    get { RNFBFirebaseOptionsClient.databaseURL(options) }
    set { RNFBFirebaseOptionsClient.setDatabaseURL(newValue, on: options) }
  }

  var storageBucket: String? {
    get { RNFBFirebaseOptionsClient.storageBucket(options) }
    set { RNFBFirebaseOptionsClient.setStorageBucket(newValue, on: options) }
  }

  var bundleID: String? {
    get { RNFBFirebaseOptionsClient.bundleID(options) }
    set { RNFBFirebaseOptionsClient.setBundleID(newValue, on: options) }
  }

  var appGroupID: String? {
    get { RNFBFirebaseOptionsClient.appGroupID(options) }
    set { RNFBFirebaseOptionsClient.setAppGroupID(newValue, on: options) }
  }
}
#else
/**
 * Wraps live `FirebaseOptions` for `RNFBFIROptionsConfiguring`.
 *
 * Swift overlays rename / tighten optionality (`apiKey`, non-optional `bundleID`),
 * so a direct `extension FirebaseOptions: RNFBFIROptionsConfiguring` does not compile.
 */
@objc(RNFBFIROptionsConfiguringAdapter)
final class RNFBFIROptionsConfiguringAdapter: NSObject, RNFBFIROptionsConfiguring {
  @objc let options: FirebaseOptions

  init(_ options: NSObject) {
    self.options = options as! FirebaseOptions
  }

  var APIKey: String? {
    get { options.apiKey }
    set { options.apiKey = newValue }
  }

  var projectID: String? {
    get { options.projectID }
    set { options.projectID = newValue }
  }

  var clientID: String? {
    get { options.clientID }
    set { options.clientID = newValue }
  }

  var databaseURL: String? {
    get { options.databaseURL }
    set { options.databaseURL = newValue }
  }

  var storageBucket: String? {
    get { options.storageBucket }
    set { options.storageBucket = newValue }
  }

  var bundleID: String? {
    get { options.bundleID }
    set { options.bundleID = newValue ?? "" }
  }

  var appGroupID: String? {
    get { options.appGroupID }
    set { options.appGroupID = newValue }
  }
}
#endif

/**
 * Adapts `FirebaseOptions` / `FIROptions` for `RCTConvertFIROptions`.
 */
@objc(RNFBFIROptionsFactoryAdapter)
final class RNFBFIROptionsFactoryAdapter: NSObject, RNFBFIROptionsCreating {
  @objc static let shared = RNFBFIROptionsFactoryAdapter()

  @objc(createWithGoogleAppID:gcmSenderID:)
  func create(googleAppID: String?, gcmSenderID: String?) -> RNFBFIROptionsConfiguring {
    RNFBFIROptionsConfiguringAdapter(
      RNFBFIROptionsAllocation.create(googleAppID: googleAppID, gcmSenderID: gcmSenderID)
    )
  }
}

/**
 * Adapts mainBundle CFBundleIdentifier for `RCTConvertFIROptions`.
 */
@objc(RNFBMainBundleIdentifierProvider)
final class RNFBMainBundleIdentifierProvider: NSObject, RNFBBundleIdentifierProviding {
  @objc static let shared = RNFBMainBundleIdentifierProvider()

  @objc var bundleIdentifier: String? {
    Bundle.main.object(forInfoDictionaryKey: "CFBundleIdentifier") as? String
  }
}

/**
 * Raw JS options dict → FIROptions mapping previously inline in `RCTConvert+FIROptions.m`.
 *
 * Mirrors pre-port:
 * - init with `appId` / `messagingSenderId`
 * - set APIKey / projectID / clientID / databaseURL / storageBucket from dict keys
 * - bundleID from the injected bundle-identifier provider
 */
@objc(RCTConvertFIROptions)
public final class RCTConvertFIROptions: NSObject {
  /// Unwraps a configuring adapter to the live `FIROptions` object.
  static func liveFIROptions(from configured: RNFBFIROptionsConfiguring) -> AnyObject {
    if let adapter = configured as? RNFBFIROptionsConfiguringAdapter {
      return adapter.options
    }
    return configured
  }

  /// Production entry used by `RCTConvert+FIROptions.m` — returns live `FIROptions`.
  @objc(convertRawOptions:)
  public static func convertRawOptions(_ rawOptions: NSDictionary) -> AnyObject {
    let configured = convertRawOptions(
      rawOptions,
      optionsFactory: RNFBFIROptionsFactoryAdapter.shared,
      bundleIDProvider: RNFBMainBundleIdentifierProvider.shared
    )
    return liveFIROptions(from: configured)
  }

  @objc(convertRawOptions:optionsFactory:bundleIDProvider:)
  public static func convertRawOptions(
    _ rawOptions: NSDictionary,
    optionsFactory: RNFBFIROptionsCreating,
    bundleIDProvider: RNFBBundleIdentifierProviding
  ) -> RNFBFIROptionsConfiguring {
    let options = optionsFactory.create(
      googleAppID: rawOptions.value(forKey: "appId") as? String,
      gcmSenderID: rawOptions.value(forKey: "messagingSenderId") as? String
    )
    options.APIKey = rawOptions.value(forKey: "apiKey") as? String
    options.projectID = rawOptions.value(forKey: "projectId") as? String
    options.clientID = rawOptions.value(forKey: "clientId") as? String
    options.databaseURL = rawOptions.value(forKey: "databaseURL") as? String
    options.storageBucket = rawOptions.value(forKey: "storageBucket") as? String
    options.bundleID = bundleIDProvider.bundleIdentifier
    return options
  }
}
