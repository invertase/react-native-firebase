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
 * `FIRAuthErrorCode` raw value → JS error-code / message mapping previously held
 * in `RNFBAuthHelper.m` (`AuthErrorCode_toJSErrorCode` and the message override
 * `switch` in `+[RNFBAuthHelper getJSError:]`).
 *
 * Called from `+[RNFBAuthHelper getJSError:]`. Unmapped codes return `nil`:
 * - code: ObjC caller substitutes `@"unknown"`
 * - message: ObjC caller keeps `[error localizedDescription]`
 *
 * Raw ints from Firebase Auth `AuthErrorCode` / `FIRAuthErrorCode`
 * (`FirebaseAuth` `AuthErrors.swift` / generated `FirebaseAuth-Swift.h`).
 * Hardcoded so the Auth unit target does not need FirebaseAuth.
 *
 * Notable preservation: `FIRAuthErrorCodeMissingEmail` (17034) → `"invalid-email"`
 * (same string as `FIRAuthErrorCodeInvalidEmail`).
 */
@objc(RNFBAuthErrorCodeMapper)
public final class RNFBAuthErrorCodeMapper: NSObject {
  /// `FIRAuthErrorCodeInvalidCustomToken`
  private static let invalidCustomToken = 17000
  /// `FIRAuthErrorCodeCustomTokenMismatch`
  private static let customTokenMismatch = 17002
  /// `FIRAuthErrorCodeInvalidCredential`
  private static let invalidCredential = 17004
  /// `FIRAuthErrorCodeUserDisabled`
  private static let userDisabled = 17005
  /// `FIRAuthErrorCodeOperationNotAllowed`
  private static let operationNotAllowed = 17006
  /// `FIRAuthErrorCodeEmailAlreadyInUse`
  private static let emailAlreadyInUse = 17007
  /// `FIRAuthErrorCodeInvalidEmail`
  private static let invalidEmail = 17008
  /// `FIRAuthErrorCodeWrongPassword`
  private static let wrongPassword = 17009
  /// `FIRAuthErrorCodeTooManyRequests`
  private static let tooManyRequests = 17010
  /// `FIRAuthErrorCodeUserNotFound`
  private static let userNotFound = 17011
  /// `FIRAuthErrorCodeAccountExistsWithDifferentCredential`
  private static let accountExistsWithDifferentCredential = 17012
  /// `FIRAuthErrorCodeRequiresRecentLogin`
  private static let requiresRecentLogin = 17014
  /// `FIRAuthErrorCodeProviderAlreadyLinked`
  private static let providerAlreadyLinked = 17015
  /// `FIRAuthErrorCodeNoSuchProvider`
  private static let noSuchProvider = 17016
  /// `FIRAuthErrorCodeInvalidUserToken`
  private static let invalidUserToken = 17017
  /// `FIRAuthErrorCodeNetworkError`
  private static let networkError = 17020
  /// `FIRAuthErrorCodeUserTokenExpired`
  private static let userTokenExpired = 17021
  /// `FIRAuthErrorCodeInvalidAPIKey`
  private static let invalidAPIKey = 17023
  /// `FIRAuthErrorCodeUserMismatch`
  private static let userMismatch = 17024
  /// `FIRAuthErrorCodeCredentialAlreadyInUse`
  private static let credentialAlreadyInUse = 17025
  /// `FIRAuthErrorCodeWeakPassword`
  private static let weakPassword = 17026
  /// `FIRAuthErrorCodeAppNotAuthorized`
  private static let appNotAuthorized = 17028
  /// `FIRAuthErrorCodeExpiredActionCode`
  private static let expiredActionCode = 17029
  /// `FIRAuthErrorCodeInvalidActionCode`
  private static let invalidActionCode = 17030
  /// `FIRAuthErrorCodeInvalidMessagePayload`
  private static let invalidMessagePayload = 17031
  /// `FIRAuthErrorCodeInvalidSender`
  private static let invalidSender = 17032
  /// `FIRAuthErrorCodeInvalidRecipientEmail`
  private static let invalidRecipientEmail = 17033
  /// `FIRAuthErrorCodeMissingEmail`
  private static let missingEmail = 17034
  /// `FIRAuthErrorCodeMissingIosBundleID`
  private static let missingIosBundleID = 17036
  /// `FIRAuthErrorCodeMissingAndroidPackageName`
  private static let missingAndroidPackageName = 17037
  /// `FIRAuthErrorCodeUnauthorizedDomain`
  private static let unauthorizedDomain = 17038
  /// `FIRAuthErrorCodeInvalidContinueURI`
  private static let invalidContinueURI = 17039
  /// `FIRAuthErrorCodeMissingContinueURI`
  private static let missingContinueURI = 17040
  /// `FIRAuthErrorCodeMissingPhoneNumber`
  private static let missingPhoneNumber = 17041
  /// `FIRAuthErrorCodeInvalidPhoneNumber`
  private static let invalidPhoneNumber = 17042
  /// `FIRAuthErrorCodeMissingVerificationCode`
  private static let missingVerificationCode = 17043
  /// `FIRAuthErrorCodeInvalidVerificationCode`
  private static let invalidVerificationCode = 17044
  /// `FIRAuthErrorCodeMissingVerificationID`
  private static let missingVerificationID = 17045
  /// `FIRAuthErrorCodeInvalidVerificationID`
  private static let invalidVerificationID = 17046
  /// `FIRAuthErrorCodeMissingAppCredential`
  private static let missingAppCredential = 17047
  /// `FIRAuthErrorCodeInvalidAppCredential`
  private static let invalidAppCredential = 17048
  /// `FIRAuthErrorCodeSessionExpired`
  private static let sessionExpired = 17051
  /// `FIRAuthErrorCodeQuotaExceeded`
  private static let quotaExceeded = 17052
  /// `FIRAuthErrorCodeMissingAppToken`
  private static let missingAppToken = 17053
  /// `FIRAuthErrorCodeNotificationNotForwarded`
  private static let notificationNotForwarded = 17054
  /// `FIRAuthErrorCodeAppNotVerified`
  private static let appNotVerified = 17055
  /// `FIRAuthErrorCodeCaptchaCheckFailed`
  private static let captchaCheckFailed = 17056
  /// `FIRAuthErrorCodeWebContextAlreadyPresented`
  private static let webContextAlreadyPresented = 17057
  /// `FIRAuthErrorCodeWebContextCancelled`
  private static let webContextCancelled = 17058
  /// `FIRAuthErrorCodeAppVerificationUserInteractionFailure`
  private static let appVerificationUserInteractionFailure = 17059
  /// `FIRAuthErrorCodeInvalidClientID`
  private static let invalidClientID = 17060
  /// `FIRAuthErrorCodeWebNetworkRequestFailed`
  private static let webNetworkRequestFailed = 17061
  /// `FIRAuthErrorCodeWebInternalError`
  private static let webInternalError = 17062
  /// `FIRAuthErrorCodeNullUser`
  private static let nullUser = 17067
  /// `FIRAuthErrorCodeSecondFactorRequired`
  private static let secondFactorRequired = 17078
  /// `FIRAuthErrorCodeKeychainError`
  private static let keychainError = 17995
  /// `FIRAuthErrorCodeInternalError`
  private static let internalError = 17999
  /// `FIRAuthErrorCodeMalformedJWT`
  private static let malformedJWT = 18000

