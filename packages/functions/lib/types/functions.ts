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

export interface HttpsCallableOptions {
  timeout?: number;
}

export interface HttpsCallable<RequestData = unknown, ResponseData = unknown> {
  (data?: RequestData | null): Promise<{ data: ResponseData }>;
}

export interface FunctionsModule {
  httpsCallable<RequestData = unknown, ResponseData = unknown>(
    name: string,
    options?: HttpsCallableOptions,
  ): HttpsCallable<RequestData, ResponseData>;
  httpsCallableFromUrl<RequestData = unknown, ResponseData = unknown>(
    url: string,
    options?: HttpsCallableOptions,
  ): HttpsCallable<RequestData, ResponseData>;
  useFunctionsEmulator(origin: string): void;
  useEmulator(host: string, port: number): void;
}

export type Functions = FunctionsModule;
export type FirebaseApp = ReactNativeFirebase.FirebaseApp & {
  functions(regionOrCustomDomain?: string): Functions;
};

// FirebaseFunctionsTypes namespace for backwards compatibility
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseFunctionsTypes {
  export type FunctionsErrorCode =
    | 'ok'
    | 'cancelled'
    | 'unknown'
    | 'invalid-argument'
    | 'deadline-exceeded'
    | 'not-found'
    | 'already-exists'
    | 'permission-denied'
    | 'resource-exhausted'
    | 'failed-precondition'
    | 'aborted'
    | 'out-of-range'
    | 'unimplemented'
    | 'internal'
    | 'unavailable'
    | 'data-loss'
    | 'unauthenticated';

  export interface HttpsCallableResult<ResponseData = unknown> {
    readonly data: ResponseData;
  }

  export interface HttpsCallable<RequestData = unknown, ResponseData = unknown> {
    (data?: RequestData | null): Promise<HttpsCallableResult<ResponseData>>;
  }

  export interface HttpsCallableOptions {
    timeout?: number;
  }

  export interface HttpsError extends Error {
    readonly code: FunctionsErrorCode;
    readonly details?: any;
  }

  export interface HttpsErrorCode {
    OK: 'ok';
    CANCELLED: 'cancelled';
    UNKNOWN: 'unknown';
    INVALID_ARGUMENT: 'invalid-argument';
    DEADLINE_EXCEEDED: 'deadline-exceeded';
    NOT_FOUND: 'not-found';
    ALREADY_EXISTS: 'already-exists';
    PERMISSION_DENIED: 'permission-denied';
    UNAUTHENTICATED: 'unauthenticated';
    RESOURCE_EXHAUSTED: 'resource-exhausted';
    FAILED_PRECONDITION: 'failed-precondition';
    ABORTED: 'aborted';
    OUT_OF_RANGE: 'out-of-range';
    UNIMPLEMENTED: 'unimplemented';
    INTERNAL: 'internal';
    UNAVAILABLE: 'unavailable';
    DATA_LOSS: 'data-loss';
  }

  export interface Statics {
    HttpsErrorCode: HttpsErrorCode;
  }

  export interface Module {
    httpsCallable<RequestData = unknown, ResponseData = unknown>(
      name: string,
      options?: HttpsCallableOptions,
    ): HttpsCallable<RequestData, ResponseData>;
    httpsCallableFromUrl<RequestData = unknown, ResponseData = unknown>(
      url: string,
      options?: HttpsCallableOptions,
    ): HttpsCallable<RequestData, ResponseData>;
    useFunctionsEmulator(origin: string): void;
    useEmulator(host: string, port: number): void;
  }
}

// Module augmentation to add functions() method to FirebaseApp
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface FirebaseApp {
      functions(regionOrCustomDomain?: string): FunctionsModule;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
