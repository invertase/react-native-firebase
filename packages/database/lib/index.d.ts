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

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { FirebaseDatabaseTypes } from './types/namespaced';

// Public/modular types (ServerValue not re-exported as type so value from modular is used)
export type {
  Database,
  DataSnapshot,
  EventType,
  OnDisconnect,
  Query,
  Reference,
  Statics,
  ThenableReference,
  TransactionResult,
} from './types/database';

// Namespaced (deprecated) types
export type { FirebaseDatabaseTypes } from './types/namespaced';

// Modular API
export * from './modular';

// Namespaced default export and firebase
type DatabaseNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseDatabaseTypes.Module,
  FirebaseDatabaseTypes.Statics
> & {
  database: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
    FirebaseDatabaseTypes.Module,
    FirebaseDatabaseTypes.Statics
  >;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

declare const defaultExport: DatabaseNamespace;

export const firebase: ReactNativeFirebase.Module & {
  database: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { database(): FirebaseDatabaseTypes.Module };
};

export default defaultExport;

declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      database: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
        FirebaseDatabaseTypes.Module,
        FirebaseDatabaseTypes.Statics
      >;
    }

    interface FirebaseApp {
      database(databaseUrl?: string): FirebaseDatabaseTypes.Module;
    }
  }
}
