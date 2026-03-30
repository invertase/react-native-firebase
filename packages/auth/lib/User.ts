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
import type { AuthInternal, NativeUserShape } from './types/internal';
import type {
  AuthCredential,
  AuthProvider,
  ActionCodeSettings,
  FirebaseAuth,
  UserInfo,
  MultiFactor,
  IdTokenResult,
} from './types/auth';
import type { FirebaseAuthTypes } from './types/namespaced';

/** Milliseconds since epoch; native modules use numbers, web auth supplies ISO strings (see RNFBAuthModule userMetadataToObject). */
function metadataTimestampToMs(value: number | string | null | undefined): number {
  if (value == null) {
    return 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const s = String(value).trim();
  if (s === '') {
    return 0;
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  const parsed = new Date(s).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default class User {
  _auth: AuthInternal;
  _user: NativeUserShape;

  constructor(auth: FirebaseAuth, user: NativeUserShape) {
    this._auth = auth as AuthInternal;
    this._user = user;
  }

  get displayName(): string | null {
    return this._user.displayName ?? null;
  }

  get email(): string | null {
    return this._user.email ?? null;
  }

  get emailVerified(): boolean {
    return this._user.emailVerified ?? false;
  }

  get isAnonymous(): boolean {
    return this._user.isAnonymous ?? false;
  }

  get metadata(): { lastSignInTime: string; creationTime: string } {
    const raw = this._user.metadata;
    const lastMs =
      raw != null && raw.lastSignInTime != null ? metadataTimestampToMs(raw.lastSignInTime) : 0;
    const creationMs =
      raw != null && raw.creationTime != null ? metadataTimestampToMs(raw.creationTime) : 0;
    const toIso = (ms: number) => {
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
    };
    return {
      lastSignInTime: toIso(lastMs),
      creationTime: toIso(creationMs),
    };
  }

  get multiFactor(): MultiFactor | null {
    return (this._user.multiFactor ?? null) as MultiFactor | null;
  }

  get phoneNumber(): string | null {
    return this._user.phoneNumber ?? null;
  }

  get tenantId(): string | null {
    return this._user.tenantId ?? null;
  }

  get photoURL(): string | null {
    return this._user.photoURL ?? null;
  }

  get providerData(): UserInfo[] {
    return (this._user.providerData ?? []) as UserInfo[];
  }

  get providerId(): string {
    return this._user.providerId ?? '';
  }

  get uid(): string {
    return this._user.uid ?? '';
  }

  delete(): Promise<void> {
    return this._auth.native.delete().then(() => {
      this._auth._setUser();
    });
  }

  getIdToken(forceRefresh = false): Promise<string> {
    return this._auth.native.getIdToken(forceRefresh);
  }

  getIdTokenResult(forceRefresh = false): Promise<IdTokenResult> {
    return this._auth.native.getIdTokenResult(forceRefresh) as Promise<IdTokenResult>;
  }

  linkWithCredential(credential: AuthCredential): Promise<FirebaseAuthTypes.UserCredential> {
    return this._auth.native
      .linkWithCredential(credential.providerId, credential.token, credential.secret)
      .then((userCredential: unknown) =>
        this._auth._setUserCredential(userCredential),
      ) as Promise<FirebaseAuthTypes.UserCredential>;
  }

  linkWithPopup(provider: AuthProvider): Promise<FirebaseAuthTypes.UserCredential> {
    return this.linkWithRedirect(provider);
  }

  linkWithRedirect(provider: AuthProvider): Promise<FirebaseAuthTypes.UserCredential> {
    return this._auth.native
      .linkWithProvider(provider.toObject())
      .then((userCredential: unknown) =>
        this._auth._setUserCredential(userCredential),
      ) as Promise<FirebaseAuthTypes.UserCredential>;
  }

  reauthenticateWithCredential(
    credential: AuthCredential,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return this._auth.native
      .reauthenticateWithCredential(credential.providerId, credential.token, credential.secret)
      .then((userCredential: unknown) =>
        this._auth._setUserCredential(userCredential),
      ) as Promise<FirebaseAuthTypes.UserCredential>;
  }

  reauthenticateWithPopup(provider: AuthProvider): Promise<FirebaseAuthTypes.UserCredential> {
    return this._auth.native
      .reauthenticateWithProvider(provider.toObject())
      .then((userCredential: unknown) =>
        this._auth._setUserCredential(userCredential),
      ) as Promise<FirebaseAuthTypes.UserCredential>;
  }

  reauthenticateWithRedirect(provider: AuthProvider): Promise<void> {
    return this._auth.native
      .reauthenticateWithProvider(provider.toObject())
      .then((userCredential: unknown) => {
        this._auth._setUserCredential(userCredential);
      }) as Promise<void>;
  }

  reload(): Promise<void> {
    return this._auth.native.reload().then((user: unknown) => {
      this._auth._setUser(user);
    }) as Promise<void>;
  }

  sendEmailVerification(actionCodeSettings?: ActionCodeSettings): Promise<void> {
    if (isObject(actionCodeSettings)) {
      const acs = actionCodeSettings as unknown as Record<string, unknown>;
      if (!isString(acs.url)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.url' expected a string value.",
        );
      }

      if (!isUndefined(acs.linkDomain) && !isString(acs.linkDomain)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.linkDomain' expected a string value.",
        );
      }

      if (!isUndefined(acs.handleCodeInApp) && !isBoolean(acs.handleCodeInApp)) {
        throw new Error(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.handleCodeInApp' expected a boolean value.",
        );
      }

      if (!isUndefined(acs.iOS)) {
        if (!isObject(acs.iOS)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.iOS' expected an object value.",
          );
        }
        const ios = acs.iOS as Record<string, unknown>;
        if (!isString(ios.bundleId)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
      }

      if (!isUndefined(acs.android)) {
        if (!isObject(acs.android)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android' expected an object value.",
          );
        }
        const android = acs.android as Record<string, unknown>;
        if (!isString(android.packageName)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.packageName' expected a string value.",
          );
        }

        if (!isUndefined(android.installApp) && !isBoolean(android.installApp)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }

        if (!isUndefined(android.minimumVersion) && !isString(android.minimumVersion)) {
          throw new Error(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
      }
    }

    return this._auth.native.sendEmailVerification(actionCodeSettings).then((user: unknown) => {
      this._auth._setUser(user);
    }) as Promise<void>;
  }

  toJSON(): Record<string, unknown> {
    return Object.assign({}, this._user) as Record<string, unknown>;
  }

  unlink(providerId: string): Promise<FirebaseAuthTypes.User> {
    return this._auth.native
      .unlink(providerId)
      .then((user: unknown) => this._auth._setUser(user)) as Promise<FirebaseAuthTypes.User>;
  }

  updateEmail(email: string): Promise<void> {
    return this._auth.native.updateEmail(email).then((user: unknown) => {
      this._auth._setUser(user);
    }) as Promise<void>;
  }

  updatePassword(password: string): Promise<void> {
    return this._auth.native.updatePassword(password).then((user: unknown) => {
      this._auth._setUser(user);
    }) as Promise<void>;
  }

  updatePhoneNumber(credential: AuthCredential): Promise<void> {
    return this._auth.native
      .updatePhoneNumber(credential.providerId, credential.token, credential.secret)
      .then((user: unknown) => {
        this._auth._setUser(user);
      }) as Promise<void>;
  }

  updateProfile(updates: Record<string, unknown>): Promise<void> {
    return this._auth.native.updateProfile(updates).then((user: unknown) => {
      this._auth._setUser(user);
    }) as Promise<void>;
  }

  verifyBeforeUpdateEmail(
    newEmail: string,
    actionCodeSettings?: ActionCodeSettings,
  ): Promise<void> {
    if (!isString(newEmail)) {
      throw new Error(
        "firebase.auth.User.verifyBeforeUpdateEmail(*) 'newEmail' expected a string value.",
      );
    }

    if (isObject(actionCodeSettings)) {
      const acs = actionCodeSettings as unknown as Record<string, unknown>;
      if (!isString(acs.url)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.url' expected a string value.",
        );
      }

      if (!isUndefined(acs.linkDomain) && !isString(acs.linkDomain)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.linkDomain' expected a string value.",
        );
      }

      if (!isUndefined(acs.handleCodeInApp) && !isBoolean(acs.handleCodeInApp)) {
        throw new Error(
          "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.handleCodeInApp' expected a boolean value.",
        );
      }

      if (!isUndefined(acs.iOS)) {
        if (!isObject(acs.iOS)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.iOS' expected an object value.",
          );
        }
        const ios = acs.iOS as Record<string, unknown>;
        if (!isString(ios.bundleId)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
      }

      if (!isUndefined(acs.android)) {
        if (!isObject(acs.android)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android' expected an object value.",
          );
        }
        const android = acs.android as Record<string, unknown>;
        if (!isString(android.packageName)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.packageName' expected a string value.",
          );
        }

        if (!isUndefined(android.installApp) && !isBoolean(android.installApp)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }

        if (!isUndefined(android.minimumVersion) && !isString(android.minimumVersion)) {
          throw new Error(
            "firebase.auth.User.verifyBeforeUpdateEmail(_, *) 'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
      }
    }

    return this._auth.native
      .verifyBeforeUpdateEmail(newEmail, actionCodeSettings)
      .then((user: unknown) => {
        this._auth._setUser(user);
      }) as Promise<void>;
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
