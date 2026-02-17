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
  isArray,
  isNull,
  isString,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import { fromDotSeparatedString } from './FirestoreFieldPath';
import { OPERATORS } from './FirestoreQueryModifiers';
import { generateNativeData } from './utils/serialize';

const AND_QUERY = 'AND';
const OR_QUERY = 'OR';

type FilterOperator = typeof AND_QUERY | typeof OR_QUERY;
type FieldFilterOperator = keyof typeof OPERATORS;

export function Filter(fieldPath: unknown, operator: FieldFilterOperator, value: unknown): _Filter {
  return new _Filter(fieldPath, operator, value);
}

export class _Filter {
  fieldPath?: unknown;
  operator: unknown;
  value?: unknown;
  queries: _Filter[];

  constructor(
    fieldPath: unknown,
    operator: unknown,
    value: unknown,
    filterOperator?: FilterOperator,
    queries: _Filter[] = [],
  ) {
    if ([AND_QUERY, OR_QUERY].includes(filterOperator as FilterOperator)) {
      this.operator = filterOperator;
      this.queries = queries;
      return;
    }

    this.fieldPath = fieldPath;
    this.operator = operator;
    this.value = value;
    this.queries = [];
  }

  _toMap(): {
    fieldPath?: unknown;
    operator: unknown;
    value?: unknown;
    queries: ReturnType<_Filter['_toMap']>[];
  } {
    if ([AND_QUERY, OR_QUERY].includes(this.operator as FilterOperator)) {
      return {
        operator: this.operator,
        queries: this.queries.map(query => query._toMap()),
      };
    }

    return {
      fieldPath: this.fieldPath,
      operator: this.operator,
      value: this.value,
      queries: [],
    };
  }
}

Filter.and = function and(...queries: _Filter[]): _Filter {
  if (queries.length > 10 || queries.length < 1) {
    throw new Error(`Expected 1-10 instances of Filter, but got ${queries.length} Filters`);
  }

  const validateFilters = queries.every(filter => filter instanceof _Filter);
  if (!validateFilters) {
    throw new Error('Expected every argument to be an instance of Filter');
  }

  return new _Filter(null, null, null, AND_QUERY, queries);
};

function hasOrOperator(obj: {
  operator: unknown;
  queries?: Array<{ operator: unknown; queries?: unknown[] }>;
}): boolean {
  return (
    obj.operator === OR_QUERY ||
    (Array.isArray(obj.queries) &&
      obj.queries.some(query => hasOrOperator(query as { operator: unknown; queries?: unknown[] })))
  );
}

Filter.or = function or(...queries: _Filter[]): _Filter {
  if (queries.length > 10 || queries.length < 1) {
    throw new Error(`Expected 1-10 instances of Filter, but got ${queries.length} Filters`);
  }

  const validateFilters = queries.every(filter => filter instanceof _Filter);
  if (!validateFilters) {
    throw new Error('Expected every argument to be an instance of Filter');
  }

  if (queries.some(hasOrOperator)) {
    throw new Error('OR Filters with nested OR Filters are not supported');
  }

  return new _Filter(null, null, null, OR_QUERY, queries);
};

function mapFieldQuery(
  {
    fieldPath,
    operator,
    value,
    queries,
  }: {
    fieldPath?: unknown;
    operator: unknown;
    value?: unknown;
    queries?: Array<{
      fieldPath?: unknown;
      operator: unknown;
      value?: unknown;
      queries?: unknown[];
    }>;
  },
  modifiers: {
    isValidOperator(operator: unknown): boolean;
    isEqualOperator(operator: unknown): boolean;
    isNotEqualOperator(operator: unknown): boolean;
    isInOperator(operator: unknown): boolean;
  },
): unknown {
  if (operator === AND_QUERY || operator === OR_QUERY) {
    return {
      operator,
      queries: (queries ?? []).map(filter => mapFieldQuery(filter, modifiers)),
    };
  }

  let path: unknown;
  if (isString(fieldPath)) {
    try {
      path = fromDotSeparatedString(fieldPath);
    } catch (e) {
      throw new Error(`first argument of Filter(*,_ , _) 'fieldPath' ${(e as Error).message}.`);
    }
  } else {
    path = fieldPath;
  }

  if (!modifiers.isValidOperator(operator)) {
    throw new Error(
      "second argument of Filter(*,_ , _) 'opStr' is invalid. Expected one of '==', '>', '>=', '<', '<=', '!=', 'array-contains', 'not-in', 'array-contains-any' or 'in'.",
    );
  }

  if (isUndefined(value)) {
    throw new Error("third argument of Filter(*,_ , _) 'value' argument expected.");
  }

  if (
    isNull(value) &&
    !modifiers.isEqualOperator(operator) &&
    !modifiers.isNotEqualOperator(operator)
  ) {
    throw new Error(
      "third argument of Filter(*,_ , _) 'value' is invalid. You can only perform equals comparisons on null",
    );
  }

  if (modifiers.isInOperator(operator)) {
    if (!isArray(value) || !value.length) {
      throw new Error(
        `third argument of Filter(*,_ , _) 'value' is invalid. A non-empty array is required for '${String(
          operator,
        )}' filters.`,
      );
    }

    if (value.length > 10) {
      throw new Error(
        `third argument of Filter(*,_ , _) 'value' is invalid. '${String(
          operator,
        )}' filters support a maximum of 10 elements in the value array.`,
      );
    }
  }

  return {
    fieldPath: path,
    operator: OPERATORS[operator as FieldFilterOperator],
    value: generateNativeData(value, true),
  };
}

export function generateFilters(
  filter: _Filter,
  modifiers: {
    isValidOperator(operator: unknown): boolean;
    isEqualOperator(operator: unknown): boolean;
    isNotEqualOperator(operator: unknown): boolean;
    isInOperator(operator: unknown): boolean;
  },
): { operator: unknown; queries: unknown[] } {
  const filterMap = filter._toMap();
  return {
    operator: filterMap.operator,
    queries: filterMap.queries.map(query => mapFieldQuery(query, modifiers)),
  };
}
