// @flow
import { NativeModules, NativeEventEmitter } from 'react-native';

import User from './user';
import { Base } from './../base';
import EmailAuthProvider from './Email';
import { promisify } from './../../utils';

const FirebaseAuth = NativeModules.RNFirebaseAuth;
const FirebaseAuthEvt = new NativeEventEmitter(FirebaseAuth);

// TODO move user methods to user class
export default class Auth extends Base {
  _user: User|null;
  _authResult: AuthResultType | null;
  authenticated: boolean;

  constructor(firebase: Object, options: Object = {}) {
    super(firebase, options);
    this._user = null;
    this._authResult = null;
    this.authenticated = false;

    // attach auth providers
    // TODO add missing providers
    this.EmailAuthProvider = EmailAuthProvider;
    // start listening straight away
    // generally though the initial event fired will get ignored
    // but this is ok as we fake it with the getCurrentUser below
    FirebaseAuthEvt.addListener('onAuthStateChanged', this._onAuthStateChanged.bind(this));
    FirebaseAuth.addAuthStateListener();
  }

  /**
   * Internal auth changed listener
   * @param auth
   * @param emit
   * @private
   */
  _onAuthStateChanged(auth: AuthResultType, emit: Boolean = true) {
    this._authResult = auth;
    this.authenticated = auth ? auth.authenticated || false : false;
    if (auth && auth.user && !this._user) this._user = new User(this, auth);
    else if ((!auth || !auth.user) && this._user) this._user = null;
    else if (this._user) this._user._updateValues(auth);
    if (emit) this.emit('onAuthStateChanged', this._authResult.user || null);
    return auth ? this._user : null;
  }


  /**
   * Remove auth change listener
   * @param listener
   */
  _offAuthStateChanged(listener: Function) {
    this.log.info('Removing onAuthStateChanged listener');
    this.removeListener('onAuthStateChanged', listener);
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
      if (result.uid) return this._onAuthStateChanged({ user: result }, false);
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
    this.on('onAuthStateChanged', listener);
    if (this._authResult) listener(this._authResult.user || null);
    return this._offAuthStateChanged.bind(this, listener);
  }

  /**
   * Sign the current user out
   * @return {Promise}
   */
  signOut(): Promise<null> {
    return this._interceptUserValue(FirebaseAuth.signOut());
  }

  /**
   * Sign a user in anonymously
   * @return {Promise} A promise resolved upon completion
   */
  signInAnonymously(): Promise<Object> {
    return this._interceptUserValue(FirebaseAuth.signInAnonymously());
  }

  /**
   * Create a user with the email/password functionality
   * @param  {string} email    The user's email
   * @param  {string} password The user's password
   * @return {Promise}         A promise indicating the completion
   */
  createUserWithEmailAndPassword(email: string, password: string): Promise<Object> {
    return this._interceptUserValue(FirebaseAuth.createUserWithEmailAndPassword(email, password));
  }

  /**
   * Sign a user in with email/password
   * @param  {string} email    The user's email
   * @param  {string} password The user's password
   * @return {Promise}         A promise that is resolved upon completion
   */
  signInWithEmailAndPassword(email: string, password: string): Promise<Object> {
    return this._interceptUserValue(FirebaseAuth.signInWithEmailAndPassword(email, password));
  }

  /**
   * Sign the user in with a custom auth token
   * @param  {string} customToken  A self-signed custom auth token.
   * @return {Promise}             A promise resolved upon completion
   */
  signInWithCustomToken(customToken: string): Promise<Object> {
    return this._interceptUserValue(FirebaseAuth.signInWithCustomToken(customToken));
  }

  /**
   * Sign the user in with a third-party authentication provider
   * @return {Promise}           A promise resolved upon completion
   */
  signInWithCredential(credential: CredentialType): Promise<Object> {
    return this._interceptUserValue(FirebaseAuth.signInWithCredential(credential.provider, credential.token, credential.secret));
  }

  /**
   * Send reset password instructions via email
   * @param {string} email The email to send password reset instructions
   */
  sendPasswordResetEmail(email: string): Promise<Object> {
    return promisify('sendPasswordResetWithEmail', FirebaseAuth, 'auth/')(email);
  }

  /**
   * Get the currently signed in user
   * @return {Promise}
   */
  getCurrentUser(): Promise<Object> {
    return promisify('getCurrentUser', FirebaseAuth, 'auth/')();
  }

  /**
   * Get the currently signed in user
   * @return {Promise}
   */
  get currentUser(): User|null {
    return this._user;
  }

  get namespace(): string {
    return 'firebase:auth';
  }
}
