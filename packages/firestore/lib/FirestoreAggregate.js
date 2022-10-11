/*
 * Copyright (c) 2022-present Invertase Limited & Contributors
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

export class FirestoreAggregateQuery {
  constructor(firestore, query, collectionPath, modifiers) {
    this._firestore = firestore;
    this._query = query;
    this._collectionPath = collectionPath;
    this._modifiers = modifiers;
  }

  get query() {
    return this._query;
  }

  get() {
    return this._firestore.native
      .collectionCount(
        this._collectionPath.relativeName,
        this._modifiers.type,
        this._modifiers.filters,
        this._modifiers.orders,
        this._modifiers.options,
      )
      .then(data => new FirestoreAggregateQuerySnapshot(this._query, data));
  }
}

export class FirestoreAggregateQuerySnapshot {
  constructor(query, data) {
    this._query = query;
    this._data = data;
  }

  data() {
    return { count: this._data.count };
  }
}
