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

import type { StorageReference } from './types/storage';
import type { ListResultInternal, StorageInternal } from './types/internal';

// To avoid React Native require cycle warnings
let Reference: (new (storage: StorageInternal, path: string) => StorageReference) | null = null;

export function provideStorageReferenceClass(
  storageReference: new (storage: StorageInternal, path: string) => StorageReference,
): void {
  Reference = storageReference;
}

export default class StorageListResult {
  private _nextPageToken: string | null;
  private _items: StorageReference[];
  private _prefixes: StorageReference[];

  constructor(storage: StorageInternal, nativeData: ListResultInternal) {
    this._nextPageToken = nativeData.nextPageToken || null;

    if (!Reference) {
      throw new Error(
        'Reference class has not been provided. This is likely a module initialization issue.',
      );
    }

    // TypeScript doesn't narrow the type after the null check, so we assign to a const
    const StorageReferenceClass = Reference;
    this._items = nativeData.items.map(path => new StorageReferenceClass(storage, path));
    this._prefixes = nativeData.prefixes.map(path => new StorageReferenceClass(storage, path));
  }

  get items(): StorageReference[] {
    return this._items;
  }

  get nextPageToken(): string | null {
    return this._nextPageToken;
  }

  get prefixes(): StorageReference[] {
    return this._prefixes;
  }
}
