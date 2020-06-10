/*
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

import React from 'react';
import { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

/**
 * The Button style (mainly color) to render.
 */
export enum AppleButtonStyle {
  /**
   * The default style, White.
   */
  DEFAULT = 'White',

  /**
   * Render a white button with black text.
   */
  WHITE = 'White',

  /**
   * Render a white button with black text and a bordered outline.
   */
  WHITE_OUTLINE = 'WhiteOutline',

  /**
   * Render a black button with white text.
   */
  BLACK = 'Black',
}

/**
 * THe Apple Button type to render, this controls the button text.
 */
export enum AppleButtonType {
  /**
   * The default button, the same as `SIGN_IN`.
   */
  DEFAULT = 'SignIn',

  /**
   * Renders the button with 'Sign in with Apple'.
   */
  SIGN_IN = 'SignIn',

  /**
   * Renders the button with 'Continue with Apple'.
   */
  CONTINUE = 'Continue',
  /**
   * Renders the button with 'Sign up with Apple'.
   *
   * > Note: This only works on iOS 13.2+. To check if the current device supports this, use the
   * provided `isSignUpButtonSupported` flag from the AppleAuth module.
   */
  SIGN_UP = 'SignUp',
}

/**
 * The current Apple Authorization state.
 */
export enum AppleAuthCredentialState {
  /**
   * The Opaque user ID was revoked by the user.
   */
  REVOKED,

  /**
   * The Opaque user ID is in good state.
   */
  AUTHORIZED,

  /**
   * The Opaque user ID was not found.
   */
  NOT_FOUND,

  /**
   * N/A
   *
   * @url https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidprovidercredentialstate/asauthorizationappleidprovidercredentialtransferred?language=objc
   */
  TRANSFERRED,
}

/**
 * Operation to be executed by the request.
 *
 * Request option used as part of `AppleAuthRequestOptions` `requestedOperation`
 */
export enum AppleAuthRequestOperation {
  /**
   * An operation that depends on the particular kind of credential provider.
   */
  IMPLICIT,

  /**
   * An operation used to authenticate a user.
   */
  LOGIN,

  /**
   * An operation that refreshes the logged-in user’s credentials.
   */
  REFRESH,

  /**
   * An operation that ends an authenticated session.
   */
  LOGOUT,
}

/**
 * The contact information to be requested from the user.  Only scopes for which this app was
 * authorized for will be returned.
 *
 * Scopes used as part of `AppleAuthRequestOptions` `requestedScopes`
 */
export enum AppleAuthRequestScope {
  /**
   * A scope that includes the user’s email address.
   */
  EMAIL,

  /**
   * A scope that includes the user’s full name.
   */
  FULL_NAME,
}

/**
 * Possible values for the real user indicator.
 *
 * @url https://developer.apple.com/documentation/authenticationservices/asuserdetectionstatus
 */
export enum AppleAuthRealUserStatus {
  /**
   * Not supported on current platform, ignore the value.
   */
  UNSUPPORTED,

  /**
   * Could not determine the value.
   *
   * New users in the ecosystem will get this value as well, so you should not blacklist but
   * instead treat these users as any new user through standard email sign up flows
   */
  UNKNOWN,

  /**
   * A hint that there's high confidence that the user is real.
   */
  LIKELY_REAL,
}

/**
 * The available props for the AppleButton view component.
 */
export interface AppleButtonProps {
  /**
   * See @{AppleButtonStyle}
   */
  buttonStyle?: AppleButtonStyle;

  /**
   * See @{AppleButtonType}
   */
  buttonType?: AppleButtonType;

  /**
   * Corner radius of the button.
   */
  cornerRadius?: number;

  onPress?: (event: GestureResponderEvent) => void;

  style?: StyleProp<ViewStyle>;
}

/**
 * Apple Authentication Request options to be used with `performRequest(requestOptions)`.
 */
export interface AppleAuthRequestOptions {
  /**
   * The contact information to be requested from the user.
   *
   * Only scopes for which this app was authorized for will be returned.
   */
  requestedScopes?: AppleAuthRequestScope[];

  /**
   * Operation which should be executed.
   *
   * @url https://developer.apple.com/documentation/authenticationservices/asauthorizationoperationimplicit?language=objc
   */
  requestedOperation?: AppleAuthRequestOperation;

  /**
   * If you have been previously vended a 'user' value through a Apple Authorization response,
   * you may set it here to provide additional context to the identity provider.
   *
   * Inherited from `ASAuthorizationAppleIDRequest`
   */
  user?: string;

  /**
   * Nonce to be passed to the identity provider. If value not provided, one will automatically
   * be created for you and available as part of @{AppleAuthRequestResponse}.
   *
   * This value can be verified with the identity token provided as a part of successful
   * ASAuthorization response.
   *
   * The nonce size may depend on the actual technology used and an error might be returned by
   * the request execution.
   */
  nonce?: string;

  /**
   * Disable automatic nonce behaviour by setting this to false.
   *
   * Useful for authentication providers that don't yet support nonces.
   *
   * Defaults to true.
   */
  nonceEnabled?: boolean;

  /**
   * State to be passed to the identity provider.
   *
   * This value will be returned as a part of successful AppleAuthRequestResponse response.
   */
  state?: string;
}

