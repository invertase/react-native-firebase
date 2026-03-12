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
import type DatabaseReference from './DatabaseReference';

// To avoid React Native require cycle warnings
let DatabaseReferenceClass: typeof DatabaseReference | null = null;

export function provideReferenceClass(databaseReference: typeof DatabaseReference): void {
  DatabaseReferenceClass = databaseReference;
}

export default class DatabaseThenableReference {
  // @ts-expect-error - _ref is used in Proxy get trap but TypeScript doesn't detect it
  private _ref: DatabaseReference;
  private _promise: Promise<DatabaseReference>;

  constructor(
    database: unknown,
    path: string,
    promise: Promise<DatabaseReference>,
  ) {
    if (!DatabaseReferenceClass) {
      throw new Error('DatabaseReference class not provided. Call provideReferenceClass first.');
    }
    this._ref = createDeprecationProxy(
      new DatabaseReferenceClass(database as any, path),
    ) as DatabaseReference;
    this._promise = promise;

    return new Proxy(this as any, {
      get(target, prop) {
        if (prop === 'then' || prop === 'catch') {
          return target[prop as keyof DatabaseThenableReference];
        }

        return (target._ref as any)[prop];
      },
    }) as DatabaseThenableReference & DatabaseReference;
  }

  get then(): Promise<DatabaseReference>['then'] {
    return this._promise.then.bind(this._promise);
  }

  get catch(): Promise<DatabaseReference>['catch'] {
    return this._promise.catch.bind(this._promise);
  }
}
