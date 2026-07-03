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

/**
 * Modular Auth API for React Native Firebase.
 *
 * Most exports mirror the [firebase-js-sdk modular Auth API](https://firebase.google.com/docs/reference/js/auth).
 * Remarks on individual symbols call out React Native-specific behavior, unsupported
 * web-only APIs, and return-type differences.
 *
 * @packageDocumentation
 */

import './types/internal';

export type * from './types/auth';
export { ActionCodeURL } from './ActionCodeURL';
export {
  AuthCredential,
  EmailAuthCredential,
  OAuthCredential,
  PhoneAuthCredential,
} from './credentials';

import {
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
  getOrCreateModularInstance,
  type ModuleConfig,
} from '@react-native-firebase/app/dist/module/internal';
import ConfirmationResultClass from './ConfirmationResult';
import { ActionCodeURL } from './ActionCodeURL';
import { PhoneAuthState } from './PhoneAuthState';
import PhoneAuthListenerClass from './PhoneAuthListener';
import PhoneMultiFactorGenerator from './PhoneMultiFactorGenerator';
import TotpMultiFactorGenerator from './TotpMultiFactorGenerator';
import { TotpSecret } from './TotpSecret';
import Settings from './Settings';
import UserClass from './User';
import { getMultiFactorResolver as createMultiFactorResolver } from './getMultiFactorResolver';
import { MultiFactorUser as MultiFactorUserModule } from './multiFactor';
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
import {
  ActionCodeOperation,
  FactorId,
  OperationType,
  ProviderId,
  SignInMethod,
} from './constants';
import fallBackModule from './web/RNFBAuthModule';
import { PasswordPolicyMixin } from './password-policy/PasswordPolicyMixin';
import type { FirebaseApp } from '@react-native-firebase/app';
import type {
  ActionCodeInfo,
  ActionCodeSettings,
  AdditionalUserInfo,
  AdditionalUserInfoNative,
  ApplicationVerifier,
  Auth,
  AuthCredential,
  AuthListenerCallback,
  AuthProvider,
  AuthSettings,
  CompleteFn,
  ConfirmationResult,
  Dependencies,
  EmulatorConfig,
  ErrorFn,
  IdTokenResult,
  MultiFactorError,
  MultiFactorInfo,
  MultiFactorResolver,
  MultiFactorSession,
  MultiFactorUser,
  NextOrObserver,
  PasswordValidationStatus,
  Persistence,
  PhoneAuthCredential,
  PhoneAuthListener,
  PhoneMultiFactorEnrollInfoOptions,
  PhoneMultiFactorInfo,
  PopupRedirectResolver,
  TotpMultiFactorInfo,
  Unsubscribe,
  User,
  UserCredential,
} from './types/auth';
import type { CallbackOrObserver } from './types/internal';
import type { User as ModularUser } from './types/auth';
import type {
  ActionCodeInfoResultInternal,
  AuthIdTokenChangedEventInternal,
  AuthInternal,
  AuthListenerCallbackInternal,
  AuthProviderWithObjectInternal,
  AuthStateChangedEventInternal,
  ConfirmationResultResultInternal,
  MultiFactorResolverResultInternal,
  MultiFactorUserResultInternal,
  MultiFactorUserSourceInternal,
  NativePhoneAuthCredentialInternal,
  NativeUserCredentialInternal,
  NativeUserInternal,
  PasswordPolicyInternal,
  PasswordValidationStatusInternal,
  PhoneAuthStateChangedEventInternal,
  UserCredentialResultInternal,
  UserInternal,
} from './types/internal';

type AuthErrorWithCodeInternal = Error & {
  code?: string;
};

const nativeEvents = ['auth_state_changed', 'auth_id_token_changed', 'phone_auth_state_changed'];

const namespace = 'auth';
const nativeModuleName = 'NativeRNFBTurboAuth';

