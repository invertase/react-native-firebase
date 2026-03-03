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
import { fromDotSeparatedString } from './FieldPath';
import { OPERATORS } from './FirestoreQueryModifiers';
import { generateNativeData } from './utils/serialize';
import type FieldPath from './FieldPath';
import type { Primitive } from './types/firestore';

const AND_QUERY = 'AND';
const OR_QUERY = 'OR';

type FilterOperator = typeof AND_QUERY | typeof OR_QUERY;
type FieldFilterOperator = keyof typeof OPERATORS;

/** Value allowed in a filter (primitive, object, or array for in/array-contains-any). */
type FilterValue = Primitive | Record<string, unknown> | unknown[];

export function Filter(
  fieldPath: string | FieldPath,
  operator: FieldFilterOperator,
  value: FilterValue | unknown,
): _Filter {
  return new _Filter(fieldPath, operator, value as FilterValue);
}

export class _Filter {
  fieldPath?: string | FieldPath;
  operator: FieldFilterOperator | FilterOperator;
  value?: FilterValue;
  queries?: _Filter[];

  constructor(
    fieldPath: string | FieldPath | null,
    operator: FieldFilterOperator | FilterOperator | null,
    value: FilterValue | null,
    filterOperator?: FilterOperator,
    queries?: _Filter[],
  ) {
    if (filterOperator !== undefined && [AND_QUERY, OR_QUERY].includes(filterOperator)) {
      this.operator = filterOperator;
      this.queries = queries;
      return;
    }

    this.fieldPath = fieldPath ?? undefined;
    this.operator = operator as FieldFilterOperator | FilterOperator;
    this.value = value ?? undefined;
  }

  _toMap(): FilterMap {
    if ([AND_QUERY, OR_QUERY].includes(this.operator as FilterOperator)) {
      return {
        operator: this.operator,
        queries: this.queries!.map(query => query._toMap()),
      };
    }

    return {
      fieldPath: this.fieldPath,
      operator: this.operator,
      value: this.value,
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

/** Serialized field filter or composite (AND/OR) for generateFilters output. */
interface SerializedFieldFilter {
  fieldPath: FieldPath | string[];
  operator: string;
  value: [number, unknown?] | null;
}
interface SerializedCompositeFilter {
  operator: FilterOperator;
  queries: SerializedFilterSpec[];
}
type SerializedFilterSpec = SerializedFieldFilter | SerializedCompositeFilter;

function hasOrOperator(obj: _Filter): boolean {
  return (
    obj.operator === OR_QUERY ||
    (Array.isArray(obj.queries) && obj.queries.some(query => hasOrOperator(query)))
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

interface FilterMap {
  fieldPath?: string | FieldPath;
  operator: FieldFilterOperator | FilterOperator;
  value?: FilterValue;
  queries?: FilterMap[];
}

/** Modifiers object passed to generateFilters (e.g. QueryModifiers). */
export interface FilterModifiersInternal {
  isValidOperator(operator: string): boolean;
  isEqualOperator(operator: string): boolean;
  isNotEqualOperator(operator: string): boolean;
  isInOperator(operator: string): boolean;
}

function mapFieldQuery(
  filterMap: FilterMap,
  modifiers: FilterModifiersInternal,
): SerializedFilterSpec {
  const { fieldPath, operator, value, queries } = filterMap;
  if (operator === AND_QUERY || operator === OR_QUERY) {
    return {
      operator,
      queries: (queries ?? []).map(q => mapFieldQuery(q, modifiers)),
    };
  }

  let path: FieldPath | string;
  if (isString(fieldPath)) {
    try {
      path = fromDotSeparatedString(fieldPath);
    } catch (e) {
      throw new Error(`first argument of Filter(*,_ , _) 'fieldPath' ${(e as Error).message}.`);
    }
  } else if (fieldPath !== undefined) {
    path = fieldPath;
  } else {
    throw new Error("first argument of Filter(*,_ , _) 'fieldPath' is required.");
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
    operator: OPERATORS[operator as FieldFilterOperator]!,
    value: generateNativeData(value, true),
  };
}

export function generateFilters(
  filter: _Filter,
  modifiers: FilterModifiersInternal,
): { operator: string; queries: SerializedFilterSpec[] } {
  const filterMap = filter._toMap();
  const queries = (filterMap.queries ?? []).map(q => mapFieldQuery(q, modifiers));
  return {
    operator: filterMap.operator ?? '',
    queries,
  };
}
