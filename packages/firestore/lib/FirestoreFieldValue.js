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

import { isArray, isNumber } from '@react-native-firebase/app/lib/common';
import { buildNativeArray, provideFieldValueClass } from './utils/serialize';

export const TypeFieldValueDelete = 'delete';
export const TypeFieldValueIncrement = 'increment';
export const TypeFieldValueRemove = 'array_remove';
export const TypeFieldValueUnion = 'array_union';
export const TypeFieldValueTimestamp = 'timestamp';

function validateArrayElements(elements) {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (element instanceof FirestoreFieldValue) {
      throw new Error('FieldValue instance cannot be used with other FieldValue methods.');
    }

    if (isArray(element)) {
      throw new Error('Nested arrays are not supported');
    }
  }
}

export default class FirestoreFieldValue {
  constructor(internal = false, type, elements) {
    if (internal === false) {
      throw new Error(
        'firebase.firestore.FieldValue constructor is private, use FieldValue.<field>() instead.',
      );
    }

    this._type = type;
    this._elements = elements;
  }

  static delete() {
    return new FirestoreFieldValue(true, TypeFieldValueDelete);
  }

  static increment(n) {
    if (!isNumber(n)) {
      throw new Error("firebase.firestore.FieldValue.increment(*) 'n' expected a number value.");
    }

    return new FirestoreFieldValue(true, TypeFieldValueIncrement, n);
  }

  static serverTimestamp() {
    return new FirestoreFieldValue(true, TypeFieldValueTimestamp);
  }

  static arrayUnion(...elements) {
    try {
      validateArrayElements(elements);
    } catch (e) {
      throw new Error(
        `firebase.firestore.FieldValue.arrayUnion(*) 'elements' called with invalid data. ${
          e.message
        }`,
      );
    }

    return new FirestoreFieldValue(true, TypeFieldValueUnion, buildNativeArray(elements));
  }

  static arrayRemove(...elements) {
    try {
      validateArrayElements(elements);
    } catch (e) {
      throw new Error(
        `firebase.firestore.FieldValue.arrayRemove(*) 'elements' called with invalid data. ${
          e.message
        }`,
      );
    }

    return new FirestoreFieldValue(true, TypeFieldValueRemove, buildNativeArray(elements));
  }

  isEqual(other) {
    if (!(other instanceof FirestoreFieldValue)) {
      throw new Error(
        "firebase.firestore.FieldValue.isEqual(*) 'other' expected a FieldValue instance.",
      );
    }

    return (
      this._type === other._type &&
      JSON.stringify(this._elements) === JSON.stringify(other._elements)
    );
  }
}

provideFieldValueClass(FirestoreFieldValue); // serialize
