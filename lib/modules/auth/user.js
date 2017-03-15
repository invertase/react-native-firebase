import { NativeModules } from 'react-native';
import { promisify } from './../../utils';

const FirebaseAuth = NativeModules.RNFirebaseAuth;

// TODO refreshToken property
// TODO reload() method

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.User
 */
export default class User {
  /**
   *
   * @param authClass Instance of Authentication class
   * @param authObj authentication result object from native
   */
  constructor(authClass, authObj) {
    this._auth = authClass;
    this._user = null;
    this._updateValues(authObj);
  }

  /**
   * INTERNALS
   */

  /**
   *
   * @param authObj
   * @private
   */
  _updateValues(authObj) {
    this._authObj = authObj;
    if (authObj.user) {
      this._user = authObj.user;
    } else {
      this._user = null;
    }
  }

  /**
   * Returns a user property or null if does not exist
   * @param prop
   * @returns {*}
   * @private
   */
  _valueOrNull(prop) {
    if (!this._user) return null;
    if (!Object.hasOwnProperty.call(this._user, prop)) return null;
    return this._user[prop];
  }

  /**
   * Returns a user property or false if does not exist
   * @param prop
   * @returns {*}
   * @private
   */
  _valueOrFalse(prop) {
    if (!this._user) return false;
    if (!Object.hasOwnProperty.call(this._user, prop)) return false;
    return this._user[prop];
  }

  /**
   * PROPERTIES
   */

  get displayName(): String|null {
    return this._valueOrNull('displayName');
  }

  get email(): String|null {
    return this._valueOrNull('email');
  }

  get emailVerified(): Boolean {
    return this._valueOrNull('emailVerified');
  }

  get isAnonymous(): Boolean {
    return this._valueOrFalse('isAnonymous');
  }

  get photoURL(): String|null {
    return this._valueOrNull('photoURL');
  }

  get providerId() {
    return this._valueOrNull('providerId');
  }

  get uid(): String {
    return this._valueOrNull('uid');
  }

  // noinspection ReservedWordAsName
  /**
   * METHODS
   */

  toJSON() {
    return Object.assign({}, this._user);
  }

  /**
   * Delete the current user
   * @return {Promise}
   */
  delete(): Promise<Object> {
    return this._auth._interceptUserValue(FirebaseAuth.delete());
  }

  /**
   * Reload the current user
   * @return {Promise}
   */
  reload(): Promise<Object> {
    return this._auth._interceptUserValue(FirebaseAuth.reload());
  }

  // TODO no RN android method yet, the SDK does have .getProviderData but returns as a List.
  // get providerData() {
  //   return this._valueOrNull('providerData');
  // }

  /**
   * Re-authenticate a user with a third-party authentication provider
   * @return {Promise}         A promise resolved upon completion
   */
  reauthenticate(credential: CredentialType): Promise<Object> {
    return promisify('reauthenticate', FirebaseAuth, 'auth/')(credential.provider, credential.token, credential.secret);
  }

  /**
   * get the token of current user
   * @return {Promise}
   */
  getToken(): Promise<Object> {
    return promisify('getToken', FirebaseAuth, 'auth/')();
  }

  /**
   *
   * @param credential
   */
  link(credential: CredentialType) {
    return promisify('link', FirebaseAuth, 'auth/')(credential.provider, credential.token, credential.secret);
  }


  /**
   * Update the current user's email
   * @param  {string} email The user's _new_ email
   * @return {Promise}       A promise resolved upon completion
   */
  updateEmail(email: string): Promise<Object> {
    return promisify('updateUserEmail', FirebaseAuth, 'auth/')(email);
  }

  /**
   * Update the current user's profile
   * @param  {Object} updates An object containing the keys listed [here](https://firebase.google.com/docs/auth/ios/manage-users#update_a_users_profile)
   * @return {Promise}
   */
  updateProfile(updates: Object = {}): Promise<Object> {
    return promisify('updateUserProfile', FirebaseAuth, 'auth/')(updates);
  }

  /**
   * Update the current user's password
   * @param  {string} password the new password
   * @return {Promise}
   */
  updatePassword(password: string): Promise<Object> {
    return promisify('updateUserPassword', FirebaseAuth, 'auth/')(password);
  }

  /**
   * Send verification email to current user.
   */
  sendEmailVerification(): Promise<Object> {
    return promisify('sendEmailVerification', FirebaseAuth, 'auth/')();
  }
}
