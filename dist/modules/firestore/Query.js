/**
 * 
 * Query representation wrapper
 */
import FieldPath from './FieldPath';
import QuerySnapshot from './QuerySnapshot';
import SnapshotError from './SnapshotError';
import DocumentSnapshot from './DocumentSnapshot';
import { getNativeModule } from '../../utils/native';
import { buildNativeArray, buildTypeMap } from './utils/serialize';
import { firestoreAutoId, isFunction, isObject } from '../../utils';
import { getAppEventName, SharedEventEmitter } from '../../utils/events';
const DIRECTIONS = {
  ASC: 'ASCENDING',
  asc: 'ASCENDING',
  DESC: 'DESCENDING',
  desc: 'DESCENDING'
};
const OPERATORS = {
  '=': 'EQUAL',
  '==': 'EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  'array-contains': 'ARRAY_CONTAINS'
};

function buildNativeFieldPath(fieldPath) {
  if (fieldPath instanceof FieldPath) {
    return {
      elements: fieldPath._segments,
      type: 'fieldpath'
    };
  }

  return {
    string: fieldPath,
    type: 'string'
  };
}
/**
 * @class Query
 */


export default class Query {
  constructor(firestore, path, fieldFilters, fieldOrders, queryOptions) {
    this._fieldFilters = fieldFilters || [];
    this._fieldOrders = fieldOrders || [];
    this._firestore = firestore;
    this._queryOptions = queryOptions || {};
    this._referencePath = path;
  }

  get firestore() {
    return this._firestore;
  }

  endAt(...snapshotOrVarArgs) {
    const options = { ...this._queryOptions,
      endAt: this._buildOrderByOption(snapshotOrVarArgs)
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters, this._fieldOrders, options);
  }

  endBefore(...snapshotOrVarArgs) {
    const options = { ...this._queryOptions,
      endBefore: this._buildOrderByOption(snapshotOrVarArgs)
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters, this._fieldOrders, options);
  }

  get(options) {
    if (options) {
      if (!isObject(options)) {
        return Promise.reject(new Error('Query.get failed: First argument must be an object.'));
      }

      if (options.source && options.source !== 'default' && options.source !== 'server' && options.source !== 'cache') {
        return Promise.reject(new Error('Query.get failed: GetOptions.source must be one of `default`, `server` or `cache`.'));
      }
    }

    return getNativeModule(this._firestore).collectionGet(this._referencePath.relativeName, this._fieldFilters, this._fieldOrders, this._queryOptions, options).then(nativeData => new QuerySnapshot(this._firestore, this, nativeData));
  }

  isEqual(otherQuery) {
    if (!(otherQuery instanceof Query)) {
      throw new Error('firebase.firestore.Query.isEqual(*) expects an instance of Query.');
    }

    if (this._firestore.app.name !== otherQuery._firestore.app.name) {
      return false;
    }

    if (this._firestore.app.options.projectId !== otherQuery._firestore.app.options.projectId) {
      return false;
    }

    if (this._fieldFilters.length !== otherQuery._fieldFilters.length) {
      return false;
    }

    for (let i = 0; i < this._fieldFilters.length; i++) {
      const thisFieldFilter = this._fieldFilters[i];
      const otherFieldFilter = otherQuery._fieldFilters[i];

      if (thisFieldFilter.fieldPath.string !== otherFieldFilter.fieldPath.string) {
        return false;
      }

      if (thisFieldFilter.fieldPath.type !== otherFieldFilter.fieldPath.type) {
        return false;
      }

      if (thisFieldFilter.value.type !== otherFieldFilter.value.type) {
        return false;
      }

      if (thisFieldFilter.value.value !== otherFieldFilter.value.value) {
        return false;
      }

      if (thisFieldFilter.operator !== otherFieldFilter.operator) {
        return false;
      }
    }

    if (this._fieldOrders.length !== otherQuery._fieldOrders.length) {
      return false;
    }

    for (let i = 0; i < this._fieldOrders.length; i++) {
      const thisFieldOrder = this._fieldOrders[i];
      const otherFieldOrder = otherQuery._fieldOrders[i];

      if (thisFieldOrder.direction !== otherFieldOrder.direction) {
        return false;
      }

      if (thisFieldOrder.fieldPath.string !== otherFieldOrder.fieldPath.string) {
        return false;
      }

      if (thisFieldOrder.fieldPath.type !== otherFieldOrder.fieldPath.type) {
        return false;
      }
    }

    return true;
  }

  limit(limit) {
    // TODO: Validation
    // validate.isInteger('n', n);
    const options = { ...this._queryOptions,
      limit
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters, this._fieldOrders, options);
  }

