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

import type { Crashlytics } from './crashlytics';

export interface NativeRNFBTurboCrashlytics {
  isCrashlyticsCollectionEnabled: boolean;
  isErrorGenerationOnJSCrashEnabled: boolean;
  isCrashlyticsJavascriptExceptionHandlerChainingEnabled: boolean;
  checkForUnsentReports(): Promise<boolean>;
  crash(): void;
  deleteUnsentReports(): Promise<void>;
  didCrashOnPreviousExecution(): Promise<boolean>;
  log(message: string): void;
  setAttribute(name: string, value: string): Promise<null>;
  setAttributes(object: { [key: string]: string }): Promise<null>;
  setUserId(userId: string): Promise<null>;
  recordError(errorObj: unknown): void;
  sendUnsentReports(): void;
  setCrashlyticsCollectionEnabled(enabled: boolean): Promise<null>;
  logPromise(message: string): Promise<void>;
  recordErrorPromise(errorObj: unknown): Promise<void>;
  crashWithStackPromise(errorObj: unknown): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    NativeRNFBTurboCrashlytics: NativeRNFBTurboCrashlytics;
  }
}

export interface CrashlyticsInternal extends Crashlytics {
  checkForUnsentReports(): Promise<boolean>;
  crash(): void;
  deleteUnsentReports(): Promise<void>;
  didCrashOnPreviousExecution(): Promise<boolean>;
  log(message: string): void;
  recordError(error: Error, jsErrorName?: string): void;
  sendUnsentReports(): void;
  setUserId(userId: string): Promise<null>;
  setAttribute(name: string, value: string): Promise<null>;
  setAttributes(attributes: { [key: string]: string }): Promise<null>;
  setCrashlyticsCollectionEnabled(enabled: boolean): Promise<null>;
  readonly native: NativeRNFBTurboCrashlytics;
}
