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
  isObject,
  isString,
  isUndefined,
  isBoolean,
} from '@react-native-firebase/app/dist/module/common';
import type { IdTokenResult, UserInfo, UserMetadata } from './types/auth';
import type { FirebaseAuthTypes } from './types/namespaced';
import type { AuthInternal, NativeUserInternal } from './types/internal';

type AuthProviderWithObject = FirebaseAuthTypes.AuthProvider & {
  toObject(): Record<string, unknown>;
};

export default class User {
  private readonly _auth: AuthInternal;
  private readonly _user: NativeUserInternal;

  constructor(auth: AuthInternal, user: NativeUserInternal) {
    this._auth = auth;
    this._user = user;
  }

  get displayName(): string | null {
    return this._user.displayName || null;
  }

  get email(): string | null {
    return this._user.email || null;
  }

  get emailVerified(): boolean {
    return this._user.emailVerified || false;
  }

  get isAnonymous(): boolean {
    return this._user.isAnonymous || false;
  }

  get metadata(): UserMetadata {
    const { metadata } = this._user;

    return {
      lastSignInTime: new Date(metadata.lastSignInTime).toISOString(),
      creationTime: new Date(metadata.creationTime).toISOString(),
    };
  }

  get multiFactor(): FirebaseAuthTypes.MultiFactor | null {
    return this._user.multiFactor || null;
  }

  get phoneNumber(): string | null {
    return this._user.phoneNumber || null;
  }

  get tenantId(): string | null {
    return this._user.tenantId || null;
  }

  get photoURL(): string | null {
    return this._user.photoURL || null;
  }

  get providerData(): UserInfo[] {
    return this._user.providerData.map(provider => ({
      displayName: provider.displayName ?? null,
      email: provider.email ?? null,
      phoneNumber: provider.phoneNumber ?? null,
      photoURL: provider.photoURL ?? null,
      providerId: provider.providerId,
      uid: provider.uid,
    }));
  }

  get providerId(): string {
    return this._user.providerId;
  }

  get uid(): string {
    return this._user.uid;
  }

  delete(): Promise<void> {
    return this._auth.native.delete().then(() => {
      this._auth._setUser(null);
    });
  }

  getIdToken(forceRefresh = false): Promise<string> {
    return this._auth.native.getIdToken(forceRefresh);
  }

  getIdTokenResult(forceRefresh = false): Promise<IdTokenResult> {
    return this._auth.native.getIdTokenResult(forceRefresh) as Promise<IdTokenResult>;
  }

  linkWithCredential(
    credential: FirebaseAuthTypes.AuthCredential,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this._auth.native
      .linkWithCredential(credential.providerId, credential.token, credential.secret)
      .then(
        userCredential =>
          this._auth._setUserCredential(userCredential) as FirebaseAuthTypes.UserCredential,
      );
  }

  linkWithPopup(provider: AuthProviderWithObject): Promise<FirebaseAuthTypes.UserCredential> {
    // call through to linkWithRedirect for shared implementation
    return this.linkWithRedirect(provider);
  }

  linkWithRedirect(provider: AuthProviderWithObject): Promise<FirebaseAuthTypes.UserCredential> {
    return this._auth.native
      .linkWithProvider(provider.toObject())
      .then(
        userCredential =>
          this._auth._setUserCredential(userCredential) as FirebaseAuthTypes.UserCredential,
      );
  }

  reauthenticateWithCredential(
    credential: FirebaseAuthTypes.AuthCredential,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this._auth.native
      .reauthenticateWithCredential(credential.providerId, credential.token, credential.secret)
      .then(
        userCredential =>
          this._auth._setUserCredential(userCredential) as FirebaseAuthTypes.UserCredential,
      );
  }

  reauthenticateWithPopup(
    provider: AuthProviderWithObject,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    // call through to reauthenticateWithRedirect for shared implementation
    return this._auth.native
      .reauthenticateWithProvider(provider.toObject())
      .then(
        userCredential =>
          this._auth._setUserCredential(userCredential) as FirebaseAuthTypes.UserCredential,
      );
  }

  reauthenticateWithRedirect(provider: AuthProviderWithObject): Promise<void> {
    return this._auth.native.reauthenticateWithProvider(provider.toObject()).then(() => {});
  }

  reload(): Promise<void> {
    return this._auth.native.reload().then(user => {
      this._auth._setUser(user);
    });
  }

