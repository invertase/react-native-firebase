/**
 * @flow
 * Query representation wrapper
 */
import DocumentSnapshot from './DocumentSnapshot';
import Path from './Path';
import QuerySnapshot from './QuerySnapshot';
import INTERNALS from './../../internals';

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

 /**
 * @class Query
 */
export default class Query {
  _fieldFilters: FieldFilter[];
  _fieldOrders: FieldOrder[];
  _firestore: Object;
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

  endAt(fieldValues: any): Query {
    fieldValues = [].slice.call(arguments);
    // TODO: Validation
    const options = {
      ...this._queryOptions,
      endAt: fieldValues,
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  endBefore(fieldValues: any): Query {
    fieldValues = [].slice.call(arguments);
    // TODO: Validation
    const options = {
      ...this._queryOptions,
      endBefore: fieldValues,
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

  limit(n: number): Query {
    // TODO: Validation
    // validate.isInteger('n', n);

    const options = {
      ...this._queryOptions,
      limit: n,
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  offset(n: number): Query {
    // TODO: Validation
    // validate.isInteger('n', n);

    /* const options = {
      ...this._queryOptions,
      offset: n,
    };
    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options); */
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('Query', 'offset'));
  }

  onSnapshot(onNext: () => any, onError?: () => any): () => void {

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

  select(varArgs: string[]): Query {
    /*
    varArgs = Array.isArray(arguments[0]) ? arguments[0] : [].slice.call(arguments);
    const fieldReferences = [];

    if (varArgs.length === 0) {
      fieldReferences.push(DOCUMENT_NAME_FIELD);
    } else {
      for (let i = 0; i < varArgs.length; ++i) {
        // TODO: Validation
        // validate.isFieldPath(i, args[i]);
        fieldReferences.push(varArgs[i]);
      }
    }

    const options = {
      ...this._queryOptions,
      selectFields: fieldReferences,
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);*/
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('Query', 'select'));
  }

  startAfter(fieldValues: any): Query {
    fieldValues = [].slice.call(arguments);
    // TODO: Validation
    const options = {
      ...this._queryOptions,
      startAfter: fieldValues,
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  startAt(fieldValues: any): Query {
    fieldValues = [].slice.call(arguments);
    // TODO: Validation
    const options = {
      ...this._queryOptions,
      startAt: fieldValues,
    };

    return new Query(this.firestore, this._referencePath, this._fieldFilters,
      this._fieldOrders, options);
  }

  stream(): Stream<DocumentSnapshot> {

  }

  where(fieldPath: string, opStr: Operator, value: any): Query {
    // TODO: Validation
    // validate.isFieldPath('fieldPath', fieldPath);
    // validate.isFieldFilter('fieldFilter', opStr, value);
    const newFilter = {
      fieldPath,
      operator: OPERATORS[opStr],
      value,
    };
    const combinedFilters = this._fieldFilters.concat(newFilter);
    return new Query(this.firestore, this._referencePath, combinedFilters,
      this._fieldOrders, this._queryOptions);
  }
}
