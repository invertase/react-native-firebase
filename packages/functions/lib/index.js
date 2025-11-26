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
import HttpsError from './HttpsError';
import version from './version';
import { setReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';
import fallBackModule from './web/RNFBFunctionsModule';

const namespace = 'functions';
const nativeModuleName = 'RNFBFunctionsModule';

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
};

const statics = {
  HttpsErrorCode,
};

const nativeEvents = ['functions_streaming_event'];

class FirebaseFunctionsModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._customUrlOrRegion = this._customUrlOrRegion || 'us-central1';
    this._useFunctionsEmulatorHost = null;
    this._useFunctionsEmulatorPort = -1;
    this._id_functions_streaming_event = 0;

    this.emitter.addListener(this.eventNameForApp('functions_streaming_event'), event => {
      this.emitter.emit(
        this.eventNameForApp(`functions_streaming_event:${event.listenerId}`),
        event,
      );
    });
  }

  httpsCallable(name, options = {}, _deprecationArg) {
    if (options.timeout) {
      if (isNumber(options.timeout)) {
        options.timeout = options.timeout / 1000;
      } else {
        throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
      }
    }
  
    // Create the main callable function
    const callableFunction = data => {
      const nativePromise = this.native.httpsCallable(
        this._useFunctionsEmulatorHost,
        this._useFunctionsEmulatorPort,
        name,
        {
          data,
        },
        options,
      );
      return nativePromise.catch(nativeError => {
        const { code, message, details } = nativeError.userInfo || {};
        return Promise.reject(
          new HttpsError(
            HttpsErrorCode[code] || HttpsErrorCode.UNKNOWN,
            message || nativeError.message,
            details || null,
            nativeError,
          ),
        );
      });
    };
  
    // Add a streaming helper (callback-based)
    // Usage: const stop = functions().httpsCallable('fn').stream(data, (evt) => {...}, options)
    callableFunction.stream = (data, onEvent, options = {}) => {
      if (options.timeout) {
        if (isNumber(options.timeout)) {
          options.timeout = options.timeout / 1000;
        } else {
          throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
        }
      }
      const listenerId = this._id_functions_streaming_event++;
      const eventName = this.eventNameForApp(`functions_streaming_event:${listenerId}`);
      const subscription = this.emitter.addListener(eventName, event => {
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
        options,
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

  httpsCallableFromUrl(url, options = {}, _deprecationArg) {
    if (options.timeout) {
      if (isNumber(options.timeout)) {
        options.timeout = options.timeout / 1000;
      } else {
        throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
      }
    }

    const callableFunction = data => {
      // Note: appName and customUrlOrRegion are automatically prepended by the native module wrapper
      const nativePromise = this.native.httpsCallableFromUrl(
        this._useFunctionsEmulatorHost,
        this._useFunctionsEmulatorPort,
        url,
        {
          data,
        },
        options,
      );
      return nativePromise.catch(nativeError => {
        const { code, message, details } = nativeError.userInfo || {};
        return Promise.reject(
          new HttpsError(
            HttpsErrorCode[code] || HttpsErrorCode.UNKNOWN,
            message || nativeError.message,
            details || null,
            nativeError,
          ),
        );
      });
    };

    // Add streaming support for URL-based callable
    callableFunction.stream = (data, onEvent, streamOptions = {}) => {
      if (streamOptions.timeout) {
        if (isNumber(streamOptions.timeout)) {
          streamOptions.timeout = streamOptions.timeout / 1000;
        } else {
          throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
        }
      }
      const listenerId = this._id_functions_streaming_event++;
      const eventName = this.eventNameForApp(`functions_streaming_event:${listenerId}`);
      const subscription = this.emitter.addListener(eventName, event => {
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
      // Note: appName and customUrlOrRegion are automatically prepended by the native module wrapper
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

  useFunctionsEmulator(origin) {
    [_, host, port] = /https?\:.*\/\/([^:]+):?(\d+)?/.exec(origin);
    if (!port) {
      port = 5001;
    }
    this.useEmulator(host, parseInt(port));
  }

  useEmulator(host, port) {
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
  nativeEvents,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseFunctionsModule,
});

export * from './modular';

// import functions, { firebase } from '@react-native-firebase/functions';
// functions().logEvent(...);
// firebase.functions().logEvent(...);
export const firebase = getFirebaseRoot();

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule);
