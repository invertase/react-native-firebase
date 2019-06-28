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
  isObject,
  isString,
  isArray,
  isUndefined,
  hasOwnProperty,
  isBoolean,
} from '@react-native-firebase/common';
import FirestoreCollectionReference from './FirestoreCollectionReference';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';
import FirestoreFieldPath from './FirestoreFieldPath';
import { buildNativeMap } from './utils/serialize';
import { parseUpdateArgs } from './utils';

export default class FirestoreDocumentReference {
  constructor(firestore, documentPath) {
    this._firestore = firestore;
    this._documentPath = documentPath;
  }

  get firestore() {
    return this._firestore;
  }

  get id() {
    return this._documentPath.id;
  }

  get parent() {
    const parentPath = this._documentPath.parent();
    // TODO circular ref?
    return new FirestoreCollectionReference(this._firestore, parentPath);
  }

  get path() {
    return this._documentPath.relativeName;
  }

  collection(collectionPath) {
    if (!isString(collectionPath)) {
      throw new Error(
        `firebase.app().firestore().doc().collection(*) 'collectionPath' must be a string value.`,
      );
    }

    if (collectionPath === '') {
      throw new Error(
        `firebase.app().firestore().doc().collection(*) 'collectionPath' must be a non-empty string.`,
      );
    }

    const path = this._documentPath.child(collectionPath);

    if (!path.isCollection) {
      throw new Error(
        `firebase.app().firestore().doc().collection(*) 'collectionPath' must point to a collection.`,
      );
    }

    return new FirestoreCollectionReference(this._firestore, path);
  }

  delete() {
    return this._firestore.native.documentDelete(this.path);
  }

  get(options) {
    if (!isUndefined(options) && !isObject(options)) {
      throw new Error(
        `firebase.app().firestore().doc().get(*) 'options' must be an object is provided.`,
      );
    }

    if (
      options &&
      options.source &&
      options.source !== 'default' &&
      options.source !== 'server' &&
      options.source !== 'cache'
    ) {
      throw new Error(
        `firebase.app().firestore().doc().get(*) 'options' GetOptions.source must be one of 'default', 'server' or 'cache'.`,
      );
    }

    return this._firestore.native
      .documentGet(this.path, options)
      .then(data => new FirestoreDocumentSnapshot(this._firestore, data));
  }

  isEqual(other) {
    // TODO (private to string method?)
    // https://github.com/invertase/react-native-firebase/blob/v5.x.x/src/modules/firestore/DocumentReference.js#L63
  }

  onSnapshot(observer) {
    // TODO
  }

  set(data, options) {
    if (!isObject(data)) {
      throw new Error(`firebase.app().firestore().doc().set(*) 'data' must be an object.`);
    }

    const mergeOptions = {};

    if (!isUndefined(options)) {
      if (!isObject(options)) {
        throw new Error(
          `firebase.app().firestore().doc().set(_, *) 'options' must be an object.`,
        );
      }

      if (hasOwnProperty(options, 'merge') && hasOwnProperty(options, 'mergeFields')) {
        throw new Error(
          `firebase.app().firestore().doc().set(_, *) 'options' must not contain both 'merge' & 'mergeFields'.`,
        );
      }

      if (!isUndefined(options.merge)) {
        if (!isBoolean(options.merge)) {
          throw new Error(
            `firebase.app().firestore().doc().set(_, *) 'options.merge' must be a boolean value.`,
          );
        }

        mergeOptions.merge = true;
      }

      if (!isUndefined(options.mergeFields)) {
        if (!isArray(options.mergeFields)) {
          throw new Error(
            `firebase.app().firestore().doc().set(_, *) 'options.mergeFields' must be an array.`,
          );
        }

        mergeOptions.mergeFields = [];

        for (let i = 0; i < options.mergeFields.length; i++) {
          const field = options.mergeFields[i];
          if (!isString(field) && !(field instanceof FirestoreFieldPath)) {
            throw new Error(
              `firebase.app().firestore().doc().set(_, *) 'options.mergeFields' all fields must be of type string or FieldPath, but the value at index ${i} was ${typeof field}`,
            );
          }

          if (field instanceof FirestoreFieldPath) {
            mergeOptions.mergeFields.push(field._toPath());
          } else {
            mergeOptions.mergeFields.push(field);
          }
        }
      }
    }

    return this._firestore.native.documentSet(this.path, buildNativeMap(data), mergeOptions);
  }

  update(...args) {
    if (args.length === 0) {
      throw new Error(
        `firebase.app().firestore().doc().update(*) expected at least 1 argument but was called with 0 arguments.`,
      );
    }

    let data;
    try {
      data = parseUpdateArgs(args);
    } catch (e) {
      throw new Error(`firebase.app().firestore().doc().update(*) ${e.message}`);
    }

    return this._firestore.native.documentUpdate(this.path, buildNativeMap(data));
  }
}
