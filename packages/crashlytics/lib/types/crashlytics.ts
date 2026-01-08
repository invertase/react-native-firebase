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

// ============ Module Interface ============

/**
 * Crashlytics module instance - returned from firebase.crashlytics() or firebase.app().crashlytics()
 */
export interface Crashlytics extends ReactNativeFirebase.FirebaseModule {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;

  /**
   * Whether Crashlytics reporting is enabled.
   */
  readonly isCrashlyticsCollectionEnabled: boolean;

  /**
   * Determines whether there are any unsent crash reports cached on the device.
   * The callback only executes if automatic data collection is disabled.
   *
   * @throws Error if Crashlytics collection is enabled (reports are automatically sent)
   */
  checkForUnsentReports(): Promise<boolean>;

  /**
   * Cause your app to crash for testing purposes. This is a native crash and will not contain a javascript stack trace.
   * Note that crashes are intercepted by debuggers on iOS so no report will be seen under those conditions.
   */
  crash(): void;

  /**
   * Deletes any unsent reports on the device. This method only applies if automatic data collection is disabled.
   */
  deleteUnsentReports(): Promise<void>;

  /**
   * Returns a boolean value indicating whether the app crashed during the previous execution.
   */
  didCrashOnPreviousExecution(): Promise<boolean>;

  /**
   * Log a message that will appear in any subsequent Crash or Non-fatal error reports.
   *
   * @param message The message to log.
   */
  log(message: string): void;

  /**
   * Record a JavaScript Error.
   *
   * The JavaScript stack trace is converted into a mock native iOS or Android exception before submission.
   *
   * @param error Expects an instance of Error; e.g. classes that extend Error will also be supported.
   * @param jsErrorName Optional string containing Javascript error name
   */
  recordError(error: Error, jsErrorName?: string): void;

  /**
   * Enqueues any unsent reports on the device to upload to Crashlytics. This method only applies if
   * automatic data collection is disabled.
   */
  sendUnsentReports(): void;

  /**
   * Sets a string value to be associated with the given attribute name which will be visible in the Firebase Crashlytics console.
   *
   * @param name The name of the attribute to set.
   * @param value A string value for the given attribute.
   */
  setAttribute(name: string, value: string): Promise<null>;

  /**
   * Like `setAttribute` but for multiple attributes.
   *
   * @param attributes An object of key/value attribute name and values.
   */
  setAttributes(attributes: { [key: string]: string }): Promise<null>;

  /**
   * Specify a user identifier which will be visible in the Firebase Crashlytics console.
   *
   * It is recommended for privacy purposes that this value be a value that's meaningless to a third-party
   * observer; such as an arbitrary string that ties an end-user to a record in your system e.g. a database record id.
   *
   * @param userId An arbitrary string that ties an end-user to a record in your system e.g. a database record id.
   */
  setUserId(userId: string): Promise<null>;

  /**
   * Enable/disable Crashlytics reporting.
   *
   * Use this for opt-in first user data collection flows combined with `firebase.json` settings to disable auto collection.
   *
   * @param enabled A boolean value representing whether to enable Crashlytics error collection.
   */
  setCrashlyticsCollectionEnabled(enabled: boolean): Promise<null>;
}

// ============ Statics Interface ============

/**
 * Static properties available on firebase.crashlytics
 */
export interface Statics {
  SDK_VERSION: string;
}

/**
 * FirebaseApp type with crashlytics() method.
 * @deprecated Import FirebaseApp from '@react-native-firebase/app' instead.
 * The crashlytics() method is added via module augmentation.
 */
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;

// ============ Module Augmentation ============

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      crashlytics: FirebaseModuleWithStaticsAndApp<Crashlytics, Statics>;
    }
    interface FirebaseApp {
      crashlytics(): Crashlytics;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
// ============ Backwards Compatibility Namespace - to be removed with namespaced exports ============
type _Statics = Statics;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseCrashlyticsTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseCrashlyticsTypes {
  // Short name aliases referencing top-level types
  export type Module = Crashlytics;
  export type Statics = _Statics;
}
/* eslint-enable @typescript-eslint/no-namespace */
