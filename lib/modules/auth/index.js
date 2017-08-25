// @flow
import User from './user';
import ModuleBase from './../../utils/ModuleBase';
import ConfirmationResult from './ConfirmationResult';

// providers
import EmailAuthProvider from './providers/Email';
import GoogleAuthProvider from './providers/Google';
import GithubAuthProvider from './providers/Github';
import TwitterAuthProvider from './providers/Twitter';
import FacebookAuthProvider from './providers/Facebook';
import PhoneAuthProvider from './providers/Phone';

export default class Auth extends ModuleBase {
  static _NAMESPACE = 'auth';
  static _NATIVE_MODULE = 'RNFirebaseAuth';

  _user: User | null;
  _authResult: AuthResultType | null;
  authenticated: boolean;

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, true);
    this._user = null;
    this._authResult = null;
    this.authenticated = false;
    this.addListener(
      // sub to internal native event - this fans out to
      // public event name: onAuthStateChangedPublic
      this._getAppEventName('onAuthStateChanged'),
      this._onAuthStateChanged.bind(this),
    );

    this._native.addAuthStateListener();
  }

  /**
   * Internal auth changed listener
   * @param auth
   * @param emit
   * @private
   */
  _onAuthStateChanged(auth: AuthResultType, emit: boolean = true) {
    this._authResult = auth;
    this.authenticated = auth ? auth.authenticated || false : false;
    if (auth && auth.user && !this._user) this._user = new User(this, auth);
    else if ((!auth || !auth.user) && this._user) this._user = null;
    else if (this._user) this._user._updateValues(auth);
    if (emit) this.emit(this._getAppEventName('onAuthStateChangedPublic'), this._user);
    return auth ? this._user : null;
  }


  /**
   * Remove auth change listener
   * @param listener
   */
  _offAuthStateChanged(listener: Function) {
    this.log.info('Removing onAuthStateChanged listener');
    this.removeListener(this._getAppEventName('onAuthStateChangedPublic'), listener);
  }

  /**
   * Intercept all user actions and send their results to
   * auth state change before resolving
   * @param promise
   * @returns {Promise.<TResult>|*}
   * @private
   */
  _interceptUserValue(promise) {
    return promise.then((result) => {
      if (!result) return this._onAuthStateChanged(null, false);
      if (result.user) return this._onAuthStateChanged(result, false);
      if (result.uid) return this._onAuthStateChanged({ authenticated: true, user: result }, false);
      return result;
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
    this.on(this._getAppEventName('onAuthStateChangedPublic'), listener);
    if (this._authResult) listener(this._user || null);
    return this._offAuthStateChanged.bind(this, listener);
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
        credential.provider, credential.token, credential.secret,
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
  confirmPasswordReset(code: string, newPassword: string): Promise<Null> {
    return FirebaseAuth.confirmPasswordReset(code, newPassword);
  }

  /**
   * Applies a verification code sent to the user by email or other out-of-band mechanism.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#applyActionCode
   * @param code
   * @return {Promise.<Null>}
   */
  applyActionCode(code: string): Promise<Any> {
    return FirebaseAuth.applyActionCode(code);
  }

  /**
   * Checks a verification code sent to the user by email or other out-of-band mechanism.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#checkActionCode
   * @param code
   * @return {Promise.<Any>|Promise<ActionCodeInfo>}
   */
  checkActionCode(code: string): Promise<Any> {
    return FirebaseAuth.checkActionCode(code);
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
}

export const statics = {
  EmailAuthProvider,
  PhoneAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
};
