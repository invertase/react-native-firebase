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
  isFunction,
  isNull,
  isObject,
  isString,
  isUndefined,
  generateFirestoreId,
} from '@react-native-firebase/common';

import FirestoreQuerySnapshot from './FirestoreQuerySnapshot';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';
import FirestoreFieldPath from './FirestoreFieldPath';

export default class FirestoreQuery {
  constructor(firestore, collectionPath, modifiers) {
    this._firestore = firestore;
    this._collectionPath = collectionPath;
    this._modifiers = modifiers;
  }

  get firestore() {
    return this._firestore;
  }

  endAt(docOrField, ...fields) {
    if (isUndefined(docOrField)) {
      throw new Error(
        `firebase.app().firestore()...collection().endAt(*) Expected a DocumentSnapshot or list of field values but got undefined.`,
      );
    }

    // DocumentSnapshot param
    if (docOrField instanceof FirestoreDocumentSnapshot) {
      if (fields.length > 0) {
        throw new Error(
          `firebase.app().firestore()...collection().endAt(*) Too many arguments provided. Expected DocumentSnapshot or list of field values.`,
        );
      }

      const documentSnapshot = docOrField;

      if (!documentSnapshot.exists) {
        throw new Error(
          `firebase.app().firestore()...collection().endAt(*) Can't use a DocumentSnapshot that doesn't exist.`,
        );
      }

      // TODO How to handle a single endAt document snapshot?
      // TODO needs to be built on the native side?
      // No orderBy available
      if (this._modifiers.orders.length === 0) {
        // const modifiers = this._modifiers.orderBy(FirestoreFieldPath.documentId());
        // modifiers.setDocumentSnapshotCursor('endAt', documentSnapshot);
        // return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
        throw Error('TODO');
      }

      const values = [];

      for (let i = 0; i < this._modifiers.orders.length; i++) {
        const order = this._modifiers.orders[i];
        if (order.fieldPath.type === 'string') {
          values.push(documentSnapshot.get(order.fieldPath.string));
        } else if (order.fieldPath.type === 'fieldpath') {
          values.push(documentSnapshot.get(new FirestoreFieldPath(...order.fieldPath.elements)));
        }
      }

      const modifiers = this._modifiers.setFieldsCursor('endAt', values);
      return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
    }

    // List of fields
    const allFields = [docOrField].concat(fields);

    if (allFields.length > this._modifiers.orders.length) {
      throw new Error(
        `firebase.app().firestore()...collection().endAt(*) Too many arguments provided. The number of arguments must be less than or equal to the number of orderBy() clauses.`,
      );
    }

    const modifiers = this._modifiers.setFieldsCursor('endAt', allFields);
    return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
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

  onSnapshot(...args) {
    if (args.length === 0) {
      throw new Error(
        `firebase.app().firestore().collection().onSnapshot(*) expected at least one argument.`,
      );
    }

    const NOOP = () => {};
    const snapshotListenOptions = {};
    let callback = NOOP;
    let onError = NOOP;
    let onComplete = NOOP;
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
        /**
         * .onSnapshot((snapshot) => {}, (error) => {}, onComplete = {})
         */
        if (isFunction(args[2])) onComplete = args[3];
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
      if (args[0].complete) onComplete = args[0].complete;
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
          onNext = args[1];
          onError = args[2];
          if (isFunction(args[3])) onComplete = args[3];
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
        if (isFunction(args[1].complete)) onComplete = args[1].complete;
        if (isFunction(args[1].error)) onError = args[1].error;
        if (isFunction(args[1].next)) onNext = args[1].next;
      } else {
        /**
         * .onSnapshot(SnapshotListenOptions, (snapshot) => {});
         */
        if (isFunction(args[1])) {
          onNext = args[1];
        }
        /**
         * .onSnapshot(SnapshotListenOptions, (snapshot) => {}, (error) => {});
         */
        if (isFunction(args[2])) {
          onError = args[2];
        }
      }
    }

    if (!isFunction(callback)) {
    } // todo error
    if (!isFunction(onNext)) {
    } // todo error
    if (!isFunction(onComplete)) {
    } // todo error
    if (!isFunction(onError)) {
    } // todo error

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

    if (isString(fieldPath) && fieldPath === '') {
      throw new Error(
        `firebase.app().firestore().collection().orderBy(*) 'fieldPath' must not be an empty string.`,
      );
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
    if (!isString(fieldPath) && !(fieldPath instanceof FirestoreFieldPath)) {
      throw new Error(
        `firebase.app().firestore().collection().where(*) 'fieldPath' must be a string or instance of FieldPath.`,
      );
    }

    if (isString(fieldPath) && fieldPath === '') {
      throw new Error(
        `firebase.app().firestore().collection().where(*) 'fieldPath' must not be an empty string.`,
      );
    }

    if (!this._modifiers.isValidOperator(opStr)) {
      throw new Error(
        `firebase.app().firestore().collection().where(_, *) 'opStr' is invalid. Expected one of '=', '==', '>', '>=', '<', '<=' or 'array-contains'.`,
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

    const modifiers = this._modifiers.where(fieldPath, opStr, value);
    modifiers.validateWhere();

    return new FirestoreQuery(this._firestore, this._collectionPath, modifiers);
  }
}