/**
 * An optional full name shared by the user.
 *
 * These fields are populated with values that the user authorized.
 */
export interface AppleAuthRequestResponseFullName {
  /**
   * Pre-nominal letters denoting title, salutation, or honorific, e.g. Dr., Mr.
   */
  namePrefix: string | null;

  /**
   * Name bestowed upon an individual by one's parents, e.g. Johnathan
   */
  givenName: string | null;

  /**
   * Secondary given name chosen to differentiate those with the same first name, e.g. Maple
   */
  middleName: string | null;

  /**
   * Name passed from one generation to another to indicate lineage, e.g. Appleseed
   */
  familyName: string | null;

  /**
   * Post-nominal letters denoting degree, accreditation, or other honor, e.g. Esq., Jr., Ph.D.
   */
  nameSuffix: string | null;

  /**
   * Name substituted for the purposes of familiarity, e.g. "Johnny"
   */
  nickname: string | null;
}

/**
 * A response from `performRequest(requestOptions)`.
 */
export interface AppleAuthRequestResponse {
  /**
   * Nonce that was passed to the identity provider. If none was passed to the request, one will
   * have automatically been created and available to be read from this property.
   */
  nonce: string;

  /**
   * An opaque user ID associated with the AppleID used for the sign in. This identifier will be
   * stable across the 'developer team', it can later be used as an input to
   * @{AppleAuthRequest} to request user contact information.
   *
   * The identifier will remain stable as long as the user is connected with the requesting client.
   * The value may change upon user disconnecting from the identity provider.
   */
  user: string;

  /**
   * An optional full name shared by the user.
   *
   * This field is populated with a value that the user authorized.
   *
   * See @{AppleAuthRequestResponseFullName}
   */
  fullName: null | AppleAuthRequestResponseFullName;

  /**
   * Check this property for a hint as to whether the current user is a "real user".
   *
   * See @{AppleAuthRealUserStatus}
   */
  realUserStatus: AppleAuthRealUserStatus;

  /**
   * This value will contain an array of scopes for which the user provided authorization.
   * Note that these may contain a subset of the requested scopes. You should query this value to
   * identify which scopes were returned as it may be different from ones you requested.
   *
   * See @{AppleAuthRealUserStatus}
   */
  authorizedScopes: AppleAuthRequestScope[];

  /**
   * A JSON Web Token (JWT) used to communicate information about the identity of the user in a
   * secure way to the app.
   *
   * The ID token contains the following information signed by Apple's identity service:
   *  - Issuer Identifier
   *  - Subject Identifier
   *  - Audience
   *  - Expiry Time
   *  - Issuance Time
   */
  identityToken: string | null;

  /**
   * An optional email shared by the user.
   *
   * This field is populated with a value that the user authorized.
   */
  email: string | null;

  /**
   * A copy of the state value that was passed to the initial request.
   */
  state: string | null;

  /**
   * A short-lived, one-time valid token that can provides proof of authorization to the server
   * component of your app.
   *
   * The authorization code is bound to the specific transaction using the state attribute passed
   * in the authorization request. The server component of your app can validate the code using
   * the Apple identity service endpoint.
   */
  authorizationCode: string | null;
}

/**
 * Errors that can occur during authorization.
 *
 * @url https://developer.apple.com/documentation/authenticationservices/asauthorizationerror/code
 */
export enum AppleAuthError {
  /**
   * The authorization attempt failed for an unknown reason.
   */
  UNKNOWN = '1000',

  /**
   * The user canceled the authorization attempt.
   */
  CANCELED = '1001',

  /**
   * The authorization request received an invalid response.
   */
  INVALID_RESPONSE = '1002',

  /**
   * The authorization request wasn't handled.
   */
  NOT_HANDLED = '1003',

  /**
   * The authorization attempt failed.
   */
  FAILED = '1004',
}

export const AppleButton: {
  Type: typeof AppleButtonType;
  Style: typeof AppleButtonStyle;
} & React.FC<AppleButtonProps>;

declare type AppleAuth = {
  /**
   * A boolean value of whether Apple Authentication is supported on this device & platform version.
   *
   * This will always return false for Android, and false for iOS devices running iOS
   * versions less than 13.
   */
  isSupported: boolean;

  /**
   * A boolean value of whether the 'SignUp' Type variant of the Apple Authentication Button is
   * supported.
   *
   * This will always return false for Android, and false for iOS devices running iOS
   * versions less than 13.2
   */
  isSignUpButtonSupported: boolean;

  /**
   * Perform a request to Apple Authentication services with the provided request options.
   * @param options AppleAuthRequestOptions
   */
  performRequest(options?: AppleAuthRequestOptions): Promise<AppleAuthRequestResponse>;

  /**
   * Get the current @{AppleAuthCredentialState} for the provided user identifier.
   *
   * @param user An opaque user ID associated with the AppleID used for the sign in.
   */
  getCredentialStateForUser(user: string): Promise<AppleAuthCredentialState>;

  /**
   * Subscribe to credential revoked events. Call `getCredentialStateForUser` on event received
   * to confirm the current credential state for your user identifier.
   *
   * @param listener Returns a function that when called will unsubscribe from future events.
   */
  onCredentialRevoked(listener: Function): () => void | undefined;
};

declare const appleAuth: {} & AppleAuth;
export default appleAuth;
