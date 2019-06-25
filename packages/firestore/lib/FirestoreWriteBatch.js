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
  hasOwnProperty,
  isArray,
  isBoolean,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/common';

import { buildNativeMap } from './utils/serialize';
import FirestoreDocumentReference from './FirestoreDocumentReference';
import FirestoreFieldPath from './FirestoreFieldPath';
import { parseUpdateArgs } from './utils';

export default class FirestoreWriteBatch {
  constructor(firestore) {
    this._firestore = firestore;
    this._writes = [];
  }

  commit() {
    return this._firestore.native.documentBatch(this._writes);
  }

  delete(documentRef) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        `firebase.app().firestore.batch().delete(*) 'documentRef' expected instance of a DocumentReference.`,
      );
    }

    if (documentRef.firestore.app !== this._firestore.app) {
      throw new Error(
        `firebase.app().firestore.batch().delete(*) 'documentRef' provided DocumentReference os from a different Firestore instance.`,
      );
    }

    this._writes.push({
      path: documentRef.path,
      type: 'DELETE',
    });

    return this;
  }

  set(documentRef, data, options) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        `firebase.app().firestore.batch().set(*) 'documentRef' expected instance of a DocumentReference.`,
      );
    }

    if (documentRef.firestore.app !== this._firestore.app) {
      throw new Error(
        `firebase.app().firestore.batch().set(*) 'documentRef' provided DocumentReference os from a different Firestore instance.`,
      );
    }

    if (!isObject(data)) {
      throw new Error(`firebase.app().firestore.batch().set(_, *) 'data' must be an object.`);
    }

    const mergeOptions = {};

    if (!isUndefined(options)) {
      if (!isObject(options)) {
        throw new Error(
          `firebase.app().firestore().batch().set(_, _, *) 'options' must be an object.`,
        );
      }

      if (hasOwnProperty(options, 'merge') && hasOwnProperty(options, 'mergeFields')) {
        throw new Error(
          `firebase.app().firestore().batch().set(_, _, *) 'options' must not contain both 'merge' & 'mergeFields'.`,
        );
      }

      if (!isUndefined(options.merge)) {
        if (!isBoolean(options.merge)) {
          throw new Error(
            `firebase.app().firestore().batch().set(_, _, *) 'options.merge' must be a boolean value.`,
          );
        }

        mergeOptions.merge = true;
      }

      if (!isUndefined(options.mergeFields)) {
        if (!isArray(options.mergeFields)) {
          throw new Error(
            `firebase.app().firestore().batch().set(_, _, *) 'options.mergeFields' must be an array.`,
          );
        }

        mergeOptions.mergeFields = [];

        for (let i = 0; i < options.mergeFields.length; i++) {
          const field = options.mergeFields[i];
          if (!isString(field) && !(field instanceof FirestoreFieldPath)) {
            throw new Error(
              `firebase.app().firestore().batch().set(_, _, *) 'options.mergeFields' all fields must be of type string or FieldPath, but the value at index ${i} was ${typeof field}`,
            );
          }

          // TODO FieldPath isnt handled native? Is this ok?
          if (field instanceof FirestoreFieldPath) {
            mergeOptions.mergeFields.push(field._toPath());
          } else {
            mergeOptions.mergeFields.push(field);
          }
        }
      }
    }

    this._writes.push({
      path: documentRef.path,
      type: 'SET',
      data: buildNativeMap(data),
      options: mergeOptions,
    });
  }

  update(documentRef, ...args) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        `firebase.app().firestore.batch().delete(*) 'documentRef' expected instance of a DocumentReference.`,
      );
    }

    if (documentRef.firestore.app !== this._firestore.app) {
      throw new Error(
        `firebase.app().firestore.batch().delete(*) 'documentRef' provided DocumentReference os from a different Firestore instance.`,
      );
    }

    let data;
    try {
      data = parseUpdateArgs(args);
    } catch (e) {
      throw new Error(`firebase.app().firestore().batch().update(_, *) ${e.message}`);
    }

    this._writes.push({
      path: documentRef.path,
      type: 'UPDATE',
      data: buildNativeMap(data),
    });
  }
}
