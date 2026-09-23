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

/// Reject callback matching `RCTPromiseRejectBlock` (`code`, `message`, `error`).
public typealias RNFBPromiseRejectCallback = (String?, String?, (any Error)?) -> Void

/**
 * Promise-rejection helpers previously inline in `RNFBSharedUtils.m`.
 *
 * Mirrors pre-port:
 * - Constructed `NSError` always uses domain `RNFBErrorDomain` and code `666`
 * - Exception path: fatal=YES, code="unknown", message/nativeErrorMessage=reason,
 *   nativeErrorCode=name; reject(name, reason, error)
 * - NSError path: fatal=NO, code="unknown", message/nativeErrorMessage=localizedDescription,
 *   nativeErrorCode=@(error.code); reject("unknown", localizedDescription, newError)
 * - UserInfo path: NSError from given userInfo; reject(userInfo["code"], userInfo["message"], error)
 */
@objc(RNFBSharedUtilsPromiseRejection)
public final class RNFBSharedUtilsPromiseRejection: NSObject {
  /// Matches pre-port private `RNFBErrorDomain` in `RNFBSharedUtils.m`.
  private static let errorDomain = "RNFBErrorDomain"
  private static let constructedErrorCode = 666

  @objc(rejectPromiseWithException:exception:)
  public static func rejectPromise(
    withException reject: @escaping RNFBPromiseRejectCallback,
    exception: NSException
  ) {
    let userInfo = NSMutableDictionary()
    userInfo.setValue(true, forKey: "fatal")
    userInfo.setValue("unknown", forKey: "code")
    userInfo.setValue(exception.reason, forKey: "message")
    userInfo.setValue(exception.name.rawValue, forKey: "nativeErrorCode")
    userInfo.setValue(exception.reason, forKey: "nativeErrorMessage")

    let error = makeError(userInfo: userInfo)
    reject(exception.name.rawValue, exception.reason, error)
  }

  @objc(rejectPromiseWithNSError:error:)
  public static func rejectPromise(
    withNSError reject: @escaping RNFBPromiseRejectCallback,
    error: NSError
  ) {
    let userInfo = NSMutableDictionary()
    userInfo.setValue(false, forKey: "fatal")
    userInfo.setValue("unknown", forKey: "code")
    userInfo.setValue(error.localizedDescription, forKey: "message")
    userInfo.setValue(NSNumber(value: error.code), forKey: "nativeErrorCode")
    userInfo.setValue(error.localizedDescription, forKey: "nativeErrorMessage")

    let newError = makeError(userInfo: userInfo)
    reject("unknown", error.localizedDescription, newError)
  }

  @objc(rejectPromiseWithUserInfo:userInfo:)
  public static func rejectPromise(
    withUserInfo reject: @escaping RNFBPromiseRejectCallback,
    userInfo: NSMutableDictionary
  ) {
    let error = makeError(userInfo: userInfo)
    reject(userInfo["code"] as? String, userInfo["message"] as? String, error)
  }

  private static func makeError(userInfo: NSDictionary) -> NSError {
    // NSDictionary bridges to [String: Any] for NSError when keys are strings.
    NSError(
      domain: errorDomain,
      code: constructedErrorCode,
      userInfo: (userInfo as! [String: Any])
    )
  }
}
