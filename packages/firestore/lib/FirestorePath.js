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

export default class FirestorePath {
  static fromName(name) {
    const parts = name.split('/');
    return new FirestorePath(parts);
  }

  constructor(pathComponents = []) {
    this._parts = pathComponents;
  }

  get id() {
    return this._parts.length ? this._parts[this._parts.length - 1] : '';
  }

  get isDocument() {
    return this._parts.length % 2 === 0;
  }

  get isCollection() {
    return this._parts.length % 2 === 1;
  }

  get relativeName() {
    return this._parts.join('/');
  }

  child(relativePath) {
    return new FirestorePath(this._parts.concat(relativePath.split('/')));
  }

  parent() {
    return this._parts.length > 1
      ? new FirestorePath(this._parts.slice(0, this._parts.length - 1))
      : null;
  }
}
