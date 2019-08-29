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

export default class ReferenceBase {
  constructor(_path) {
    let path = _path;

    if (path) {
      path = path.length > 1 && path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      if (path.startsWith('/') && path.length > 1) {
        path = path.substring(1, path.length);
      }
    } else {
      path = '/';
    }

    this.path = path;
  }

  /**
   * The last part of a Reference's path (after the last '/')
   * The key of a root Reference is null.
   * @type {String}
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#key}
   */
  get key() {
    return this.path === '/' ? null : this.path.substring(this.path.lastIndexOf('/') + 1);
  }
}
