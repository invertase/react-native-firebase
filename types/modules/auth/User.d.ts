import Auth from './';
import { ActionCodeSettings, AuthCredential, NativeUser, UserCredential, UserMetadata } from './types';
export declare type UserInfo = {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    providerId: string;
    uid: string;
    [key: string]: any;
};
export declare type UpdateProfile = {
    displayName?: string;
    photoURL?: string;
    [key: string]: any;
};
export default class User {
    _auth: Auth;
    _user: NativeUser;
    /**
     *
     * @param auth Instance of Authentication class
     * @param user user result object from native
     */
    constructor(auth: Auth, user: NativeUser);
    /**
     * PROPERTIES
     */
    readonly displayName: string | null;
    readonly email: string | null;
    readonly emailVerified: boolean;
    readonly isAnonymous: boolean;
    readonly metadata: UserMetadata;
    readonly phoneNumber: string | null;
    readonly photoURL: string | null;
    readonly providerData: UserInfo[];
    readonly providerId: string;
    readonly uid: string;
    /**
     * METHODS
     */
    /**
     * Delete the current user
     * @return {Promise}
     */
    delete(): Promise<void>;
    /**
     * get the token of current user
     * @return {Promise}
     */
    getIdToken(forceRefresh?: boolean): Promise<string>;
    /**
     * get the token of current user
     * @deprecated Deprecated getToken in favor of getIdToken.
     * @return {Promise}
     */
    getToken(forceRefresh?: boolean): Promise<any>;
    /**
     * @deprecated Deprecated linkWithCredential in favor of linkAndRetrieveDataWithCredential.
     * @param credential
     */
    linkWithCredential(credential: AuthCredential): Promise<User>;
    /**
     *
     * @param credential
     */
    linkAndRetrieveDataWithCredential(credential: AuthCredential): Promise<UserCredential>;
    /**
     * Re-authenticate a user with a third-party authentication provider
     * @return {Promise}         A promise resolved upon completion
     */
    reauthenticateWithCredential(credential: AuthCredential): Promise<void>;
    /**
     * Re-authenticate a user with a third-party authentication provider
     * @return {Promise}         A promise resolved upon completion
     */
    reauthenticateAndRetrieveDataWithCredential(credential: AuthCredential): Promise<UserCredential>;
    /**
     * Reload the current user
     * @return {Promise}
     */
    reload(): Promise<void>;
    /**
     * Send verification email to current user.
     */
    sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void>;
    toJSON(): Object;
    /**
     *
     * @param providerId
     * @return {Promise.<TResult>|*}
     */
    unlink(providerId: string): Promise<User>;
    /**
     * Update the current user's email
     *
     * @param  {string} email The user's _new_ email
     * @return {Promise}       A promise resolved upon completion
     */
    updateEmail(email: string): Promise<void>;
    /**
     * Update the current user's password
     * @param  {string} password the new password
     * @return {Promise}
     */
    updatePassword(password: string): Promise<void>;
    /**
     * Update the current user's profile
     * @param  {Object} updates An object containing the keys listed [here](https://firebase.google.com/docs/auth/ios/manage-users#update_a_users_profile)
     * @return {Promise}
     */
    updateProfile(updates?: UpdateProfile): Promise<void>;
    /**
     * KNOWN UNSUPPORTED METHODS
     */
    linkWithPhoneNumber(): void;
    linkWithPopup(): void;
    linkWithRedirect(): void;
    reauthenticateWithPhoneNumber(): void;
    reauthenticateWithPopup(): void;
    reauthenticateWithRedirect(): void;
    updatePhoneNumber(): void;
    readonly refreshToken: string;
}
