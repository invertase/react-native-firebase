/**
 * @flow
 * User representation wrapper
 */
import INTERNALS from '../../utils/internals';

import type Auth from './';
import type { ActionCodeSettings, AuthCredential } from '../../types';

type NativeUser = {
  displayName?: string,
  email?: string,
  emailVerified?: boolean,
  isAnonymous?: boolean,
  phoneNumber?: string,
  photoURL?: string,
  providerData: UserInfo[],
  providerId: string,
  uid: string,
}

type UserInfo = {
  displayName?: string,
  email?: string,
  phoneNumber?: string,
  photoURL?: string,
  providerId: string,
  uid: string,
}

export default class User {
  _auth: Auth;
  _user: NativeUser;

  /**
   *
   * @param auth Instance of Authentication class
   * @param user user result object from native
   */
  constructor(auth: Auth, user: NativeUser) {
    this._auth = auth;
    this._user = user;
  }

  /**
   * PROPERTIES
   */

  get displayName(): ?string {
    return this._user.displayName || null;
  }

  get email(): ?string {
    return this._user.email || null;
  }

  get emailVerified(): boolean {
    return this._user.emailVerified || false;
  }

  get isAnonymous(): boolean {
    return this._user.isAnonymous || false;
  }

  get phoneNumber(): ?string {
    return this._user.phoneNumber || null;
  }

  get photoURL(): ?string {
    return this._user.photoURL || null;
  }

  get providerData(): Array<UserInfo> {
    return this._user.providerData;
  }

  get providerId(): string {
    return this._user.providerId;
  }

  get uid(): string {
    return this._user.uid;
  }

  /**
   * METHODS
   */

  /**
   * Delete the current user
   * @return {Promise}
   */
  delete(): Promise<void> {
    return this._auth
      ._interceptUndefinedUserValue(this._auth._native.delete());
  }

  /**
   * get the token of current user
   * @return {Promise}
   */
  getIdToken(forceRefresh: boolean = false): Promise<string> {
    return this._auth._native.getToken(forceRefresh);
  }

  /**
   *
   * @param credential
   */
  linkWithCredential(credential: AuthCredential): Promise<User> {
    return this._auth
      ._interceptUserValue(this._auth._native.link(credential.providerId, credential.token, credential.secret));
  }

  /**
   * Re-authenticate a user with a third-party authentication provider
   * @return {Promise}         A promise resolved upon completion
   */
  reauthenticateWithCredential(credential: AuthCredential): Promise<void> {
    return this._auth
      ._interceptUndefinedUserValue(this._auth._native.reauthenticate(credential.providerId, credential.token, credential.secret));
  }

  /**
   * Reload the current user
   * @return {Promise}
   */
  reload(): Promise<void> {
    return this._auth
      ._interceptUndefinedUserValue(this._auth._native.reload());
  }

  /**
   * Send verification email to current user.
   */
  sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void> {
    return this._auth
      ._interceptUndefinedUserValue(this._auth._native.sendEmailVerification(actionCodeSettings));
  }

  toJSON(): Object {
    return Object.assign({}, this._user);
  }

  /**
   *
   * @param providerId
   * @return {Promise.<TResult>|*}
   */
  unlink(providerId: string): Promise<User> {
    return this._auth._interceptUserValue(this._auth._native.unlink(providerId));
  }

  /**
   * Update the current user's email
   *
   * @param  {string} email The user's _new_ email
   * @return {Promise}       A promise resolved upon completion
   */
  updateEmail(email: string): Promise<void> {
    return this._auth
      ._interceptUndefinedUserValue(this._auth._native.updateEmail(email));
  }

  /**
   * Update the current user's password
   * @param  {string} password the new password
   * @return {Promise}
   */
  updatePassword(password: string): Promise<void> {
    return this._auth
      ._interceptUndefinedUserValue(this._auth._native.updatePassword(password));
  }

  /**
   * Update the current user's profile
   * @param  {Object} updates An object containing the keys listed [here](https://firebase.google.com/docs/auth/ios/manage-users#update_a_users_profile)
   * @return {Promise}
   */
  updateProfile(updates: Object = {}): Promise<void> {
    return this._auth
      ._interceptUndefinedUserValue(this._auth._native.updateProfile(updates));
  }

  /**
   * get the token of current user
   * @deprecated Deprecated getToken in favor of getIdToken.
   * @return {Promise}
   */
  getToken(forceRefresh: boolean = false): Promise<Object> {
    console.warn('Deprecated firebase.User.prototype.getToken in favor of firebase.User.prototype.getIdToken.');
    return this._auth._native.getToken(forceRefresh);
  }

  /**
   * KNOWN UNSUPPORTED METHODS
   */

  linkAndRetrieveDataWithCredential() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'linkAndRetrieveDataWithCredential'));
  }

  linkWithPhoneNumber() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'linkWithPhoneNumber'));
  }

  linkWithPopup() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'linkWithPopup'));
  }

  linkWithRedirect() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'linkWithRedirect'));
  }

  reauthenticateWithPhoneNumber() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'reauthenticateWithPhoneNumber'));
  }

  reauthenticateWithPopup() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'reauthenticateWithPopup'));
  }

  reauthenticateWithRedirect() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'reauthenticateWithRedirect'));
  }

  updatePhoneNumber() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('User', 'updatePhoneNumber'));
  }

  get refreshToken(): string {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_PROPERTY('User', 'refreshToken'));
  }
}
