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

import type { Reference } from './types/storage';

// To avoid React Native require cycle warnings
let StorageReference: (new (storage: any, path: string) => Reference) | null = null;

export function provideStorageReferenceClass(
  storageReference: new (storage: any, path: string) => Reference,
): void {
  StorageReference = storageReference;
}

export default class StorageListResult {
  private _nextPageToken: string | null;
  private _items: Reference[];
  private _prefixes: Reference[];

  constructor(
    storage: any,
    nativeData: { nextPageToken?: string | null; items: string[]; prefixes: string[] },
  ) {
    this._nextPageToken = nativeData.nextPageToken || null;
    // @ts-ignore - StorageReference is set by provideStorageReferenceClass before use
    this._items = nativeData.items.map(path => new StorageReference(storage, path));
    // @ts-ignore - StorageReference is set by provideStorageReferenceClass before use
    this._prefixes = nativeData.prefixes.map(path => new StorageReference(storage, path));
  }

  get items(): Reference[] {
    return this._items;
  }

  get nextPageToken(): string | null {
    return this._nextPageToken;
  }

  get prefixes(): Reference[] {
    return this._prefixes;
  }
}
