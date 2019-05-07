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

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <Firebase/Firebase.h>

@interface RNFBAuthModule : NSObject <RCTBridgeModule>
@end

extern NSString * const AuthErrorCode_toJSErrorCode[];
NSString * const AuthErrorCode_toJSErrorCode[] = {
  [FIRAuthErrorCodeInvalidCustomToken] = @"invalid-custom-token",
  [FIRAuthErrorCodeCustomTokenMismatch] = @"custom-token-mismatch",
  [FIRAuthErrorCodeInvalidCredential] = @"invalid-credential",
  [FIRAuthErrorCodeUserDisabled] = @"user-disabled",
  [FIRAuthErrorCodeOperationNotAllowed] = @"operation-not-allowed",
  [FIRAuthErrorCodeEmailAlreadyInUse] = @"email-already-in-use",
  [FIRAuthErrorCodeInvalidEmail] = @"invalid-email",
  [FIRAuthErrorCodeWrongPassword] = @"wrong-password",
  [FIRAuthErrorCodeTooManyRequests] = @"too-many-requests",
  [FIRAuthErrorCodeUserNotFound] = @"user-not-found",
  [FIRAuthErrorCodeAccountExistsWithDifferentCredential] = @"account-exists-with-different-credential",
  [FIRAuthErrorCodeRequiresRecentLogin] = @"requires-recent-login",
  [FIRAuthErrorCodeProviderAlreadyLinked] = @"provider-already-linked",
  [FIRAuthErrorCodeNoSuchProvider] = @"no-such-provider",
  [FIRAuthErrorCodeInvalidUserToken] = @"invalid-user-token",
  [FIRAuthErrorCodeNetworkError] = @"network-request-failed",
  [FIRAuthErrorCodeUserTokenExpired] = @"user-token-expired",
  [FIRAuthErrorCodeInvalidAPIKey] = @"invalid-api-key",
  [FIRAuthErrorCodeUserMismatch] = @"user-mismatch",
  [FIRAuthErrorCodeCredentialAlreadyInUse] = @"credential-already-in-use",
  [FIRAuthErrorCodeWeakPassword] = @"weak-password",
  [FIRAuthErrorCodeAppNotAuthorized] = @"app-not-authorized",
  [FIRAuthErrorCodeExpiredActionCode] = @"expired-action-code",
  [FIRAuthErrorCodeInvalidActionCode] = @"invalid-action-code",
  [FIRAuthErrorCodeInvalidMessagePayload] = @"invalid-message-payload",
  [FIRAuthErrorCodeInvalidSender] = @"invalid-sender",
  [FIRAuthErrorCodeInvalidRecipientEmail] = @"invalid-recipient-email",
  [FIRAuthErrorCodeMissingEmail] = @"invalid-email",
  [FIRAuthErrorCodeMissingIosBundleID] = @"missing-ios-bundle-id",
  [FIRAuthErrorCodeMissingAndroidPackageName] = @"missing-android-pkg-name",
  [FIRAuthErrorCodeUnauthorizedDomain] = @"unauthorized-domain",
  [FIRAuthErrorCodeInvalidContinueURI] = @"invalid-continue-uri",
  [FIRAuthErrorCodeMissingContinueURI] = @"missing-continue-uri",
  [FIRAuthErrorCodeMissingPhoneNumber] = @"missing-phone-number",
  [FIRAuthErrorCodeInvalidPhoneNumber] = @"invalid-phone-number",
  [FIRAuthErrorCodeMissingVerificationCode] = @"missing-verification-code",
  [FIRAuthErrorCodeInvalidVerificationCode] = @"invalid-verification-code",
  [FIRAuthErrorCodeMissingVerificationID] = @"missing-verification-id",
  [FIRAuthErrorCodeInvalidVerificationID] = @"invalid-verification-id",
  [FIRAuthErrorCodeMissingAppCredential] = @"missing-app-credential",
  [FIRAuthErrorCodeInvalidAppCredential] = @"invalid-app-credential",
  [FIRAuthErrorCodeSessionExpired] = @"code-expired",
  [FIRAuthErrorCodeQuotaExceeded] = @"quota-exceeded",
  [FIRAuthErrorCodeMissingAppToken] = @"missing-apns-token",
  [FIRAuthErrorCodeNotificationNotForwarded] = @"notification-not-forwarded",
  [FIRAuthErrorCodeAppNotVerified] = @"app-not-verified",
  [FIRAuthErrorCodeCaptchaCheckFailed] = @"captcha-check-failed",
  [FIRAuthErrorCodeWebContextAlreadyPresented] = @"cancelled-popup-request",
  [FIRAuthErrorCodeWebContextCancelled] = @"popup-closed-by-user",
  [FIRAuthErrorCodeAppVerificationUserInteractionFailure] = @"app-verification-user-interaction-failure",
  [FIRAuthErrorCodeInvalidClientID] = @"invalid-oauth-client-id",
  [FIRAuthErrorCodeWebNetworkRequestFailed] = @"network-request-failed",
  [FIRAuthErrorCodeWebInternalError] = @"internal-error",
  [FIRAuthErrorCodeNullUser] = @"null-user",
  [FIRAuthErrorCodeKeychainError] = @"keychain-error",
  [FIRAuthErrorCodeInternalError] = @"internal-error",
  [FIRAuthErrorCodeMalformedJWT] = @"malformed-jwt"
};