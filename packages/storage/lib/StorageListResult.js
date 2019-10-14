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
let StorageReference = null;
export function provideStorageReferenceClass(storageReference) {
  StorageReference = storageReference;
}

export default class StorageListResult {
  constructor(storage, nativeData) {
    this._nextPageToken = nativeData.nextPageToken || null;
    this._items = nativeData.items.map(path => new StorageReference(storage, path));
    this._prefixes = nativeData.prefixes.map(path => new StorageReference(storage, path));
  }

  get items() {
    return this._items;
  }

  get nextPageToken() {
    return this._nextPageToken;
  }

  get prefixes() {
    return this._prefixes;
  }
}