const config: ModuleConfig = {
  namespace,
  nativeModuleName,
  nativeEvents,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

type BeforeAuthStateChangedEntry = {
  callback: (user: ModularUser | null) => void | Promise<void>;
  onAbort?: () => void;
};

class FirebaseAuthModule extends FirebaseModule<typeof nativeModuleName> {
  _user: User | null;
  _settings: AuthSettings | null;
  _authResult: boolean;
  _languageCode: string;
  _tenantId: string | null;
  _projectPasswordPolicy: PasswordPolicyInternal | null;
  _tenantPasswordPolicies: Record<string, PasswordPolicyInternal | null>;
  _emulatorConfig: EmulatorConfig | null;
  _authStateReadyPromise: Promise<void> | null;
  _beforeAuthStateChangedCallbacks: BeforeAuthStateChangedEntry[];
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
    this._emulatorConfig = null;
    this._authStateReadyPromise = null;
    this._beforeAuthStateChangedCallbacks = [];

    if (!this.languageCode) {
      this._languageCode = this.native.APP_LANGUAGE['[DEFAULT]'] ?? '';
    }

    const initialUser = this.native.APP_USER[this.app.name];
    if (initialUser) {
      this._setUser(initialUser);
    }

    this.emitter.addListener(this.eventNameForApp('auth_state_changed'), event => {
      const authEvent = event as AuthStateChangedEventInternal;
      void this._handleAuthStateChanged(authEvent.user);
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
    // Native iOS/Android Firebase Auth SDKs do not expose the firebase-js-sdk config object.
    return {};
  }

  get tenantId(): string | null {
    return this._tenantId;
  }

  set tenantId(tenantId: string | null) {
    void this.setTenantId(tenantId);
  }

  get emulatorConfig(): EmulatorConfig | null {
    return this._emulatorConfig;
  }

  authStateReady(): Promise<void> {
    if (this._authResult) {
      return Promise.resolve();
    }

    if (!this._authStateReadyPromise) {
      this._authStateReadyPromise = new Promise(resolve => {
        const unsubscribe = this.onAuthStateChanged(() => {
          if (this._authResult) {
            unsubscribe();
            resolve();
          }
        });

        if (this._authResult) {
          unsubscribe();
          resolve();
        }
      });
    }

    return this._authStateReadyPromise;
  }

  beforeAuthStateChanged(
    callback: (user: ModularUser | null) => void | Promise<void>,
    onAbort?: () => void,
  ): Unsubscribe {
    const entry: BeforeAuthStateChangedEntry = { callback, onAbort };
    this._beforeAuthStateChangedCallbacks.push(entry);

    return () => {
      const index = this._beforeAuthStateChangedCallbacks.indexOf(entry);
      if (index >= 0) {
        this._beforeAuthStateChangedCallbacks.splice(index, 1);
      }
    };
  }

  async updateCurrentUser(user: User | null): Promise<void> {
    if (user === null) {
      await this.signOut();
      return;
    }

    const userInternal = user as unknown as {
      _auth?: AuthInternal;
      _user?: NativeUserInternal;
    };

    if (!userInternal._auth || userInternal._auth !== (this as unknown as AuthInternal)) {
      throw new Error(
        "firebase.auth().updateCurrentUser() expected 'user' to be an Auth instance from the same Firebase App",
      );
    }

    if (!userInternal._user) {
      throw new Error("firebase.auth().updateCurrentUser(*) expected 'user' to be a valid User");
    }

    this._setUser(userInternal._user);
  }

  async _handleAuthStateChanged(nativeUser?: NativeUserInternal | null): Promise<void> {
    const pendingUser = nativeUser
      ? (new UserClass(this as unknown as AuthInternal, nativeUser) as User)
      : null;

    for (const { callback, onAbort } of [...this._beforeAuthStateChangedCallbacks]) {
      try {
        await callback(pendingUser as ModularUser | null);
      } catch {
        onAbort?.();
        return;
      }
    }

    this._setUser(nativeUser);
    this.emitter.emit(this.eventNameForApp('onAuthStateChanged'), this._user);
  }

  get settings(): AuthSettings {
    if (!this._settings) {
      this._settings = new Settings(this as unknown as AuthInternal) as AuthSettings;
    }
    return this._settings;
  }

  get currentUser(): User | null {
    return this._user;
  }

  _setUser(user?: NativeUserInternal | null): User | null {
    this._user = user ? (new UserClass(this as unknown as AuthInternal, user) as User) : null;
    this._authResult = true;
    this.emitter.emit(this.eventNameForApp('onUserChanged'), this._user);
    return this._user;
  }

  _setUserCredential(userCredential: NativeUserCredentialInternal): UserCredential {
    const user = new UserClass(this as unknown as AuthInternal, userCredential.user) as User;
    this._user = user;
    this._authResult = true;
    this.emitter.emit(this.eventNameForApp('onUserChanged'), this._user);
    return {
      additionalUserInfo: userCredential.additionalUserInfo,
      user,
    } as UserCredential;
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

  async setTenantId(tenantId: string | null): Promise<void> {
    if (!isString(tenantId) && !isNull(tenantId)) {
      throw new Error("firebase.auth().setTenantId(*) expected 'tenantId' to be a string");
    }
    await this.native.setTenantId(tenantId);
    this._tenantId = tenantId;
  }

  onAuthStateChanged(listenerOrObserver: CallbackOrObserver<AuthListenerCallback>): () => void {
    const listener = parseListenerOrObserver(listenerOrObserver) as AuthListenerCallback;
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

  onIdTokenChanged(listenerOrObserver: CallbackOrObserver<AuthListenerCallback>): () => void {
    const listener = parseListenerOrObserver(listenerOrObserver) as AuthListenerCallback;
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

  onUserChanged(listenerOrObserver: CallbackOrObserver<AuthListenerCallback>): () => void {
    const listener = parseListenerOrObserver(listenerOrObserver) as AuthListenerCallback;
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

  signInAnonymously(): Promise<UserCredential> {
    return this.native
      .signInAnonymously()
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  signInWithPhoneNumber(phoneNumber: string, forceResend?: boolean): Promise<ConfirmationResult> {
    return this.native
      .signInWithPhoneNumber(phoneNumber, forceResend || false)
      .then(
        (result: NativePhoneAuthCredentialInternal) =>
          new ConfirmationResultClass(
            this as unknown as AuthInternal,
            result.verificationId,
          ) as unknown as ConfirmationResult,
      );
  }

  verifyPhoneNumber(
    phoneNumber: string,
    autoVerifyTimeoutOrForceResend?: number | boolean,
    forceResend?: boolean,
  ): PhoneAuthListener {
    let _forceResend = forceResend;
    let _autoVerifyTimeout: number | undefined = 60;

    if (isBoolean(autoVerifyTimeoutOrForceResend)) {
      _forceResend = autoVerifyTimeoutOrForceResend;
    } else {
      _autoVerifyTimeout = autoVerifyTimeoutOrForceResend;
    }

    return new PhoneAuthListenerClass(
      this as unknown as AuthInternal,
      phoneNumber,
      _autoVerifyTimeout,
      _forceResend,
    ) as PhoneAuthListener;
  }

  verifyPhoneNumberWithMultiFactorInfo(
    multiFactorHint: MultiFactorInfo,
    session: MultiFactorSession,
  ): Promise<string> {
    return this.native.verifyPhoneNumberWithMultiFactorInfo(multiFactorHint.uid, session);
  }

  verifyPhoneNumberForMultiFactor(
    phoneInfoOptions: PhoneMultiFactorEnrollInfoOptions,
  ): Promise<string> {
    const { phoneNumber, session } = phoneInfoOptions;
    return this.native.verifyPhoneNumberForMultiFactor(phoneNumber, session);
  }

  resolveMultiFactorSignIn(
    session: MultiFactorSession,
    verificationId: string,
    verificationCode: string,
  ): Promise<UserCredential> {
    return this.native
      .resolveMultiFactorSignIn(session, verificationId, verificationCode)
      .then((userCredential: NativeUserCredentialInternal) => {
        return this._setUserCredential(userCredential);
      });
  }

  resolveTotpSignIn(
    session: MultiFactorSession,
    uid: string,
    totpSecret: string,
  ): Promise<UserCredential> {
    return this.native
      .resolveTotpSignIn(session, uid, totpSecret)
      .then((userCredential: NativeUserCredentialInternal) => {
        return this._setUserCredential(userCredential);
      });
  }

  createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
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

  signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
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

  signInWithCustomToken(customToken: string): Promise<UserCredential> {
    return this.native
      .signInWithCustomToken(customToken)
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  signInWithCredential(credential: AuthCredential): Promise<UserCredential> {
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
    actionCodeSettings: ActionCodeSettings | null = null,
  ): Promise<void> {
    return this.native.sendPasswordResetEmail(email, actionCodeSettings);
  }

  private _resolveActionCodeSettings(actionCodeSettings?: ActionCodeSettings): ActionCodeSettings {
    if (actionCodeSettings && isString(actionCodeSettings.url)) {
      return actionCodeSettings;
    }

    const authDomain = this.app.options.authDomain;
    let url = 'https://localhost';
    if (authDomain && isString(authDomain)) {
      url = isValidUrl(authDomain) ? authDomain : `https://${authDomain}`;
    }

    return {
      ...(actionCodeSettings ?? {}),
      url,
      handleCodeInApp: actionCodeSettings?.handleCodeInApp ?? true,
    };
  }

  sendSignInLinkToEmail(email: string, actionCodeSettings?: ActionCodeSettings): Promise<void> {
    return this.native.sendSignInLinkToEmail(
      email,
      this._resolveActionCodeSettings(actionCodeSettings),
    );
  }

  isSignInWithEmailLink(emailLink: string): Promise<boolean> {
    return this.native.isSignInWithEmailLink(emailLink);
  }

  signInWithEmailLink(email: string, emailLink?: string): Promise<UserCredential> {
    return this.native
      .signInWithEmailLink(email, emailLink ?? '')
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

  checkActionCode(code: string): Promise<ActionCodeInfo> {
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

  getRedirectResult(): Promise<UserCredential | null> {
    throw new Error(
      'firebase.auth().getRedirectResult() is unsupported by the native Firebase SDKs.',
    );
  }

  setPersistence(): Promise<void> {
    throw new Error('firebase.auth().setPersistence() is unsupported by the native Firebase SDKs.');
  }

  signInWithPopup(provider: AuthProvider): Promise<UserCredential> {
    return this.native
      .signInWithProvider((provider as AuthProviderWithObjectInternal).toObject())
      .then((userCredential: NativeUserCredentialInternal) =>
        this._setUserCredential(userCredential),
      );
  }

  signInWithRedirect(provider: AuthProvider): Promise<UserCredential> {
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

  useEmulator(url: string, options?: { disableWarnings?: boolean }): void {
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
    if (!host) {
      throw new Error('firebase.auth().useEmulator() unable to parse host from URL');
    }
    const port = portString ? parseInt(portString, 10) : undefined;
    this._emulatorConfig = {
      protocol: 'http',
      host,
      port: port ?? null,
      options: {
        disableWarnings: options?.disableWarnings ?? false,
      },
    };
    this.native.useEmulator(host, port);
    // @ts-ignore - undocumented return, useful for unit testing
    return [host, port];
  }

  getMultiFactorResolver(error: MultiFactorError): MultiFactorResolver {
    return createMultiFactorResolver(this as unknown as AuthInternal, error) as MultiFactorResolver;
  }

  multiFactor(user: User): MultiFactorUser {
    if (!this.currentUser || user.uid !== this.currentUser.uid) {
      throw new Error('firebase.auth().multiFactor() only operates on currentUser');
    }
    return new MultiFactorUserModule(this as unknown as AuthInternal, user) as MultiFactorUser;
  }

  getCustomAuthDomain(): Promise<string> {
    return this.native.getCustomAuthDomain();
  }
}

// Apply password policy mixin to FirebaseAuthModule
Object.assign(FirebaseAuthModule.prototype, PasswordPolicyMixin);

export {
  AppleAuthProvider,
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  OIDCAuthProvider,
  PhoneAuthProvider,
  PhoneAuthState,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  TotpSecret,
  TwitterAuthProvider,
  ActionCodeOperation,
  FactorId,
  OperationType,
  ProviderId,
  SignInMethod,
};

type AnyFn = (...args: any[]) => any;

type UserModuleInternal = UserInternal;
type MultiFactorInfoInternal = MultiFactorInfo | MultiFactorResolverResultInternal['hints'][number];

function getAuthInternal(auth: Auth): AuthInternal {
  return auth as unknown as AuthInternal;
}

function getUserInternal(user: User): UserModuleInternal {
  return user as unknown as UserModuleInternal;
}

type AdditionalUserInfoSource = {
  isNewUser?: boolean;
  profile?: Record<string, unknown> | null;
  providerId?: string | null;
  username?: string | null;
} & Record<string, unknown>;

function normalizeAdditionalUserInfo(info: AdditionalUserInfoSource): AdditionalUserInfoNative {
  return {
    ...info,
    isNewUser: Boolean(info.isNewUser),
    profile: info.profile ?? null,
    providerId: info.providerId ?? null,
    username: info.username ?? null,
  };
}

function normalizeUserCredential(
  userCredential: UserCredentialResultInternal,
  overrides: Partial<Pick<UserCredential, 'operationType' | 'providerId'>> = {},
): UserCredential {
  const normalizedUserCredential: UserCredential = {
    user: userCredential.user as unknown as User,
    providerId:
      overrides.providerId ??
      userCredential.providerId ??
      userCredential.additionalUserInfo?.providerId ??
      null,
    operationType: overrides.operationType ?? userCredential.operationType ?? OperationType.SIGN_IN,
  };

  if (userCredential.additionalUserInfo) {
    normalizedUserCredential.additionalUserInfo = normalizeAdditionalUserInfo(
      userCredential.additionalUserInfo as AdditionalUserInfoSource,
    );
  }

  return normalizedUserCredential;
}

function normalizeMultiFactorInfo(info: MultiFactorInfoInternal): MultiFactorInfo {
  const normalizedInfo = {
    uid: info.uid,
    displayName: info.displayName ?? null,
    enrollmentTime: info.enrollmentTime,
    factorId: info.factorId,
  };

  if ('phoneNumber' in info) {
    return {
      ...normalizedInfo,
      phoneNumber: info.phoneNumber,
    } as PhoneMultiFactorInfo;
  }

  return normalizedInfo as TotpMultiFactorInfo;
}

function normalizeActionCodeInfo(actionCodeInfo: ActionCodeInfoResultInternal): ActionCodeInfo {
  const data = actionCodeInfo.data ?? {};

  return {
    data: {
      email: data.email ?? null,
      multiFactorInfo:
        'multiFactorInfo' in data && data.multiFactorInfo
          ? normalizeMultiFactorInfo(data.multiFactorInfo)
          : null,
      previousEmail: (('previousEmail' in data ? data.previousEmail : undefined) ??
        ('fromEmail' in data ? data.fromEmail : undefined) ??
        null) as string | null,
    },
    operation: actionCodeInfo.operation as ActionCodeInfo['operation'],
  };
}

function normalizeConfirmationResult(
  confirmationResult: ConfirmationResultResultInternal,
): ConfirmationResult {
  if (!confirmationResult.verificationId) {
    throw new Error('signInWithPhoneNumber() did not return a verificationId.');
  }

  return {
    verificationId: confirmationResult.verificationId,
    async confirm(verificationCode: string) {
      const userCredential = await confirmationResult.confirm(verificationCode);

      if (!userCredential) {
        throw new Error('signInWithPhoneNumber().confirm() returned no user credential.');
      }

      return normalizeUserCredential(userCredential, {
        providerId: ProviderId.PHONE,
        operationType: OperationType.SIGN_IN,
      });
    },
  };
}

function normalizeMultiFactorResolver(
  resolver: MultiFactorResolverResultInternal,
): MultiFactorResolver {
  return {
    hints: resolver.hints.map(normalizeMultiFactorInfo),
    session: resolver.session,
    async resolveSignIn(assertion) {
      return normalizeUserCredential(await resolver.resolveSignIn(assertion), {
        providerId: assertion.factorId === FactorId.PHONE ? ProviderId.PHONE : null,
        operationType: OperationType.SIGN_IN,
      });
    },
  };
}

function normalizeMultiFactorUser(multiFactorUser: MultiFactorUserResultInternal): MultiFactorUser {
  return {
    enrolledFactors: multiFactorUser.enrolledFactors.map(normalizeMultiFactorInfo),
    getSession: () => multiFactorUser.getSession(),
    enroll: (assertion, displayName) => multiFactorUser.enroll(assertion, displayName),
    unenroll: option =>
      multiFactorUser.unenroll(option as Parameters<MultiFactorUserResultInternal['unenroll']>[0]),
  };
}

function normalizeAuthListener(
  nextOrObserver: NextOrObserver<User>,
): AuthListenerCallbackInternal | { next: AuthListenerCallbackInternal } {
  if (typeof nextOrObserver === 'function') {
    return nextOrObserver as AuthListenerCallbackInternal;
  }

  if (typeof nextOrObserver.next !== 'function') {
    return { next: () => {} };
  }

  return nextOrObserver as { next: AuthListenerCallbackInternal };
}

function callAuthMethod<F extends AnyFn>(
  auth: AuthInternal,
  method: F,
  ...args: Parameters<F>
): ReturnType<F> {
  return method.call(auth, ...args);
}

function callUserMethod<F extends AnyFn>(
  user: UserModuleInternal,
  method: F,
  ...args: Parameters<F>
): ReturnType<F> {
  return method.call(user, ...args);
}

/**
 * Returns the Auth instance associated with the provided FirebaseApp.
 *
 * @param app - The Firebase app instance. Defaults to the default app.
 */
export function getAuth(app?: FirebaseApp): Auth {
  return getOrCreateModularInstance(FirebaseAuthModule, config, app) as unknown as Auth;
}

/**
 * This function allows more control over the Auth instance than getAuth().
 *
 * @param app - The Firebase app to initialize Auth for.
 * @param _deps - Optional firebase-js-sdk dependency bag.
 *
 * @remarks
 * The optional `deps` argument exists for firebase-js-sdk API parity. React Native Firebase
 * ignores persistence, popup redirect resolver, and error-map dependencies because native
 * iOS/Android SDKs manage auth state and do not support the web-only persistence stack.
 * `initializeAuth()` returns the same shared Auth instance as {@link getAuth}.
 */
export function initializeAuth(app: FirebaseApp, _deps?: Dependencies): Auth {
  return getAuth(app);
}

/**
 * Applies an out-of-band email action code (for example from a password reset or email verification link).
 */
export function applyActionCode(auth: Auth, oobCode: string): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.applyActionCode, oobCode);
}

/**
 * Registers a callback to run before an auth state change is committed.
 *
 * @returns An unsubscribe function.
 */
export function beforeAuthStateChanged(
  auth: Auth,
  callback: (user: User | null) => void | Promise<void>,
  onAbort?: () => void,
): Unsubscribe {
  const authInternal = getAuthInternal(auth);
  return authInternal.beforeAuthStateChanged(callback, onAbort);
}

/**
 * Checks the validity of an out-of-band email action code and returns metadata about the pending operation.
 *
 * @remarks React Native Firebase normalizes native results toward firebase-js-sdk shapes, including mapping
 * `fromEmail` to `previousEmail` and coercing multi-factor info objects.
 */
export function checkActionCode(auth: Auth, oobCode: string): Promise<ActionCodeInfo> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.checkActionCode, oobCode).then(
    normalizeActionCodeInfo,
  );
}

/**
 * Confirms a password reset using the out-of-band code from the reset email.
 */
export function confirmPasswordReset(
  auth: Auth,
  oobCode: string,
  newPassword: string,
): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.confirmPasswordReset, oobCode, newPassword);
}

/**
 * Connects the Auth instance to the Auth emulator.
 *
 * @remarks Delegates to the native `useEmulator` bridge. Accepts the firebase-js-sdk
 * `options.disableWarnings` flag for {@link Auth.emulatorConfig} parity. On web, that flag
 * suppresses the emulator DOM warning banner; native iOS/Android SDKs do not surface that banner,
 * so the value is recorded on `auth.emulatorConfig.options` only. When `options` is provided,
 * `disableWarnings` is required (matching firebase-js-sdk).
 */
export function connectAuthEmulator(
  auth: Auth,
  url: string,
  options?: { disableWarnings: boolean },
): void {
  const authInternal = getAuthInternal(auth);
  callAuthMethod(authInternal, authInternal.useEmulator, url, options);
}

/**
 * Creates a new user with an email address and password.
 *
 * @remarks Returned {@link UserCredential} objects include top-level `providerId` and `operationType`
 * fields. `additionalUserInfo`, when present, is attached as a non-enumerable property.
 */
export function createUserWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.createUserWithEmailAndPassword,
    email,
    password,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Fetches the sign-in methods available for the given email address.
 */
export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.fetchSignInMethodsForEmail, email);
}

/**
 * Extracts a {@link MultiFactorResolver} from a {@link MultiFactorError}.
 *
 * @throws If the error does not contain resolver hints.
 */
export function getMultiFactorResolver(auth: Auth, error: MultiFactorError): MultiFactorResolver {
  const authInternal = getAuthInternal(auth);
  const resolver = callAuthMethod(
    authInternal,
    authInternal.getMultiFactorResolver,
    error,
  ) as MultiFactorResolverResultInternal | null;

  if (!resolver) {
    throw new Error('The provided auth error did not contain a multi-factor resolver.');
  }

  return normalizeMultiFactorResolver(resolver);
}

/**
 * Returns the redirect sign-in result after a browser redirect flow completes.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously because native provider
 * flows do not use the browser redirect contract from the firebase-js-sdk.
 */
export function getRedirectResult(
  _auth: Auth,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential | null> {
  throw new Error('getRedirectResult is unsupported by the native Firebase SDKs.');
}

/**
 * Checks whether an email link is a valid sign-in with email link URL.
 *
 * @remarks React Native Firebase performs this check through the native bridge and returns
 * `Promise<boolean>`. The firebase-js-sdk returns a synchronous `boolean`.
 */
export function isSignInWithEmailLink(auth: Auth, emailLink: string): Promise<boolean> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.isSignInWithEmailLink, emailLink);
}

/**
 * Subscribes to auth state changes for the given Auth instance.
 *
 * @returns An unsubscribe function.
 *
 * @remarks The legacy `error` and `completed` callback overload exists for firebase-js-sdk API parity.
 * Native auth listeners never invoke separate error or completed callbacks.
 */
export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: NextOrObserver<User>,
  _error?: ErrorFn,
  _completed?: CompleteFn,
): Unsubscribe {
  // The legacy callback overload exists for JS SDK compatibility, but native auth listeners
  // never invoke separate error/completed callbacks.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.onAuthStateChanged,
    normalizeAuthListener(nextOrObserver),
  );
}

