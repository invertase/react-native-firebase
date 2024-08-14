import {
  FieldPath,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
  startAt,
  startAfter,
  endAt,
  endBefore,
  and,
  or,
} from '@react-native-firebase/app/lib/internal/web/firebaseFirestore';
import { parseTypeMap, readableToArray } from './convert';

export function buildQuery(queryInstance, filters, orders, options) {
  // Apply filters
  for (const filter of filters) {
    queryInstance = query(queryInstance, getFilterConstraint(filter));
  }

  // Apply orders
  for (const order of orders) {
    const fieldPath =
      typeof order.fieldPath === 'string' ? order.fieldPath : new FieldPath(...order.fieldPath);
    const direction = order.direction === 'ASCENDING' ? 'asc' : 'desc';
    queryInstance = query(queryInstance, orderBy(fieldPath, direction));
  }

  // Apply options
  if ('limit' in options) {
    queryInstance = query(queryInstance, limit(options.limit));
  }

  if ('limitToLast' in options) {
    queryInstance = query(queryInstance, limitToLast(options.limitToLast));
  }

  if ('startAt' in options) {
    const fieldList = readableToArray(queryInstance.firestore, options.startAt);
    queryInstance = query(queryInstance, startAt(...fieldList));
  }

  if ('startAfter' in options) {
    const fieldList = readableToArray(queryInstance.firestore, options.startAfter);
    queryInstance = query(queryInstance, startAfter(...fieldList));
  }

  if ('endAt' in options) {
    const fieldList = readableToArray(queryInstance.firestore, options.endAt);
    queryInstance = query(queryInstance, endAt(...fieldList));
  }

  if ('endBefore' in options) {
    const fieldList = readableToArray(queryInstance.firestore, options.endBefore);
    queryInstance = query(queryInstance, endBefore(...fieldList));
  }

  return queryInstance;
}

function getFilterConstraint(filter) {
  if ('fieldPath' in filter && filter.fieldPath) {
    const fieldPath = Array.isArray(filter.fieldPath)
      ? new FieldPath(...filter.fieldPath)
      : new FieldPath(...filter.fieldPath._segments);
    const operator = filter.operator;
    const value = parseTypeMap(query.firestore, filter.value);

    switch (operator) {
      case 'EQUAL':
        return where(fieldPath, '==', value);
      case 'NOT_EQUAL':
        return where(fieldPath, '!=', value);
      case 'GREATER_THAN':
        return where(fieldPath, '>', value);
      case 'GREATER_THAN_OR_EQUAL':
        return where(fieldPath, '>=', value);
      case 'LESS_THAN':
        return where(fieldPath, '<', value);
      case 'LESS_THAN_OR_EQUAL':
        return where(fieldPath, '<=', value);
      case 'ARRAY_CONTAINS':
        return where(fieldPath, 'array-contains', value);
      case 'ARRAY_CONTAINS_ANY':
        return where(fieldPath, 'array-contains-any', value);
      case 'IN':
        return where(fieldPath, 'in', value);
      case 'NOT_IN':
        return where(fieldPath, 'not-in', value);
    }
  } else if ('operator' in filter && 'queries' in filter) {
    const constraints = [];

    for (const constraint of filter.queries) {
      constraints.push(getFilterConstraint(constraint));
    }

    if (filter.operator === 'AND') {
      return and(...constraints);
    }

    if (filter.operator === 'OR') {
      return or(...constraints);
    }

    throw new Error('Invalid filter operator');
  }

  throw new Error('Invaldi filter.');
}
