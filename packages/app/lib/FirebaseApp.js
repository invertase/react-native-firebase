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

import { NativeModules } from 'react-native';

import { isObject } from '@react-native-firebase/common';

export default class FirebaseApp {
  constructor(options = {}, name, fromNative = false, deleteApp) {
    this._name = name;
    this._deleted = false;
    this._options = Object.assign({}, options);
    this._deleteApp = deleteApp;
    if (fromNative) {
      this._initialized = true;
      this._nativeInitialized = true;
    }
  }

  /**
   *
   * @return {*}
   */
  get name() {
    return this._name;
  }

  /**
   *
   * @return {*}
   */
  get options() {
    return Object.assign({}, this._options);
  }

  extendApp(extendedProps = {}) {
    // TODO
  }

  /**
   *
   * @return {Promise}
   */
  delete() {
    if (this._name === APPS.DEFAULT_APP_NAME && this._nativeInitialized) {
      return Promise.reject(
        new Error('Unable to delete the default native firebase app instance.'),
      );
    }

    return FirebaseCoreModule.deleteApp(this.name).then(() => this._deleteApp(this.name));
  }

  /**
   *
   * @return {*}
   */
  onReady() {
    if (this._initialized) return Promise.resolve(this);

    return new Promise((resolve, reject) => {
      SharedEventEmitter.once(`AppReady:${this._name}`, ({ error }) => {
        if (error) return reject(new Error(error)); // error is a string as it's from native
        return resolve(this); // return app
      });
    });
  }

  /**
   * toString returns the name of the app.
   *
   * @return {string}
   */
  toString() {
    return this.name;
  }
}
