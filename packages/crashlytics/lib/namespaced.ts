/* eslint-disable no-console */
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

import { getApp } from '@react-native-firebase/app';
import {
  isBoolean,
  isError,
  isObject,
  isString,
  isOther,
  MODULAR_DEPRECATION_ARG,
} from '@react-native-firebase/app/lib/common';
import type { ModuleConfig } from '@react-native-firebase/app/lib/internal';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import StackTrace from 'stacktrace-js';
import {
  createNativeErrorObj,
  setGlobalErrorHandler,
  setOnUnhandledPromiseRejectionHandler,
} from './handlers';
import { version } from './version';
import type { Crashlytics, CrashlyticsStatics } from './types/crashlytics';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

const statics: CrashlyticsStatics = {};

const namespace = 'crashlytics';

const nativeModuleName = 'RNFBCrashlyticsModule';

class FirebaseCrashlyticsModule extends FirebaseModule {
  _isCrashlyticsCollectionEnabled: boolean;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    setGlobalErrorHandler(this.native);
    setOnUnhandledPromiseRejectionHandler(this.native);
    this._isCrashlyticsCollectionEnabled = this.native.isCrashlyticsCollectionEnabled;
  }

  get isCrashlyticsCollectionEnabled(): boolean {
    // Purposefully did not deprecate this as I think it should remain a property rather than a method.
    return this._isCrashlyticsCollectionEnabled;
  }

  checkForUnsentReports(): Promise<boolean> {
    if (this.isCrashlyticsCollectionEnabled) {
      throw new Error(
        "firebase.crashlytics().setCrashlyticsCollectionEnabled(*) has been set to 'true', all reports are automatically sent.",
      );
    }
    return this.native.checkForUnsentReports();
  }

  crash(): void {
    this.native.crash();
  }

  async deleteUnsentReports(): Promise<void> {
    await this.native.deleteUnsentReports();
  }

  didCrashOnPreviousExecution(): Promise<boolean> {
    return this.native.didCrashOnPreviousExecution();
  }

  log(message: string): void {
    this.native.log(`${message}`);
  }

  setAttribute(name: string, value: string): Promise<null> {
    if (!isString(name)) {
      throw new Error(
        'firebase.crashlytics().setAttribute(*, _): The supplied property name must be a string.',
      );
    }

    if (!isString(value)) {
      throw new Error(
        'firebase.crashlytics().setAttribute(_, *): The supplied property value must be a string value.',
      );
    }

    return this.native.setAttribute(name, value);
  }

  setAttributes(object: { [key: string]: string }): Promise<null> {
    if (!isObject(object)) {
      throw new Error(
        'firebase.crashlytics().setAttributes(*): The supplied arg must be an object of key value strings.',
      );
    }

    return this.native.setAttributes(object);
  }

  setUserId(userId: string): Promise<null> {
    if (!isString(userId)) {
      throw new Error(
        'firebase.crashlytics().setUserId(*): The supplied userId must be a string value.',
      );
    }

    return this.native.setUserId(userId);
  }

  recordError(error: Error, jsErrorName?: string): void {
    if (isError(error)) {
      StackTrace.fromError(error, { offline: true }).then(stackFrames => {
        this.native.recordError(createNativeErrorObj(error, stackFrames, false, jsErrorName));
      });
    } else {
      console.warn(
        'firebase.crashlytics().recordError(*) expects an instance of Error. Non Errors will be ignored.',
      );
    }
  }

  sendUnsentReports(): void {
    if (this.isCrashlyticsCollectionEnabled) {
      this.native.sendUnsentReports();
    }
  }

  setCrashlyticsCollectionEnabled(enabled: boolean): Promise<null> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.crashlytics().setCrashlyticsCollectionEnabled(*) 'enabled' must be a boolean.",
      );
    }

    this._isCrashlyticsCollectionEnabled = enabled;
    return this.native.setCrashlyticsCollectionEnabled(enabled);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/crashlytics';
export const SDK_VERSION = version;

const crashlyticsNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseCrashlyticsModule,
});

type CrashlyticsNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  Crashlytics,
  CrashlyticsStatics
> & {
  crashlytics: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<Crashlytics, CrashlyticsStatics>;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

// import crashlytics from '@react-native-firebase/crashlytics';
// crashlytics().X(...);
export default crashlyticsNamespace as unknown as CrashlyticsNamespace;

// import crashlytics, { firebase } from '@react-native-firebase/crashlytics';
// crashlytics().X(...);
// firebase.crashlytics().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'crashlytics',
    Crashlytics,
    CrashlyticsStatics,
    false
  >;

// Register the interop module for non-native platforms.
// Note: This package doesn't have a web fallback module like functions does
// setReactNativeModule(nativeModuleName, fallBackModule);

// This will throw with 'Default App Not initialized' if the default app is not configured.
if (!isOther) {
  // @ts-ignore - Extra arg used by deprecation proxy to detect namespaced calls
  firebase.crashlytics.call(null, getApp(), MODULAR_DEPRECATION_ARG);
}
