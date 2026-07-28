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

import type { FirebaseApp } from '@react-native-firebase/app';
import {
  isBoolean,
  isError,
  isObject,
  isString,
} from '@react-native-firebase/app/dist/module/common';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import './types/internal';
import StackTrace from 'stacktrace-js';
import {
  createNativeErrorObj,
  setGlobalErrorHandler,
  setOnUnhandledPromiseRejectionHandler,
} from './handlers';
import { version } from './version';
import type { Crashlytics } from './types/crashlytics';
import type { CrashlyticsInternal } from './types/internal';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

const nativeModuleName = 'NativeRNFBTurboCrashlytics';

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
      StackTrace.fromError(error, { offline: true })
        .then(stackFrames =>
          this.native.recordErrorPromise(
            createNativeErrorObj(error, stackFrames, false, jsErrorName),
          ),
        )
        .catch(() => {});
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

const config: ModuleConfig = {
  namespace: 'crashlytics',
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

export const SDK_VERSION = version;

export function getCrashlytics(app?: FirebaseApp): Crashlytics {
  return getOrCreateModularInstance(
    FirebaseCrashlyticsModule,
    config,
    app,
  ) as unknown as Crashlytics;
}

export function checkForUnsentReports(crashlytics: Crashlytics): Promise<boolean> {
  return (crashlytics as CrashlyticsInternal).checkForUnsentReports();
}

export function deleteUnsentReports(crashlytics: Crashlytics): Promise<void> {
  return (crashlytics as CrashlyticsInternal).deleteUnsentReports();
}

export function didCrashOnPreviousExecution(crashlytics: Crashlytics): Promise<boolean> {
  return (crashlytics as CrashlyticsInternal).didCrashOnPreviousExecution();
}

export function crash(crashlytics: Crashlytics): void {
  return (crashlytics as CrashlyticsInternal).crash();
}

export function log(crashlytics: Crashlytics, message: string): void {
  return (crashlytics as CrashlyticsInternal).log(message);
}

export function recordError(crashlytics: Crashlytics, error: Error, jsErrorName?: string): void {
  return (crashlytics as CrashlyticsInternal).recordError(error, jsErrorName);
}

export function sendUnsentReports(crashlytics: Crashlytics): void {
  return (crashlytics as CrashlyticsInternal).sendUnsentReports();
}

export function setUserId(crashlytics: Crashlytics, userId: string): Promise<null> {
  return (crashlytics as CrashlyticsInternal).setUserId(userId);
}

export function setAttribute(crashlytics: Crashlytics, name: string, value: string): Promise<null> {
  return (crashlytics as CrashlyticsInternal).setAttribute(name, value);
}

export function setAttributes(
  crashlytics: Crashlytics,
  attributes: { [key: string]: string },
): Promise<null> {
  return (crashlytics as CrashlyticsInternal).setAttributes(attributes);
}

export function setCrashlyticsCollectionEnabled(
  crashlytics: Crashlytics,
  enabled: boolean,
): Promise<null> {
  return (crashlytics as CrashlyticsInternal).setCrashlyticsCollectionEnabled(enabled);
}

export type { Crashlytics } from './types/crashlytics';