  sendEmailVerification(actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings): Promise<void> {
    if (isObject(actionCodeSettings)) {
      const settings = actionCodeSettings as FirebaseAuthTypes.ActionCodeSettings;

      if (!isString(settings.url)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.url' expected a string value.",
        );
      }

      if (!isUndefined(settings.linkDomain) && !isString(settings.linkDomain)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.linkDomain' expected a string value.",
        );
      }

      if (!isUndefined(settings.handleCodeInApp) && !isBoolean(settings.handleCodeInApp)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.handleCodeInApp' expected a boolean value.",
        );
      }

      if (!isUndefined(settings.iOS)) {
        if (!isObject(settings.iOS)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.iOS' expected an object value.",
          );
        }
        if (!isString(settings.iOS.bundleId)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
      }

      if (!isUndefined(settings.android)) {
        if (!isObject(settings.android)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android' expected an object value.",
          );
        }
        if (!isString(settings.android.packageName)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.packageName' expected a string value.",
          );
        }

        if (!isUndefined(settings.android.installApp) && !isBoolean(settings.android.installApp)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }

        if (
          !isUndefined(settings.android.minimumVersion) &&
          !isString(settings.android.minimumVersion)
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

  toJSON(): object {
    return Object.assign({}, this._user);
  }

  unlink(providerId: string): Promise<FirebaseAuthTypes.User> {
    return this._auth.native
      .unlink(providerId)
      .then(user => {
        const updatedUser = this._auth._setUser(user);
        if (!updatedUser) {
          throw new Error('firebase.auth.User.unlink() returned no user after unlinking provider.');
        }
        return updatedUser;
      });
  }

  updateEmail(email: string): Promise<void> {
    return this._auth.native.updateEmail(email).then(user => {
      this._auth._setUser(user);
    });
  }

  updatePassword(password: string): Promise<void> {
    return this._auth.native.updatePassword(password).then(user => {
      this._auth._setUser(user);
    });
  }

  updatePhoneNumber(credential: FirebaseAuthTypes.AuthCredential): Promise<void> {
    return this._auth.native
      .updatePhoneNumber(credential.providerId, credential.token, credential.secret)
      .then(user => {
        this._auth._setUser(user);
      });
  }

  updateProfile(updates: FirebaseAuthTypes.UpdateProfile): Promise<void> {
    return this._auth.native.updateProfile(updates).then(user => {
      this._auth._setUser(user);
    });
  }

  verifyBeforeUpdateEmail(
    newEmail: string,
    actionCodeSettings?: FirebaseAuthTypes.ActionCodeSettings,
  ): Promise<void> {
    if (!isString(newEmail)) {
      throw new Error(
        "firebase.auth.User.verifyBeforeUpdateEmail(*) 'newEmail' expected a string value.",
      );
    }

    if (isObject(actionCodeSettings)) {
      const settings = actionCodeSettings as FirebaseAuthTypes.ActionCodeSettings;

      if (!isString(settings.url)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.url' expected a string value.",
        );
      }

      if (!isUndefined(settings.linkDomain) && !isString(settings.linkDomain)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.linkDomain' expected a string value.",
        );
      }

      if (!isUndefined(settings.handleCodeInApp) && !isBoolean(settings.handleCodeInApp)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.handleCodeInApp' expected a boolean value.",
        );
      }

      if (!isUndefined(settings.iOS)) {
        if (!isObject(settings.iOS)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.iOS' expected an object value.",
          );
        }
        if (!isString(settings.iOS.bundleId)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
      }

      if (!isUndefined(settings.android)) {
        if (!isObject(settings.android)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android' expected an object value.",
          );
        }
        if (!isString(settings.android.packageName)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.packageName' expected a string value.",
          );
        }

        if (!isUndefined(settings.android.installApp) && !isBoolean(settings.android.installApp)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }

        if (
          !isUndefined(settings.android.minimumVersion) &&
          !isString(settings.android.minimumVersion)
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

  linkWithPhoneNumber(): never {
    throw new Error(
      'firebase.auth.User.linkWithPhoneNumber() is unsupported by the native Firebase SDKs.',
    );
  }

  reauthenticateWithPhoneNumber(): never {
    throw new Error(
      'firebase.auth.User.reauthenticateWithPhoneNumber() is unsupported by the native Firebase SDKs.',
    );
  }

  get refreshToken(): never {
    throw new Error('firebase.auth.User.refreshToken is unsupported by the native Firebase SDKs.');
  }
}
