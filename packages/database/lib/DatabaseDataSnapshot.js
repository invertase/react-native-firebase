/* eslint-disable no-console */
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

export default class DatabaseDataSnapshot {
  constructor(reference, snapshot) {
    this._ref = reference;
    this._snapshot = snapshot;
  }

  get key() {
    return 'todo'; // TODO
  }

  get ref() {
    return 'todo'; // TODO
  }

  child(path) {
    // TODO
  }

  exists() {
    return false; // TODO
  }

  exportVal() {
    // TODO
  }

  forEach() {
    // TODO
  }

  getPriority() {
    // TODO
  }

  hasChild() {
    // TODO
  }

  hasChildren() {
    // TODO
  }

  numChildren() {
    // TODO
  }

  toJSON() {

  }

  val() {

  }
}
