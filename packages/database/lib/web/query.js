import {
  query,
  orderByKey,
  orderByPriority,
  orderByValue,
  orderByChild,
  limitToLast,
  limitToFirst,
  endAt,
  endBefore,
  startAt,
  startAfter,
} from '@react-native-firebase/app/lib/internal/web/firebaseDatabase';

export function getQueryInstance(dbRef, modifiers) {
  const constraints = [];

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
          constraints.push(orderByChild(modifier.key));
          break;
      }
    }

    if (type === 'limit') {
      const { limit } = modifier;

      switch (name) {
        case 'limitToLast':
          constraints.push(limitToLast(limit));
          break;
        case 'limitToFirst':
          constraints.push(limitToFirst(limit));
          break;
      }
    }

    if (type === 'filter') {
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