/**
 * Subscribes to ID token changes for the given Auth instance.
 *
 * @returns An unsubscribe function.
 *
 * @remarks The legacy `error` and `completed` callback overload exists for firebase-js-sdk API parity.
 * Native auth listeners never invoke separate error or completed callbacks.
 */
export function onIdTokenChanged(
  auth: Auth,
  nextOrObserver: NextOrObserver<User>,
  _error?: ErrorFn,
  _completed?: CompleteFn,
): Unsubscribe {
  // The legacy callback overload exists for JS SDK compatibility, but native auth listeners
  // never invoke separate error/completed callbacks.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.onIdTokenChanged,
    normalizeAuthListener(nextOrObserver),
  );
}

/**
 * Revokes the given OAuth access token for the current user.
 *
 * @remarks
 * **Web only.** Always throws synchronously on React Native Firebase.
 */
export function revokeAccessToken(_auth: Auth, _token: string): Promise<void> {
  throw new Error('revokeAccessToken() is only supported on Web');
}

/**
 * Revokes a user's Sign in with Apple token.
 *
 * @remarks
 * React Native Firebase-specific API required by Apple's account-deletion guidelines.
 * **Supported on iOS** via the native `revokeTokenWithAuthorizationCode` bridge.
 * On Android and Web the bridge resolves without performing revocation (no-op).
 * Distinct from firebase-js-sdk {@link revokeAccessToken}, which revokes OAuth access tokens on Web only.
 */
