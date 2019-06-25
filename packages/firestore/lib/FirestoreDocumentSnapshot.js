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

import { deepGet } from '@react-native-firebase/common/lib/deeps';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import FirestoreFieldPath from './FirestoreFieldPath';
import FirestorePath from './FirestorePath';
import { extractFieldPathData } from './utils';
import { parseNativeMap } from './utils/serialize';
import { isString } from '@react-native-firebase/common';

export default class FirestoreDocumentSnapshot {
  constructor(firestore, nativeData) {
    this._data = parseNativeMap(firestore, nativeData.data);
    this._metadata = nativeData.metadata;
    this._ref = new FirestoreDocumentReference(firestore, FirestorePath.fromName(nativeData.path));
  }

  get exists() {
    return this._data !== undefined;
  }

  get id() {
    return this._ref.id;
  }

  get metadata() {
    return this._metadata;
  }

  get ref() {
    return this._ref;
  }

  data(options) {
    // todo options
    return this._data;
  }

  get(fieldPath, options) {
    // todo valid path (no start end ., or ..
    // todo validate string or instance

    if (!isString(fieldPath) && !(fieldPath instanceof FirestoreFieldPath)) {
      throw new Error('bad fieldpath TODO');
    }

    if (fieldPath instanceof FirestoreFieldPath) {
      return extractFieldPathData(this._data, fieldPath._segments);
    }
    // todo options

    return deepGet(this._data, fieldPath);
  }

  isEqual(other) {
    // todo
  }
}
