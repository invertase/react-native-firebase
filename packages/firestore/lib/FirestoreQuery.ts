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
  createDeprecationProxy,
  filterModularArgument,
  isArray,
  isNull,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import NativeError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import { FirestoreAggregateQuery } from './FirestoreAggregate';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';
import FirestoreFieldPath, { fromDotSeparatedString } from './FirestoreFieldPath';
import { _Filter, generateFilters } from './FirestoreFilter';
import FirestoreQueryModifiers from './FirestoreQueryModifiers';
import FirestoreQuerySnapshot from './FirestoreQuerySnapshot';
import { parseSnapshotArgs, validateWithConverter } from './utils';

import type FirestorePath from './FirestorePath';

let _id = 0;

export default class FirestoreQuery {
  _firestore: any;
  _collectionPath: FirestorePath;
  _modifiers: FirestoreQueryModifiers;
  _queryName: string | undefined;
  _converter: unknown;

  constructor(
    firestore: any,
    collectionPath: FirestorePath,
    modifiers: FirestoreQueryModifiers,
    queryName?: string,
    converter?: unknown,
  ) {
    this._firestore = firestore;
    this._collectionPath = collectionPath;
    this._modifiers = modifiers;
    this._queryName = queryName;
    this._converter = converter ?? null;
  }

  get firestore(): any {
    return this._firestore;
  }

  get converter(): unknown {
    return this._converter;
  }

  _handleQueryCursor(
    cursor: 'startAt' | 'startAfter' | 'endAt' | 'endBefore',
    docOrField: FirestoreDocumentSnapshot | unknown,
    fields: unknown[],
  ): FirestoreQueryModifiers {
    const modifiers = this._modifiers._copy();

    if (isUndefined(docOrField)) {
      throw new Error(
        `firebase.firestore().collection().${cursor}(*) Expected a DocumentSnapshot or list of field values but got undefined.`,
      );
    }

    if (docOrField instanceof FirestoreDocumentSnapshot) {
      if (fields.length > 0) {
        throw new Error(
          `firebase.firestore().collection().${cursor}(*) Too many arguments provided. Expected DocumentSnapshot or list of field values.`,
        );
      }

      const documentSnapshot = docOrField;

      if (!documentSnapshot.exists()) {
        throw new Error(
          `firebase.firestore().collection().${cursor}(*) Can't use a DocumentSnapshot that doesn't exist.`,
        );
      }

      const currentOrders = modifiers.orders;
      const values: unknown[] = [];

      for (let i = 0; i < currentOrders.length; i++) {
        const order = currentOrders[i]!;
        const pathStr = Array.isArray(order.fieldPath)
          ? order.fieldPath.join('.')
          : String(order.fieldPath);
        if (pathStr === '__name__') {
          continue;
        }

        const value = documentSnapshot.get(order.fieldPath as string | string[]);

        if (value === undefined) {
          throw new Error(
            `firebase.firestore().collection().${cursor}(*) You are trying to start or end a query using a document for which the field '${pathStr}' (used as the orderBy) does not exist.`,
          );
        }

        values.push(value);
      }

      if (modifiers._orders.length) {
        const lastOrder = modifiers._orders[modifiers._orders.length - 1]!;
        const lastPathStr =
          lastOrder.fieldPath instanceof FirestoreFieldPath
            ? lastOrder.fieldPath._toPath()
            : String(lastOrder.fieldPath);
        if (lastPathStr !== '__name__') {
          modifiers._orders.push({
            fieldPath: new FirestoreFieldPath('__name__'),
            direction: lastOrder.direction,
          });
        }
      } else {
        modifiers._orders.push({
          fieldPath: new FirestoreFieldPath('__name__'),
          direction: 'ASCENDING',
        });
      }

      if (this._modifiers.isCollectionGroupQuery()) {
        values.push(documentSnapshot.ref.path);
      } else {
        values.push(documentSnapshot.id);
      }

      return modifiers.setFieldsCursor(cursor, values);
    }

    const allFields = [docOrField].concat(fields);

    if (allFields.length > modifiers.orders.length) {
      throw new Error(
        `firebase.firestore().collection().${cursor}(*) Too many arguments provided. The number of arguments must be less than or equal to the number of orderBy() clauses.`,
      );
    }

    return modifiers.setFieldsCursor(cursor, allFields);
  }