export function revokeToken(auth: Auth, authorizationCode: string): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.revokeToken, authorizationCode);
}

/**
 * Sends a password reset email to the given address.
 */
export function sendPasswordResetEmail(
  auth: Auth,
  email: string,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.sendPasswordResetEmail,
    email,
    actionCodeSettings,
  );
}

/**
 * Sends a sign-in with email link to the given address.
 *
 * @remarks `actionCodeSettings` is required in the modular API (matching firebase-js-sdk).
 * The namespaced `firebase.auth().sendSignInLinkToEmail(email, settings?)` API still supplies
 * defaults when settings are omitted.
 */
export function sendSignInLinkToEmail(
  auth: Auth,
  email: string,
  actionCodeSettings: ActionCodeSettings,
): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.sendSignInLinkToEmail,
    email,
    actionCodeSettings,
  );
}

/**
 * Sets the persistence type for the Auth instance.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously because auth state is
 * managed by the native iOS/Android SDKs rather than the web persistence stack.
 */
export function setPersistence(_auth: Auth, _persistence: Persistence): Promise<void> {
  throw new Error('setPersistence is unsupported by the native Firebase SDKs.');
}

/**
 * Signs in anonymously.
 */
export function signInAnonymously(auth: Auth): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInAnonymously).then(userCredential =>
    normalizeUserCredential(userCredential, {
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Signs in with the given auth credential.
 */
export function signInWithCredential(
  auth: Auth,
  credential: AuthCredential,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithCredential, credential).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: credential.providerId,
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Signs in with a custom authentication token.
 */
export function signInWithCustomToken(auth: Auth, customToken: string): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithCustomToken, customToken).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Signs in with an email address and password.
 */
export function signInWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.signInWithEmailAndPassword,
    email,
    password,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Signs in using an email and sign-in with email link.
 *
 * @remarks The `emailLink` argument is optional, matching firebase-js-sdk.
 */
export function signInWithEmailLink(
  auth: Auth,
  email: string,
  emailLink?: string,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithEmailLink, email, emailLink).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: ProviderId.PASSWORD,
        operationType: OperationType.SIGN_IN,
      }),
  );
}

