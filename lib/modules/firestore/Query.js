/**
 * @flow
 * Query representation wrapper
 */
import DocumentSnapshot from './DocumentSnapshot';
import Path from './Path';
import QuerySnapshot from './QuerySnapshot';
import { buildNativeArray, buildTypeMap } from './utils/serialize';
import { firestoreAutoId, isFunction, isObject } from '../../utils';

const DIRECTIONS = {
  ASC: 'ASCENDING',
  asc: 'ASCENDING',
  DESC: 'DESCENDING',
  desc: 'DESCENDING',
};

const OPERATORS = {
  '=': 'EQUAL',
  '==': 'EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
};

export type Direction = 'DESC' | 'desc' | 'ASC' | 'asc';
type FieldFilter = {
  fieldPath: string,
  operator: string,
  value: any,
}
type FieldOrder = {
  direction: string,
  fieldPath: string,
}
type QueryOptions = {
  endAt?: any[],
  endBefore?: any[],
  limit?: number,
  offset?: number,
  selectFields?: string[],
  startAfter?: any[],
  startAt?: any[],
}
export type Operator = '<' | '<=' | '=' | '==' | '>' | '>=';
type QueryListenOptions = {
  includeQueryMetadataChanges: boolean,
  includeQueryMetadataChanges: boolean,
}

type Observer = {
  next: (DocumentSnapshot) => void,
  error?: (Object) => void,
}

 /**
 * @class Query
 */
export default class Query {
  _fieldFilters: FieldFilter[];
  _fieldOrders: FieldOrder[];
  _firestore: Object;
  _iid: number;
  _queryOptions: QueryOptions;
  _referencePath: Path;

  constructor(firestore: Object, path: Path, fieldFilters?: FieldFilter[],
    fieldOrders?: FieldOrder[], queryOptions?: QueryOptions) {
    this._fieldFilters = fieldFilters || [];
    this._fieldOrders = fieldOrders || [];
    this._firestore = firestore;
    this._queryOptions = queryOptions || {};
    this._referencePath = path;
  }

  get firestore(): Object {
    return this._firestore;
  }

