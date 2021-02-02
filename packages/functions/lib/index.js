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

const namespace = 'functions';
const nativeModuleName = 'RNFBFunctionsModule';

// import { HttpsErrorCode } from '@react-native-firebase/functions';
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
};

const statics = {
  HttpsErrorCode,
};

class FirebaseFunctionsModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._customUrlOrRegion = this._customUrlOrRegion || 'us-central1';
    this._useFunctionsEmulatorOrigin = null;
  }

  httpsCallable(name, options = {}) {
    if (options.timeout) {
      if (isNumber(options.timeout)) {
        options.timeout = options.timeout / 1000;
      } else {
        throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
      }
    }

    return data => {
      const nativePromise = this.native.httpsCallable(
        this._useFunctionsEmulatorOrigin,
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
  }

  useFunctionsEmulator(origin) {
    let _origin = origin;
    if (isAndroid && _origin) {
      if (_origin.startsWith('http://localhost')) {
        _origin = _origin.replace('http://localhost', 'http://10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping functions host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices.',
        );
      }
      if (_origin.startsWith('http://127.0.0.1')) {
        _origin = _origin.replace('http://127.0.0.1', 'http://10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping functions host "127.0.0.1" to "10.0.2.2" for android emulators. Use real IP on real devices.',
        );
      }
    }
    this._useFunctionsEmulatorOrigin = _origin || null;
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
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseFunctionsModule,
});

// import functions, { firebase } from '@react-native-firebase/functions';
// functions().logEvent(...);
// firebase.functions().logEvent(...);
export const firebase = getFirebaseRoot();