  @objc(jsErrorCodeForAuthErrorCode:)
  public static func jsErrorCode(forAuthErrorCode code: Int) -> String? {
    switch code {
    case invalidCustomToken:
      return "invalid-custom-token"
    case customTokenMismatch:
      return "custom-token-mismatch"
    case invalidCredential:
      return "invalid-credential"
    case userDisabled:
      return "user-disabled"
    case operationNotAllowed:
      return "operation-not-allowed"
    case emailAlreadyInUse:
      return "email-already-in-use"
    case invalidEmail:
      return "invalid-email"
    case wrongPassword:
      return "wrong-password"
    case tooManyRequests:
      return "too-many-requests"
    case userNotFound:
      return "user-not-found"
    case accountExistsWithDifferentCredential:
      return "account-exists-with-different-credential"
    case requiresRecentLogin:
      return "requires-recent-login"
    case providerAlreadyLinked:
      return "provider-already-linked"
    case noSuchProvider:
      return "no-such-provider"
    case invalidUserToken:
      return "invalid-user-token"
    case networkError:
      return "network-request-failed"
    case userTokenExpired:
      return "user-token-expired"
    case invalidAPIKey:
      return "invalid-api-key"
    case userMismatch:
      return "user-mismatch"
    case credentialAlreadyInUse:
      return "credential-already-in-use"
    case weakPassword:
      return "weak-password"
    case appNotAuthorized:
      return "app-not-authorized"
    case expiredActionCode:
      return "expired-action-code"
    case invalidActionCode:
      return "invalid-action-code"
    case invalidMessagePayload:
      return "invalid-message-payload"
    case invalidSender:
      return "invalid-sender"
    case invalidRecipientEmail:
      return "invalid-recipient-email"
    case missingEmail:
      // Preserved pre-port: MissingEmail maps to invalid-email (not missing-email).
      return "invalid-email"
    case missingIosBundleID:
      return "missing-ios-bundle-id"
    case missingAndroidPackageName:
      return "missing-android-pkg-name"
    case unauthorizedDomain:
      return "unauthorized-domain"
    case invalidContinueURI:
      return "invalid-continue-uri"
    case missingContinueURI:
      return "missing-continue-uri"
    case missingPhoneNumber:
      return "missing-phone-number"
    case invalidPhoneNumber:
      return "invalid-phone-number"
    case missingVerificationCode:
      return "missing-verification-code"
    case invalidVerificationCode:
      return "invalid-verification-code"
    case missingVerificationID:
      return "missing-verification-id"
    case invalidVerificationID:
      return "invalid-verification-id"
    case missingAppCredential:
      return "missing-app-credential"
    case invalidAppCredential:
      return "invalid-app-credential"
    case sessionExpired:
      return "code-expired"
    case quotaExceeded:
      return "quota-exceeded"
    case missingAppToken:
      return "missing-apns-token"
    case notificationNotForwarded:
      return "notification-not-forwarded"
    case appNotVerified:
      return "app-not-verified"
    case captchaCheckFailed:
      return "captcha-check-failed"
    case webContextAlreadyPresented:
      return "cancelled-popup-request"
    case webContextCancelled:
      return "popup-closed-by-user"
    case appVerificationUserInteractionFailure:
      return "app-verification-user-interaction-failure"
    case invalidClientID:
      return "invalid-oauth-client-id"
    case webNetworkRequestFailed:
      return "network-request-failed"
    case webInternalError:
      return "internal-error"
    case nullUser:
      return "null-user"
    case keychainError:
      return "keychain-error"
    case internalError:
      return "internal-error"
    case malformedJWT:
      return "malformed-jwt"
    case secondFactorRequired:
      return "multi-factor-auth-required"
    default:
      return nil
    }
  }

