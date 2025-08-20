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
import type { ReactNativeFirebase } from './index';

// Type definitions for internal modules used by other packages during TypeScript migration

declare module '@react-native-firebase/app/lib/internal' {
  import BaseFirebaseModule = ReactNativeFirebase.FirebaseModule;
  export class FirebaseModule extends BaseFirebaseModule {
    native: any;
    emitter: any;
  }
  export function createModuleNamespace(config: any): any;
  export function getFirebaseRoot(): any;
  export class NativeFirebaseError {
    static getStackWithMessage(message: string, jsStack?: string): string;
  }
}

declare module '@react-native-firebase/app/lib/internal/nativeModule' {
  export function setReactNativeModule(name: string, module: any): void;
}

declare module '@react-native-firebase/app/lib/common' {
  export function isAlphaNumericUnderscore(value: any): boolean;
  export function isE164PhoneNumber(value: any): boolean;
  export function isIOS(): boolean;
  export function isNull(value: any): boolean;
  export function isNumber(value: any): boolean;
  export function isObject(value: any): boolean;
  export function isOneOf(value: any, array: any[]): boolean;
  export function isString(value: any): boolean;
  export function isUndefined(value: any): boolean;
  export function isBoolean(value: any): boolean;
}
