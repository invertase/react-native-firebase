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
 *
 */

import Foundation
#if canImport(RNFBFirebase)
import RNFBFirebase
#else
import FirebaseMessaging
#endif

/// Swift-side facade for every `FIRMessaging` call `RNFBMessagingModule.mm` and
/// `RNFBMessaging+AppDelegate.m` need.
///
/// Exists so those Objective-C(++) sources never have to `#import`/`@import`
/// FirebaseMessaging directly. Under the local dynamic SPM umbrella
/// (`RNFBFirebase`), the individual Firebase framework headers are not on the
/// Clang header search path -- only this pod's own generated `-Swift.h` header
/// is. A plain Swift `import` (this file) is unaffected by that.
///
/// See `RNFBAnalyticsFacade` (packages/analytics) for the same pattern, and
/// `packages/app/ios/RNFBFirebase/Package.swift` for the umbrella itself.
@objcMembers public class RNFBMessagingFacade: NSObject {

  @objc(isAutoInitEnabled)
  public static func isAutoInitEnabled() -> Bool {
    return Messaging.messaging().isAutoInitEnabled
  }

  @objc(setAutoInitEnabled:)
  public static func setAutoInitEnabled(_ enabled: Bool) {
    Messaging.messaging().isAutoInitEnabled = enabled
  }

  @objc(apnsToken)
  public static func apnsToken() -> Data? {
    return Messaging.messaging().apnsToken
  }

  private static func tokenType(fromTypeString typeString: String?) -> MessagingAPNSTokenType {
    if typeString == "prod" {
      return .prod
    }
    if typeString == "sandbox" {
      return .sandbox
    }
    return .unknown
  }

  /// Backs the JS-facing `setAPNSToken(token, type)` call, where `type` is an
  /// optional "prod"/"sandbox" string (any other value, including `nil`, maps
  /// to `.unknown` -- same fallback the historical `.mm` used).
  @objc(setAPNSTokenData:typeString:)
  public static func setAPNSToken(data: Data, typeString: String?) {
    Messaging.messaging().setAPNSToken(data, type: tokenType(fromTypeString: typeString))
  }

  /// Backs `application:didRegisterForRemoteNotificationsWithDeviceToken:`
  /// (RNFBMessaging+AppDelegate.m), which already knows sandbox-vs-prod from
  /// its own `#ifdef DEBUG`.
  @objc(setAPNSTokenFromRegistration:sandbox:)
  public static func setAPNSTokenFromRegistration(data: Data, sandbox: Bool) {
    Messaging.messaging().setAPNSToken(data, type: sandbox ? .sandbox : .prod)
  }

  @objc(retrieveFCMTokenForSenderID:completion:)
  public static func retrieveFCMToken(
    senderID: String,
    completion: @escaping (String?, NSError?) -> Void
  ) {
    Messaging.messaging().retrieveFCMToken(forSenderID: senderID) { token, error in
      completion(token, error as NSError?)
    }
  }

  @objc(deleteFCMTokenForSenderID:completion:)
  public static func deleteFCMToken(senderID: String, completion: @escaping (NSError?) -> Void) {
    Messaging.messaging().deleteFCMToken(forSenderID: senderID) { error in
      completion(error as NSError?)
    }
  }

  @objc(subscribeToTopic:completion:)
  public static func subscribeToTopic(_ topic: String, completion: @escaping (NSError?) -> Void) {
    Messaging.messaging().subscribe(toTopic: topic) { error in
      completion(error as NSError?)
    }
  }

  @objc(unsubscribeFromTopic:completion:)
  public static func unsubscribeFromTopic(
    _ topic: String, completion: @escaping (NSError?) -> Void
  ) {
    Messaging.messaging().unsubscribe(fromTopic: topic) { error in
      completion(error as NSError?)
    }
  }
}
