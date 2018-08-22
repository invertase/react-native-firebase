#ifndef RNFirebaseAuth_h
    #define RNFirebaseAuth_h
    #import <Foundation/Foundation.h>
    #if __has_include(<FirebaseAuth/FIRAuth.h>)
        #import <Firebase.h>
        #import <React/RCTBridgeModule.h>
        #import <React/RCTEventEmitter.h>

        @interface RNFirebaseAuth : RCTEventEmitter <RCTBridgeModule> {};
        @property NSMutableDictionary *authStateHandlers;
        @property NSMutableDictionary *idTokenHandlers;
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
    #else
        @interface RNFirebaseAuth : NSObject
        @end
    #endif
#endif
