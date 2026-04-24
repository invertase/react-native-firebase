/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  createDeprecationProxy,
  isAndroid,
  isBoolean,
  isNull,
  isOther,
  isString,
  isValidUrl,
  parseListenerOrObserver,
} from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import {
  FirebaseModule,
  createModuleNamespace,
  getFirebaseRoot,
  type ModuleConfig,
} from '@react-native-firebase/app/dist/module/internal';
import ConfirmationResult from './ConfirmationResult';
import { PhoneAuthState } from './PhoneAuthState';
import PhoneAuthListener from './PhoneAuthListener';
import PhoneMultiFactorGenerator from './PhoneMultiFactorGenerator';
import TotpMultiFactorGenerator from './TotpMultiFactorGenerator';
import Settings from './Settings';
import User from './User';
import { getMultiFactorResolver } from './getMultiFactorResolver';
import { MultiFactorUser, multiFactor } from './multiFactor';
import AppleAuthProvider from './providers/AppleAuthProvider';
import EmailAuthProvider from './providers/EmailAuthProvider';
import FacebookAuthProvider from './providers/FacebookAuthProvider';
import GithubAuthProvider from './providers/GithubAuthProvider';
import GoogleAuthProvider from './providers/GoogleAuthProvider';
import OAuthProvider from './providers/OAuthProvider';
import OIDCAuthProvider from './providers/OIDCAuthProvider';
import PhoneAuthProvider from './providers/PhoneAuthProvider';
import TwitterAuthProvider from './providers/TwitterAuthProvider';
import { version } from './version';
import fallBackModule from './web/RNFBAuthModule';
import { PasswordPolicyMixin } from './password-policy/PasswordPolicyMixin';
import type { CallbackOrObserver, FirebaseAuthTypes } from './types/namespaced';
import type {
  AuthIdTokenChangedEventInternal,
  AuthInternal,
  AuthStateChangedEventInternal,
  NativePhoneAuthCredentialInternal,
  NativeUserCredentialInternal,
  NativeUserInternal,
  PasswordPolicyInternal,
  PasswordValidationStatusInternal,
  PhoneAuthStateChangedEventInternal,
} from './types/internal';

type AuthProviderWithObjectInternal = FirebaseAuthTypes.AuthProvider & {
  toObject(): Record<string, unknown>;
};

type AuthErrorWithCodeInternal = Error & {
  code?: string;
};

const nativeEvents = ['auth_state_changed', 'auth_id_token_changed', 'phone_auth_state_changed'];

const statics = {
  AppleAuthProvider,
  EmailAuthProvider,
  PhoneAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  OAuthProvider,
  OIDCAuthProvider,
  PhoneAuthState,
  getMultiFactorResolver,
  multiFactor,
};

const namespace = 'auth';
const nativeModuleName = 'RNFBAuthModule';

class FirebaseAuthModule extends FirebaseModule<typeof nativeModuleName> {
  _user: FirebaseAuthTypes.User | null;
  _settings: FirebaseAuthTypes.AuthSettings | null;
  _authResult: boolean;
  _languageCode: string;
  _tenantId: string | null;
  _projectPasswordPolicy: PasswordPolicyInternal | null;
  _tenantPasswordPolicies: Record<string, PasswordPolicyInternal | null>;
  _getPasswordPolicyInternal!: () => PasswordPolicyInternal | null;
  _updatePasswordPolicy!: () => Promise<void>;
  _recachePasswordPolicy!: () => Promise<void>;
  validatePassword!: (password: string) => Promise<PasswordValidationStatusInternal>;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._user = null;
    this._settings = null;
    this._authResult = false;
    this._languageCode = this.native.APP_LANGUAGE[this.app.name] ?? '';
    this._tenantId = null;
    this._projectPasswordPolicy = null;
    this._tenantPasswordPolicies = {};

    if (!this.languageCode) {
      this._languageCode = this.native.APP_LANGUAGE['[DEFAULT]'] ?? '';
    }

