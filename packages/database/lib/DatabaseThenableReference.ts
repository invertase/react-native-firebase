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

import { createDeprecationProxy } from '@react-native-firebase/app/dist/module/common';

import type { DatabaseInternal } from './types/internal';
import type { DatabaseReference } from './types/database';

type DatabaseReferenceConstructor = new (
  database: DatabaseInternal,
  path: string,
) => DatabaseReference;

let DatabaseReferenceClass: DatabaseReferenceConstructor | null = null;

export function provideReferenceClass(databaseReference: DatabaseReferenceConstructor): void {
  DatabaseReferenceClass = databaseReference;
}

export default class DatabaseThenableReference implements Pick<
  Promise<DatabaseReference>,
  'then' | 'catch'
> {
  _ref: DatabaseReference;
  _promise: Promise<DatabaseReference>;

  constructor(database: DatabaseInternal, path: string, promise: Promise<DatabaseReference>) {
    if (!DatabaseReferenceClass) {
      throw new Error('DatabaseReference class has not been provided.');
    }

    this._ref = createDeprecationProxy(
      new DatabaseReferenceClass(database, path),
    ) as DatabaseReference;
    this._promise = promise;

    return new Proxy(this, {
      get(target, prop) {
        if (prop === 'then' || prop === 'catch') {
          return Reflect.get(target, prop, target);
        }

        return Reflect.get(target._ref as object, prop);
      },
    }) as unknown as DatabaseThenableReference;
  }

  get then(): Promise<DatabaseReference>['then'] {
    return this._promise.then.bind(this._promise);
  }

  get catch(): Promise<DatabaseReference>['catch'] {
    return this._promise.catch.bind(this._promise);
  }
}
