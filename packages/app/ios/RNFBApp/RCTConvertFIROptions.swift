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
 * Raw JS options dict → FIROptions mapping previously inline in `RCTConvert+FIROptions.m`.
 *
 * Mirrors pre-port:
 * - init with `appId` / `messagingSenderId`
 * - set APIKey / projectID / clientID / databaseURL / storageBucket from dict keys
 * - bundleID from the injected bundle-identifier provider
 */
@objc(RCTConvertFIROptions)
public final class RCTConvertFIROptions: NSObject {
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
