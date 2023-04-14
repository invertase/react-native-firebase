import { isString, isNull, isUndefined, isArray } from '@react-native-firebase/app/lib/common';
import { fromDotSeparatedString } from './FirestoreFieldPath';
import { generateNativeData } from './utils/serialize';
import { OPERATORS } from './FirestoreQueryModifiers';
const AND_QUERY = 'AND';
const OR_QUERY = 'OR';

export function Filter(fieldPath, operator, value) {
  return new _Filter(fieldPath, operator, value);
}

export function _Filter(fieldPath, operator, value, filterOperator, queries) {
  if ([AND_QUERY, OR_QUERY].includes(filterOperator)) {
    // AND or OR Filter (list of Filters)
    this.operator = filterOperator;
    this.queries = queries;

    this._toMap = function _toMap() {
      return {
        operator: this.operator,
        queries: this.queries.map(query => query._toMap()),
      };
    };

    return this;
  } else {
    // Filter
    this.fieldPath = fieldPath;
    this.operator = operator;
    this.value = value;

    this._toMap = function _toMap() {
      return {
        fieldPath: this.fieldPath,
        operator: this.operator,
        value: this.value,
      };
    };

    return this;
  }
}

Filter.and = function and(...queries) {
  if (queries.length > 10 || queries.length < 2) {
    throw new Error(`Expected 2-10 instances of Filter, but got ${queries.length} Filters`);
  }

  const validateFilters = queries.every(filter => filter instanceof _Filter);

  if (!validateFilters) {
    throw new Error('Expected every argument to be an instance of Filter');
  }

  return new _Filter(null, null, null, AND_QUERY, queries);
};

Filter.or = function or(...queries) {
  if (queries.length > 10 || queries.length < 2) {
    throw new Error(`Expected 2-10 instances of Filter, but got ${queries.length} Filters`);
  }

  const validateFilters = queries.every(filter => filter instanceof _Filter);

  if (!validateFilters) {
    throw new Error('Expected every argument to be an instance of Filter');
  }

  return new _Filter(null, null, null, OR_QUERY, queries);
};

export function generateFilters(filter, modifiers) {
  const filterMap = filter._toMap();

  const queriesMaps = filterMap.queries.map(({ fieldPath, operator, value }) => {
    let path;
    if (isString(fieldPath)) {
      try {
        path = fromDotSeparatedString(fieldPath);
      } catch (e) {
        throw new Error(`first argument of Filter(*,_ , _) 'fieldPath' ${e.message}.`);
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
          `third argument of Filter(*,_ , _) 'value' is invalid. A non-empty array is required for '${operator}' filters.`,
        );
      }

      if (value.length > 10) {
        throw new Error(
          `third argument of Filter(*,_ , _) 'value' is invalid. '${operator}' filters support a maximum of 10 elements in the value array.`,
        );
      }
    }

    return {
      fieldPath: path,
      operator: OPERATORS[operator],
      value: generateNativeData(value, true),
    };
  });

  return {
    operator: filterMap.operator,
    queries: queriesMaps,
  };
}
