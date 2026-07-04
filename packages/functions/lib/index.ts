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

import { isAndroid, isNumber, isOther } from '@react-native-firebase/app/dist/module/common';
import type { FirebaseApp } from '@react-native-firebase/app';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import './types/internal';
import { HttpsError, type NativeError } from './HttpsError';
import type { FunctionsInternal } from './types/internal';
import { version } from './version';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import fallBackModule from './web/RNFBFunctionsModule';
import type {
  HttpsCallableOptions,
  HttpsCallableStreamOptions,
  Functions,
  HttpsCallable,
} from './types/functions';
import type { CustomHttpsCallableOptions, FunctionsStreamingEvent } from './types/internal';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
const nativeModuleName = 'NativeRNFBTurboFunctions';

export const HttpsErrorCode = {
  OK: 'ok',
  CANCELLED: 'cancelled',
  UNKNOWN: 'unknown',
  INVALID_ARGUMENT: 'invalid-argument',
  DEADLINE_EXCEEDED: 'deadline-exceeded',
  NOT_FOUND: 'not-found',
  ALREADY_EXISTS: 'already-exists',
  PERMISSION_DENIED: 'permission-denied',
  UNAUTHENTICATED: 'unauthenticated',
  RESOURCE_EXHAUSTED: 'resource-exhausted',
  FAILED_PRECONDITION: 'failed-precondition',
  ABORTED: 'aborted',
  OUT_OF_RANGE: 'out-of-range',
  UNIMPLEMENTED: 'unimplemented',
  INTERNAL: 'internal',
  UNAVAILABLE: 'unavailable',
  DATA_LOSS: 'data-loss',
  UNSUPPORTED_TYPE: 'unsupported-type',
  FAILED_TO_PARSE_WRAPPED_NUMBER: 'failed-to-parse-wrapped-number',
  // Web codes are lowercase dasherized.
  ok: 'ok',
  cancelled: 'cancelled',
  unknown: 'unknown',
  'invalid-argument': 'invalid-argument',
  'deadline-exceeded': 'deadline-exceeded',
  'not-found': 'not-found',
  'already-exists': 'already-exists',
  'permission-denied': 'permission-denied',
  unauthenticated: 'unauthenticated',
  'resource-exhausted': 'resource-exhausted',
  'failed-precondition': 'failed-precondition',
  aborted: 'aborted',
  'out-of-range': 'out-of-range',
  unimplemented: 'unimplemented',
  internal: 'internal',
  unavailable: 'unavailable',
  'data-loss': 'data-loss',
} as const;

function normalizeHttpsCallableTimeoutOptions(options: HttpsCallableOptions): HttpsCallableOptions {
  if (!options.timeout) {
    return options;
  }
  if (!isNumber(options.timeout)) {
    throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
  }
  if (isOther) {
    return options;
  }
  return {
    ...options,
    timeout: options.timeout / 1000,
  };
}

let _id_functions_streaming_event = 0;

class FirebaseFunctionsModule extends FirebaseModule {
  _customUrlOrRegion: string;
  private _useFunctionsEmulatorHost: string | null;
  private _useFunctionsEmulatorPort: number;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._customUrlOrRegion = customUrlOrRegion || 'us-central1';
    this._useFunctionsEmulatorHost = null;
    this._useFunctionsEmulatorPort = -1;

