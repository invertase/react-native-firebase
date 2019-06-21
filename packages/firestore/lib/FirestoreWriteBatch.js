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

import { buildNativeMap } from './utils/serialize';

export default class FirestoreWriteBatch {
  constructor(firestore) {
    this._firestore = firestore;
    this._writes = [];
  }

  commit() {
    return this._firestore.native.documentBatch(this._writes);
  }

  delete(docRef) {
    // todo validate is docref
    // todo validate is optional precondition?
    this._writes.push({
      path: docRef.path,
      type: 'DELETE',
    });
  }

  set(docRef, data, options) {
    // todo validate is docRef
    // todo validate is valid data
    // todo validate is optional precondition?
    this._writes.push({
      path: docRef.path,
      type: 'SET',
      data: buildNativeMap(data),
      options,
    });
  }

  update(docRef, ...args) {
    // todo validate is docref
    const data = {}; // todo parseUpdateArgs
    this._writes.push({
      path: docRef.path,
      type: 'UPDATE',
      data: buildNativeMap(data),
    });
  }
}
