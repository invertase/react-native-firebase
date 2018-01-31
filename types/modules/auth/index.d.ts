/**
 * @flow
 * Auth representation wrapper
 */
import User from './User';
import ModuleBase from '../../utils/ModuleBase';
import ConfirmationResult from './ConfirmationResult';
import EmailAuthProvider from './providers/EmailAuthProvider';
import PhoneAuthProvider from './providers/PhoneAuthProvider';
import GoogleAuthProvider from './providers/GoogleAuthProvider';
import GithubAuthProvider from './providers/GithubAuthProvider';
import OAuthProvider from './providers/OAuthProvider';
import TwitterAuthProvider from './providers/TwitterAuthProvider';
import FacebookAuthProvider from './providers/FacebookAuthProvider';
import PhoneAuthListener from './PhoneAuthListener';
import { ActionCodeSettings, AuthCredential, NativeUser, NativeUserCredential, UserCredential } from './types';
import App from '../core/firebase-app';
export interface AuthState {
    user?: NativeUser;
    [key: string]: any;
}
export interface ActionCodeInfo {
    data: {
        email?: string;
        fromEmail?: string;
    };
    operation: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'RECOVER_EMAIL';
    [key: string]: any;
}
export interface CustomError {
    requestKey: string;
    type: string;
    state: any;
}
export declare type UserListenerFn = (user?: User) => void;
export declare const MODULE_NAME = "RNFirebaseAuth";
export default class Auth extends ModuleBase {
    static NAMESPACE: string;
    private _authResult;
    private _languageCode;
    private _user?;
    constructor(app: App);
    /** @private */
    _setUser(user?: NativeUser): User | null;
    /** @private */
    _setUserCredential(userCredential: NativeUserCredential): UserCredential;
    /**
     * Listen for auth changes.
     * @param listener
     */
    onAuthStateChanged(listener: UserListenerFn): () => void;
    /**
     * Listen for id token changes.
     * @param listener
     */
    onIdTokenChanged(listener: UserListenerFn): () => void;
    /**
     * Listen for user changes.
     * @param listener
     */
    onUserChanged(listener: UserListenerFn): () => void;
    /**
     * Sign the current user out
     * @return {Promise}
     */
    signOut(): Promise<void>;
    /**
     * Sign a user in anonymously
     * @deprecated Deprecated signInAnonymously in favor of signInAnonymouslyAndRetrieveData.
     * @return {Promise} A promise resolved upon completion
     */
    signInAnonymously(): Promise<User>;
    /**
     * Sign a user in anonymously
     * @return {Promise} A promise resolved upon completion
     */
    signInAnonymouslyAndRetrieveData(): Promise<UserCredential>;
    /**
     * Create a user with the email/password functionality
     * @deprecated Deprecated createUserWithEmailAndPassword in favor of createUserAndRetrieveDataWithEmailAndPassword.
     * @param  {string} email    The user's email
     * @param  {string} password The user's password
     * @return {Promise}         A promise indicating the completion
     */
    createUserWithEmailAndPassword(email: string, password: string): Promise<User>;
    /**
     * Create a user with the email/password functionality
     * @param  {string} email    The user's email
     * @param  {string} password The user's password
     * @return {Promise}         A promise indicating the completion
     */
    createUserAndRetrieveDataWithEmailAndPassword(email: string, password: string): Promise<User>;
    /**
     * Sign a user in with email/password
     * @deprecated Deprecated signInWithEmailAndPassword in favor of signInAndRetrieveDataWithEmailAndPassword
     * @param  {string} email    The user's email
     * @param  {string} password The user's password
     * @return {Promise}         A promise that is resolved upon completion
     */
    signInWithEmailAndPassword(email: string, password: string): Promise<User>;
    /**
     * Sign a user in with email/password
     * @param  {string} email    The user's email
     * @param  {string} password The user's password
     * @return {Promise}         A promise that is resolved upon completion
     */
    signInAndRetrieveDataWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    /**
     * Sign the user in with a custom auth token
     * @deprecated Deprecated signInWithCustomToken in favor of signInAndRetrieveDataWithCustomToken
     * @param  {string} customToken  A self-signed custom auth token.
     * @return {Promise}             A promise resolved upon completion
     */
    signInWithCustomToken(customToken: string): Promise<User>;
    /**
     * Sign the user in with a custom auth token
     * @param  {string} customToken  A self-signed custom auth token.
     * @return {Promise}             A promise resolved upon completion
     */
    signInAndRetrieveDataWithCustomToken(customToken: string): Promise<UserCredential>;
    /**
     * Sign the user in with a third-party authentication provider
     * @deprecated Deprecated signInWithCredential in favor of signInAndRetrieveDataWithCredential.
     * @return {Promise}           A promise resolved upon completion
     */
    signInWithCredential(credential: AuthCredential): Promise<User>;
    /**
     * Sign the user in with a third-party authentication provider
     * @return {Promise}           A promise resolved upon completion
     */
    signInAndRetrieveDataWithCredential(credential: AuthCredential): Promise<UserCredential>;
    /**
     * Asynchronously signs in using a phone number.
     *
     */
    signInWithPhoneNumber(phoneNumber: string): Promise<ConfirmationResult>;
    /**
     * Returns a PhoneAuthListener to listen to phone verification events,
     * on the final completion event a PhoneAuthCredential can be generated for
     * authentication purposes.
     *
     * @param phoneNumber
     * @param autoVerifyTimeout Android Only
     * @returns {PhoneAuthListener}
     */
    verifyPhoneNumber(phoneNumber: string, autoVerifyTimeout?: number): PhoneAuthListener;
    /**
     * Send reset password instructions via email
     * @param {string} email The email to send password reset instructions
     */
    sendPasswordResetEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
    /**
     * Completes the password reset process, given a confirmation code and new password.
     *
     * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#confirmPasswordReset
     * @param code
     * @param newPassword
     * @return {Promise.<Null>}
     */
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;
    /**
     * Applies a verification code sent to the user by email or other out-of-band mechanism.
     *
     * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#applyActionCode
     * @param code
     * @return {Promise.<Null>}
     */
    applyActionCode(code: string): Promise<void>;
    /**
     * Checks a verification code sent to the user by email or other out-of-band mechanism.
     *
     * @link https://firebase.google.com/docs/reference/js/firebase.auth.Auth#checkActionCode
     * @param code
     * @return {Promise.<any>|Promise<ActionCodeInfo>}
     */
    checkActionCode(code: string): Promise<ActionCodeInfo>;
    /**
     * Returns a list of authentication providers that can be used to sign in a given user (identified by its main email address).
     * @return {Promise}
     */
    fetchProvidersForEmail(email: string): Promise<string[]>;
    verifyPasswordResetCode(code: string): Promise<string>;
    /**
     * Sets the language for the auth module
     * @param code
     * @returns {*}
     */
    languageCode: string;
    /**
     * Get the currently signed in user
     * @return {Promise}
     */
    readonly currentUser: User | null;
    /**
     * KNOWN UNSUPPORTED METHODS
     */
    getRedirectResult(): void;
    setPersistence(): void;
    signInWithPopup(): void;
    signInWithRedirect(): void;
    useDeviceLanguage(): void;
}
export declare const statics: {
    EmailAuthProvider: typeof EmailAuthProvider;
    PhoneAuthProvider: typeof PhoneAuthProvider;
    GoogleAuthProvider: typeof GoogleAuthProvider;
    GithubAuthProvider: typeof GithubAuthProvider;
    TwitterAuthProvider: typeof TwitterAuthProvider;
    FacebookAuthProvider: typeof FacebookAuthProvider;
    OAuthProvider: typeof OAuthProvider;
    PhoneAuthState: {
        CODE_SENT: string;
        AUTO_VERIFY_TIMEOUT: string;
        AUTO_VERIFIED: string;
        ERROR: string;
    };
};
