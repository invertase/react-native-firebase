/**
 * 
 * User representation wrapper
 */
import INTERNALS from '../../utils/internals';
import { getNativeModule } from '../../utils/native';
export default class User {
  /**
   *
   * @param auth Instance of Authentication class
   * @param user user result object from native
   */
  constructor(auth, user) {
    this._auth = auth;
    this._user = user;
  }
  /**
   * PROPERTIES
   */


  get displayName() {
    return this._user.displayName || null;
  }

  get email() {
    return this._user.email || null;
  }

  get emailVerified() {
    return this._user.emailVerified || false;
  }

  get isAnonymous() {
    return this._user.isAnonymous || false;
  }

  get metadata() {
    return this._user.metadata;
  }

  get phoneNumber() {
    return this._user.phoneNumber || null;
  }

  get photoURL() {
    return this._user.photoURL || null;
  }

  get providerData() {
    return this._user.providerData;
  }

  get providerId() {
    return this._user.providerId;
  }

  get uid() {
    return this._user.uid;
  }
  /**
   * METHODS
   */

  /**
   * Delete the current user
   * @return {Promise}
   */


  delete() {
    return getNativeModule(this._auth).delete().then(() => {
      this._auth._setUser();
    });
  }
  /**
   * Returns a JWT token used to identify the user to a Firebase service.
   *
   * @param forceRefresh boolean Force refresh regardless of token expiration.
   * @return {Promise<string>}
   */


  getIdToken(forceRefresh = false) {
    return getNativeModule(this._auth).getIdToken(forceRefresh);
  }
  /**
   * Returns a IdTokenResult object which contains the ID token JWT string and other properties for getting
   * data associated with the token and all the decoded payload claims.
   *
   * @param forceRefresh boolean Force refresh regardless of token expiration.
   * @return {Promise<IdTokenResult>}
   */


  getIdTokenResult(forceRefresh = false) {
    return getNativeModule(this._auth).getIdTokenResult(forceRefresh);
  }
  /**
   * @param credential
   */


  linkWithCredential(credential) {
    return getNativeModule(this._auth).linkWithCredential(credential.providerId, credential.token, credential.secret).then(userCredential => this._auth._setUserCredential(userCredential));
  }
  /**
   * @deprecated Deprecated linkAndRetrieveDataWithCredential in favor of linkWithCredential.
   * @param credential
   */


  linkAndRetrieveDataWithCredential(credential) {
    console.warn('Deprecated linkAndRetrieveDataWithCredential in favor of linkWithCredential.');
    return getNativeModule(this._auth).linkWithCredential(credential.providerId, credential.token, credential.secret).then(userCredential => this._auth._setUserCredential(userCredential));
  }
  /**
   * Re-authenticate a user with a third-party authentication provider
   * @return {Promise}         A promise resolved upon completion
   */


  reauthenticateWithCredential(credential) {
    return getNativeModule(this._auth).reauthenticateWithCredential(credential.providerId, credential.token, credential.secret).then(userCredential => this._auth._setUserCredential(userCredential));
  }
  /**
   * Re-authenticate a user with a third-party authentication provider
   *
   * @deprecated Deprecated reauthenticateAndRetrieveDataWithCredential in favor of reauthenticateWithCredential.
   * @return {Promise}         A promise resolved upon completion
   */


  reauthenticateAndRetrieveDataWithCredential(credential) {
    console.warn('Deprecated reauthenticateAndRetrieveDataWithCredential in favor of reauthenticateWithCredential.');
    return getNativeModule(this._auth).reauthenticateWithCredential(credential.providerId, credential.token, credential.secret).then(userCredential => this._auth._setUserCredential(userCredential));
  }
  /**
   * Reload the current user
   * @return {Promise}
   */


  reload() {
    return getNativeModule(this._auth).reload().then(user => {
      this._auth._setUser(user);
    });
  }
  /**
   * Send verification email to current user.
   */


  sendEmailVerification(actionCodeSettings) {
    return getNativeModule(this._auth).sendEmailVerification(actionCodeSettings).then(user => {
      this._auth._setUser(user);
    });
  }

  toJSON() {
    return Object.assign({}, this._user);
  }
  /**
   *
   * @param providerId
   * @return {Promise.<TResult>|*}
   */


  unlink(providerId) {
    return getNativeModule(this._auth).unlink(providerId).then(user => this._auth._setUser(user));
  }
  /**
   * Update the current user's email
   *
   * @param  {string} email The user's _new_ email
   * @return {Promise}       A promise resolved upon completion
   */


  updateEmail(email) {
    return getNativeModule(this._auth).updateEmail(email).then(user => {
      this._auth._setUser(user);
    });
  }
  /**
   * Update the current user's password
   * @param  {string} password the new password
   * @return {Promise}
   */


  updatePassword(password) {
    return getNativeModule(this._auth).updatePassword(password).then(user => {
      this._auth._setUser(user);
    });
  }
  /**
   * Update the current user's phone number
   *
   * @param  {AuthCredential} credential Auth credential with the _new_ phone number
   * @return {Promise}
   */


  updatePhoneNumber(credential) {
    return getNativeModule(this._auth).updatePhoneNumber(credential.providerId, credential.token, credential.secret).then(user => {
      this._auth._setUser(user);
    });
  }
  /**
   * Update the current user's profile
   * @param  {Object} updates An object containing the keys listed [here](https://firebase.google.com/docs/auth/ios/manage-users#update_a_users_profile)
   * @return {Promise}
   */


  updateProfile(updates = {}) {
    return getNativeModule(this._auth).updateProfile(updates).then(user => {
      this._auth._setUser(user);
    });
  }
  /**
   * KNOWN UNSUPPORTED METHODS
   */


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

  get refreshToken() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_PROPERTY('User', 'refreshToken'));
  }

}