/**
 * Signs in with a phone number and returns a confirmation result for SMS verification.
 *
 * @remarks
 * Native SDKs own the phone verification flow. The optional `appVerifier` argument from the
 * firebase-js-sdk is ignored. This modular API also does not accept RNFB's legacy `forceResend`
 * argument — use {@link verifyPhoneNumber} for the native listener / force-resend flow instead.
 */
export function signInWithPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  // Native SDKs own the verification flow, so the modular wrapper intentionally ignores the
  // JS SDK's optional ApplicationVerifier and forwards only the phone number.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signInWithPhoneNumber, phoneNumber).then(
    normalizeConfirmationResult,
  );
}

/**
 * Starts native phone number verification and returns a listener for verification events.
 *
 * @remarks React Native Firebase-specific API with no firebase-js-sdk equivalent. Use this for
 * auto-verification, resend, and multi-step phone auth flows that require native callbacks.
 */
export function verifyPhoneNumber(
  auth: Auth,
  phoneNumber: string,
  autoVerifyTimeoutOrForceResend?: number | boolean,
  forceResend?: boolean,
): PhoneAuthListener {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.verifyPhoneNumber,
    phoneNumber,
    autoVerifyTimeoutOrForceResend,
    forceResend,
  );
}

/**
 * Signs in with the given provider using a native popup-style flow where supported.
 */