  onSnapshot(optionsOrObserverOrOnNext, observerOrOnNextOrOnError, onError) {
    // TODO refactor this 💩
    let observer;
    let metadataChanges = {}; // Called with: onNext, ?onError

    if (isFunction(optionsOrObserverOrOnNext)) {
      if (observerOrOnNextOrOnError && !isFunction(observerOrOnNextOrOnError)) {
        throw new Error('Query.onSnapshot failed: Second argument must be a valid function.');
      } // $FlowExpectedError: Not coping with the overloaded method signature


      observer = {
        next: optionsOrObserverOrOnNext,
        error: observerOrOnNextOrOnError
      };
    } else if (optionsOrObserverOrOnNext && isObject(optionsOrObserverOrOnNext)) {
      // Called with: Observer
      if (optionsOrObserverOrOnNext.next) {
        if (isFunction(optionsOrObserverOrOnNext.next)) {
          if (optionsOrObserverOrOnNext.error && !isFunction(optionsOrObserverOrOnNext.error)) {
            throw new Error('Query.onSnapshot failed: Observer.error must be a valid function.');
          } // $FlowExpectedError: Not coping with the overloaded method signature


          observer = {
            next: optionsOrObserverOrOnNext.next,
            error: optionsOrObserverOrOnNext.error
          };
        } else {
          throw new Error('Query.onSnapshot failed: Observer.next must be a valid function.');
        }
      } else if (Object.prototype.hasOwnProperty.call(optionsOrObserverOrOnNext, 'includeMetadataChanges')) {
        metadataChanges = optionsOrObserverOrOnNext; // Called with: Options, onNext, ?onError

        if (isFunction(observerOrOnNextOrOnError)) {
          if (onError && !isFunction(onError)) {
            throw new Error('Query.onSnapshot failed: Third argument must be a valid function.');
          } // $FlowExpectedError: Not coping with the overloaded method signature


          observer = {
            next: observerOrOnNextOrOnError,
            error: onError
          }; // Called with Options, Observer
        } else if (observerOrOnNextOrOnError && isObject(observerOrOnNextOrOnError) && observerOrOnNextOrOnError.next) {
          if (isFunction(observerOrOnNextOrOnError.next)) {
            if (observerOrOnNextOrOnError.error && !isFunction(observerOrOnNextOrOnError.error)) {
              throw new Error('Query.onSnapshot failed: Observer.error must be a valid function.');
            }

            observer = {
              next: observerOrOnNextOrOnError.next,
              error: observerOrOnNextOrOnError.error
            };
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

    const listener = nativeQuerySnapshot => {
      const querySnapshot = new QuerySnapshot(this._firestore, this, nativeQuerySnapshot);
      observer.next(querySnapshot);
    };

    let unsubscribe; // Listen to snapshot events

    const snapshotSubscription = SharedEventEmitter.addListener(getAppEventName(this._firestore, `onQuerySnapshot:${listenerId}`), listener); // listen for snapshot error events

    const errorSubscription = SharedEventEmitter.addListener(getAppEventName(this._firestore, `onQuerySnapshotError:${listenerId}`), e => {
      if (unsubscribe) unsubscribe();
      const error = new SnapshotError(e);
      if (observer.error) observer.error(error);else this.firestore.log.error(error);
    }); // Add the native listener

    getNativeModule(this._firestore).collectionOnSnapshot(this._referencePath.relativeName, this._fieldFilters, this._fieldOrders, this._queryOptions, listenerId, metadataChanges); // return an unsubscribe method

    unsubscribe = () => {
      snapshotSubscription.remove();
      errorSubscription.remove(); // cancel native listener

      getNativeModule(this._firestore).collectionOffSnapshot(this._referencePath.relativeName, this._fieldFilters, this._fieldOrders, this._queryOptions, listenerId);
    };

    return unsubscribe;
  }

  orderBy(fieldPath, directionStr = 'asc') {
    // TODO: Validation
    // validate.isFieldPath('fieldPath', fieldPath);
    // validate.isOptionalFieldOrder('directionStr', directionStr);
    if (this._queryOptions.startAt || this._queryOptions.startAfter || this._queryOptions.endAt || this._queryOptions.endBefore) {
      throw new Error('Cannot specify an orderBy() constraint after calling ' + 'startAt(), startAfter(), endBefore() or endAt().');
    }

    const newOrder = {
      direction: DIRECTIONS[directionStr],
      fieldPath: buildNativeFieldPath(fieldPath)
    };

    const combinedOrders = this._fieldOrders.concat(newOrder);

    return new Query(this.firestore, this._referencePath, this._fieldFilters, combinedOrders, this._queryOptions);
  }

  startAfter(...snapshotOrVarArgs) {
    const options = { ...this._queryOptions,
      startAfter: this._buildOrderByOption(snapshotOrVarArgs)
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters, this._fieldOrders, options);
  }

  startAt(...snapshotOrVarArgs) {
    const options = { ...this._queryOptions,
      startAt: this._buildOrderByOption(snapshotOrVarArgs)
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters, this._fieldOrders, options);
  }

  where(fieldPath, opStr, value) {
    // TODO: Validation
    // validate.isFieldPath('fieldPath', fieldPath);
    // validate.isFieldFilter('fieldFilter', opStr, value);
    const nativeValue = buildTypeMap(value);
    const newFilter = {
      fieldPath: buildNativeFieldPath(fieldPath),
      operator: OPERATORS[opStr],
      value: nativeValue
    };

    const combinedFilters = this._fieldFilters.concat(newFilter);

    return new Query(this.firestore, this._referencePath, combinedFilters, this._fieldOrders, this._queryOptions);
  }
  /**
   * INTERNALS
   */


  _buildOrderByOption(snapshotOrVarArgs) {
    // TODO: Validation
    let values;

    if (snapshotOrVarArgs.length === 1 && snapshotOrVarArgs[0] instanceof DocumentSnapshot) {
      const docSnapshot = snapshotOrVarArgs[0];
      values = [];

      for (let i = 0; i < this._fieldOrders.length; i++) {
        const fieldOrder = this._fieldOrders[i];

        if (fieldOrder.fieldPath.type === 'string' && fieldOrder.fieldPath.string) {
          values.push(docSnapshot.get(fieldOrder.fieldPath.string));
        } else if (fieldOrder.fieldPath.elements) {
          const fieldPath = new FieldPath(...fieldOrder.fieldPath.elements);
          values.push(docSnapshot.get(fieldPath));
        }
      }
    } else {
      values = snapshotOrVarArgs;
    }

    return buildNativeArray(values);
  }

}