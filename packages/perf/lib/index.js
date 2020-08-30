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

import { isBoolean, isOneOf, isString } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import HttpMetric from './HttpMetric';
import Trace from './Trace';
import version from './version';

const statics = {};

const namespace = 'perf';

const nativeModuleName = 'RNFBPerfModule';

const VALID_HTTP_METHODS = [
  'CONNECT',
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'TRACE',
];

class FirebasePerfModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._isPerformanceCollectionEnabled = this.native.isPerformanceCollectionEnabled;
  }

  get isPerformanceCollectionEnabled() {
    return this._isPerformanceCollectionEnabled;
  }

  setPerformanceCollectionEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.perf().setPerformanceCollectionEnabled(*) 'enabled' must be a boolean.",
      );
    }

    this._isPerformanceCollectionEnabled = enabled;
    return this.native.setPerformanceCollectionEnabled(enabled);
  }

  newTrace(identifier) {
    // TODO(VALIDATION): identifier: no leading or trailing whitespace, no leading underscore '_'
    if (!isString(identifier) || identifier.length > 100) {
      throw new Error(
        "firebase.perf().newTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
      );
    }

    return new Trace(this.native, identifier);
  }

  startTrace(identifier) {
    const trace = this.newTrace(identifier);
    return trace.start().then(() => trace);
  }

  newHttpMetric(url, httpMethod) {
    if (!isString(url)) {
      throw new Error("firebase.perf().newHttpMetric(*, _) 'url' must be a string.");
    }

    if (!isString(url) || !isOneOf(httpMethod, VALID_HTTP_METHODS)) {
      throw new Error(
        `firebase.perf().newHttpMetric(_, *) 'httpMethod' must be one of ${VALID_HTTP_METHODS.join(
          ', ',
        )}.`,
      );
    }

    return new HttpMetric(this.native, url, httpMethod);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/perf';
export const SDK_VERSION = version;

// import perf from '@react-native-firebase/perf';
// perf().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebasePerfModule,
});

// import perf, { firebase } from '@react-native-firebase/perf';
// perf().X(...);
// firebase.perf().X(...);
export const firebase = getFirebaseRoot();
