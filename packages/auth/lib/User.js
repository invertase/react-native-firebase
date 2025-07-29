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

import { isObject, isString, isUndefined, isBoolean } from '@react-native-firebase/app/lib/common';

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

  get multiFactor() {
    return this._user.multiFactor || null;
  }

  get phoneNumber() {
    return this._user.phoneNumber || null;
  }

  get tenantId() {
    return this._user.tenantId || null;
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

  linkWithPopup(provider) {
    // call through to linkWithRedirect for shared implementation
    return this.linkWithRedirect(provider);
  }

  linkWithRedirect(provider) {
    return this._auth.native
      .linkWithProvider(provider.toObject())
      .then(userCredential => this._auth._setUserCredential(userCredential));
  }

  reauthenticateWithCredential(credential) {
    return this._auth.native
      .reauthenticateWithCredential(credential.providerId, credential.token, credential.secret)
      .then(userCredential => this._auth._setUserCredential(userCredential));
  }

  reauthenticateWithPopup(provider) {
    // call through to reauthenticateWithRedirect for shared implementation
    return this.reauthenticateWithRedirect(provider);
  }

  reauthenticateWithRedirect(provider) {
    return this._auth.native
      .reauthenticateWithProvider(provider.toObject())
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

      if (!isUndefined(actionCodeSettings.linkDomain) && !isString(actionCodeSettings.linkDomain)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.linkDomain' expected a string value.",
        );
      }

      if (
        !isUndefined(actionCodeSettings.handleCodeInApp) &&
        !isBoolean(actionCodeSettings.handleCodeInApp)
      ) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.handleCodeInApp' expected a boolean value.",
        );
      }

      if (!isUndefined(actionCodeSettings.iOS)) {
        if (!isObject(actionCodeSettings.iOS)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.iOS' expected an object value.",
          );
        }
        if (!isString(actionCodeSettings.iOS.bundleId)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
      }

      if (!isUndefined(actionCodeSettings.android)) {
        if (!isObject(actionCodeSettings.android)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android' expected an object value.",
          );
        }
        if (!isString(actionCodeSettings.android.packageName)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.packageName' expected a string value.",
          );
        }

        if (
          !isUndefined(actionCodeSettings.android.installApp) &&
          !isBoolean(actionCodeSettings.android.installApp)
        ) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }

        if (
          !isUndefined(actionCodeSettings.android.minimumVersion) &&
          !isString(actionCodeSettings.android.minimumVersion)
        ) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
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

  verifyBeforeUpdateEmail(newEmail, actionCodeSettings) {
    if (!isString(newEmail)) {
      throw new Error(
        "firebase.auth.User.verifyBeforeUpdateEmail(*) 'newEmail' expected a string value.",
      );
    }

    if (isObject(actionCodeSettings)) {
      if (!isString(actionCodeSettings.url)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.url' expected a string value.",
        );
      }

      if (!isUndefined(actionCodeSettings.linkDomain) && !isString(actionCodeSettings.linkDomain)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.linkDomain' expected a string value.",
        );
      }

      if (
        !isUndefined(actionCodeSettings.handleCodeInApp) &&
        !isBoolean(actionCodeSettings.handleCodeInApp)
      ) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.handleCodeInApp' expected a boolean value.",
        );
      }

      if (!isUndefined(actionCodeSettings.iOS)) {
        if (!isObject(actionCodeSettings.iOS)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.iOS' expected an object value.",
          );
        }
        if (!isString(actionCodeSettings.iOS.bundleId)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
      }

      if (!isUndefined(actionCodeSettings.android)) {
        if (!isObject(actionCodeSettings.android)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android' expected an object value.",
          );
        }
        if (!isString(actionCodeSettings.android.packageName)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.packageName' expected a string value.",
          );
        }

        if (
          !isUndefined(actionCodeSettings.android.installApp) &&
          !isBoolean(actionCodeSettings.android.installApp)
        ) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }

        if (
          !isUndefined(actionCodeSettings.android.minimumVersion) &&
          !isString(actionCodeSettings.android.minimumVersion)
        ) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
      }
    }

    return this._auth.native.verifyBeforeUpdateEmail(newEmail, actionCodeSettings).then(user => {
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

  reauthenticateWithPhoneNumber() {
    throw new Error(
      'firebase.auth.User.reauthenticateWithPhoneNumber() is unsupported by the native Firebase SDKs.',
    );
  }

  get refreshToken() {
    throw new Error('firebase.auth.User.refreshToken is unsupported by the native Firebase SDKs.');
  }
}