  count(): ReturnType<typeof createDeprecationProxy> {
    return createDeprecationProxy(
      new FirestoreAggregateQuery(this._firestore, this, this._collectionPath, this._modifiers),
    );
  }

  countFromServer(): ReturnType<FirestoreQuery['count']> {
    return this.count();
  }

  endAt(
    docOrField: FirestoreDocumentSnapshot | unknown,
    ...fields: unknown[]
  ): ReturnType<typeof createDeprecationProxy> {
    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        this._handleQueryCursor('endAt', docOrField, filterModularArgument(fields)),
        this._queryName,
        this._converter,
      ),
    );
  }

  endBefore(
    docOrField: FirestoreDocumentSnapshot | unknown,
    ...fields: unknown[]
  ): ReturnType<typeof createDeprecationProxy> {
    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        this._handleQueryCursor('endBefore', docOrField, filterModularArgument(fields)),
        this._queryName,
        this._converter,
      ),
    );
  }

  get(options?: { source?: 'default' | 'server' | 'cache' }): Promise<FirestoreQuerySnapshot> {
    if (!isUndefined(options) && !isObject(options)) {
      throw new Error(
        "firebase.firestore().collection().get(*) 'options' must be an object is provided.",
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
        "firebase.firestore().collection().get(*) 'options' GetOptions.source must be one of 'default', 'server' or 'cache'.",
      );
    }

    if (!isUndefined(this._queryName)) {
      return this._firestore.native
        .namedQueryGet(
          this._queryName,
          this._modifiers.type,
          this._modifiers.filters,
          this._modifiers.orders,
          this._modifiers.options,
          options,
        )
        .then(
          (data: any) => new FirestoreQuerySnapshot(this._firestore, this, data, this._converter),
        );
    }

    this._modifiers.validatelimitToLast();

    return this._firestore.native
      .collectionGet(
        this._collectionPath.relativeName,
        this._modifiers.type,
        this._modifiers.filters,
        this._modifiers.orders,
        this._modifiers.options,
        options,
      )
      .then(
        (data: any) => new FirestoreQuerySnapshot(this._firestore, this, data, this._converter),
      );
  }

  isEqual(other: FirestoreQuery): boolean {
    if (!(other instanceof FirestoreQuery)) {
      throw new Error(
        "firebase.firestore().collection().isEqual(*) 'other' expected a Query instance.",
      );
    }

    if (
      this.firestore.app.name !== other.firestore.app.name ||
      this._modifiers.type !== other._modifiers.type ||
      this._modifiers.filters.length !== other._modifiers.filters.length ||
      this._modifiers.orders.length !== other._modifiers.orders.length ||
      this._collectionPath.relativeName !== other._collectionPath.relativeName ||
      this._converter !== other._converter ||
      Object.keys(this._modifiers.options).length !== Object.keys(other._modifiers.options).length
    ) {
      return false;
    }

    if (
      JSON.stringify(this._modifiers.filters) !== JSON.stringify(other._modifiers.filters) ||
      JSON.stringify(this._modifiers.orders) !== JSON.stringify(other._modifiers.orders) ||
      JSON.stringify(this._modifiers.options) !== JSON.stringify(other._modifiers.options)
    ) {
      return false;
    }

    return true;
  }

  limit(limit: number): ReturnType<typeof createDeprecationProxy> {
    if (this._modifiers.isValidLimit(limit)) {
      throw new Error(
        "firebase.firestore().collection().limit(*) 'limit' must be a positive integer value.",
      );
    }

    const modifiers = this._modifiers._copy().limit(limit);

    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        modifiers,
        this._queryName,
        this._converter,
      ),
    );
  }

  limitToLast(limitToLast: number): ReturnType<typeof createDeprecationProxy> {
    if (this._modifiers.isValidLimitToLast(limitToLast)) {
      throw new Error(
        "firebase.firestore().collection().limitToLast(*) 'limitToLast' must be a positive integer value.",
      );
    }

    const modifiers = this._modifiers._copy().limitToLast(limitToLast);

    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        modifiers,
        this._queryName,
        this._converter,
      ),
    );
  }

  onSnapshot(...args: unknown[]): () => void {
    let snapshotListenOptions: { includeMetadataChanges?: boolean };
    let callback: (snapshot: FirestoreQuerySnapshot | null, error: Error | null) => void;
    let onNext: (snapshot: FirestoreQuerySnapshot) => void;
    let onError: (error: Error) => void;

    this._modifiers.validatelimitToLast();

    try {
      const options = parseSnapshotArgs(filterModularArgument(args));
      snapshotListenOptions = options.snapshotListenOptions;
      callback = options.callback;
      onNext = options.onNext;
      onError = options.onError;
    } catch (e) {
      throw new Error(`firebase.firestore().collection().onSnapshot(*) ${(e as Error).message}`);
    }

    function handleSuccess(querySnapshot: FirestoreQuerySnapshot): void {
      callback(querySnapshot, null);
      onNext(querySnapshot);
    }

    function handleError(error: Error): void {
      callback(null, error);
      onError(error);
    }

    const listenerId = _id++;

    const onSnapshotSubscription = this._firestore.emitter.addListener(
      this._firestore.eventNameForApp(`firestore_collection_sync_event:${listenerId}`),
      (event: { body: { error?: unknown; snapshot?: any } }) => {
        if (event.body.error) {
          handleError(NativeError.fromEvent(event.body.error, 'firestore'));
        } else {
          const querySnapshot = new FirestoreQuerySnapshot(
            this._firestore,
            this,
            event.body.snapshot,
            this._converter,
          );
          handleSuccess(querySnapshot);
        }
      },
    );

    const unsubscribe = (): void => {
      onSnapshotSubscription.remove();
      this._firestore.native.collectionOffSnapshot(listenerId);
    };

    if (!isUndefined(this._queryName)) {
      this._firestore.native.namedQueryOnSnapshot(
        this._queryName,
        this._modifiers.type,
        this._modifiers.filters,
        this._modifiers.orders,
        this._modifiers.options,
        listenerId,
        snapshotListenOptions,
      );
    } else {
      this._firestore.native.collectionOnSnapshot(
        this._collectionPath.relativeName,
        this._modifiers.type,
        this._modifiers.filters,
        this._modifiers.orders,
        this._modifiers.options,
        listenerId,
        snapshotListenOptions,
      );
    }

    return unsubscribe;
  }

  orderBy(
    fieldPath: string | FirestoreFieldPath,
    directionStr?: string,
  ): ReturnType<typeof createDeprecationProxy> {
    if (!isString(fieldPath) && !(fieldPath instanceof FirestoreFieldPath)) {
      throw new Error(
        "firebase.firestore().collection().orderBy(*) 'fieldPath' must be a string or instance of FieldPath.",
      );
    }

    let path: FirestoreFieldPath;

    if (isString(fieldPath)) {
      try {
        path = fromDotSeparatedString(fieldPath);
      } catch (e) {
        throw new Error(
          `firebase.firestore().collection().orderBy(*) 'fieldPath' ${(e as Error).message}.`,
        );
      }
    } else {
      path = fieldPath;
    }

    if (!isUndefined(directionStr) && !this._modifiers.isValidDirection(directionStr)) {
      throw new Error(
        "firebase.firestore().collection().orderBy(_, *) 'directionStr' must be one of 'asc' or 'desc'.",
      );
    }

    if (this._modifiers.hasStart()) {
      throw new Error(
        'firebase.firestore().collection().orderBy() Invalid query. You must not call startAt() or startAfter() before calling orderBy().',
      );
    }

    if (this._modifiers.hasEnd()) {
      throw new Error(
        'firebase.firestore().collection().orderBy() Invalid query. You must not call endAt() or endBefore() before calling orderBy().',
      );
    }

    const modifiers = this._modifiers._copy().orderBy(path, directionStr);

    try {
      modifiers.validateOrderBy();
    } catch (e) {
      throw new Error(`firebase.firestore().collection().orderBy() ${(e as Error).message}`);
    }

    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        modifiers,
        this._queryName,
        this._converter,
      ),
    );
  }

  startAfter(
    docOrField: FirestoreDocumentSnapshot | unknown,
    ...fields: unknown[]
  ): ReturnType<typeof createDeprecationProxy> {
    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        this._handleQueryCursor('startAfter', docOrField, filterModularArgument(fields)),
        this._queryName,
        this._converter,
      ),
    );
  }

  startAt(
    docOrField: FirestoreDocumentSnapshot | unknown,
    ...fields: unknown[]
  ): ReturnType<typeof createDeprecationProxy> {
    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        this._handleQueryCursor('startAt', docOrField, filterModularArgument(fields)),
        this._queryName,
        this._converter,
      ),
    );
  }

  where(
    fieldPathOrFilter: string | FirestoreFieldPath | _Filter,
    opStr?: string,
    value?: unknown,
  ): ReturnType<typeof createDeprecationProxy> {
    if (
      !isString(fieldPathOrFilter) &&
      !(fieldPathOrFilter instanceof FirestoreFieldPath) &&
      !(fieldPathOrFilter instanceof _Filter)
    ) {
      throw new Error(
        "firebase.firestore().collection().where(*) 'fieldPath' must be a string, instance of FieldPath or instance of Filter.",
      );
    }

    let modifiers: FirestoreQueryModifiers;

    if (fieldPathOrFilter instanceof _Filter && fieldPathOrFilter.queries) {
      const filters = generateFilters(fieldPathOrFilter, this._modifiers);
      modifiers = this._modifiers._copy().filterWhere(filters as any);
    } else {
      let path: FirestoreFieldPath;
      let op = opStr;
      let val = value;

      if (fieldPathOrFilter instanceof _Filter) {
        op = fieldPathOrFilter.operator as string;
        val = fieldPathOrFilter.value;
        fieldPathOrFilter = fieldPathOrFilter.fieldPath as FirestoreFieldPath;
      }

      if (isString(fieldPathOrFilter)) {
        try {
          path = fromDotSeparatedString(fieldPathOrFilter);
        } catch (e) {
          throw new Error(
            `firebase.firestore().collection().where(*) 'fieldPath' ${(e as Error).message}.`,
          );
        }
      } else {
        path = fieldPathOrFilter;
      }

      if (!this._modifiers.isValidOperator(op!)) {
        throw new Error(
          "firebase.firestore().collection().where(_, *) 'opStr' is invalid. Expected one of '==', '>', '>=', '<', '<=', '!=', 'array-contains', 'not-in', 'array-contains-any' or 'in'.",
        );
      }

      if (isUndefined(val)) {
        throw new Error(
          "firebase.firestore().collection().where(_, _, *) 'value' argument expected.",
        );
      }

      if (
        isNull(val) &&
        !this._modifiers.isEqualOperator(op!) &&
        !this._modifiers.isNotEqualOperator(op!)
      ) {
        throw new Error(
          "firebase.firestore().collection().where(_, _, *) 'value' is invalid. You can only perform equals comparisons on null",
        );
      }

      if (this._modifiers.isInOperator(op!)) {
        if (!isArray(val) || !(val as unknown[]).length) {
          throw new Error(
            `firebase.firestore().collection().where(_, _, *) 'value' is invalid. A non-empty array is required for '${op}' filters.`,
          );
        }

        if ((val as unknown[]).length > 30) {
          throw new Error(
            `firebase.firestore().collection().where(_, _, *) 'value' is invalid. '${op}' filters support a maximum of 30 elements in the value array.`,
          );
        }
      }

      modifiers = this._modifiers._copy().where(path, op!, val);
    }

    try {
      modifiers.validateWhere();
    } catch (e) {
      throw new Error(`firebase.firestore().collection().where() ${(e as Error).message}`);
    }

    return createDeprecationProxy(
      new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        modifiers,
        this._queryName,
        this._converter,
      ),
    );
  }

  withConverter(converter: unknown): FirestoreQuery {
    if (isUndefined(converter) || isNull(converter)) {
      return new FirestoreQuery(
        this._firestore,
        this._collectionPath,
        this._modifiers,
        this._queryName,
        null,
      );
    }

    try {
      validateWithConverter(converter);
    } catch (e) {
      throw new Error(`firebase.firestore().collection().withConverter() ${(e as Error).message}`);
    }

    return new FirestoreQuery(
      this._firestore,
      this._collectionPath,
      this._modifiers,
      this._queryName,
      converter,
    );
  }
}
