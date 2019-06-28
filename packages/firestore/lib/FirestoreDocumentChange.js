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

import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';

export default class FirestoreDocumentChange {
  constructor(firestore, nativeData) {
    this._firestore = firestore;
    this._nativeData = nativeData;
  }

  get doc() {
    return new FirestoreDocumentSnapshot(this._firestore, this._nativeData.doc);
  }

  get newIndex() {
    return this._nativeData.ni;
  }

  get oldIndex() {
    return this._nativeData.oi;
  }

  get type() {
    switch (this._nativeData.type) {
      case 'a':
        return 'added';
      case 'm':
        return 'modified';
      case 'r':
        return 'removed';
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown DocumentChange type recieved: ${this._nativeData.type}`);
        return 'unknown';
    }
  }
}
