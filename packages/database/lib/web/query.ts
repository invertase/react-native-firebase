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
  type QueryConstraint,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseDatabase';

interface QueryModifier {
  type: string;
  name: string;
  key?: string;
  value?: unknown;
}

export function getQueryInstance(dbRef: unknown, modifiers: QueryModifier[]): unknown {
  const constraints: QueryConstraint[] = [];

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
          constraints.push(orderByChild(modifier.key!));
          break;
      }
    }

    if (type === 'limit') {
      const { value } = modifier;

      switch (name) {
        case 'limitToLast':
          constraints.push(limitToLast(value as number));
          break;
        case 'limitToFirst':
          constraints.push(limitToFirst(value as number));
          break;
      }
    }

    if (type === 'filter') {
      const { key, value } = modifier;

      switch (name) {
        case 'endAt':
          constraints.push(endAt(value as number | string | boolean | null, key));
          break;
        case 'endBefore':
          constraints.push(endBefore(value as number | string | boolean | null, key));
          break;
        case 'startAt':
          constraints.push(startAt(value as number | string | boolean | null | undefined, key));
          break;
        case 'startAfter':
          constraints.push(startAfter(value as number | string | boolean | null, key));
          break;
      }
    }
  }
  return query(dbRef as Parameters<typeof query>[0], ...constraints);
}
