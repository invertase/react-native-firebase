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
import { isNotModularCall } from '@react-native-firebase/app/lib/common';
import { getAppModule } from './internal/registry/nativeModule';

export default class FirebaseApp {
  constructor(options, appConfig, fromNative, deleteApp) {
    const { name, automaticDataCollectionEnabled } = appConfig;

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

  get name() {
    return this._name;
  }

  get options() {
    return Object.assign({}, this._options);
  }

  get automaticDataCollectionEnabled() {
    return this._automaticDataCollectionEnabled;
  }

  set automaticDataCollectionEnabled(enabled) {
    this._checkDestroyed();
    getAppModule().setAutomaticDataCollectionEnabled(this.name, enabled);
    this._automaticDataCollectionEnabled = enabled;
  }

  _checkDestroyed() {
    if (this._deleted) {
      throw new Error(`Firebase App named '${this._name}' already deleted`);
    }
  }

  extendApp(extendedProps) {
    if (isNotModularCall(arguments)) {
      // eslint-disable-next-line no-console
      console.warn(
        'This v8 method is deprecated and will be removed in the next major release as part of move to match Firebase Web modular v9 SDK API.',
      );
    }
    this._checkDestroyed();
    Object.assign(this, extendedProps);
  }

  delete() {
    if (isNotModularCall(arguments)) {
      // eslint-disable-next-line no-console
      console.warn(
        'This v8 method is deprecated and will be removed in the next major release as part of move to match Firebase Web modular v9 SDK API. Please use `deleteApp()` instead.',
      );
    }
    this._checkDestroyed();
    return this._deleteApp();
  }

  toString() {
    if (isNotModularCall(arguments)) {
      // eslint-disable-next-line no-console
      console.warn(
        'This v8 method is deprecated and will be removed in the next major release as part of move to match Firebase Web modular v9 SDK API.',
      );
    }
    return this.name;
  }
}
