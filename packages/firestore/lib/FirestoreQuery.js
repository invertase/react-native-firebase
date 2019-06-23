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

import { isObject, isUndefined } from '@react-native-firebase/common';

import FirestoreQuerySnapshot from './FirestoreQuerySnapshot';

export default class FirestoreQuery {
  constructor(firestore, collectionPath, modifiers) {
    this._firestore = firestore;
    this._collectionPath = collectionPath;
    this._modifiers = modifiers;
  }

  get firestore() {
    return this._firestore;
  }

  endAt(snapshot) {
    // TODO 2 signatures https://firebase.google.com/docs/reference/js/firebase.firestore.Query#end-at
  }

  endBefore(snapshot) {
    // TODO 2 signatures https://firebase.google.com/docs/reference/js/firebase.firestore.Query#end-at
  }

  get(options) {
    if (!isUndefined(options) && isObject(options)) {
      throw new Error(
        `firebase.app().firestore()...collection().get(*) 'options' must be an object is provided.`,
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
        `firebase.app().firestore()...collection().get(*) 'options' GetOptions.source must be one of 'default', 'server' or 'cache'.`,
      );
    }

    return this._firestore.native
      .collectionGet(
        this._collectionPath.relativeName,
        this._modifiers.type,
        this._modifiers.filters,
        this._modifiers.orders,
        this._modifiers.options,
        options,
      )
      .then(data => new FirestoreQuerySnapshot(this._firestore, this, data));
  }

  isEqual(other) {}

  limit(limit) {
    if (this._modifiers.isValidLimit(limit)) {
      throw new Error(
        `firebase.app().firestore().collection().limit(*) 'limit' must be a positive integer value.`,
      );
    }

    const modifiers = this._modifiers.limit(limit);

    return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
  }

  onSnapshot(observer) {}

  orderBy(fieldPath, directionStr) {
    // TODO validate
    // TODO cant have startAt
    // TODO cant have endAt

    const modifiers = this._modifiers.orderBy(fieldPath, directionStr);
    // TODO validate https://github.com/firebase/firebase-js-sdk/blob/master/packages/firestore/src/api/database.ts#L2010

    return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
  }

  startAfter(snapshot) {
    // TODO 2 signatures https://firebase.google.com/docs/reference/js/firebase.firestore.Query#end-at
  }

  startAt(snapshot) {
    // TODO 2 signatures https://firebase.google.com/docs/reference/js/firebase.firestore.Query#end-at
  }

  where(fieldPath, opStr, value) {
    // TODO validate

    const modifiers = this._modifiers.where(fieldPath, opStr, value);
    // TODO validate modifier filters

    return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
  }
}
