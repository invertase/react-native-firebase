/**
 * @flow
 * Auth representation wrapper
 */
import User from './User';
import ModuleBase from '../../utils/ModuleBase';
import { getAppEventName, SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import { getNativeModule } from '../../utils/native';
import INTERNALS from '../../utils/internals';
import ConfirmationResult from './ConfirmationResult';

// providers
import EmailAuthProvider from './providers/EmailAuthProvider';
import PhoneAuthProvider from './providers/PhoneAuthProvider';
import GoogleAuthProvider from './providers/GoogleAuthProvider';
import GithubAuthProvider from './providers/GithubAuthProvider';
import TwitterAuthProvider from './providers/TwitterAuthProvider';
import FacebookAuthProvider from './providers/FacebookAuthProvider';

import PhoneAuthListener from './PhoneAuthListener';

import type { ActionCodeSettings, AuthCredential } from '../../types';
import type App from '../core/firebase-app';

type AuthResult = {
  authenticated: boolean,
  user: Object|null
} | null;

const NATIVE_EVENTS = [
  'auth_state_changed',
  'phone_auth_state_changed',
];

export const MODULE_NAME = 'RNFirebaseAuth';
export const NAMESPACE = 'auth';

export default class Auth extends ModuleBase {
  _authResult: AuthResult | null;
  _user: User | null;

  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      namespace: NAMESPACE,
    });
    this._user = null;
    this._authResult = null;

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onAuthStateChanged
      getAppEventName(this, 'auth_state_changed'),
      this._onInternalAuthStateChanged.bind(this),
    );

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public events based on event.type
      getAppEventName(this, 'phone_auth_state_changed'),
      this._onInternalPhoneAuthStateChanged.bind(this),
    );

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onIdTokenChanged
      getAppEventName(this, 'auth_id_token_changed'),
      this._onInternalIdTokenChanged.bind(this),
    );

    getNativeModule(this).addAuthStateListener();
    getNativeModule(this).addIdTokenListener();
  }

  /**
   * Route a phone state change event to the correct listeners
   * @param event
   * @private
   */
  _onInternalPhoneAuthStateChanged(event: Object) {
    const eventKey = `phone:auth:${event.requestKey}:${event.type}`;
    SharedEventEmitter.emit(eventKey, event.state);
  }

  _setAuthState(auth: AuthResult) {
    this._authResult = auth;
    this._user = auth && auth.user ? new User(this, auth.user) : null;
    SharedEventEmitter.emit(getAppEventName(this, 'onUserChanged'), this._user);
  }

  /**
   * Internal auth changed listener
   * @param auth
   * @private
   */
  _onInternalAuthStateChanged(auth: AuthResult) {
    this._setAuthState(auth);
    SharedEventEmitter.emit(getAppEventName(this, 'onAuthStateChanged'), this._user);
  }

  /**
   * Internal auth changed listener
   * @param auth
   * @param emit
   * @private
   */
  _onInternalIdTokenChanged(auth: AuthResult) {
    this._setAuthState(auth);
    SharedEventEmitter.emit(getAppEventName(this, 'onIdTokenChanged'), this._user);
  }

  /**
   * Intercept all user actions and send their results to
   * auth state change before resolving
   * @param promise
   * @returns {Promise.<*>}
   * @private
   */
  _interceptUserValue(promise: Promise<AuthResult>): Promise<User> {
    return promise.then((result: AuthResult) => {
      if (!result) this._setAuthState(null);
      else if (result.user) this._setAuthState(result);
      else if (result.uid) this._setAuthState({ authenticated: true, user: result });
      return this._user;
    });
  }

  _interceptUndefinedUserValue(promise: Promise<AuthResult>): Promise<void> {
    return this._interceptUserValue(promise)
      .then(() => {});
  }

  /*
   * WEB API
   */

  /**
   * Listen for auth changes.
   * @param listener
   */
  onAuthStateChanged(listener: Function) {
    getLogger(this).info('Creating onAuthStateChanged listener');
    SharedEventEmitter.addListener(getAppEventName(this, 'onAuthStateChanged'), listener);
    if (this._authResult) listener(this._user || null);
    return this._offAuthStateChanged.bind(this, listener);
  }

  /**
   * Remove auth change listener
   * @param listener
   */
  _offAuthStateChanged(listener: Function) {
    getLogger(this).info('Removing onAuthStateChanged listener');
    SharedEventEmitter.removeListener(getAppEventName(this, 'onAuthStateChanged'), listener);
  }

  /**
   * Listen for id token changes.
   * @param listener
   */
  onIdTokenChanged(listener: Function) {
    getLogger(this).info('Creating onIdTokenChanged listener');
    SharedEventEmitter.addListener(getAppEventName(this, 'onIdTokenChanged'), listener);
    if (this._authResult) listener(this._user || null);
    return this._offIdTokenChanged.bind(this, listener);
  }

  /**
   * Remove id token change listener
   * @param listener
   */
  _offIdTokenChanged(listener: Function) {
    getLogger(this).info('Removing onIdTokenChanged listener');
    SharedEventEmitter.removeListener(getAppEventName(this, 'onIdTokenChanged'), listener);
  }

  /**
   * Listen for user changes.
   * @param listener
   */
  onUserChanged(listener: Function) {
    getLogger(this).info('Creating onUserChanged listener');
    SharedEventEmitter.addListener(getAppEventName(this, 'onUserChanged'), listener);
    if (this._authResult) listener(this._user || null);
    return this._offUserChanged.bind(this, listener);
  }

  /**
   * Remove user change listener
   * @param listener
   */
  _offUserChanged(listener: Function) {
    getLogger(this).info('Removing onUserChanged listener');
    SharedEventEmitter.removeListener(getAppEventName(this, 'onUserChanged'), listener);
  }

  /**
   * Sign the current user out
   * @return {Promise}
   */
  signOut(): Promise<void> {
    return this._interceptUndefinedUserValue(getNativeModule(this).signOut());
  }

  /**
   * Sign a user in anonymously
   * @return {Promise} A promise resolved upon completion
   */
  signInAnonymously(): Promise<User> {
    return this._interceptUserValue(getNativeModule(this).signInAnonymously());
  }

  /**
   * Create a user with the email/password functionality
   * @param  {string} email    The user's email
   * @param  {string} password The user's password
   * @return {Promise}         A promise indicating the completion
   */
  createUserWithEmailAndPassword(email: string, password: string): Promise<User> {
    return this._interceptUserValue(getNativeModule(this).createUserWithEmailAndPassword(email, password));
  }

  /**
   * Sign a user in with email/password
   * @param  {string} email    The user's email
   * @param  {string} password The user's password
   * @return {Promise}         A promise that is resolved upon completion
   */
  signInWithEmailAndPassword(email: string, password: string): Promise<User> {
    return this._interceptUserValue(getNativeModule(this).signInWithEmailAndPassword(email, password));
  }

  /**
   * Sign the user in with a custom auth token
   * @param  {string} customToken  A self-signed custom auth token.
   * @return {Promise}             A promise resolved upon completion
   */
  signInWithCustomToken(customToken: string): Promise<User> {
    return this._interceptUserValue(getNativeModule(this).signInWithCustomToken(customToken));
  }

  /**
   * Sign the user in with a third-party authentication provider
   * @return {Promise}           A promise resolved upon completion
   */
  signInWithCredential(credential: AuthCredential): Promise<User> {
    return this._interceptUserValue(
      getNativeModule(this).signInWithCredential(
        credential.providerId, credential.token, credential.secret,
      ),
    );
  }

  /**
   * Asynchronously signs in using a phone number.
   *
   */
  signInWithPhoneNumber(phoneNumber: string): Promise<ConfirmationResult> {
    return getNativeModule(this).signInWithPhoneNumber(phoneNumber).then((result) => {
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
  sendPasswordResetEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void> {
    return getNativeModule(this).sendPasswordResetEmail(email, actionCodeSettings);
  }

  /**
   * Completes the password reset process, given a confirmation code and new password.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#confirmPasswordReset
   * @param code
   * @param newPassword
   * @return {Promise.<Null>}
   */
  confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    return getNativeModule(this).confirmPasswordReset(code, newPassword);
  }

  /**
   * Applies a verification code sent to the user by email or other out-of-band mechanism.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#applyActionCode
   * @param code
   * @return {Promise.<Null>}
   */
  applyActionCode(code: string): Promise<void> {
    return getNativeModule(this).applyActionCode(code);
  }

  /**
   * Checks a verification code sent to the user by email or other out-of-band mechanism.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#checkActionCode
   * @param code
   * @return {Promise.<any>|Promise<ActionCodeInfo>}
   */
  checkActionCode(code: string): Promise<void> {
    return getNativeModule(this).checkActionCode(code);
  }

  /**
   * Get the currently signed in user
   * @return {Promise}
   */
  getCurrentUser(): Promise<User | null> {
    return this._interceptUserValue(getNativeModule(this).getCurrentUser());
  }

  /**
   * Returns a list of authentication providers that can be used to sign in a given user (identified by its main email address).
   * @return {Promise}
   */
  fetchProvidersForEmail(email: string): Promise<Array<String>> {
    return getNativeModule(this).fetchProvidersForEmail(email);
  }

  /**
   * Get the currently signed in user
   * @return {Promise}
   */
  get currentUser(): User | null {
    return this._user;
  }

  /**
   * KNOWN UNSUPPORTED METHODS
   */

  getRedirectResult() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD('auth', 'getRedirectResult'));
  }

  setPersistence() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD('auth', 'setPersistence'));
  }

  signInAndRetrieveDataWithCredential() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD('auth', 'signInAndRetrieveDataWithCredential'));
  }

  signInWithPopup() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD('auth', 'signInWithPopup'));
  }

  signInWithRedirect() {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD('auth', 'signInWithRedirect'));
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
