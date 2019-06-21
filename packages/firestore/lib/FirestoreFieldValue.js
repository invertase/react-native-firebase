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

import { buildNativeArray } from './utils/serialize';

export const TypeFieldValueDelete = 'delete';
export const TypeFieldValueIncrement = 'increment';
export const TypeFieldValueRemove = 'remove';
export const TypeFieldValueUnion = 'union';
export const TypeFieldValueTimestamp = 'timestamp';

export default class FirestoreFieldValue {
  static delete() {
    return new FirestoreFieldValue(TypeFieldValueDelete);
  }

  static increment(n) {
    return new FirestoreFieldValue(TypeFieldValueIncrement, n);
  }

  static serverTimestamp() {
    return new FirestoreFieldValue(TypeFieldValueTimestamp);
  }

  static arrayUnion(...elements) {
    // TODO Salakar: v6: validate elements, any primitive or FirestoreReference allowed
    // TODO Salakar: v6: explicitly deny use of serverTimestamp - only allowed on set/update
    // TODO Salakar: v6: explicitly deny use of nested arrays - not supported on sdk
    return new FirestoreFieldValue(TypeFieldValueUnion, buildNativeArray(elements));
  }

  static arrayRemove(...elements) {
    // TODO Salakar: v6: validate elements, any primitive or FirestoreReference allowed
    // TODO Salakar: v6: explicitly deny use of serverTimestamp - only allowed on set/update
    // TODO Salakar: v6: explicitly deny use of nested arrays - not supported on sdk
    return new FieldValue(TypeFieldValueRemove, buildNativeArray(elements));
  }

  constructor(type, elements) {
    this._type = type;
    this._elements = elements;
  }

  get type() {
    return this._type;
  }

  get elements() {
    return this._elements;
  }
}
