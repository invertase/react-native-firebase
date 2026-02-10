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

import type {
  Storage,
  StorageStatics,
  Reference,
  FullMetadata,
  SettableMetadata,
  ListResult,
  ListOptions,
  TaskSnapshot,
  TaskResult,
  Task,
  EmulatorMockTokenOptions,
} from './storage';

// ============ Backwards Compatibility Namespace ============

// Helper types to reference outer scope types within the namespace
// These are needed because TypeScript can't directly alias types with the same name
type _Storage = Storage;
type _StorageStatics = StorageStatics;
type _Reference = Reference;
type _FullMetadata = FullMetadata;
type _SettableMetadata = SettableMetadata;
type _ListResult = ListResult;
type _ListOptions = ListOptions;
type _TaskSnapshot = TaskSnapshot;
type _TaskResult = TaskResult;
type _Task = Task;
type _EmulatorMockTokenOptions = EmulatorMockTokenOptions;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseStorageTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseStorageTypes {
  // Short name aliases referencing top-level types
  export type Module = _Storage;
  export type Statics = _StorageStatics;
  export type Reference = _Reference;
  export type FullMetadata = _FullMetadata;
  export type SettableMetadata = _SettableMetadata;
  export type ListResult = _ListResult;
  export type ListOptions = _ListOptions;
  export type TaskSnapshot = _TaskSnapshot;
  export type TaskResult = _TaskResult;
  export type Task = _Task;
  export type EmulatorMockTokenOptions = _EmulatorMockTokenOptions;
}
/* eslint-enable @typescript-eslint/no-namespace */
