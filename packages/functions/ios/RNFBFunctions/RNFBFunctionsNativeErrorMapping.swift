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

/// Maps callable errors raised below FirebaseFunctions (transport and Auth ID token fetch)
/// to callable error codes, and describes them for the JS `details` field.
enum RNFBFunctionsNativeErrorMapping {
  /// FirebaseAuth's error domain and the `FIRAuthErrorCode` values mapped below.
  /// Spelled out because this module does not link FirebaseAuth.
  private static let authErrorDomain = "FIRAuthErrorDomain"
  /// `FIRAuthErrorCodeNetworkError`.
  private static let authNetworkErrorCode = 17020
  /// The signed-in credential is gone for good: `UserDisabled` (17005), `UserNotFound` (17011),
  /// `InvalidUserToken` (17017) and `UserTokenExpired` (17021). Every other Auth code (keychain,
  /// rate limit, internal, app configuration) leaves the credential valid.
  private static let deadCredentialAuthErrorCodes: Set<Int> = [17005, 17011, 17017, 17021]
  /// `FunctionsErrorDomain` and the `FunctionsErrorCode` values that `stream()` uses to wrap
  /// failures before a response: `invalidArgument` (3) around the Auth ID token fetch and
  /// `unavailable` (14) around the transport. Spelled out so this file needs only Foundation.
  private static let functionsErrorDomain = "com.firebase.functions"
  private static let functionsPreResponseWrapperCodes: Set<Int> = [3, 14]

  /// Returns the error to report for `error`: the wrapped transport or Auth error when
  /// FirebaseFunctions wrapped it before a response, otherwise `error` itself.
  ///
  /// Callable calls receive transport and Auth errors unwrapped; `stream()` wraps them under
  /// `NSUnderlyingErrorKey`. Reporting the wrapped error gives both the same `code` and `details`.
  static func reportedError(for error: NSError) -> NSError {
    guard error.domain == functionsErrorDomain,
          functionsPreResponseWrapperCodes.contains(error.code),
          let underlying = error.userInfo[NSUnderlyingErrorKey] as? NSError,
          details(for: underlying) != nil
    else {
      return error
    }
    return underlying
  }

  /// Returns the callable error code for `error`, or `nil` when it has no mapping here.
  ///
  /// Every `NSURLErrorDomain` error is a transport failure (`UNAVAILABLE`, matching Android's
  /// `IOException`); FirebaseFunctions already reports timeouts as its own `deadlineExceeded`.
  /// For Auth, a network error is transient and a dead credential needs a new sign-in; any other
  /// Auth code has no mapping and stays `UNKNOWN`, reported through `details(for:)`.
  static func code(for error: NSError) -> String? {
    switch error.domain {
    case NSURLErrorDomain:
      return "UNAVAILABLE"
    case authErrorDomain where error.code == authNetworkErrorCode:
      return "UNAVAILABLE"
    case authErrorDomain where deadCredentialAuthErrorCodes.contains(error.code):
      return "UNAUTHENTICATED"
    default:
      return nil
    }
  }

  /// Returns the native `domain` and `nativeCode` of a transport or Auth error, or `nil` for
  /// any other domain.
  static func details(for error: NSError) -> [String: Any]? {
    guard error.domain == NSURLErrorDomain || error.domain == authErrorDomain else {
      return nil
    }
    return ["domain": error.domain, "nativeCode": error.code]
  }
}
