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
import { Platform } from 'react-native';
import HttpMetric from './HttpMetric';
import Trace from './Trace';
import ScreenTrace from './ScreenTrace';
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
    this._instrumentationEnabled = this.native.isInstrumentationEnabled;
  }

  get isPerformanceCollectionEnabled() {
    return this._isPerformanceCollectionEnabled;
  }

  get instrumentationEnabled() {
    return this._instrumentationEnabled;
  }

  set instrumentationEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error("firebase.perf().instrumentationEnabled = 'enabled' must be a boolean.");
    }
    if (Platform.OS == 'ios') {
      // We don't change for android as it cannot be set from code, it is set at gradle build time.
      this._instrumentationEnabled = enabled;
      // No need to await, as it only takes effect on the next app run.
      this.native.instrumentationEnabled(enabled);
    }
  }

  get dataCollectionEnabled() {
    return this._isPerformanceCollectionEnabled;
  }

  set dataCollectionEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error("firebase.perf().dataCollectionEnabled = 'enabled' must be a boolean.");
    }
    this._isPerformanceCollectionEnabled = enabled;
    this.native.setPerformanceCollectionEnabled(enabled);
  }

  async setPerformanceCollectionEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.perf().setPerformanceCollectionEnabled(*) 'enabled' must be a boolean.",
      );
    }

    if (Platform.OS == 'ios') {
      // '_instrumentationEnabled' is updated here as well to maintain backward compatibility. See:
      // https://github.com/invertase/react-native-firebase/commit/b705622e64d6ebf4ee026d50841e2404cf692f85
      this._instrumentationEnabled = enabled;
      await this.native.instrumentationEnabled(enabled);
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

  newScreenTrace(identifier) {
    if (!isString(identifier) || identifier.length > 100) {
      throw new Error(
        "firebase.perf().newScreenTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
      );
    }

    return new ScreenTrace(this.native, identifier);
  }

  startScreenTrace(identifier) {
    const screenTrace = this.newScreenTrace(identifier);
    return screenTrace.start().then(() => screenTrace);
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

export * from './modular';

// import perf, { firebase } from '@react-native-firebase/perf';
// perf().X(...);
// firebase.perf().X(...);
export const firebase = getFirebaseRoot();
