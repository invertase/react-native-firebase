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

import {
  isString,
  pathParent,
  pathChild,
} from '@react-native-firebase/common';

import DatabaseQuery from './DatabaseQuery';
import DatabaseQueryParams from './DatabaseQueryParams';

export default class DatabaseReference extends DatabaseQuery {
  constructor(database, path) {
    super(path, DatabaseQueryParams.DEFAULT);
    this._database = database;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#parent
   */
  get parent() {
    const parentPath = pathParent(this.path);
    if (parentPath === null) return parentPath;
    return new DatabaseReference(this._database, parentPath);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#ref
   */
  get ref() {
    return this;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#root
   */
  get root() {
    return new DatabaseReference(this._database, '/');
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#child
   */
  child(path) {
    if (!isString(path)) {
      throw new Error(`firebase.app().database().ref().child(*) 'path' must be a string value.`);
    }

    return new DatabaseReference(this._database, pathChild(this.path, path));
  }

  set() {

  }

  update() {

  }

  setWithPriority() {

  }

  remove() {

  }

  transaction() {

  }

  setPriority() {

  }

  push() {

  }

  onDisconnect() {

  }
}
