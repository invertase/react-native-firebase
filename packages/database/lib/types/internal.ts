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

import type { Database, ServerValue } from './database';

/** Optional final argument passed by modular API wrappers (MODULAR_DEPRECATION_ARG). */
export type DatabaseModularDeprecationArg = string;

/** App instance with database() method (e.g. from getApp() when used for getDatabase()). */
export interface AppWithDatabaseInternal {
  database(url?: string): Database;
}

/** Runtime ServerValue object shape used by modular wrappers. */
export interface ServerValueStaticInternal extends ServerValue {
  increment(delta: number, deprecationArg?: DatabaseModularDeprecationArg): object;
}