    this.emitter.addListener(
      this.eventNameForApp('functions_streaming_event'),
      (event: FunctionsStreamingEvent) => {
        this.emitter.emit(
          this.eventNameForApp(`functions_streaming_event:${event.listenerId}`),
          event,
        );
      },
    );
  }

  /**
   * Private helper method to create a streaming handler for callable functions.
   * This method encapsulates the common streaming logic used by both
   * httpsCallable and httpsCallableFromUrl.
   */
  private async _createStreamHandler(
    initiateStream: (listenerId: number) => void,
  ): Promise<{ stream: AsyncGenerator<unknown, void, unknown>; data: Promise<unknown> }> {
    const listenerId = _id_functions_streaming_event++;
    const eventName = this.eventNameForApp(`functions_streaming_event:${listenerId}`);
    const nativeModule = this.native;

    // Capture JavaScript stack at stream creation time so an error can be thrown with the correct stack trace
    const capturedStack = new Error().stack;

    // Queue to buffer events before iteration starts
    const eventQueue: unknown[] = [];
    let resolveNext: ((value: IteratorResult<unknown>) => void) | null = null;
    let error: HttpsError | null = null;
    let done = false;
    let finalData: unknown = null;
    let resolveDataPromise: ((value: unknown) => void) | null = null;
    let rejectDataPromise: ((reason: Error) => void) | null = null;

    const subscription = this.emitter.addListener(eventName, (event: FunctionsStreamingEvent) => {
      const body = event.body;

      if (body.error) {
        const { code, message, details } = body.error || {};
        error = new HttpsError(
          HttpsErrorCode[code as keyof typeof HttpsErrorCode] || HttpsErrorCode.UNKNOWN,
          message || 'Unknown error',
          details ?? null,
          { jsStack: capturedStack },
        );
        done = true;
        subscription.remove();
        if (nativeModule.removeFunctionsStreaming) {
          nativeModule.removeFunctionsStreaming(listenerId);
        }
        if (resolveNext) {
          resolveNext({ done: true, value: undefined });
          resolveNext = null;
        }
        if (rejectDataPromise) {
          rejectDataPromise(error);
          rejectDataPromise = null;
        }
        return;
      }

      if (body.done) {
        finalData = body.data;
        done = true;
        subscription.remove();
        if (nativeModule.removeFunctionsStreaming) {
          nativeModule.removeFunctionsStreaming(listenerId);
        }
        if (resolveNext) {
          resolveNext({ done: true, value: undefined });
          resolveNext = null;
        }
        if (resolveDataPromise) {
          resolveDataPromise(finalData);
          resolveDataPromise = null;
        }
      } else if (body.data !== null && body.data !== undefined) {
        // This is a chunk
        if (resolveNext) {
          resolveNext({ done: false, value: body.data });
          resolveNext = null;
        } else {
          eventQueue.push(body.data);
        }
      }
    });

    // Start native streaming via the provided callback
    initiateStream(listenerId);

    // Use async generator function for better compatibility with Hermes/React Native
    async function* streamGenerator() {
      try {
        while (true) {
          if (error) {
            const err = error as HttpsError;
            throw new HttpsError(
              HttpsErrorCode[err.code as keyof typeof HttpsErrorCode] || HttpsErrorCode.UNKNOWN,
              err.message,
              err.details ?? null,
              {
                jsStack: capturedStack,
              },
            );
          }

          if (eventQueue.length > 0) {
            yield eventQueue.shift();
            continue;
          }

          if (error) {
            const err = error as HttpsError;
            throw new HttpsError(
              HttpsErrorCode[err.code as keyof typeof HttpsErrorCode] || HttpsErrorCode.UNKNOWN,
              err.message,
              err.details ?? null,
              {
                jsStack: capturedStack,
              },
            );
          }
          if (done) {
            return;
          }

          // Wait for next event
          const result = await new Promise<IteratorResult<unknown>>(resolve => {
            resolveNext = resolve;
          });

          // Check result after promise resolves
          if (error) {
            const err = error as HttpsError;
            throw new HttpsError(err.code, err.message, err.details ?? null, {
              jsStack: capturedStack,
            });
          }
          if (result.done || done) {
            return;
          }

          if (result.value !== undefined && result.value !== null) {
            yield result.value;
          }
        }
      } finally {
        // Cleanup when generator is closed/returned
        subscription.remove();
        if (nativeModule.removeFunctionsStreaming) {
          nativeModule.removeFunctionsStreaming(listenerId);
        }
      }
    }

    const asyncIterator = streamGenerator();

    // Create a promise that resolves with the final data when the listener receives done/error
    const dataPromise = new Promise<unknown>((resolve, reject) => {
      resolveDataPromise = resolve;
      rejectDataPromise = reject;
      if (error) {
        rejectDataPromise = null;
        reject(error);
      } else if (done) {
        resolveDataPromise = null;
        resolve(finalData);
      }
    });

    return {
      stream: asyncIterator,
      data: dataPromise,
    };
  }

  httpsCallable(name: string, options: HttpsCallableOptions = {}) {
    const normalizedOptions = normalizeHttpsCallableTimeoutOptions(options);

    const callableFunction = ((data?: unknown) => {
      const nativePromise = this.native.httpsCallable(
        this._useFunctionsEmulatorHost,
        this._useFunctionsEmulatorPort,
        name,
        {
          data,
        },
        normalizedOptions,
      );
      return nativePromise.catch((nativeError: NativeError) => {
        const { code, message, details } = nativeError.userInfo || {};
        return Promise.reject(
          new HttpsError(
            HttpsErrorCode[code as keyof typeof HttpsErrorCode] || HttpsErrorCode.UNKNOWN,
            message || nativeError.message,
            details || null,
            nativeError,
          ),
        );
      });
    }) as HttpsCallable<unknown, unknown, unknown>;

    callableFunction.stream = async (
      data?: unknown,
      streamOptions?: HttpsCallableStreamOptions,
    ) => {
      const platformOptions = !isOther
        ? normalizedOptions
        : ({
            ...normalizedOptions,
            httpsCallableStreamOptions: streamOptions || {},
          } as CustomHttpsCallableOptions);
      return this._createStreamHandler(listenerId => {
        this.native.httpsCallableStream(
          this._useFunctionsEmulatorHost || null,
          this._useFunctionsEmulatorPort || -1,
          name,
          { data },
          platformOptions || {},
          listenerId,
        );
      });
    };

    return callableFunction;
  }

  httpsCallableFromUrl(url: string, options: HttpsCallableOptions = {}) {
    const normalizedOptions = normalizeHttpsCallableTimeoutOptions(options);

    const callableFunction = ((data?: unknown) => {
      const nativePromise = this.native.httpsCallableFromUrl(
        this._useFunctionsEmulatorHost,
        this._useFunctionsEmulatorPort,
        url,
        {
          data,
        },
        normalizedOptions,
      );
      return nativePromise.catch((nativeError: NativeError) => {
        const { code, message, details } = nativeError.userInfo || {};
        return Promise.reject(
          new HttpsError(
            HttpsErrorCode[code as keyof typeof HttpsErrorCode] || HttpsErrorCode.UNKNOWN,
            message || nativeError.message,
            details || null,
            nativeError,
          ),
        );
      });
    }) as HttpsCallable<unknown, unknown, unknown>;

    callableFunction.stream = async (
      data?: unknown,
      streamOptions?: HttpsCallableStreamOptions,
    ) => {
      const platformOptions = !isOther
        ? normalizedOptions
        : ({
            ...normalizedOptions,
            httpsCallableStreamOptions: streamOptions || {},
          } as CustomHttpsCallableOptions);
      return this._createStreamHandler(listenerId => {
        this.native.httpsCallableStreamFromUrl(
          this._useFunctionsEmulatorHost || null,
          this._useFunctionsEmulatorPort || -1,
          url,
          { data },
          platformOptions || {},
          listenerId,
        );
      });
    };
    return callableFunction;
  }

  useFunctionsEmulator(origin: string): void {
    const match = /https?\:.*\/\/([^:]+):?(\d+)?/.exec(origin);
    if (!match) {
      throw new Error('Invalid emulator origin format');
    }
    const [, host, portStr] = match;
    const port = portStr ? parseInt(portStr) : 5001;
    this.useEmulator(host as string, port);
  }

  useEmulator(host: string, port: number): void {
    if (!isNumber(port)) {
      throw new Error('useEmulator port parameter must be a number');
    }

    let _host = host;

    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;
    if (!androidBypassEmulatorUrlRemap && isAndroid && _host) {
      if (_host.startsWith('localhost')) {
        _host = _host.replace('localhost', '10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping functions host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
      if (_host.startsWith('127.0.0.1')) {
        _host = _host.replace('127.0.0.1', '10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping functions host "127.0.0.1" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }
    this._useFunctionsEmulatorHost = _host || null;
    this._useFunctionsEmulatorPort = port || -1;
  }
}

const config: ModuleConfig = {
  namespace: 'functions',
  nativeModuleName,
  nativeEvents: ['functions_streaming_event'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  turboModule: true,
};

export const SDK_VERSION = version;
export { HttpsError, HttpsError as FunctionsError };

/**
 * Returns a {@link Functions} instance for the default or given {@link FirebaseApp}.
 */
export function getFunctions(app?: FirebaseApp, regionOrCustomDomain?: string): Functions {
  return getOrCreateModularInstance(
    FirebaseFunctionsModule,
    config,
    app,
    regionOrCustomDomain,
  ) as unknown as Functions;
}

/**
 * Modify this instance to communicate with the Cloud Functions emulator.
 */
export function connectFunctionsEmulator(
  functionsInstance: Functions,
  host: string,
  port: number,
): void {
  (functionsInstance as FunctionsInternal).useEmulator(host, port);
}

/**
 * Returns a reference to the callable HTTPS trigger with the given name.
 */
export function httpsCallable<RequestData = unknown, ResponseData = unknown, StreamData = unknown>(
  functionsInstance: Functions,
  name: string,
  options?: HttpsCallableOptions,
): HttpsCallable<RequestData, ResponseData, StreamData> {
  return (functionsInstance as FunctionsInternal).httpsCallable(name, options) as HttpsCallable<
    RequestData,
    ResponseData,
    StreamData
  >;
}

/**
 * Returns a reference to the callable HTTPS trigger with the specified url.
 */
export function httpsCallableFromUrl<
  RequestData = unknown,
  ResponseData = unknown,
  StreamData = unknown,
>(
  functionsInstance: Functions,
  url: string,
  options?: HttpsCallableOptions,
): HttpsCallable<RequestData, ResponseData, StreamData> {
  return (functionsInstance as FunctionsInternal).httpsCallableFromUrl(
    url,
    options,
  ) as HttpsCallable<RequestData, ResponseData, StreamData>;
}

export type {
  HttpsCallableOptions,
  HttpsCallable,
  HttpsCallableResult,
  Functions,
  FunctionsErrorCode,
  FunctionsErrorCodeCore,
  HttpsErrorCodeValue,
} from './types/functions';

setReactNativeModule(nativeModuleName, fallBackModule);