export function signInWithPopup(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.signInWithPopup,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Signs in with the given provider using a redirect-style flow.
 *
 * @remarks On React Native Firebase, native provider flows complete immediately and resolve with a
 * {@link UserCredential} instead of following the browser redirect contract used by the
 * firebase-js-sdk (which resolves later via {@link getRedirectResult}).
 */
export function signInWithRedirect(
  auth: Auth,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(
    authInternal,
    authInternal.signInWithRedirect,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.SIGN_IN,
    }),
  );
}

/**
 * Signs out the current user for the given Auth instance.
 */
export function signOut(auth: Auth): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.signOut);
}

/**
 * Updates the currently signed-in user on the Auth instance.
 */
export function updateCurrentUser(auth: Auth, user: User | null): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.updateCurrentUser, user);
}

/**
 * Sets the Auth `languageCode` from the device locale.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously. Set `auth.languageCode`
 * directly or use {@link setLanguageCode}.
 */
export function useDeviceLanguage(_auth: Auth): void {
  throw new Error('useDeviceLanguage is unsupported by the native Firebase SDKs');
}

/**
 * Sets the Auth language code.
 *
 * @remarks React Native Firebase exposes this as a modular helper. The firebase-js-sdk only exposes
 * the writable `auth.languageCode` property.
 */
