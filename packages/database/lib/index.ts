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

// Export modular API functions
export * from './modular';
export { ServerValue } from './modular';

// Export modular/public type helpers
export type {
  Database,
  EmulatorMockTokenOptions,
  TransactionResult,
  DatabaseReference,
  ThenableReference,
  Query,
  OnDisconnect,
  EventType,
  DataSnapshot,
  IteratedDataSnapshot,
  Unsubscribe,
  ListenOptions,
  QueryConstraintType,
  QueryConstraint,
  TransactionOptions,
} from './types/database';

// Export namespaced API
export type { FirebaseDatabaseTypes } from './types/namespaced';

export * from './namespaced';
export { default } from './namespaced';
