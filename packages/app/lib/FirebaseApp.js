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

export default class FirebaseApp {
  constructor(options, name, fromNative, deleteApp) {
    this._name = name;
    this._deleted = false;
    this._options = Object.assign({}, options);
    this._deleteApp = deleteApp;
    if (fromNative) {
      this._initialized = true;
      this._nativeInitialized = true;
    }
  }

  _checkDestroyed() {
    if (this._deleted) {
      throw new Error(`Firebase App named '${this._name}' already deleted`);
    }
  }

  /**
   *
   * @return {*}
   */
  get name() {
    this._checkDestroyed();
    return this._name;
  }

  /**
   *
   * @return {*}
   */
  get options() {
    this._checkDestroyed();
    return Object.assign({}, this._options);
  }

  extendApp(extendedProps = {}) {
    this._checkDestroyed();

    // TODO
  }

  /**
   *
   * @return {Promise}
   */
  delete() {
    this._checkDestroyed();
    return this._deleteApp();
  }

  /**
   *
   * @return {*}
   */
  onReady() {
    this._checkDestroyed();
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