  endAt(...snapshotOrVarArgs: any): Query {
    const options = {
      ...this._queryOptions,
      endAt: this._buildOrderByOption(snapshotOrVarArgs),
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  endBefore(...snapshotOrVarArgs: any): Query {
    const options = {
      ...this._queryOptions,
      endBefore: this._buildOrderByOption(snapshotOrVarArgs),
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  get(): Promise<QuerySnapshot> {
    return this._firestore._native
      .collectionGet(
        this._referencePath.relativeName,
        this._fieldFilters,
        this._fieldOrders,
        this._queryOptions,
      )
      .then(nativeData => new QuerySnapshot(this._firestore, this, nativeData));
  }

  limit(limit: number): Query {
    // TODO: Validation
    // validate.isInteger('n', n);

    const options = {
      ...this._queryOptions,
      limit,
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  onSnapshot(
      optionsOrObserverOrOnNext: QueryListenOptions | Observer | (DocumentSnapshot) => void,
      observerOrOnNextOrOnError?: Observer | (DocumentSnapshot) => void | (Object) => void,
      onError?: (Object) => void,
  ) {
    let observer = {};
    let queryListenOptions = {};
    // Called with: onNext, ?onError
    if (isFunction(optionsOrObserverOrOnNext)) {
      observer.next = optionsOrObserverOrOnNext;
      if (observerOrOnNextOrOnError && !isFunction(observerOrOnNextOrOnError)) {
        throw new Error('Query.onSnapshot failed: Second argument must be a valid function.');
      }
      observer.error = observerOrOnNextOrOnError;
    } else if (optionsOrObserverOrOnNext && isObject(optionsOrObserverOrOnNext)) {
      // Called with: Observer
      if (optionsOrObserverOrOnNext.next) {
        if (isFunction(optionsOrObserverOrOnNext.next)) {
          if (optionsOrObserverOrOnNext.error && !isFunction(optionsOrObserverOrOnNext.error)) {
            throw new Error('Query.onSnapshot failed: Observer.error must be a valid function.');
          }
          observer = optionsOrObserverOrOnNext;
        } else {
          throw new Error('Query.onSnapshot failed: Observer.next must be a valid function.');
        }
      } else if (optionsOrObserverOrOnNext.includeDocumentMetadataChanges || optionsOrObserverOrOnNext.includeQueryMetadataChanges) {
        queryListenOptions = optionsOrObserverOrOnNext;
        // Called with: Options, onNext, ?onError
        if (isFunction(observerOrOnNextOrOnError)) {
          observer.next = observerOrOnNextOrOnError;
          if (onError && !isFunction(onError)) {
            throw new Error('Query.onSnapshot failed: Third argument must be a valid function.');
          }
          observer.error = onError;
        // Called with Options, Observer
        } else if (observerOrOnNextOrOnError && isObject(observerOrOnNextOrOnError) && observerOrOnNextOrOnError.next) {
          if (isFunction(observerOrOnNextOrOnError.next)) {
            if (observerOrOnNextOrOnError.error && !isFunction(observerOrOnNextOrOnError.error)) {
              throw new Error('Query.onSnapshot failed: Observer.error must be a valid function.');
            }
            observer = observerOrOnNextOrOnError;
          } else {
            throw new Error('Query.onSnapshot failed: Observer.next must be a valid function.');
          }
        } else {
          throw new Error('Query.onSnapshot failed: Second argument must be a function or observer.');
        }
      } else {
        throw new Error('Query.onSnapshot failed: First argument must be a function, observer or options.');
      }
    } else {
      throw new Error('Query.onSnapshot failed: Called with invalid arguments.');
    }

    const listenerId = firestoreAutoId();

    const listener = (nativeQuerySnapshot) => {
      const querySnapshot = new QuerySnapshot(this._firestore, this, nativeQuerySnapshot);
      observer.next(querySnapshot);
    };

    // Listen to snapshot events
    this._firestore.on(
      this._firestore._getAppEventName(`onQuerySnapshot:${listenerId}`),
      listener,
    );

    // Listen for snapshot error events
    if (observer.error) {
      this._firestore.on(
        this._firestore._getAppEventName(`onQuerySnapshotError:${listenerId}`),
        observer.error,
      );
    }

    // Add the native listener
    this._firestore._native
      .collectionOnSnapshot(
          this._referencePath.relativeName,
          this._fieldFilters,
          this._fieldOrders,
          this._queryOptions,
          listenerId,
          queryListenOptions,
      );

    // Return an unsubscribe method
    return this._offCollectionSnapshot.bind(this, listenerId, listener);
  }

  orderBy(fieldPath: string, directionStr?: Direction = 'asc'): Query {
    // TODO: Validation
    // validate.isFieldPath('fieldPath', fieldPath);
    // validate.isOptionalFieldOrder('directionStr', directionStr);

    if (this._queryOptions.startAt || this._queryOptions.endAt) {
      throw new Error('Cannot specify an orderBy() constraint after calling ' +
        'startAt(), startAfter(), endBefore() or endAt().');
    }

    const newOrder = {
      direction: DIRECTIONS[directionStr],
      fieldPath,
    };
    const combinedOrders = this._fieldOrders.concat(newOrder);
    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      combinedOrders, this._queryOptions);
  }

  startAfter(...snapshotOrVarArgs: any): Query {
    const options = {
      ...this._queryOptions,
      startAfter: this._buildOrderByOption(snapshotOrVarArgs),
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  startAt(...snapshotOrVarArgs: any): Query {
    const options = {
      ...this._queryOptions,
      startAt: this._buildOrderByOption(snapshotOrVarArgs),
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  where(fieldPath: string, opStr: Operator, value: any): Query {
    // TODO: Validation
    // validate.isFieldPath('fieldPath', fieldPath);
    // validate.isFieldFilter('fieldFilter', opStr, value);
    const nativeValue = buildTypeMap(value);
    const newFilter = {
      fieldPath,
      operator: OPERATORS[opStr],
      value: nativeValue,
    };
    const combinedFilters = this._fieldFilters.concat(newFilter);
    return new Query(this.firestore, this._referencePath, combinedFilters,
      this._fieldOrders, this._queryOptions);
  }

  /**
   * INTERNALS
   */

  _buildOrderByOption(snapshotOrVarArgs: any[]) {
    // TODO: Validation
    let values;
    if (snapshotOrVarArgs.length === 1 && snapshotOrVarArgs[0] instanceof DocumentSnapshot) {
      const docSnapshot = snapshotOrVarArgs[0];
      values = [];
      for (let i = 0; i < this._fieldOrders.length; i++) {
        const fieldOrder = this._fieldOrders[i];
        values.push(docSnapshot.get(fieldOrder.fieldPath));
      }
    } else {
      values = snapshotOrVarArgs;
    }

    return buildNativeArray(values);
  }

  /**
   * Remove query snapshot listener
   * @param listener
   */
  _offCollectionSnapshot(listenerId: number, listener: Function) {
    this._firestore.log.info('Removing onQuerySnapshot listener');
    this._firestore.removeListener(this._firestore._getAppEventName(`onQuerySnapshot:${listenerId}`), listener);
    this._firestore.removeListener(this._firestore._getAppEventName(`onQuerySnapshotError:${listenerId}`), listener);
    this._firestore._native
      .collectionOffSnapshot(
        this._referencePath.relativeName,
        this._fieldFilters,
        this._fieldOrders,
        this._queryOptions,
        listenerId
      );
  }
}
