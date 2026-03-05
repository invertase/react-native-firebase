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

import type { FirestoreInternal } from './types/internal';

/**
 * A `PersistentCacheIndexManager` for configuring persistent cache indexes used
 * for local query execution.
 *
 * To use, call `getPersistentCacheIndexManager()` to get an instance.
 */
export class PersistentCacheIndexManager {
  _firestore: FirestoreInternal;

  constructor(firestore: FirestoreInternal) {
    this._firestore = firestore;
  }

  async enableIndexAutoCreation(): Promise<void> {
    await this._firestore.native.persistenceCacheIndexManager(0);
  }

  async disableIndexAutoCreation(): Promise<void> {
    await this._firestore.native.persistenceCacheIndexManager(1);
  }

  async deleteAllIndexes(): Promise<void> {
    await this._firestore.native.persistenceCacheIndexManager(2);
  }
}

export default PersistentCacheIndexManager;
