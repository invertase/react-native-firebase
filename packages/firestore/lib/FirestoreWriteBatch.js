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
import FirestoreFieldPath, { fromDotSeparatedString } from './FirestoreFieldPath';
import { parseUpdateArgs } from './utils';

export default class FirestoreWriteBatch {
  constructor(firestore) {
    this._firestore = firestore;
    this._writes = [];
  }

  commit() {
    if (this._writes.length === 0) return Promise.resolve();
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
        `firebase.app().firestore.batch().delete(*) 'documentRef' provided DocumentReference is from a different Firestore instance.`,
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
        `firebase.app().firestore.batch().set(*) 'documentRef' provided DocumentReference is from a different Firestore instance.`,
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
              `firebase.app().firestore().batch().set(_, _, *) 'options.mergeFields' all fields must be of type string or FieldPath, but the value at index ${i} was ${typeof field}.`,
            );
          }

          let path;

          if (isString(field)) {
            try {
              path = fromDotSeparatedString(field);
            } catch (e) {
              throw new Error(
                `firebase.app().firestore().batch().set(_, _, *) 'options.mergeFields' ${e.message}.`,
              );
            }
          } else {
            path = field;
          }

          mergeOptions.mergeFields.push(path._toPath());
        }
      }
    }

    this._writes.push({
      path: documentRef.path,
      type: 'SET',
      data: buildNativeMap(data),
      options: mergeOptions,
    });

    return this;
  }

  update(documentRef, ...args) {
    if (!(documentRef instanceof FirestoreDocumentReference)) {
      throw new Error(
        `firebase.app().firestore.batch().update(*) 'documentRef' expected instance of a DocumentReference.`,
      );
    }

    if (documentRef.firestore.app !== this._firestore.app) {
      throw new Error(
        `firebase.app().firestore.batch().update(*) 'documentRef' provided DocumentReference is from a different Firestore instance.`,
      );
    }

    if (args.length === 0) {
      throw new Error(
        `firebase.app().firestore.batch().update(_, *) Invalid arguments. Expected update object or list of key/value pairs.`,
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

    return this;
  }
}