export function setLanguageCode(auth: Auth, languageCode: string | null): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.setLanguageCode, languageCode);
}

/**
 * Configures iOS keychain access group sharing for the Auth instance.
 *
 * @remarks React Native Firebase-specific iOS helper with no firebase-js-sdk equivalent.
 */
export function useUserAccessGroup(auth: Auth, userAccessGroup: string): Promise<void> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.useUserAccessGroup, userAccessGroup).then(
    () => undefined,
  );
}

/**
 * Verifies a password reset code and returns the associated email address.
 */
export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.verifyPasswordResetCode, code);
}

/**
 * Parses an email action link string.
 *
 * @param link - The email action link to parse.
 * @returns The {@link ActionCodeURL} object, or `null` if the link is invalid.
 *
 * @remarks Pure URL parsing (ported from firebase-js-sdk). Works on all platforms without a native
 * bridge. See also {@link ActionCodeURL.parseLink}.
 */
export function parseActionCodeURL(link: string): ActionCodeURL | null {
  return ActionCodeURL.parseLink(link);
}

/**
 * Deletes the given user account.
 */
export function deleteUser(user: User): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.delete);
}

/**
 * Returns the current ID token for the user.
 */
export function getIdToken(user: User, forceRefresh?: boolean): Promise<string> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.getIdToken, forceRefresh);
}

/**
 * Returns the decoded ID token result for the user.
 */
export function getIdTokenResult(user: User, forceRefresh?: boolean): Promise<IdTokenResult> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.getIdTokenResult, forceRefresh);
}

/**
 * Links the user account with the given credential.
 */
export function linkWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.linkWithCredential, credential).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: credential.providerId,
        operationType: OperationType.LINK,
      }),
  );
}

/**
 * Links the user account with a phone number using SMS verification.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously.
 */
export function linkWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  throw new Error('linkWithPhoneNumber is unsupported by the native Firebase SDKs');
}

/**
 * Links the user account with the given provider using a native popup-style flow where supported.
 */
export function linkWithPopup(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.linkWithPopup,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.LINK,
    }),
  );
}

/**
 * Links the user account with the given provider using a redirect-style flow.
 *
 * @remarks On React Native Firebase, native provider flows complete immediately and resolve with a
 * {@link UserCredential} instead of following the browser redirect contract used by the
 * firebase-js-sdk.
 */
export function linkWithRedirect(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  // Native provider flows complete immediately and return a credential instead of following the
  // browser redirect contract from the Firebase JS SDK.
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.linkWithRedirect,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.LINK,
    }),
  );
}

/**
 * Returns the multi-factor interface for the given user.
 *
 * @remarks Uses the user's own Auth instance instead of always calling {@link getAuth}, which fixes
 * secondary Firebase app usage compared with earlier RNFB behavior.
 */
export function multiFactor(user: User): MultiFactorUser {
  return normalizeMultiFactorUser(
    new MultiFactorUserModule(
      ((user as unknown as UserInternal)._auth ||
        (getAuth() as unknown as UserInternal['_auth'])) as NonNullable<UserInternal['_auth']>,
      user as unknown as MultiFactorUserSourceInternal,
    ),
  );
}

