import INTERNALS from './../../internals';

/**
 * @url https://firebase.google.com/docs/reference/js/firebase.User
 */
export default class User {
  /**
   *
   * @param authClass Instance of Authentication class
   * @param user user result object from native
   */
  constructor(authClass, userObj) {
    this._auth = authClass;
    this._user = userObj;
  }

  /**
   * INTERNALS
   */

  /**
   * Returns a user property or null if does not exist
   * @param prop
   * @returns {*}
   * @private
   */
  _valueOrNull(prop) {
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
    if (!Object.hasOwnProperty.call(this._user, prop)) return false;
    return this._user[prop];
  }

  /**
   * PROPERTIES
   */

  get displayName(): String | null {
    return this._valueOrNull('displayName');
  }

  get email(): String | null {
    return this._valueOrNull('email');
  }

  get emailVerified(): Boolean {
    return this._valueOrNull('emailVerified');
  }

  get isAnonymous(): Boolean {
    return this._valueOrFalse('isAnonymous');
  }

  get photoURL(): String | null {
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
    return this._auth._interceptUserValue(this._auth._native.delete());
  }

  /**
   *
   * @param credential
   */
  linkWithCredential(credential: CredentialType) {
    return this._auth._interceptUserValue(this._auth._native.link(credential.providerId, credential.token, credential.secret));
  }

  /**
   *
   * @param providerId
   * @return {Promise.<TResult>|*}
   */
  unlink(providerId: string) {
    return this._auth._interceptUserValue(this._auth._native.unlink(providerId));
  }

  /**
   * Re-authenticate a user with a third-party authentication provider
   * @return {Promise}         A promise resolved upon completion
   */
  reauthenticateWithCredential(credential: CredentialType) {
    return this._auth._interceptUserValue(this._auth._native.reauthenticate(credential.providerId, credential.token, credential.secret));
  }

  /**
   * Reload the current user
   * @return {Promise}
   */
  reload(): Promise<Object> {
    return this._auth._interceptUserValue(this._auth._native.reload());
  }

  /**
   * get the token of current user
   * @deprecated Deprecated getToken in favor of getIdToken.
   * @return {Promise}
   */
  getToken(forceRefresh: Boolean = false): Promise<Object> {
    console.warn('Deprecated firebase.User.prototype.getToken in favor of firebase.User.prototype.getIdToken.');
    return this._auth._native.getToken(forceRefresh);
  }

  /**
   * get the token of current user
   * @return {Promise}
   */
  getIdToken(forceRefresh: Boolean = false): Promise<Object> {
    return this._auth._native.getToken(forceRefresh);
  }

  /**
   *
   * @returns {Array}
   */
  get providerData(): Array {
    return this._valueOrNull('providerData') || [];
  }

  /**
   * Update the current user's email
   *
   * @param  {string} email The user's _new_ email
   * @return {Promise}       A promise resolved upon completion
   */
  updateEmail(email: string): Promise<Object> {
    return this._auth._interceptUserValue(this._auth._native.updateEmail(email));
  }

  /**
   * Update the current user's profile
   * @param  {Object} updates An object containing the keys listed [here](https://firebase.google.com/docs/auth/ios/manage-users#update_a_users_profile)
   * @return {Promise}
   */
  updateProfile(updates: Object = {}): Promise<Object> {
    return this._auth._interceptUserValue(this._auth._native.updateProfile(updates));
  }

  /**
   * Update the current user's password
   * @param  {string} password the new password
   * @return {Promise}
   */
  updatePassword(password: string): Promise<Object> {
    return this._auth._interceptUserValue(this._auth._native.updatePassword(password));
  }

  /**
   * Send verification email to current user.
   */
  sendEmailVerification(): Promise<Object> {
    return this._auth._interceptUserValue(this._auth._native.sendEmailVerification());
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

  get refreshToken() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_PROPERTY('User', 'refreshToken'));
  }
}
