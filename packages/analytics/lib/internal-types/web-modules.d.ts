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

/**
 * Type declarations for web-only modules from the app package.
 * These modules are JavaScript files with separate .d.ts declarations.
 *
 * @internal - This file is not exposed to package consumers
 */

declare module '@react-native-firebase/app/lib/internal/web/firebaseApp' {
  import type { ReactNativeFirebase } from '@react-native-firebase/app';

  export function getApp(appName?: string): ReactNativeFirebase.FirebaseApp;
}

declare module '@react-native-firebase/app/lib/internal/web/utils' {
  export function guard<T>(fn: () => T | Promise<T>): Promise<T>;
}

declare module '@react-native-firebase/app/lib/internal/web/firebaseInstallations' {
  import type { ReactNativeFirebase } from '@react-native-firebase/app';

  export interface Installations {
    app: ReactNativeFirebase.FirebaseApp;
  }

  export type Unsubscribe = () => void;

  export function getApp(appName?: string): ReactNativeFirebase.FirebaseApp;
  export function getInstallations(app?: ReactNativeFirebase.FirebaseApp): Installations;
  export function getId(installations: Installations): Promise<string>;
  export function onIdChange(
    installations: Installations,
    callback: (installationId: string) => void,
  ): Unsubscribe;
  export function makeIDBAvailable(): void;
}
