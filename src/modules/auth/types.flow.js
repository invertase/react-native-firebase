/**
 * @flow
 */
import type User from './User';

export type ActionCodeInfo = {
  data: {
    email?: string,
    fromEmail?: string,
  },
  operation: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'RECOVER_EMAIL',
};

export type ActionCodeSettings = {
  android: {
    installApp?: boolean,
    minimumVersion?: string,
    packageName: string,
  },
  handleCodeInApp?: boolean,
  iOS: {
    bundleId?: string,
  },
  url: string,
};

export type AdditionalUserInfo = {
  isNewUser: boolean,
  profile?: Object,
  providerId: string,
  username?: string,
};

export type AuthCredential = {
  providerId: string,
  token: string,
  secret: string,
};

export type UserCredential = {|
  additionalUserInfo?: AdditionalUserInfo,
  user: User,
|};

export type UserInfo = {
  displayName?: string,
  email?: string,
  phoneNumber?: string,
  photoURL?: string,
  providerId: string,
  uid: string,
};

export type UserMetadata = {
  creationTime?: string,
  lastSignInTime?: string,
};

export type NativeUser = {
  displayName?: string,
  email?: string,
  emailVerified?: boolean,
  isAnonymous?: boolean,
  metadata: UserMetadata,
  phoneNumber?: string,
  photoURL?: string,
  providerData: UserInfo[],
  providerId: string,
  uid: string,
};

export type NativeUserCredential = {|
  additionalUserInfo?: AdditionalUserInfo,
  user: NativeUser,
|};

export type AuthErrorCode =
  | 'account-exists-with-different-credential'
  | 'app-deleted'
  | 'app-not-authorized'
  | 'app-not-installed'
  | 'app-not-verified'
  | 'app-verification-user-interaction-failure'
  | 'argument-error'
  | 'auth-domain-config-required'
  | 'cancelled-popup-request'
  | 'cancelled-popup-request'
  | 'captcha-check-failed'
  | 'code-expired'
  | 'code-expired'
  | 'credential-already-in-use'
  | 'custom-token-mismatch'
  | 'dynamic-link-not-activated'
  | 'email-already-in-use'
  | 'expired-action-code'
  | 'internal-error'
  | 'internal-error'
  | 'invalid-action-code'
  | 'invalid-api-key'
  | 'invalid-app-credential'
  | 'invalid-app-id'
  | 'invalid-auth-event'
  | 'invalid-cert-hash'
  | 'invalid-continue-uri'
  | 'invalid-credential'
  | 'invalid-custom-token'
  | 'invalid-email'
  | 'invalid-email'
  | 'invalid-message-payload'
  | 'invalid-oauth-client-id'
  | 'invalid-oauth-client-id'
  | 'invalid-oauth-provider'
  | 'invalid-persistence-type'
  | 'invalid-phone-number'
  | 'invalid-provider-id'
  | 'invalid-recipient-email'
  | 'invalid-sender'
  | 'invalid-user-token'
  | 'invalid-verification-code'
  | 'invalid-verification-id'
  | 'keychain-error'
  | 'malformed-jwt'
  | 'missing-android-pkg-name'
  | 'missing-android-pkg-name'
  | 'missing-apns-token'
  | 'missing-app-credential'
  | 'missing-continue-uri'
  | 'missing-ios-bundle-id'
  | 'missing-phone-number'
  | 'missing-verification-code'
  | 'missing-verification-id'
  | 'network-request-failed'
  | 'network-request-failed'
  | 'network-request-failed'
  | 'no-auth-event'
  | 'no-such-provider'
  | 'notification-not-forwarded'
  | 'null-user'
  | 'operation-not-allowed'
  | 'operation-not-supported-in-this-environment'
  | 'popup-blocked'
  | 'popup-closed-by-user'
  | 'popup-closed-by-user'
  | 'provider-already-linked'
  | 'quota-exceeded'
  | 'redirect-cancelled-by-user'
  | 'redirect-operation-pending'
  | 'requires-recent-login'
  | 'timeout'
  | 'too-many-requests'
  | 'unauthorized-continue-uri'
  | 'unauthorized-domain'
  | 'unsupported-persistence-type'
  | 'user-cancelled'
  | 'user-disabled'
  | 'user-mismatch'
  | 'user-not-found'
  | 'user-signed-out'
  | 'user-token-expired'
  | 'weak-password'
  | 'web-storage-unsupported'
  | 'wrong-password';
