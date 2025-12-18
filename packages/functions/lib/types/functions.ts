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

// ============ Options & Result Types ============

export interface HttpsCallableOptions {
  timeout?: number;
}

export interface HttpsCallableResult<ResponseData = unknown> {
  readonly data: ResponseData;
}

export interface HttpsCallable<RequestData = unknown, ResponseData = unknown> {
  (data?: RequestData | null): Promise<HttpsCallableResult<ResponseData>>;
}

// ============ Error Code Types ============

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
  | 'unauthenticated'
  | 'unsupported-type'
  | 'failed-to-parse-wrapped-number';

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
  UNSUPPORTED_TYPE: 'unsupported-type';
  FAILED_TO_PARSE_WRAPPED_NUMBER: 'failed-to-parse-wrapped-number';
}

export interface HttpsError extends Error {
  readonly code: FunctionsErrorCode;
  readonly details?: unknown;
}

// ============ Module Interface ============

/**
 * Functions module instance - returned from firebase.functions() or firebase.app().functions()
 */
export interface FunctionsModule extends ReactNativeFirebase.FirebaseModule {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;

  /**
   * Returns a reference to the callable HTTPS trigger with the given name.
   *
   * @param name The name of the trigger.
   * @param options Optional settings for the callable function.
   */
  httpsCallable<RequestData = unknown, ResponseData = unknown>(
    name: string,
    options?: HttpsCallableOptions,
  ): HttpsCallable<RequestData, ResponseData>;

  /**
   * Returns a reference to the callable HTTPS trigger with the given URL.
   *
   * @param url The URL of the trigger.
   * @param options Optional settings for the callable function.
   */
  httpsCallableFromUrl<RequestData = unknown, ResponseData = unknown>(
    url: string,
    options?: HttpsCallableOptions,
  ): HttpsCallable<RequestData, ResponseData>;

  /**
   * Changes this instance to point to a Cloud Functions emulator running locally.
   *
   * @deprecated Use useEmulator(host, port) instead.
   * @param origin The origin of the local emulator, e.g. "http://localhost:5001".
   */
  useFunctionsEmulator(origin: string): void;

  /**
   * Changes this instance to point to a Cloud Functions emulator running locally.
   *
   * @param host The host of the emulator, e.g. "localhost" or "10.0.2.2" for Android.
   * @param port The port of the emulator, e.g. 5001.
   */
  useEmulator(host: string, port: number): void;
}

// ============ Statics Interface ============

/**
 * Static properties available on firebase.functions
 */
export interface FunctionsStatics {
  HttpsErrorCode: HttpsErrorCode;
}

// ============ Type Aliases for Convenience ============

export type Functions = FunctionsModule;

/**
 * FirebaseApp type with functions() method.
 * @deprecated Import FirebaseApp from '@react-native-firebase/app' instead.
 * The functions() method is added via module augmentation.
 */
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;

// ============ Module Augmentation ============

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      functions: FirebaseModuleWithStaticsAndApp<FunctionsModule, FunctionsStatics>;
    }
    interface FirebaseApp {
      functions(regionOrCustomDomain?: string): FunctionsModule;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// ============ Backwards Compatibility Namespace ============

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseFunctionsTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseFunctionsTypes {
  // Short name aliases referencing top-level types
  export type ErrorCode = FunctionsErrorCode;
  export type CallableResult<ResponseData = unknown> = HttpsCallableResult<ResponseData>;
  export type Callable<RequestData = unknown, ResponseData = unknown> = HttpsCallable<
    RequestData,
    ResponseData
  >;
  export type CallableOptions = HttpsCallableOptions;
  export type Error = HttpsError;
  export type ErrorCodeMap = HttpsErrorCode;
  export type Statics = FunctionsStatics;
  export type Module = FunctionsModule;
}

// Separate namespace block for Https* aliases to avoid naming conflicts
// These provide backwards compatibility for code using FirebaseFunctionsTypes.HttpsCallableResult
export namespace FirebaseFunctionsTypes {
  // These must be inline definitions since TypeScript doesn't allow re-exporting
  // with the same name as a type that already exists in scope
  export interface HttpsCallableResult<T = unknown> {
    readonly data: T;
  }
  export interface HttpsCallable<RequestData = unknown, ResponseData = unknown> {
    (data?: RequestData | null): Promise<HttpsCallableResult<ResponseData>>;
  }
  export interface HttpsCallableOptions {
    timeout?: number;
  }
  export interface HttpsError extends globalThis.Error {
    readonly code: FunctionsErrorCode;
    readonly details?: unknown;
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
    UNSUPPORTED_TYPE: 'unsupported-type';
    FAILED_TO_PARSE_WRAPPED_NUMBER: 'failed-to-parse-wrapped-number';
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
