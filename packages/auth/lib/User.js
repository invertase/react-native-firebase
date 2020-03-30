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

import { isObject, isString } from '@react-native-firebase/app/lib/common';

export default class User {
  constructor(auth, user) {
    this._auth = auth;
    this._user = user;
  }

  get displayName() {
    return this._user.displayName || null;
  }

  get email() {
    return this._user.email || null;
  }

  get emailVerified() {
    return this._user.emailVerified || false;
  }

  get isAnonymous() {
    return this._user.isAnonymous || false;
  }

  get metadata() {
    const { metadata } = this._user;

    return {
      lastSignInTime: new Date(metadata.lastSignInTime).toISOString(),
      creationTime: new Date(metadata.creationTime).toISOString(),
    };
  }

  get phoneNumber() {
    return this._user.phoneNumber || null;
  }

  get photoURL() {
    return this._user.photoURL || null;
  }

  get providerData() {
    return this._user.providerData;
  }

  get providerId() {
    return this._user.providerId;
  }

  get uid() {
    return this._user.uid;
  }

  delete() {
    return this._auth.native.delete().then(() => {
      this._auth._setUser();
    });
  }

  getIdToken(forceRefresh = false) {
    return this._auth.native.getIdToken(forceRefresh);
  }

  getIdTokenResult(forceRefresh = false) {
    return this._auth.native.getIdTokenResult(forceRefresh);
  }

  linkWithCredential(credential) {
    return this._auth.native
      .linkWithCredential(credential.providerId, credential.token, credential.secret)
      .then(userCredential => this._auth._setUserCredential(userCredential));
  }

  reauthenticateWithCredential(credential) {
    return this._auth.native
      .reauthenticateWithCredential(credential.providerId, credential.token, credential.secret)
      .then(userCredential => this._auth._setUserCredential(userCredential));
  }

  reload() {
    return this._auth.native.reload().then(user => {
      this._auth._setUser(user);
    });
  }

  sendEmailVerification(actionCodeSettings) {
    if (isObject(actionCodeSettings)) {
      if (!isString(actionCodeSettings.url)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.url' expected a string value.",
        );
      }
    }

    return this._auth.native.sendEmailVerification(actionCodeSettings).then(user => {
      this._auth._setUser(user);
    });
  }

  toJSON() {
    return Object.assign({}, this._user);
  }

  unlink(providerId) {
    return this._auth.native.unlink(providerId).then(user => this._auth._setUser(user));
  }

  updateEmail(email) {
    return this._auth.native.updateEmail(email).then(user => {
      this._auth._setUser(user);
    });
  }

  updatePassword(password) {
    return this._auth.native.updatePassword(password).then(user => {
      this._auth._setUser(user);
    });
  }

  updatePhoneNumber(credential) {
    return this._auth.native
      .updatePhoneNumber(credential.providerId, credential.token, credential.secret)
      .then(user => {
        this._auth._setUser(user);
      });
  }

  updateProfile(updates) {
    return this._auth.native.updateProfile(updates).then(user => {
      this._auth._setUser(user);
    });
  }

  /**
   * KNOWN UNSUPPORTED METHODS
   */

  linkWithPhoneNumber() {
    throw new Error(
      'firebase.auth.User.linkWithPhoneNumber() is unsupported by the native Firebase SDKs.',
    );
  }

  linkWithPopup() {
    throw new Error(
      'firebase.auth.User.linkWithPopup() is unsupported by the native Firebase SDKs.',
    );
  }

  linkWithRedirect() {
    throw new Error(
      'firebase.auth.User.linkWithRedirect() is unsupported by the native Firebase SDKs.',
    );
  }

  reauthenticateWithPhoneNumber() {
    throw new Error(
      'firebase.auth.User.reauthenticateWithPhoneNumber() is unsupported by the native Firebase SDKs.',
    );
  }

  reauthenticateWithPopup() {
    throw new Error(
      'firebase.auth.User.reauthenticateWithPopup() is unsupported by the native Firebase SDKs.',
    );
  }

  reauthenticateWithRedirect() {
    throw new Error(
      'firebase.auth.User.reauthenticateWithRedirect() is unsupported by the native Firebase SDKs.',
    );
  }

  get refreshToken() {
    throw new Error('firebase.auth.User.refreshToken is unsupported by the native Firebase SDKs.');
  }
}
