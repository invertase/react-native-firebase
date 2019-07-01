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

// To avoid React Native require cycle warnings
let DatabaseReference = null;
export function provideReferenceClass(databaseReference) {
  DatabaseReference = databaseReference;
}

export default class DatabaseThenableReference {
  constructor(database, path, promise) {
    this._ref = new DatabaseReference(database, path);
    this._promise = promise;

    return new Proxy(this, {
      get(target, prop) {
        if (prop === 'then' || prop === 'catch') {
          return target[prop];
        }

        return target._ref[prop];
      },
    });
  }

  get then() {
    return this._promise.then.bind(this._promise);
  }

  get catch() {
    return this._promise.catch.bind(this._promise);
  }
}
