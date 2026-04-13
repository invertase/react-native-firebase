/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import type { DatabaseModuleInternal, DatabaseReferenceInternal } from './types/internal';
import type { FirebaseDatabaseTypes } from './types/namespaced';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- intentional shim
declare class DatabaseReference implements DatabaseReferenceInternal {
  constructor(database: DatabaseModuleInternal, path: string);
  readonly path: string;
  on(
    eventType: 'value' | 'child_added' | 'child_changed' | 'child_moved' | 'child_removed',
    callback: (data: unknown, previousChildKey?: string | null) => void,
    cancelCallbackOrContext?: Record<string, any> | ((a: Error) => void) | string | null,
    context?: Record<string, any> | null,
  ): (a: unknown, b?: string | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- intentional shim
interface DatabaseReference extends FirebaseDatabaseTypes.Reference {}

export default DatabaseReference;
