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
import { warnIfNotModularCall } from './common';
import { getAppModule } from './internal/registry/nativeModule';
import type { ReactNativeFirebase, Utils } from './types/app';

export default class FirebaseApp implements ReactNativeFirebase.FirebaseAppBase {
  private _name: string;
  private _deleted: boolean;
  private _deleteApp: () => Promise<void>;
  private _options: ReactNativeFirebase.FirebaseAppOptions;
  private _automaticDataCollectionEnabled: boolean;
  _initialized: boolean;
  _nativeInitialized: boolean;

  constructor(
    options: ReactNativeFirebase.FirebaseAppOptions,
    appConfig: ReactNativeFirebase.FirebaseAppConfig,
    fromNative: boolean,
    deleteApp: () => Promise<void>,
  ) {
    const { name = '[DEFAULT]', automaticDataCollectionEnabled } = appConfig;

    this._name = name;
    this._deleted = false;
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

  get name(): string {
    return this._name;
  }

  get options(): ReactNativeFirebase.FirebaseAppOptions {
    return Object.assign({}, this._options);
  }

  get automaticDataCollectionEnabled(): boolean {
    return this._automaticDataCollectionEnabled;
  }

  set automaticDataCollectionEnabled(enabled: boolean) {
    this._checkDestroyed();
    getAppModule().setAutomaticDataCollectionEnabled(this.name, enabled);
    this._automaticDataCollectionEnabled = enabled;
  }

  private _checkDestroyed(): void {
    if (this._deleted) {
      throw new Error(`Firebase App named '${this._name}' already deleted`);
    }
  }

  extendApp(extendedProps: Record<string, unknown>): void {
    warnIfNotModularCall(arguments);
    this._checkDestroyed();
    Object.assign(this, extendedProps);
  }

  delete(): Promise<void> {
    warnIfNotModularCall(arguments, 'deleteApp()');
    this._checkDestroyed();
    return this._deleteApp();
  }

  toString(): string {
    warnIfNotModularCall(arguments, '.name property');
    return this.name;
  }

  // For backward compatibility - utils method added by registry
  utils(): Utils.Module {
    throw new Error('utils() should be added by registry');
  }
}
