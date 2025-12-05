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

import { ReactNativeFirebase } from '../../index';

// Firebase Installations service interface
export interface Installations {
  app: ReactNativeFirebase.FirebaseApp;
}

// Unsubscribe function type for onIdChange
export type Unsubscribe = () => void;

// getApp function - returns ReactNativeFirebase.FirebaseApp
export function getApp(appName?: string): ReactNativeFirebase.FirebaseApp;

// getInstallations function - gets the installations service for an app
export function getInstallations(app?: ReactNativeFirebase.FirebaseApp): Installations;

// getId function - gets the installation ID
export function getId(installations: Installations): Promise<string>;

// onIdChange function - listens for installation ID changes
export function onIdChange(
  installations: Installations,
  observer: (installationId: string) => void,
  onError?: (error: Error) => void
): Unsubscribe;

// makeIDBAvailable function - makes IndexedDB available in environments that don't have it
export function makeIDBAvailable(): void;
