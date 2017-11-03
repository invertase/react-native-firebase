// @flow
import User from './user';
import ModuleBase from './../../utils/ModuleBase';
import INTERNALS from './../../internals';
import ConfirmationResult from './ConfirmationResult';

// providers
import EmailAuthProvider from './providers/EmailAuthProvider';
import PhoneAuthProvider from './providers/PhoneAuthProvider';
import GoogleAuthProvider from './providers/GoogleAuthProvider';
import GithubAuthProvider from './providers/GithubAuthProvider';
import TwitterAuthProvider from './providers/TwitterAuthProvider';
import FacebookAuthProvider from './providers/FacebookAuthProvider';

import PhoneAuthListener from './PhoneAuthListener';

export default class Auth extends ModuleBase {
  static _NAMESPACE = 'auth';
  static _NATIVE_MODULE = 'RNFirebaseAuth';

  _user: User | null;
  _native: Object;
  _getAppEventName: Function;
  _authResult: AuthResultType | null;

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, true);
    this._user = null;
    this._authResult = null;

    this.addListener(
      // sub to internal native event - this fans out to
      // public event name: onAuthStateChanged
      this._getAppEventName('auth_state_changed'),
      this._onInternalAuthStateChanged.bind(this),
    );

    this.addListener(
      // sub to internal native event - this fans out to
      // public events based on event.type
      this._getAppEventName('phone_auth_state_changed'),
      this._onInternalPhoneAuthStateChanged.bind(this),
    );

    this.addListener(
      // sub to internal native event - this fans out to
      // public event name: onIdTokenChanged
      this._getAppEventName('auth_id_token_changed'),
      this._onInternalIdTokenChanged.bind(this),
    );

    this._native.addAuthStateListener();
    this._native.addIdTokenListener();
  }

  /**
   * Route a phone state change event to the correct listeners
   * @param event
   * @private
   */
  _onInternalPhoneAuthStateChanged(event: Object) {
    const eventKey = `phone:auth:${event.requestKey}:${event.type}`;
    this.emit(eventKey, event.state);
  }

  _setAuthState(auth: AuthResultType) {
    this._authResult = auth;
    this._user = auth && auth.user ? new User(this, auth.user) : null;
    this.emit(this._getAppEventName('onUserChanged'), this._user);
  }

  /**
   * Internal auth changed listener
   * @param auth
   * @private
   */
  _onInternalAuthStateChanged(auth: AuthResultType) {
    this._setAuthState(auth);
    this.emit(this._getAppEventName('onAuthStateChanged'), this._user);
  }

  /**
   * Internal auth changed listener
   * @param auth
   * @param emit
   * @private
   */
  _onInternalIdTokenChanged(auth: AuthResultType) {
    this._setAuthState(auth);
    this.emit(this._getAppEventName('onIdTokenChanged'), this._user);
  }

  /**
   * Intercept all user actions and send their results to
   * auth state change before resolving
   * @param promise
   * @returns {Promise.<*>}
   * @private
   */
  _interceptUserValue(promise) {
    return promise.then((result) => {
      if (!result) this._setAuthState(null);
      else if (result.user) this._setAuthState(result);
      else if (result.uid) this._setAuthState({ authenticated: true, user: result });
      return this._user;
    });
  }

  /*
   * WEB API
   */

  /**
   * Listen for auth changes.
   * @param listener
   */
  onAuthStateChanged(listener: Function) {
    this.log.info('Creating onAuthStateChanged listener');
    this.on(this._getAppEventName('onAuthStateChanged'), listener);
    if (this._authResult) listener(this._user || null);
    return this._offAuthStateChanged.bind(this, listener);
  }

  /**
   * Remove auth change listener
   * @param listener
   */
  _offAuthStateChanged(listener: Function) {
    this.log.info('Removing onAuthStateChanged listener');
    this.removeListener(this._getAppEventName('onAuthStateChanged'), listener);
  }

  /**
   * Listen for id token changes.
   * @param listener
   */
  onIdTokenChanged(listener: Function) {
    this.log.info('Creating onIdTokenChanged listener');
    this.on(this._getAppEventName('onIdTokenChanged'), listener);
    if (this._authResult) listener(this._user || null);
    return this._offIdTokenChanged.bind(this, listener);
  }

  /**
   * Remove id token change listener
   * @param listener
   */
  _offIdTokenChanged(listener: Function) {
    this.log.info('Removing onIdTokenChanged listener');
    this.removeListener(this._getAppEventName('onIdTokenChanged'), listener);
  }

  /**
   * Listen for user changes.
   * @param listener
   */
  onUserChanged(listener: Function) {
    this.log.info('Creating onUserChanged listener');
    this.on(this._getAppEventName('onUserChanged'), listener);
    if (this._authResult) listener(this._user || null);
    return this._offUserChanged.bind(this, listener);
  }

  /**
   * Remove user change listener
   * @param listener
   */
  _offUserChanged(listener: Function) {
    this.log.info('Removing onUserChanged listener');
    this.removeListener(this._getAppEventName('onUserChanged'), listener);
  }

  /**
   * Sign the current user out
   * @return {Promise}
   */
  signOut(): Promise<null> {
    return this._interceptUserValue(this._native.signOut());
  }

  /**
   * Sign a user in anonymously
   * @return {Promise} A promise resolved upon completion
   */
  signInAnonymously(): Promise<Object> {
    return this._interceptUserValue(this._native.signInAnonymously());
  }

  /**
   * Create a user with the email/password functionality
   * @param  {string} email    The user's email
   * @param  {string} password The user's password
   * @return {Promise}         A promise indicating the completion
   */
  createUserWithEmailAndPassword(email: string, password: string): Promise<Object> {
    return this._interceptUserValue(this._native.createUserWithEmailAndPassword(email, password));
  }

  /**
   * Sign a user in with email/password
   * @param  {string} email    The user's email
   * @param  {string} password The user's password
   * @return {Promise}         A promise that is resolved upon completion
   */
  signInWithEmailAndPassword(email: string, password: string): Promise<Object> {
    return this._interceptUserValue(this._native.signInWithEmailAndPassword(email, password));
  }

  /**
   * Sign the user in with a custom auth token
   * @param  {string} customToken  A self-signed custom auth token.
   * @return {Promise}             A promise resolved upon completion
   */
  signInWithCustomToken(customToken: string): Promise<Object> {
    return this._interceptUserValue(this._native.signInWithCustomToken(customToken));
  }

  /**
   * Sign the user in with a third-party authentication provider
   * @return {Promise}           A promise resolved upon completion
   */
  signInWithCredential(credential: CredentialType): Promise<Object> {
    return this._interceptUserValue(
      this._native.signInWithCredential(
        credential.providerId, credential.token, credential.secret,
      ),
    );
  }

  /**
   * Asynchronously signs in using a phone number.
   *
   */
  signInWithPhoneNumber(phoneNumber: string): Promise<Object> {
    return this._native.signInWithPhoneNumber(phoneNumber).then((result) => {
      return new ConfirmationResult(this, result.verificationId);
    });
  }

  /**
   * Returns a PhoneAuthListener to listen to phone verification events,
   * on the final completion event a PhoneAuthCredential can be generated for
   * authentication purposes.
   *
   * @param phoneNumber
   * @param autoVerifyTimeout Android Only
   * @returns {PhoneAuthListener}
   */
  verifyPhoneNumber(phoneNumber: string, autoVerifyTimeout?: number): PhoneAuthListener {
    return new PhoneAuthListener(this, phoneNumber, autoVerifyTimeout);
  }

  /**
   * Send reset password instructions via email
   * @param {string} email The email to send password reset instructions
   */
  sendPasswordResetEmail(email: string): Promise<Object> {
    return this._native.sendPasswordResetEmail(email);
  }

  /**
   * Completes the password reset process, given a confirmation code and new password.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#confirmPasswordReset
   * @param code
   * @param newPassword
   * @return {Promise.<Null>}
   */
  confirmPasswordReset(code: string, newPassword: string): Promise<null> {
    return this._native.confirmPasswordReset(code, newPassword);
  }

  /**
   * Applies a verification code sent to the user by email or other out-of-band mechanism.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#applyActionCode
   * @param code
   * @return {Promise.<Null>}
   */
  applyActionCode(code: string): Promise<any> {
    return this._native.applyActionCode(code);
  }

  /**
   * Checks a verification code sent to the user by email or other out-of-band mechanism.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#checkActionCode
   * @param code
   * @return {Promise.<any>|Promise<ActionCodeInfo>}
   */
  checkActionCode(code: string): Promise<any> {
    return this._native.checkActionCode(code);
  }

  /**
   * Get the currently signed in user
   * @return {Promise}
   */
  getCurrentUser(): Promise<Object> {
    return this._interceptUserValue(this._native.getCurrentUser());
  }

  /**
   * Returns a list of authentication providers that can be used to sign in a given user (identified by its main email address).
   * @return {Promise}
   */
  fetchProvidersForEmail(email: string): Promise<Array<String>> {
    return this._native.fetchProvidersForEmail(email);
  }

  /**
   * Get the currently signed in user
   * @return {Promise}
   */
  get currentUser(): User | null {
    return this._user;
  }

  get namespace(): string {
    return 'firebase:auth';
  }

  /**
   * KNOWN UNSUPPORTED METHODS
   */

  getRedirectResult() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(Auth, 'getRedirectResult'));
  }

  setPersistence() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(Auth, 'setPersistence'));
  }

  signInAndRetrieveDataWithCredential() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(Auth, 'signInAndRetrieveDataWithCredential'));
  }

  signInWithPopup() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(Auth, 'signInWithPopup'));
  }

  signInWithRedirect() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(Auth, 'signInWithRedirect'));
  }
}

export const statics = {
  EmailAuthProvider,
  PhoneAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  PhoneAuthState: {
    CODE_SENT: 'sent',
    AUTO_VERIFY_TIMEOUT: 'timeout',
    AUTO_VERIFIED: 'verified',
    ERROR: 'error',
  },
};
