import {
  endAt,
  endBefore,
  limitToFirst,
  limitToLast,
  orderByChild,
  orderByKey,
  orderByPriority,
  orderByValue,
  query,
  startAfter,
  startAt,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseDatabase';
import type { DatabaseQueryModifier } from '../DatabaseQueryModifiers';

type WebDatabaseReference = Parameters<typeof query>[0];
type WebQueryConstraint = Parameters<typeof query>[1];
type QueryFilterValue = number | string | boolean | null;
type WebDatabaseQueryModifier =
  | DatabaseQueryModifier
  | {
      type: 'filter';
      name: 'endBefore' | 'startAfter';
      value: QueryFilterValue;
      key?: string;
    };

function isQueryFilterValue(value: unknown): value is QueryFilterValue {
  return (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value === null
  );
}

export function getQueryInstance(
  dbRef: WebDatabaseReference,
  modifiers: WebDatabaseQueryModifier[],
): ReturnType<typeof query> {
  const constraints: WebQueryConstraint[] = [];

  for (const modifier of modifiers) {
    const { type, name } = modifier;

    if (type === 'orderBy') {
      switch (name) {
        case 'orderByKey':
          constraints.push(orderByKey());
          break;
        case 'orderByPriority':
          constraints.push(orderByPriority());
          break;
        case 'orderByValue':
          constraints.push(orderByValue());
          break;
        case 'orderByChild':
          constraints.push(orderByChild(modifier.key ?? ''));
          break;
      }
    }

    if (type === 'limit') {
      const { value } = modifier;

      switch (name) {
        case 'limitToLast':
          constraints.push(limitToLast(value));
          break;
        case 'limitToFirst':
          constraints.push(limitToFirst(value));
          break;
      }
    }

    if (type === 'filter' && isQueryFilterValue(modifier.value)) {
      const { key, value } = modifier;

      switch (name) {
        case 'endAt':
          constraints.push(endAt(value, key));
          break;
        case 'endBefore':
          constraints.push(endBefore(value, key));
          break;
        case 'startAt':
          constraints.push(startAt(value, key));
          break;
        case 'startAfter':
          constraints.push(startAfter(value, key));
          break;
      }
    }
  }

  return query(dbRef, ...constraints);
}
