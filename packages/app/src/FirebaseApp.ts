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

import { getAppModule } from './internal/registry/nativeModule';
import { FirebaseAppImpl, FirebaseOptionsImpl, DeleteAppType, FirebaseConfigImpl } from './types';
import version from './version';
import { getApp, getApps, initializeApp } from './internal/registry/app';

export default class FirebaseApp implements FirebaseAppImpl {
  private _name: string;
  private _deleted: boolean;
  private _deleteApp: DeleteAppType;
  private _options: FirebaseOptionsImpl;
  private _automaticDataCollectionEnabled: boolean;
  //TODO are the below needed?
  private _initialized: boolean;
  private _nativeInitialized: boolean;

  constructor(
    options: FirebaseOptionsImpl,
    appConfig: { name: string; automaticDataCollectionEnabled?: boolean },
    fromNative: boolean,
    deleteApp: DeleteAppType,
  ) {
    const { name, automaticDataCollectionEnabled } = appConfig;
    this._deleted = false;
    this._name = name;
    this._deleteApp = deleteApp;
    this._options = Object.assign({}, options);
    this._automaticDataCollectionEnabled = !!automaticDataCollectionEnabled;

    if (fromNative) {
      this._initialized = true;
      this._nativeInitialized = true;
    } else {
      this._initialized = false;
      this._nativeInitialized = false;
    }
  }

  readonly SDK_VERSION = version;

  get apps() {
    return getApps();
  }

  app(name?: string): Promise<FirebaseAppImpl> {
    return Promise.resolve(getApp(name));
  }

  initializeApp(
    options: FirebaseOptionsImpl,
    configOrName: string | FirebaseConfigImpl,
  ): Promise<FirebaseAppImpl> {
    return initializeApp(options, configOrName);
  }

  // @ts-ignore
  utils() {
    throw new Error('Method not implemented.');
  }

  get name() {
    return this._name;
  }

  get options() {
    return Object.assign({}, this._options);
  }

  get initialized() {
    return this._initialized;
  }

  get nativeInitialized() {
    return this._nativeInitialized;
  }

  get automaticDataCollectionEnabled() {
    return this._automaticDataCollectionEnabled;
  }

  set automaticDataCollectionEnabled(enabled) {
    this._checkDestroyed();
    getAppModule().setAutomaticDataCollectionEnabled(this.name, enabled);
    this._automaticDataCollectionEnabled = enabled;
  }

  private _checkDestroyed() {
    if (this._deleted) {
      throw new Error(`Firebase App named '${this._name}' already deleted`);
    }
  }

  extendApp(extendedProps: Record<string, unknown>) {
    this._checkDestroyed();
    Object.assign(this, extendedProps);
  }

  delete() {
    this._checkDestroyed();
    return this._deleteApp();
  }

  toString() {
    return this.name;
  }
}
