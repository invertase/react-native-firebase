import {
  FieldPath,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
} from '@react-native-firebase/app/lib/internal/web/firebaseFirestore';
import { parseTypeMap } from './convert';

export function buildQuery(queryInstance, filters, orders, options) {
  // Apply filters
  for (const filter of filters) {
    if ('fieldPath' in filter) {
      const fieldPath = new FieldPath(...filter.fieldPath);
      const operator = filter.operator;
      const value = parseTypeMap(query.firestore, filter.value);

      switch (operator) {
        case 'EQUAL':
          queryInstance = query(queryInstance, where(fieldPath, '==', value));
          break;
        case 'NOT_EQUAL':
          queryInstance = query(queryInstance, where(fieldPath, '!=', value));
          break;
        case 'GREATER_THAN':
          queryInstance = query(queryInstance, where(fieldPath, '>', value));
          break;
        case 'GREATER_THAN_OR_EQUAL':
          queryInstance = query(queryInstance, where(fieldPath, '>=', value));
          break;
        case 'LESS_THAN':
          queryInstance = query(queryInstance, where(fieldPath, '<', value));
          break;
        case 'LESS_THAN_OR_EQUAL':
          queryInstance = query(queryInstance, where(fieldPath, '<=', value));
          break;
        case 'ARRAY_CONTAINS':
          queryInstance = query(queryInstance, where(fieldPath, 'array-contains', value));
          break;
        case 'ARRAY_CONTAINS_ANY':
          queryInstance = query(queryInstance, where(fieldPath, 'array-contains-any', value));
          break;
        case 'IN':
          queryInstance = query(queryInstance, where(fieldPath, 'in', value));
          break;
        case 'NOT_IN':
          queryInstance = query(queryInstance, where(fieldPath, 'not-in', value));
          break;
      }
    } else {
      // TODO apply filter queries
    }
  }

  // Apply orders
  for (const order of orders) {
    const fieldPath =
      typeof order.fieldPath === 'string' ? order.fieldPath : new FieldPath(...order.fieldPath);
    queryInstance = query(queryInstance, orderBy(fieldPath, order.direction));
  }

  // Apply options
  if ('limit' in options) {
    queryInstance = query(queryInstance, limit(options.limit));
  }

  if ('limitToLast' in options) {
    queryInstance = query(queryInstance, limitToLast(options.limitToLast));
  }

  // TODO(ehesp): How do parse snapshots?
}
