import User from './User';
export interface ActionCodeSettings {
    android: {
        installApp?: boolean;
        minimumVersion?: string;
        packageName: string;
    };
    handleCodeInApp?: boolean;
    iOS: {
        bundleId?: string;
    };
    url: string;
    [key: string]: any;
}
export declare type AdditionalUserInfo = {
    isNewUser: boolean;
    profile?: Object;
    providerId: string;
    username?: string;
    [key: string]: any;
};
export interface AuthCredential {
    providerId: string;
    token: string;
    secret: string;
    [key: string]: any;
}
export interface UserCredential {
    additionalUserInfo?: AdditionalUserInfo;
    user: User;
}
export interface UserInfo {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    providerId: string;
    uid: string;
    [key: string]: any;
}
export interface UserMetadata {
    creationTime?: string;
    lastSignInTime?: string;
    [key: string]: any;
}
export interface NativeUser {
    displayName?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    metadata: UserMetadata;
    phoneNumber?: string;
    photoURL?: string;
    providerData: UserInfo[];
    providerId: string;
    uid: string;
    [key: string]: any;
}
export interface NativeUserCredential {
    additionalUserInfo?: AdditionalUserInfo;
    user: NativeUser;
}
