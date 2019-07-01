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

import NativeError from '@react-native-firebase/app/lib/internal/NativeFirebaseError';
import {
  generateFirestoreId,
  hasOwnProperty,
  isBoolean,
  isFunction,
  isNull,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/common';

import FirestoreQuerySnapshot from './FirestoreQuerySnapshot';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';
import FirestoreFieldPath, { fromDotSeparatedString } from './FirestoreFieldPath';

export default class FirestoreQuery {
  constructor(firestore, collectionPath, modifiers) {
    this._firestore = firestore;
    this._collectionPath = collectionPath;
    this._modifiers = modifiers;
  }

  get firestore() {
    return this._firestore;
  }

  _handleQueryCursor(cursor, docOrField, fields) {
    // TODO ehesp - what cant be accepted?
    if (isUndefined(docOrField)) {
      throw new Error(
        `firebase.app().firestore().collection().${cursor}(*) Expected a DocumentSnapshot or list of field values but got undefined.`,
      );
    }

    // Handles cases where the first arg is a DocumentSnapshot
    if (docOrField instanceof FirestoreDocumentSnapshot) {
      if (fields.length > 0) {
        throw new Error(
          `firebase.app().firestore().collection().${cursor}(*) Too many arguments provided. Expected DocumentSnapshot or list of field values.`,
        );
      }

      const documentSnapshot = docOrField;

      if (!documentSnapshot.exists) {
        throw new Error(
          `firebase.app().firestore().collection().${cursor}(*) Can't use a DocumentSnapshot that doesn't exist.`,
        );
      }

      const currentOrders = this._modifiers.orders;

      // If no orders, build custom query
      if (currentOrders.length === 0) {
        return this._modifiers.setDocumentSnapshotCursor(cursor, documentSnapshot);
      }

      const values = [];

      for (let i = 0; i < currentOrders.length; i++) {
        const order = currentOrders[i];
        const value = documentSnapshot.get(order.fieldPath);

        if (value === undefined) {
          throw new Error(
            `firebase.app().firestore().collection().${cursor}(*) You are trying to start or end a query using a document for which the field '${
              order.fieldPath
            }' (used as the orderBy) does not exist.`,
          );
        }

        values.push(value);
      }

      return this._modifiers.setFieldsCursor(cursor, values);
    }

    /**
     * Assumes list of field values to query by. Orders must be of equal length.
     */

    const allFields = [docOrField].concat(fields);

    if (allFields.length > this._modifiers.orders.length) {
      throw new Error(
        `firebase.app().firestore().collection().${cursor}(*) Too many arguments provided. The number of arguments must be less than or equal to the number of orderBy() clauses.`,
      );
    }

    return this._modifiers.setFieldsCursor(cursor, allFields);
  }

  endAt(docOrField, ...fields) {
    return new FirestoreQuery(
      this._firestore,
      this._collectionPath,
      this._handleQueryCursor('endAt', docOrField, fields),
    );
  }

  endBefore(docOrField, ...fields) {
    return new FirestoreQuery(
      this._firestore,
      this._collectionPath,
      this._handleQueryCursor('endBefore', docOrField, fields),
    );
  }

  get(options) {
    if (!isUndefined(options) && !isObject(options)) {
      throw new Error(
        `firebase.app().firestore().collection().get(*) 'options' must be an object is provided.`,
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
        `firebase.app().firestore().collection().get(*) 'options' GetOptions.source must be one of 'default', 'server' or 'cache'.`,
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

  onSnapshot(...args) {
    /* eslint-disable prefer-destructuring */
    if (args.length === 0) {
      throw new Error(
        `firebase.app().firestore().collection().onSnapshot(*) expected at least one argument.`,
      );
    }

    // Ignore onComplete as its never used
    const NOOP = () => {};
    const snapshotListenOptions = {};
    let callback = NOOP;
    let onError = NOOP;
    let onNext = NOOP;

    /**
     * .onSnapshot(Function...
     */
    if (isFunction(args[0])) {
      /**
       * .onSnapshot((snapshot) => {}, (error) => {}
       */
      if (isFunction(args[1])) {
        onNext = args[0];
        onError = args[1];
      } else {
        /**
         * .onSnapshot((snapshot, error) => {})
         */
        callback = args[0];
      }
    }

    /**
     * .onSnapshot({ complete: () => {}, error: (e) => {}, next: (snapshot) => {} })
     */
    if (isObject(args[0]) && args[0].includeMetadataChanges === undefined) {
      if (args[0].error) onError = args[0].error;
      if (args[0].next) onNext = args[0].next;
    }

    /**
     * .onSnapshot(SnapshotListenOptions, ...
     */
    if (isObject(args[0]) && args[0].includeMetadataChanges !== undefined) {
      snapshotListenOptions.includeMetadataChanges = args[0].includeMetadataChanges;
      if (isFunction(args[1])) {
        /**
         * .onSnapshot(SnapshotListenOptions, Function);
         */
        if (isFunction(args[2])) {
          /**
           * .onSnapshot(SnapshotListenOptions, (snapshot) => {}, (error) => {});
           */
          onNext = args[1];
          onError = args[2];
        } else {
          /**
           * .onSnapshot(SnapshotListenOptions, (s, e) => {};
           */
          callback = args[1];
        }
      } else if (isObject(args[1])) {
        /**
         * .onSnapshot(SnapshotListenOptions, { complete: () => {}, error: (e) => {}, next: (snapshot) => {} });
         */
        if (isFunction(args[1].error)) onError = args[1].error;
        if (isFunction(args[1].next)) onNext = args[1].next;
      }
    }

    if (hasOwnProperty(snapshotListenOptions, 'includeMetadataChanges')) {
      if (!isBoolean(snapshotListenOptions.includeMetadataChanges)) {
        throw new Error(
          `firebase.app().firestore().collection().onSnapshot(*) 'options' SnapshotOptions.includeMetadataChanges must be a boolean value.`,
        );
      }
    }

    if (!isFunction(onNext)) {
      throw new Error(
        `firebase.app().firestore().collection().onSnapshot(*) 'observer.next' or 'onNext' expected a function.`,
      );
    }

    if (!isFunction(onError)) {
      throw new Error(
        `firebase.app().firestore().collection().onSnapshot(*) 'observer.error' or 'onError' expected a function.`,
      );
    }

    function handleSuccess(querySnapshot) {
      callback(querySnapshot, null);
      onNext(querySnapshot);
    }

    function handleError(error) {
      callback(null, error);
      onError(error);
    }

    const listenerId = generateFirestoreId();

    const onSnapshotSubscription = this._firestore.emitter.addListener(
      this._firestore.eventNameForApp('firestore_collection_sync_event'),
      event => {
        if (event.body.error) {
          handleError(NativeError.fromEvent(event.body.error, 'firestore'));
        } else {
          const querySnapshot = new FirestoreQuerySnapshot(
            this._firestore,
            this,
            event.body.snapshot,
          );
          handleSuccess(querySnapshot);
        }
      },
    );

    const unsubscribe = () => {
      onSnapshotSubscription.remove();
      this._firestore.native.collectionOffSnapshot(listenerId);
    };

    this._firestore.native.collectionOnSnapshot(
      this._collectionPath.relativeName,
      this._modifiers.type,
      this._modifiers.filters,
      this._modifiers.orders,
      this._modifiers.options,
      listenerId,
      snapshotListenOptions,
    );

    return unsubscribe;
  }

  orderBy(fieldPath, directionStr) {
    if (!isString(fieldPath) && !(fieldPath instanceof FirestoreFieldPath)) {
      throw new Error(
        `firebase.app().firestore().collection().orderBy(*) 'fieldPath' must be a string or instance of FieldPath.`,
      );
    }

    let path;

    if (isString(fieldPath)) {
      try {
        path = fromDotSeparatedString(fieldPath);
      } catch (e) {
        throw new Error(
          `firebase.app().firestore().collection().orderBy(*) 'fieldPath' ${e.message}.`,
        );
      }
    } else {
      path = fieldPath;
    }

    if (!isUndefined(directionStr) && !this._modifiers.isValidDirection(directionStr)) {
      throw new Error(
        `firebase.app().firestore().collection().orderBy(_, *) 'directionStr' must be one of 'asc' or 'desc'.`,
      );
    }

    if (this._modifiers.hasStart()) {
      throw new Error(
        `firebase.app().firestore().collection().orderBy() Invalid query. You must not call startAt() or startAfter() before calling orderBy().`,
      );
    }

    if (this._modifiers.hasEnd()) {
      throw new Error(
        `firebase.app().firestore().collection().orderBy() Invalid query. You must not call endAt() or endBefore() before calling orderBy().`,
      );
    }

    const modifiers = this._modifiers.orderBy(path, directionStr);

    return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
  }

  startAfter(docOrField, ...fields) {
    return new FirestoreQuery(
      this._firestore,
      this._collectionPath,
      this._handleQueryCursor('startAfter', docOrField, fields),
    );
  }

  startAt(docOrField, ...fields) {
    return new FirestoreQuery(
      this._firestore,
      this._collectionPath,
      this._handleQueryCursor('startAt', docOrField, fields),
    );
  }

  where(fieldPath, opStr, value) {
    if (!isString(fieldPath) && !(fieldPath instanceof FirestoreFieldPath)) {
      throw new Error(
        `firebase.app().firestore().collection().where(*) 'fieldPath' must be a string or instance of FieldPath.`,
      );
    }

    let path;

    if (isString(fieldPath)) {
      try {
        path = fromDotSeparatedString(fieldPath);
      } catch (e) {
        throw new Error(
          `firebase.app().firestore().collection().where(*) 'fieldPath' ${e.message}.`,
        );
      }
    } else {
      path = fieldPath;
    }

    if (!this._modifiers.isValidOperator(opStr)) {
      throw new Error(
        `firebase.app().firestore().collection().where(_, *) 'opStr' is invalid. Expected one of '==', '>', '>=', '<', '<=' or 'array-contains'.`,
      );
    }

    if (isUndefined(value)) {
      throw new Error(
        `firebase.app().firestore().collection().where(_, _, *) 'value' argument expected.`,
      );
    }

    if (isNull(value) && !this._modifiers.isEqualOperator(opStr)) {
      throw new Error(
        `firebase.app().firestore().collection().where(_, _, *) 'value' is invalid. You can only perform equals comparisons on null`,
      );
    }

    const modifiers = this._modifiers.where(path, opStr, value);

    try {
      modifiers.validateWhere();
    } catch (e) {
      throw new Error(`firebase.app().firestore().collection().where() ${e.message}`);
    }

    modifiers.validateWhere();

    return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
  }
}
