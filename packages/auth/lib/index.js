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
  isAndroid,
  isBoolean,
  isNull,
  isString,
  isValidUrl,
} from '@react-native-firebase/app/lib/common';
import { setReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';
import {
  FirebaseModule,
  createModuleNamespace,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import ConfirmationResult from './ConfirmationResult';
import PhoneAuthListener from './PhoneAuthListener';
import PhoneMultiFactorGenerator from './PhoneMultiFactorGenerator';
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
import version from './version';
import fallBackModule from './web/RNFBAuthModule';

export {
  AppleAuthProvider,
  EmailAuthProvider,
  PhoneAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  PhoneMultiFactorGenerator,
  OAuthProvider,
  OIDCAuthProvider,
};

const statics = {
  AppleAuthProvider,
  EmailAuthProvider,
  PhoneAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  PhoneMultiFactorGenerator,
  OAuthProvider,
  OIDCAuthProvider,
  PhoneAuthState: {
    CODE_SENT: 'sent',
    AUTO_VERIFY_TIMEOUT: 'timeout',
    AUTO_VERIFIED: 'verified',
    ERROR: 'error',
  },
  getMultiFactorResolver,
  multiFactor,
};

const namespace = 'auth';
const nativeModuleName = 'RNFBAuthModule';

class FirebaseAuthModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._user = null;
    this._settings = null;
    this._authResult = false;
    this._languageCode = this.native.APP_LANGUAGE[this.app._name];
    this._tenantId = null;

    if (!this.languageCode) {
      this._languageCode = this.native.APP_LANGUAGE['[DEFAULT]'];
    }

    if (this.native.APP_USER[this.app._name]) {
      this._setUser(this.native.APP_USER[this.app._name]);
    }

    this.emitter.addListener(this.eventNameForApp('auth_state_changed'), event => {
      this._setUser(event.user);
      this.emitter.emit(this.eventNameForApp('onAuthStateChanged'), this._user);
    });

    this.emitter.addListener(this.eventNameForApp('phone_auth_state_changed'), event => {
      const eventKey = `phone:auth:${event.requestKey}:${event.type}`;
      this.emitter.emit(eventKey, event.state);
    });

    this.emitter.addListener(this.eventNameForApp('auth_id_token_changed'), auth => {
      this._setUser(auth.user);
      this.emitter.emit(this.eventNameForApp('onIdTokenChanged'), this._user);
    });

    this.native.addAuthStateListener();
    this.native.addIdTokenListener();

    // custom authDomain in only available from App's FirebaseOptions,
    // but we need it in Auth if it exists. During app configuration we store
    // mappings from app name to authDomain, this auth constructor
    // is a reasonable time to use the mapping and set it into auth natively
    this.native.configureAuthDomain();
  }

  get languageCode() {
    return this._languageCode;
  }

  set languageCode(code) {
    // For modular API, not recommended to set languageCode directly as it should be set in the native SDKs first
    if (!isString(code) && !isNull(code)) {
      throw new Error(
        "firebase.auth().languageCode = (*) expected 'languageCode' to be a string or null value",
      );
    }
    // as this is a setter, we can't use async/await. So we set it first so it is available immediately
    if (code === null) {
      this._languageCode = this.native.APP_LANGUAGE[this.app._name];

      if (!this.languageCode) {
        this._languageCode = this.native.APP_LANGUAGE['[DEFAULT]'];
      }
    } else {
      this._languageCode = code;
    }
    // This sets it natively
    this.setLanguageCode(code);
  }

  get config() {
    // for modular API, firebase JS SDK has a config object which is not available in native SDKs
    return {};
  }

  get tenantId() {
    return this._tenantId;
  }

  get settings() {
    if (!this._settings) {
      this._settings = new Settings(this);
    }
    return this._settings;
  }

  get currentUser() {
    return this._user;
  }

  _setUser(user) {
    this._user = user ? new User(this, user) : null;
    this._authResult = true;
    this.emitter.emit(this.eventNameForApp('onUserChanged'), this._user);
    return this._user;
  }

  _setUserCredential(userCredential) {
    const user = new User(this, userCredential.user);
    this._user = user;
    this._authResult = true;
    this.emitter.emit(this.eventNameForApp('onUserChanged'), this._user);
    return {
      additionalUserInfo: userCredential.additionalUserInfo,
      user,
    };
  }

  async setLanguageCode(code) {
    if (!isString(code) && !isNull(code)) {
      throw new Error(
        "firebase.auth().setLanguageCode(*) expected 'languageCode' to be a string or null value",
      );
    }

    await this.native.setLanguageCode(code);

    if (code === null) {
      this._languageCode = this.native.APP_LANGUAGE[this.app._name];

      if (!this.languageCode) {
        this._languageCode = this.native.APP_LANGUAGE['[DEFAULT]'];
      }
    } else {
      this._languageCode = code;
    }
  }

  async setTenantId(tenantId) {
    if (!isString(tenantId)) {
      throw new Error("firebase.auth().setTenantId(*) expected 'tenantId' to be a string");
    }
    this._tenantId = tenantId;
    await this.native.setTenantId(tenantId);
  }

  _parseListener(listenerOrObserver) {
    return typeof listenerOrObserver === 'object'
      ? listenerOrObserver.next.bind(listenerOrObserver)
      : listenerOrObserver;
  }

  onAuthStateChanged(listenerOrObserver) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `onAuthStateChanged()` from the modular API instead.',
    );
    const listener = this._parseListener(listenerOrObserver);
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

  onIdTokenChanged(listenerOrObserver) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `onIdTokenChanged()` from the modular API instead.',
    );
    const listener = this._parseListener(listenerOrObserver);
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

  onUserChanged(listenerOrObserver) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `onUserChanged()` from the modular API instead.',
    );
    const listener = this._parseListener(listenerOrObserver);
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

  signOut() {
    // eslint-disable-next-line no-console
    console.warn('This method is deprecated. Please use `signOut()` from the modular API instead.');
    return this.native.signOut().then(() => {
      this._setUser();
    });
  }

  signInAnonymously() {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInAnonymously()` from the modular API instead.',
    );
    return this.native
      .signInAnonymously()
      .then(userCredential => this._setUserCredential(userCredential));
  }

  signInWithPhoneNumber(phoneNumber, forceResend) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInWithPhoneNumber()` from the modular API instead.',
    );
    if (isAndroid) {
      return this.native
        .signInWithPhoneNumber(phoneNumber, forceResend || false)
        .then(result => new ConfirmationResult(this, result.verificationId));
    }

    return this.native
      .signInWithPhoneNumber(phoneNumber)
      .then(result => new ConfirmationResult(this, result.verificationId));
  }

  verifyPhoneNumber(phoneNumber, autoVerifyTimeoutOrForceResend, forceResend) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `verifyPhoneNumber()` from the modular API instead.',
    );
    let _forceResend = forceResend;
    let _autoVerifyTimeout = 60;

    if (isBoolean(autoVerifyTimeoutOrForceResend)) {
      _forceResend = autoVerifyTimeoutOrForceResend;
    } else {
      _autoVerifyTimeout = autoVerifyTimeoutOrForceResend;
    }

    return new PhoneAuthListener(this, phoneNumber, _autoVerifyTimeout, _forceResend);
  }

  verifyPhoneNumberWithMultiFactorInfo(multiFactorHint, session) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `verifyPhoneNumberWithMultiFactorInfo()` from the modular API instead.',
    );
    return this.native.verifyPhoneNumberWithMultiFactorInfo(multiFactorHint.uid, session);
  }

  verifyPhoneNumberForMultiFactor(phoneInfoOptions) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `verifyPhoneNumberForMultiFactor()` from the modular API instead.',
    );
    const { phoneNumber, session } = phoneInfoOptions;
    return this.native.verifyPhoneNumberForMultiFactor(phoneNumber, session);
  }

  resolveMultiFactorSignIn(session, verificationId, verificationCode) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `resolveMultiFactorSignIn()` from the modular API instead.',
    );
    return this.native
      .resolveMultiFactorSignIn(session, verificationId, verificationCode)
      .then(userCredential => {
        return this._setUserCredential(userCredential);
      });
  }

  createUserWithEmailAndPassword(email, password) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `createUserWithEmailAndPassword()` from the modular API instead.',
    );
    return this.native
      .createUserWithEmailAndPassword(email, password)
      .then(userCredential => this._setUserCredential(userCredential));
  }

  signInWithEmailAndPassword(email, password) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInWithEmailAndPassword()` from the modular API instead.',
    );
    return this.native
      .signInWithEmailAndPassword(email, password)
      .then(userCredential => this._setUserCredential(userCredential));
  }

  signInWithCustomToken(customToken) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInWithCustomToken()` from the modular API instead.',
    );
    return this.native
      .signInWithCustomToken(customToken)
      .then(userCredential => this._setUserCredential(userCredential));
  }

  signInWithCredential(credential) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInWithCredential()` from the modular API instead.',
    );
    return this.native
      .signInWithCredential(credential.providerId, credential.token, credential.secret)
      .then(userCredential => this._setUserCredential(userCredential));
  }

  revokeToken(authorizationCode) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `revokeToken()` from the modular API instead.',
    );
    return this.native.revokeToken(authorizationCode);
  }

  sendPasswordResetEmail(email, actionCodeSettings = null) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `sendPasswordResetEmail()` from the modular API instead.',
    );
    return this.native.sendPasswordResetEmail(email, actionCodeSettings);
  }

  sendSignInLinkToEmail(email, actionCodeSettings = {}) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `sendSignInLinkToEmail()` from the modular API instead.',
    );
    return this.native.sendSignInLinkToEmail(email, actionCodeSettings);
  }

  isSignInWithEmailLink(emailLink) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `isSignInWithEmailLink()` from the modular API instead.',
    );
    return (
      typeof emailLink === 'string' &&
      (emailLink.includes('mode=signIn') || emailLink.includes('mode%3DsignIn')) &&
      (emailLink.includes('oobCode=') || emailLink.includes('oobCode%3D'))
    );
  }

  signInWithEmailLink(email, emailLink) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInWithEmailLink()` from the modular API instead.',
    );
    return this.native
      .signInWithEmailLink(email, emailLink)
      .then(userCredential => this._setUserCredential(userCredential));
  }

  confirmPasswordReset(code, newPassword) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `confirmPasswordReset()` from the modular API instead.',
    );
    return this.native.confirmPasswordReset(code, newPassword);
  }

  applyActionCode(code) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `applyActionCode()` from the modular API instead.',
    );
    return this.native.applyActionCode(code).then(user => {
      this._setUser(user);
    });
  }

  checkActionCode(code) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `checkActionCode()` from the modular API instead.',
    );
    return this.native.checkActionCode(code);
  }

  fetchSignInMethodsForEmail(email) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `fetchSignInMethodsForEmail()` from the modular API instead.',
    );
    return this.native.fetchSignInMethodsForEmail(email);
  }

  verifyPasswordResetCode(code) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `verifyPasswordResetCode()` from the modular API instead.',
    );
    return this.native.verifyPasswordResetCode(code);
  }

  useUserAccessGroup(userAccessGroup) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `useUserAccessGroup()` from the modular API instead.',
    );
    if (isAndroid) {
      return Promise.resolve();
    }
    return this.native.useUserAccessGroup(userAccessGroup);
  }

  getRedirectResult() {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `getRedirectResult()` from the modular API instead.',
    );
    throw new Error(
      'firebase.auth().getRedirectResult() is unsupported by the native Firebase SDKs.',
    );
  }

  setPersistence() {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `setPersistence()` from the modular API instead.',
    );
    throw new Error('firebase.auth().setPersistence() is unsupported by the native Firebase SDKs.');
  }

  signInWithPopup(provider) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInWithPopup()` from the modular API instead.',
    );
    return this.native
      .signInWithProvider(provider.toObject())
      .then(userCredential => this._setUserCredential(userCredential));
  }

  signInWithRedirect(provider) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `signInWithRedirect()` from the modular API instead.',
    );
    return this.native
      .signInWithProvider(provider.toObject())
      .then(userCredential => this._setUserCredential(userCredential));
  }

  // firebase issue - https://github.com/invertase/react-native-firebase/pull/655#issuecomment-349904680
  useDeviceLanguage() {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `useDeviceLanguage()` from the modular API instead.',
    );
    throw new Error(
      'firebase.auth().useDeviceLanguage() is unsupported by the native Firebase SDKs.',
    );
  }

  useEmulator(url) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `useEmulator()` from the modular API instead.',
    );
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
    const port = parseInt(urlMatches[2], 10);
    this.native.useEmulator(host, port);
    return [host, port]; // undocumented return, useful for unit testing
  }

  getMultiFactorResolver(error) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `getMultiFactorResolver()` from the modular API instead.',
    );
    return getMultiFactorResolver(this, error);
  }

  multiFactor(user) {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `multiFactor()` from the modular API instead.',
    );
    if (user.userId !== this.currentUser.userId) {
      throw new Error('firebase.auth().multiFactor() only operates on currentUser');
    }
    return new MultiFactorUser(this, user);
  }

  getCustomAuthDomain() {
    // eslint-disable-next-line no-console
    console.warn(
      'This method is deprecated. Please use `getCustomAuthDomain()` from the modular API instead.',
    );
    return this.native.getCustomAuthDomain();
  }
}

// import { SDK_VERSION } from '@react-native-firebase/auth';
export const SDK_VERSION = version;

// import auth from '@react-native-firebase/auth';
// auth().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: ['auth_state_changed', 'auth_id_token_changed', 'phone_auth_state_changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAuthModule,
});

export * from './modular/index';

// import auth, { firebase } from '@react-native-firebase/auth';
// auth().X(...);
// firebase.auth().X(...);
export const firebase = getFirebaseRoot();

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);
