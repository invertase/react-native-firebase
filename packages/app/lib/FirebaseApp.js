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

import { promiseDefer } from '@react-native-firebase/common';
import { getAppModule } from './internal/registry/nativeModule';

export default class FirebaseApp {
  constructor(options, appConfig, fromNative, deleteApp) {
    const { name, automaticDataCollectionEnabled } = appConfig;

    this._name = name;
    this._deleted = false;
    this._deleteApp = deleteApp;
    this._deferredPromise = promiseDefer();
    this._options = Object.assign({}, options);
    this._automaticDataCollectionEnabled = automaticDataCollectionEnabled;

    if (fromNative) {
      this._initialized = true;
      this._nativeInitialized = true;
      this._deferredPromise.resolve(this);
    } else {
      getAppModule().setAutomaticDataCollectionEnabled(name, automaticDataCollectionEnabled);
    }
  }

  _checkDestroyed() {
    if (this._deleted) {
      throw new Error(`Firebase App named '${this._name}' already deleted`);
    }
  }

  get name() {
    this._checkDestroyed();
    return this._name;
  }

  get options() {
    this._checkDestroyed();
    return Object.assign({}, this._options);
  }

  get automaticDataColletionEnabled() {
    this._checkDestroyed_();
    return this._automaticDataCollectionEnabled;
  }

  // TODO assert ow.boolean
  set automaticDataCollectionEnabled(enabled) {
    this._checkDestroyed();
    getAppModule().setAutomaticDataCollectionEnabled(this.name, enabled);
    this._automaticDataCollectionEnabled = enabled;
  }

  // TODO assert ow.object
  extendApp(extendedProps) {
    this._checkDestroyed();
    Object.assign(this, extendedProps || {});
  }

  delete() {
    this._checkDestroyed();
    return this._deleteApp();
  }

  get then() {
    if (this._initialized) return Promise.resolve(this).then;
    const { promise } = this._deferredPromise;
    return promise.then.bind(promise);
  }

  get catch() {
    const { promise } = this._deferredPromise;
    return promise.catch.bind(promise);
  }

  toString() {
    return this.name;
  }
}