/**
 * Reauthenticates the user with the given credential.
 */
export function reauthenticateWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.reauthenticateWithCredential, credential).then(
    userCredential =>
      normalizeUserCredential(userCredential, {
        providerId: credential.providerId,
        operationType: OperationType.REAUTHENTICATE,
      }),
  );
}

/**
 * Reauthenticates the user with a phone number using SMS verification.
 *
 * @remarks
 * **Not supported on React Native Firebase.** Always throws synchronously.
 */
export function reauthenticateWithPhoneNumber(
  _user: User,
  _phoneNumber: string,
  _appVerifier?: ApplicationVerifier,
): Promise<ConfirmationResult> {
  throw new Error('reauthenticateWithPhoneNumber is unsupported by the native Firebase SDKs');
}

/**
 * Reauthenticates the user with the given provider using a native popup-style flow where supported.
 */
export function reauthenticateWithPopup(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<UserCredential> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.reauthenticateWithPopup,
    provider as unknown as AuthProviderWithObjectInternal,
  ).then(userCredential =>
    normalizeUserCredential(userCredential, {
      providerId: provider.providerId,
      operationType: OperationType.REAUTHENTICATE,
    }),
  );
}

/**
 * Reauthenticates the user with the given provider using a redirect-style flow.
 *
 * @remarks On React Native Firebase, native provider flows do not follow the browser redirect
 * contract. This resolves with `void` after the native flow completes instead of the
 * firebase-js-sdk `Promise<never>` signature used for unresolved browser redirects.
 */
export function reauthenticateWithRedirect(
  user: User,
  provider: AuthProvider,
  _resolver?: PopupRedirectResolver,
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.reauthenticateWithRedirect,
    provider as unknown as AuthProviderWithObjectInternal,
  );
}

/**
 * Reloads the user's profile data from the server.
 */
export function reload(user: User): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.reload);
}

/**
 * Sends an email verification message to the user.
 */
export function sendEmailVerification(
  user: User,
  actionCodeSettings?: ActionCodeSettings | null,
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.sendEmailVerification,
    actionCodeSettings ?? undefined,
  );
}

/**
 * Unlinks a provider from the user account.
 */
export function unlink(user: User, providerId: string): Promise<User> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.unlink, providerId);
}

/**
 * Updates the user's email address.
 */
export function updateEmail(user: User, newEmail: string): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updateEmail, newEmail);
}

/**
 * Updates the user's password.
 */
export function updatePassword(user: User, newPassword: string): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updatePassword, newPassword);
}

/**
 * Updates the user's phone number using a phone auth credential.
 */
export function updatePhoneNumber(user: User, credential: PhoneAuthCredential): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updatePhoneNumber, credential);
}

/**
 * Updates the user's display name and/or photo URL.
 */
export function updateProfile(
  user: User,
  profile: { displayName?: string | null; photoURL?: string | null },
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(userInternal, userInternal.updateProfile, {
    displayName: profile.displayName,
    photoURL: profile.photoURL,
  });
}

/**
 * Sends a verification email to the new address before updating the user's email.
 */
export function verifyBeforeUpdateEmail(
  user: User,
  newEmail: string,
  actionCodeSettings?: ActionCodeSettings | null,
): Promise<void> {
  const userInternal = getUserInternal(user);
  return callUserMethod(
    userInternal,
    userInternal.verifyBeforeUpdateEmail,
    newEmail,
    actionCodeSettings ?? undefined,
  );
}

/**
 * Returns additional OAuth / federated sign-in information from a {@link UserCredential}.
 *
 * @remarks Returns firebase-js-sdk core fields plus any extra native keys copied from the bridge.
 */
export function getAdditionalUserInfo(userCredential: UserCredential): AdditionalUserInfo | null {
  if (userCredential.additionalUserInfo) {
    return userCredential.additionalUserInfo;
  }

  const info = (userCredential as unknown as UserCredentialResultInternal).additionalUserInfo;
  if (!info) {
    return null;
  }

  return normalizeAdditionalUserInfo(info as AdditionalUserInfoSource);
}

/**
 * Returns the configured custom auth domain for the Auth instance.
 *
 * @remarks React Native Firebase-specific helper with no firebase-js-sdk equivalent.
 */
export function getCustomAuthDomain(auth: Auth): Promise<string> {
  const authInternal = getAuthInternal(auth);
  return callAuthMethod(authInternal, authInternal.getCustomAuthDomain);
}

/**
 * Validates a password against the project's password policy.
 */
export function validatePassword(auth: Auth, password: string): Promise<PasswordValidationStatus> {
  if (!auth || !('app' in auth)) {
    throw new Error(
      `firebase.auth().validatePassword(*) 'auth' must be a valid Auth instance with an 'app' property`,
    );
  }

  if (password === null || password === undefined) {
    throw new Error(
      "firebase.auth().validatePassword(*) expected 'password' to be a non-null or a defined value.",
    );
  }

  const authWithPasswordValidation = getAuthInternal(auth);
  return callAuthMethod(
    authWithPasswordValidation,
    authWithPasswordValidation.validatePassword,
    password,
  );
}

export const SDK_VERSION: string = version;

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);
