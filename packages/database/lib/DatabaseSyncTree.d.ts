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

import type { FirebaseDatabaseTypes } from './types/namespaced';

interface DatabaseSyncTreeRegistration {
  eventType: string;
  ref: FirebaseDatabaseTypes.Reference;
  path: string;
  key: string;
  appName: string;
  dbURL: string | null;
  eventRegistrationKey: string;
  listener: (...args: any[]) => void;
  once?: boolean;
}

declare const DatabaseSyncTree: {
  addRegistration(registration: DatabaseSyncTreeRegistration): string;
  getOneByPathEventListener(
    path: string,
    eventType: string,
    listener: (...args: any[]) => void,
  ): string | null;
  getRegistrationsByPath(path: string): string[];
  getRegistrationsByPathEvent(path: string, eventType?: string): string[];
  removeListenerRegistrations(
    listener: (...args: any[]) => void,
    registrations: string[],
  ): string[];
  removeListenersForRegistrations(registrations: string[] | string): number;
};

export default DatabaseSyncTree;
