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

import { isAndroid, isNumber } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { HttpsError, type NativeError } from './HttpsError';
import { version } from './version';
import { setReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';
import fallBackModule from './web/RNFBFunctionsModule';
import type { HttpsCallableOptions } from './types/functions';
import type { FirebaseApp } from '@react-native-firebase/app';
const namespace = 'functions';

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

const statics = {
  HttpsErrorCode,
};

// Export the complete FirebaseFunctionsTypes namespace
// eslint-disable-next-line @typescript-eslint/no-namespace
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

  // Re-export HttpsCallableOptions from types/functions
  export type HttpsCallableOptions = import('./types/functions').HttpsCallableOptions;

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

class FirebaseFunctionsModule extends FirebaseModule {
  _customUrlOrRegion: string;
  private _useFunctionsEmulatorHost: string | null;
  private _useFunctionsEmulatorPort: number;
  private _id_functions_streaming_event: number;
  
  // TODO: config is app package (FirebaseModule) object to be typed in the future
  constructor(app: FirebaseApp, config: any, customUrlOrRegion: string | null) {
    super(app, config, customUrlOrRegion);
    this._customUrlOrRegion = customUrlOrRegion || 'us-central1';
    this._useFunctionsEmulatorHost = null;
    this._useFunctionsEmulatorPort = -1;
    this._id_functions_streaming_event = 0;

    // @ts-ignore - emitter and eventNameForApp exist on FirebaseModule
    this.emitter.addListener(this.eventNameForApp('functions_streaming_event'), (event: { listenerId: any; }) => {
      // @ts-ignore
      this.emitter.emit(
        // @ts-ignore
        this.eventNameForApp(`functions_streaming_event:${event.listenerId}`),
        event,
      );
    });
  }

  httpsCallable(name: string, options: HttpsCallableOptions = {}) {
    if (options.timeout) {
      if (isNumber(options.timeout)) {
        options.timeout = options.timeout / 1000;
      } else {
        throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
      }
    }

    const callableFunction: any = (data?: any) => {
      const nativePromise = this.native.httpsCallable(
        this._useFunctionsEmulatorHost,
        this._useFunctionsEmulatorPort,
        name,
        {
          data,
        },
        options,
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
    };

    // Add a streaming helper (callback-based)
    // Usage: const stop = functions().httpsCallable('fn').stream(data, (evt) => {...}, options)
    callableFunction.stream = (data?: any, onEvent?: (event: any) => void, streamOptions: HttpsCallableOptions = {}) => {
      if (streamOptions.timeout) {
        if (isNumber(streamOptions.timeout)) {
          streamOptions.timeout = streamOptions.timeout / 1000;
        } else {
          throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
        }
      }

      const listenerId = this._id_functions_streaming_event++;
      // @ts-ignore
      const eventName = this.eventNameForApp(`functions_streaming_event:${listenerId}`);

      // @ts-ignore
      const subscription = this.emitter.addListener(eventName, (event: any) => {
        const body = event.body;
        if (onEvent) {
          onEvent(body);
        }
        if (body && (body.done || body.error)) {
          subscription.remove();
          if (this.native.removeFunctionsStreaming) {
            this.native.removeFunctionsStreaming(listenerId);
          }
        }
      });

      // Start native streaming on both platforms.
      // Note: appName and customUrlOrRegion are automatically prepended by the native module wrapper
      this.native.httpsCallableStream(
        this._useFunctionsEmulatorHost || null,
        this._useFunctionsEmulatorPort || -1,
        name,
        { data },
        streamOptions,
        listenerId,
      );

      return () => {
        subscription.remove();
        if (this.native.removeFunctionsStreaming) {
          this.native.removeFunctionsStreaming(listenerId);
        }
      };
    };

    return callableFunction;
  }

  httpsCallableFromUrl(url: string, options: HttpsCallableOptions = {}) {
    if (options.timeout) {
      if (isNumber(options.timeout)) {
        options.timeout = options.timeout / 1000;
      } else {
        throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
      }
    }

    const callableFunction: any = (data?: any) => {
      const nativePromise = this.native.httpsCallableFromUrl(
        this._useFunctionsEmulatorHost,
        this._useFunctionsEmulatorPort,
        url,
        {
          data,
        },
        options,
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
    };

    callableFunction.stream = (data?: any, onEvent?: (event: any) => void, streamOptions: HttpsCallableOptions = {}) => {
      if (streamOptions.timeout) {
        if (isNumber(streamOptions.timeout)) {
          streamOptions.timeout = streamOptions.timeout / 1000;
        } else {
          throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
        }
      }

      const listenerId = this._id_functions_streaming_event++;
      // @ts-ignore
      const eventName = this.eventNameForApp(`functions_streaming_event:${listenerId}`);

      // @ts-ignore
      const subscription = this.emitter.addListener(eventName, (event: any) => {
        const body = event.body;
        if (onEvent) {
          onEvent(body);
        }
        if (body && (body.done || body.error)) {
          subscription.remove();
          if (this.native.removeFunctionsStreaming) {
            this.native.removeFunctionsStreaming(listenerId);
          }
        }
      });

      this.native.httpsCallableStreamFromUrl(
        this._useFunctionsEmulatorHost || null,
        this._useFunctionsEmulatorPort || -1,
        url,
        { data },
        streamOptions,
        listenerId,
      );

      return () => {
        subscription.remove();
        if (this.native.removeFunctionsStreaming) {
          this.native.removeFunctionsStreaming(listenerId);
        }
      };
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

// import { SDK_VERSION } from '@react-native-firebase/functions';
export const SDK_VERSION = version;

// import functions from '@react-native-firebase/functions';
// functions().logEvent(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: ['functions_streaming_event'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseFunctionsModule,
  turboModule: true,
});

// import functions, { firebase } from '@react-native-firebase/functions';
// functions().logEvent(...);
// firebase.functions().logEvent(...);
export const firebase = getFirebaseRoot();

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);