    const initialUser = this.native.APP_USER[this.app.name];
    if (initialUser) {
      this._setUser(initialUser);
    }

    this.emitter.addListener(this.eventNameForApp('auth_state_changed'), event => {
      const authEvent = event as AuthStateChangedEventInternal;
      this._setUser(authEvent.user);
      this.emitter.emit(this.eventNameForApp('onAuthStateChanged'), this._user);
    });

    this.emitter.addListener(this.eventNameForApp('phone_auth_state_changed'), event => {
      const phoneAuthEvent = event as PhoneAuthStateChangedEventInternal;
      const eventKey = `phone:auth:${phoneAuthEvent.requestKey}:${phoneAuthEvent.type}`;
      this.emitter.emit(eventKey, phoneAuthEvent.state);
    });

    this.emitter.addListener(this.eventNameForApp('auth_id_token_changed'), event => {
      const authEvent = event as AuthIdTokenChangedEventInternal;
      this._setUser(authEvent.user);
      this.emitter.emit(this.eventNameForApp('onIdTokenChanged'), this._user);
    });

    this.native.addAuthStateListener();
    this.native.addIdTokenListener();

    // custom authDomain in only available from App's FirebaseOptions,
    // but we need it in Auth if it exists. During app configuration we store
    // mappings from app name to authDomain, this auth constructor
    // is a reasonable time to use the mapping and set it into auth natively
    if (!isOther) {
      // Only supported on native platforms
      this.native.configureAuthDomain();
    }
  }

  get languageCode(): string {
    return this._languageCode;
  }

  set languageCode(code: string | null) {
    // For modular API, not recommended to set languageCode directly as it should be set in the native SDKs first
    if (!isString(code) && !isNull(code)) {
      throw new Error(
        "firebase.auth().languageCode = (*) expected 'languageCode' to be a string or null value",
      );
    }
    // as this is a setter, we can't use async/await. So we set it first so it is available immediately
    if (code === null) {
      this._languageCode = this.native.APP_LANGUAGE[this.app.name] ?? '';

      if (!this.languageCode) {
        this._languageCode = this.native.APP_LANGUAGE['[DEFAULT]'] ?? '';
      }
    } else {
      this._languageCode = code;
    }
    // This sets it natively
    void this.setLanguageCode(code);
  }

  get config(): Record<string, never> {
    // for modular API, firebase JS SDK has a config object which is not available in native SDKs
    return {};
  }

  get tenantId(): string | null {
    return this._tenantId;
  }

  get settings(): FirebaseAuthTypes.AuthSettings {
    if (!this._settings) {
      this._settings = new Settings(
        this as unknown as AuthInternal,
      ) as FirebaseAuthTypes.AuthSettings;
    }
    return this._settings;
  }

  get currentUser(): FirebaseAuthTypes.User | null {
    return this._user;
  }

  _setUser(user?: NativeUserInternal | null): FirebaseAuthTypes.User | null {
    this._user = user
      ? (createDeprecationProxy(
          new User(this as unknown as AuthInternal, user),
        ) as FirebaseAuthTypes.User)
      : null;
    this._authResult = true;
    this.emitter.emit(this.eventNameForApp('onUserChanged'), this._user);
    return this._user;
  }

  _setUserCredential(
    userCredential: NativeUserCredentialInternal,
  ): FirebaseAuthTypes.UserCredential {
    const user = createDeprecationProxy(
      new User(this as unknown as AuthInternal, userCredential.user),
    ) as FirebaseAuthTypes.User;
    this._user = user;
    this._authResult = true;
    this.emitter.emit(this.eventNameForApp('onUserChanged'), this._user);
    return {
      additionalUserInfo: userCredential.additionalUserInfo,
      user,
    };
  }

  async setLanguageCode(code: string | null): Promise<void> {
    if (!isString(code) && !isNull(code)) {
      throw new Error(
        "firebase.auth().setLanguageCode(*) expected 'languageCode' to be a string or null value",
      );
    }

    await this.native.setLanguageCode(code);

    if (code === null) {
      this._languageCode = this.native.APP_LANGUAGE[this.app.name] ?? '';

      if (!this.languageCode) {
        this._languageCode = this.native.APP_LANGUAGE['[DEFAULT]'] ?? '';
      }
    } else {
      this._languageCode = code;
    }
  }

  async setTenantId(tenantId: string): Promise<void> {
    if (!isString(tenantId)) {
      throw new Error("firebase.auth().setTenantId(*) expected 'tenantId' to be a string");
    }
    this._tenantId = tenantId;
    await this.native.setTenantId(tenantId);
  }

  onAuthStateChanged(
    listenerOrObserver: CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>,
  ): () => void {
    const listener = parseListenerOrObserver(
      listenerOrObserver,
    ) as FirebaseAuthTypes.AuthListenerCallback;
    const subscription = this.emitter.addListener(
      this.eventNameForApp('onAuthStateChanged'),
      listener,
    );

    if (this._authResult) {
      Promise.resolve().then(() => {
        listener(this._user || null);
      });
    }
    return () => subscription.remove();
  }

  onIdTokenChanged(
    listenerOrObserver: CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>,
  ): () => void {
    const listener = parseListenerOrObserver(
      listenerOrObserver,
    ) as FirebaseAuthTypes.AuthListenerCallback;
    const subscription = this.emitter.addListener(
      this.eventNameForApp('onIdTokenChanged'),
      listener,
    );

    if (this._authResult) {
      Promise.resolve().then(() => {
        listener(this._user || null);
      });
    }
    return () => subscription.remove();
  }

  onUserChanged(
    listenerOrObserver: CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>,
  ): () => void {
    const listener = parseListenerOrObserver(
      listenerOrObserver,
    ) as FirebaseAuthTypes.AuthListenerCallback;
    const subscription = this.emitter.addListener(this.eventNameForApp('onUserChanged'), listener);
    if (this._authResult) {
      Promise.resolve().then(() => {
        listener(this._user || null);
      });
    }

    return () => {
      subscription.remove();
    };
  }

  signOut(): Promise<void> {
    return this.native.signOut().then(() => {
      this._setUser(null);
    });
  }

  signInAnonymously(): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .signInAnonymously()
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  signInWithPhoneNumber(
    phoneNumber: string,
    forceResend?: boolean,
  ): Promise<FirebaseAuthTypes.ConfirmationResult> {
    if (isAndroid) {
      return this.native
        .signInWithPhoneNumber(phoneNumber, forceResend || false)
        .then(
          (result: NativePhoneAuthCredentialInternal) =>
            new ConfirmationResult(this as unknown as AuthInternal, result.verificationId),
        );
    }

    return this.native
      .signInWithPhoneNumber(phoneNumber)
      .then(
        (result: NativePhoneAuthCredentialInternal) =>
          new ConfirmationResult(this as unknown as AuthInternal, result.verificationId),
      );
  }

  verifyPhoneNumber(
    phoneNumber: string,
    autoVerifyTimeoutOrForceResend?: number | boolean,
    forceResend?: boolean,
  ): FirebaseAuthTypes.PhoneAuthListener {
    let _forceResend = forceResend;
    let _autoVerifyTimeout: number | undefined = 60;

    if (isBoolean(autoVerifyTimeoutOrForceResend)) {
      _forceResend = autoVerifyTimeoutOrForceResend;
    } else {
      _autoVerifyTimeout = autoVerifyTimeoutOrForceResend;
    }

    return new PhoneAuthListener(
      this as unknown as AuthInternal,
      phoneNumber,
      _autoVerifyTimeout,
      _forceResend,
    ) as FirebaseAuthTypes.PhoneAuthListener;
  }

  verifyPhoneNumberWithMultiFactorInfo(
    multiFactorHint: FirebaseAuthTypes.MultiFactorInfo,
    session: FirebaseAuthTypes.MultiFactorSession,
  ): Promise<string> {
    return this.native.verifyPhoneNumberWithMultiFactorInfo(multiFactorHint.uid, session);
  }

  verifyPhoneNumberForMultiFactor(
    phoneInfoOptions: FirebaseAuthTypes.PhoneMultiFactorEnrollInfoOptions,
  ): Promise<string> {
    const { phoneNumber, session } = phoneInfoOptions;
    return this.native.verifyPhoneNumberForMultiFactor(phoneNumber, session);
  }

  resolveMultiFactorSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    verificationId: string,
    verificationCode: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .resolveMultiFactorSignIn(session, verificationId, verificationCode)
      .then((userCredential: NativeUserCredentialInternal) => {
        return this._setUserCredential(userCredential);
      });
  }

  resolveTotpSignIn(
    session: FirebaseAuthTypes.MultiFactorSession,
    uid: string,
    totpSecret: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .resolveTotpSignIn(session, uid, totpSecret)
      .then((userCredential: NativeUserCredentialInternal) => {
        return this._setUserCredential(userCredential);
      });
  }

  createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return (
      this.native
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential: NativeUserCredentialInternal) =>
          this._setUserCredential(userCredential),
        )
        /* istanbul ignore next - native error handling cannot be unit tested */
        .catch((error: AuthErrorWithCodeInternal) => {
          if (error.code === 'auth/password-does-not-meet-requirements') {
            return this._recachePasswordPolicy()
              .catch(() => {
                // Silently ignore recache failures - the original error matters more
              })
              .then(() => {
                throw error;
              });
          }
          throw error;
        })
    );
  }

  signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return (
      this.native
        .signInWithEmailAndPassword(email, password)
        .then((userCredential: NativeUserCredentialInternal) =>
          this._setUserCredential(userCredential),
        )
        /* istanbul ignore next - native error handling cannot be unit tested */
        .catch((error: AuthErrorWithCodeInternal) => {
          if (error.code === 'auth/password-does-not-meet-requirements') {
            return this._recachePasswordPolicy()
              .catch(() => {
                // Silently ignore recache failures - the original error matters more
              })
              .then(() => {
                throw error;
              });
          }
          throw error;
        })
    );
  }

  signInWithCustomToken(customToken: string): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .signInWithCustomToken(customToken)
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  signInWithCredential(
    credential: FirebaseAuthTypes.AuthCredential,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .signInWithCredential(credential.providerId, credential.token, credential.secret)
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  revokeToken(authorizationCode: string): Promise<void> {
    return this.native.revokeToken(authorizationCode);
  }

  sendPasswordResetEmail(
    email: string,
    actionCodeSettings: FirebaseAuthTypes.ActionCodeSettings | null = null,
  ): Promise<void> {
    return this.native.sendPasswordResetEmail(email, actionCodeSettings);
  }

  sendSignInLinkToEmail(
    email: string,
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
  ): Promise<void> {
    return this.native.sendSignInLinkToEmail(email, actionCodeSettings);
  }

  isSignInWithEmailLink(emailLink: string): Promise<boolean> {
    return this.native.isSignInWithEmailLink(emailLink);
  }

  signInWithEmailLink(email: string, emailLink: string): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .signInWithEmailLink(email, emailLink)
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    return (
      this.native
        .confirmPasswordReset(code, newPassword)
        /* istanbul ignore next - native error handling cannot be unit tested */
        .catch((error: AuthErrorWithCodeInternal) => {
          if (error.code === 'auth/password-does-not-meet-requirements') {
            return this._recachePasswordPolicy()
              .catch(() => {
                // Silently ignore recache failures - the original error matters more
              })
              .then(() => {
                throw error;
              });
          }
          throw error;
        })
    );
  }

  applyActionCode(code: string): Promise<void> {
    return this.native.applyActionCode(code).then(user => {
      this._setUser(user);
    });
  }

  checkActionCode(code: string): Promise<FirebaseAuthTypes.ActionCodeInfo> {
    return this.native.checkActionCode(code);
  }

  fetchSignInMethodsForEmail(email: string): Promise<string[]> {
    return this.native.fetchSignInMethodsForEmail(email);
  }

  verifyPasswordResetCode(code: string): Promise<string> {
    return this.native.verifyPasswordResetCode(code);
  }

  useUserAccessGroup(userAccessGroup: string): Promise<void> {
    if (isAndroid) {
      return Promise.resolve();
    }
    return this.native.useUserAccessGroup(userAccessGroup).then(() => undefined);
  }

  getRedirectResult(): Promise<FirebaseAuthTypes.UserCredential | null> {
    throw new Error(
      'firebase.auth().getRedirectResult() is unsupported by the native Firebase SDKs.',
    );
  }

  setPersistence(): Promise<void> {
    throw new Error('firebase.auth().setPersistence() is unsupported by the native Firebase SDKs.');
  }

  signInWithPopup(
    provider: FirebaseAuthTypes.AuthProvider,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .signInWithProvider((provider as AuthProviderWithObjectInternal).toObject())
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  signInWithRedirect(
    provider: FirebaseAuthTypes.AuthProvider,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this.native
      .signInWithProvider((provider as AuthProviderWithObjectInternal).toObject())
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  // firebase issue - https://github.com/invertase/react-native-firebase/pull/655#issuecomment-349904680
  useDeviceLanguage(): void {
    throw new Error(
      'firebase.auth().useDeviceLanguage() is unsupported by the native Firebase SDKs.',
    );
  }

  useEmulator(url: string): [string, number] {
    if (!url || !isString(url) || !isValidUrl(url)) {
      throw new Error('firebase.auth().useEmulator() takes a non-empty string URL');
    }

    let _url = url;
    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;
    if (!androidBypassEmulatorUrlRemap && isAndroid && _url) {
      if (_url.startsWith('http://localhost')) {
        _url = _url.replace('http://localhost', 'http://10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping auth host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
      if (_url.startsWith('http://127.0.0.1')) {
        _url = _url.replace('http://127.0.0.1', 'http://10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping auth host "127.0.0.1" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }

    // Native calls take the host and port split out
    const hostPortRegex = /^http:\/\/([\w\d-.]+):(\d+)$/;
    const urlMatches = _url.match(hostPortRegex);
    if (!urlMatches) {
      throw new Error('firebase.auth().useEmulator() unable to parse host and port from URL');
    }
    const host = urlMatches[1];
    const portString = urlMatches[2];
    if (!host || !portString) {
      throw new Error('firebase.auth().useEmulator() unable to parse host and port from URL');
    }
    const port = parseInt(portString, 10);
    this.native.useEmulator(host, port);
    return [host, port]; // undocumented return, useful for unit testing
  }

  getMultiFactorResolver(
    error: FirebaseAuthTypes.MultiFactorError,
  ): FirebaseAuthTypes.MultiFactorResolver {
    return getMultiFactorResolver(
      this as unknown as AuthInternal,
      error,
    ) as FirebaseAuthTypes.MultiFactorResolver;
  }

  multiFactor(user: FirebaseAuthTypes.User): FirebaseAuthTypes.MultiFactorUser {
    if (!this.currentUser || user.uid !== this.currentUser.uid) {
      throw new Error('firebase.auth().multiFactor() only operates on currentUser');
    }
    return new MultiFactorUser(
      this as unknown as AuthInternal,
      user,
    ) as FirebaseAuthTypes.MultiFactorUser;
  }

  getCustomAuthDomain(): Promise<string> {
    return this.native.getCustomAuthDomain();
  }
}

// Apply password policy mixin to FirebaseAuthModule
Object.assign(FirebaseAuthModule.prototype, PasswordPolicyMixin);

// import { SDK_VERSION } from '@react-native-firebase/auth';
export const SDK_VERSION = version;

// import auth from '@react-native-firebase/auth';
// auth().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAuthModule,
});

// import auth, { firebase } from '@react-native-firebase/auth';
// auth().X(...);
// firebase.auth().X(...);
export const firebase = getFirebaseRoot();

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);