  /// Pre-port `getJSError:` message overrides. Unmapped / default → `nil`.
  @objc(jsErrorMessageForAuthErrorCode:)
  public static func jsErrorMessage(forAuthErrorCode code: Int) -> String? {
    switch code {
    case invalidCustomToken:
      return "The custom token format is incorrect. Please check the documentation."
    case customTokenMismatch:
      return "The custom token corresponds to a different audience."
    case invalidCredential:
      return "The supplied auth credential is malformed or has expired."
    case invalidEmail:
      return "The email address is badly formatted."
    case wrongPassword:
      return "The password is invalid or the user does not have a password."
    case userMismatch:
      return "The supplied credentials do not correspond to the previously signed in user."
    case requiresRecentLogin:
      return "This operation is sensitive and requires recent authentication. Log in again "
        + "before retrying this request."
    case secondFactorRequired:
      return "Please complete a second factor challenge to finish signing into this account."
    case accountExistsWithDifferentCredential:
      return "An account already exists with the same email address but different sign-in "
        + "credentials. Sign in using a provider associated with this email address."
    case emailAlreadyInUse:
      return "The email address is already in use by another account."
    case credentialAlreadyInUse:
      return "This credential is already associated with a different user account."
    case userDisabled:
      return "The user account has been disabled by an administrator."
    case userTokenExpired:
      return "The user's credential is no longer valid. The user must sign in again."
    case userNotFound:
      return "There is no user record corresponding to this identifier. The user may have been "
        + "deleted."
    case invalidUserToken:
      return "The user's credential is no longer valid. The user must sign in again."
    case weakPassword:
      return "The given password is invalid."
    case operationNotAllowed:
      return "This operation is not allowed. You must enable this service in the console."
    case networkError:
      return "A network error has occurred, please try again."
    case internalError:
      return "An internal error has occurred, please try again."
    case invalidPhoneNumber:
      return "The format of the phone number provided is incorrect. "
        + "Please enter the phone number in a format that can be parsed into E.164 format. "
        + "E.164 phone numbers are written in the format [+][country code][subscriber "
        + "number including area code]."
    default:
      return nil
    }
  }
}
