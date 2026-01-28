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

/**
 * Use for iOS, Android and web for https callable only. For streaming, this is for android and iOS only.
 * For web streaming, use `HttpsCallableStreamOptions` instead.
 **/
export interface HttpsCallableOptions {
  /**
   * Use for iOS, Android and web for https callable only. For streaming, this is for android and iOS only.
   * For web streaming, use `HttpsCallableStreamOptions` instead.
   * The timeout for the callable function or stream request.
   */
  timeout?: number;
  /**
   * Use for iOS, Android and web for https callable only. For streaming, this is for android and iOS only.
   * For web streaming, use `HttpsCallableStreamOptions` instead.
   * If set to true, uses a limited-use App Check token for callable function or stream requests from this
   * instance of {@link Functions}. You must use limited-use tokens to call functions with
   * replay protection enabled. By default, this is false.
   */
  limitedUseAppCheckTokens?: boolean;
}

/**
 * Use for web only, for iOS and Android specific options, use `HttpsCallableOptions`.
 **/
export interface HttpsCallableStreamOptions {
  /**
   * Web only. An `AbortSignal` that can be used to cancel the streaming response. When the signal is aborted,
   * the underlying HTTP connection will be terminated. `AbortSignal` is only available on React Native >= v0.82.
   */
  signal?: AbortSignal;
  /**
   * Web only. If set to true, uses a limited-use App Check token for callable function requests from this
   * instance of {@link Functions}. You must use limited-use tokens to call functions with
   * replay protection enabled. By default, this is false.
   */
  limitedUseAppCheckTokens?: boolean;
}

export interface HttpsCallableResult<ResponseData = unknown> {
  readonly data: ResponseData;
}

export interface HttpsCallableStreamResult<ResponseData = unknown, StreamData = unknown> {
  readonly data: Promise<ResponseData>;
  readonly stream: AsyncIterable<StreamData>;
}

export interface HttpsCallable<
  RequestData = unknown,
  ResponseData = unknown,
  StreamData = unknown,
> {
  (data?: RequestData | null): Promise<HttpsCallableResult<ResponseData>>;
  stream: (
    data?: RequestData | null,
    options?: HttpsCallableStreamOptions,
  ) => Promise<HttpsCallableStreamResult<ResponseData, StreamData>>;
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
export interface Functions extends ReactNativeFirebase.FirebaseModule {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;

  /**
   * Returns a reference to the callable HTTPS trigger with the given name.
   *
   * @param name The name of the trigger.
   * @param options Optional settings for the callable function.
   */
  httpsCallable<RequestData = unknown, ResponseData = unknown, StreamData = unknown>(
    name: string,
    options?: HttpsCallableOptions,
  ): HttpsCallable<RequestData, ResponseData, StreamData>;

  /**
   * Returns a reference to the callable HTTPS trigger with the given URL.
   *
   * @param url The URL of the trigger.
   * @param options Optional settings for the callable function.
   */
  httpsCallableFromUrl<RequestData = unknown, ResponseData = unknown, StreamData = unknown>(
    url: string,
    options?: HttpsCallableOptions,
  ): HttpsCallable<RequestData, ResponseData, StreamData>;

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
      functions: FirebaseModuleWithStaticsAndApp<Functions, FunctionsStatics>;
    }
    interface FirebaseApp {
      functions(regionOrCustomDomain?: string): Functions;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// ============ Backwards Compatibility Namespace - to be removed with namespaced exports ============

// Helper types to reference outer scope types within the namespace
// These are needed because TypeScript can't directly alias types with the same name
type _HttpsCallableResult<T> = HttpsCallableResult<T>;
type _HttpsCallableStreamResult<ResponseData, StreamData> = HttpsCallableStreamResult<
  ResponseData,
  StreamData
>;
type _HttpsCallable<RequestData, ResponseData, StreamData> = HttpsCallable<
  RequestData,
  ResponseData,
  StreamData
>;
type _HttpsCallableOptions = HttpsCallableOptions;
type _HttpsCallableStreamOptions = HttpsCallableStreamOptions;
type _HttpsError = HttpsError;
type _HttpsErrorCode = HttpsErrorCode;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseFunctionsTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseFunctionsTypes {
  // Short name aliases referencing top-level types
  export type ErrorCode = FunctionsErrorCode;
  export type CallableResult<ResponseData = unknown> = HttpsCallableResult<ResponseData>;
  export type CallableStreamResult<
    ResponseData = unknown,
    StreamData = unknown,
  > = HttpsCallableStreamResult<ResponseData, StreamData>;
  export type Callable<
    RequestData = unknown,
    ResponseData = unknown,
    StreamData = unknown,
  > = HttpsCallable<RequestData, ResponseData, StreamData>;
  export type CallableOptions = HttpsCallableOptions;
  export type CallableStreamOptions = HttpsCallableStreamOptions;
  export type Error = HttpsError;
  export type ErrorCodeMap = HttpsErrorCode;
  export type Statics = FunctionsStatics;
  export type Module = Functions;

  // Https* aliases that reference the exported types above via helper types
  // These provide backwards compatibility for code using FirebaseFunctionsTypes.HttpsCallableResult
  export type HttpsCallableResult<T = unknown> = _HttpsCallableResult<T>;
  export type HttpsCallableStreamResult<
    ResponseData = unknown,
    StreamData = unknown,
  > = _HttpsCallableStreamResult<ResponseData, StreamData>;
  export type HttpsCallable<
    RequestData = unknown,
    ResponseData = unknown,
    StreamData = unknown,
  > = _HttpsCallable<RequestData, ResponseData, StreamData>;
  export type HttpsCallableOptions = _HttpsCallableOptions;
  export type HttpsCallableStreamOptions = _HttpsCallableStreamOptions;
  export type HttpsError = _HttpsError;
  export type HttpsErrorCode = _HttpsErrorCode;
}
/* eslint-enable @typescript-eslint/no-namespace */
