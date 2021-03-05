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

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Cloud Functions package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `functions` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/functions';
 *
 * // firebase.functions().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `functions` package:
 *
 * ```js
 * import functions from '@react-native-firebase/functions';
 *
 * // functions().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/functions';
 *
 * // firebase.functions().X
 * ```
 *
 * @firebase functions
 */
export namespace FirebaseFunctionsTypes {
  /**
   * The set of Firebase Functions status codes.
   *
   * The codes are the same at the ones exposed by [gRPC](https://github.com/grpc/grpc/blob/master/doc/statuscodes.md).
   *
   * Possible values:
   * - `cancelled`: The operation was cancelled (typically by the caller).
   * - `unknown`: Unknown error or an error from a different error domain.
   * - `invalid-argument`: Client specified an invalid argument. Note that this
   *   differs from `failed-precondition`. `invalid-argument` indicates
   *   arguments that are problematic regardless of the state of the system
   *   (e.g. an invalid field name).
   * - `deadline-exceeded`: Deadline expired before operation could complete.
   *   For operations that change the state of the system, this error may be
   *   returned even if the operation has completed successfully. For example,
   *   a successful response from a server could have been delayed long enough
   *   for the deadline to expire.
   * - `not-found`: Some requested document was not found.
   * - `already-exists`: Some document that we attempted to create already
   *   exists.
   * - `permission-denied`: The caller does not have permission to execute the
   *   specified operation.
   * - `resource-exhausted`: Some resource has been exhausted, perhaps a
   *   per-user quota, or perhaps the entire file system is out of space.
   * - `failed-precondition`: Operation was rejected because the system is not
   *   in a state required for the operation's execution.
   * - `aborted`: The operation was aborted, typically due to a concurrency
   *   issue like transaction aborts, etc.
   * - `out-of-range`: Operation was attempted past the valid range.
   * - `unimplemented`: Operation is not implemented or not supported/enabled.
   * - `internal`: Internal errors. Means some invariants expected by
   *   underlying system has been broken. If you see one of these errors,
   *   something is very broken.
   * - `unavailable`: The service is currently unavailable. This is most likely
   *   a transient condition and may be corrected by retrying with a backoff.
   * - `data-loss`: Unrecoverable data loss or corruption.
   * - `unauthenticated`: The request does not have valid authentication
   *   credentials for the operation.
   */
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

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

  /**
   * An HttpsCallableResult wraps a single result from a function call.
   */
  export interface HttpsCallableResult {
    readonly data: any;
  }

  /**
   * An HttpsCallable is a reference to a "callable" http trigger in
   * Google Cloud Functions.
   *
   * #### Example
   *
   * ```js
   * // Create a HttpsCallable instance
   * const instance = firebase.functions().httpsCallable('order');
   *
   * try {
   *  const response = await instance({
   *    id: '12345',
   *  });
   * } catch (e) {
   *  console.error(e);
   * }
   * ```
   */
  export interface HttpsCallable {
    (data?: any): Promise<HttpsCallableResult>;
  }

  /**
   * An HttpsCallableOptions object that can be passed as the second argument to `firebase.functions().httpsCallable(name, HttpsCallableOptions)`.
   **/
  export interface HttpsCallableOptions {
    /**
     * The timeout property allows you to control how long the application will wait for the cloud function to respond in milliseconds.
     *
     * #### Example
     *
     *```js
     * // The below will wait 7 seconds for a response from the cloud function before an error is thrown
     * try {
     *  const instance = firebase.functions().httpsCallable('order', { timeout: 7000 });
     *  const response = await instance({
     *    id: '12345',
     *  });
     * } catch (e) {
     *  console.log(e);
     * }
     * ```
     */
    timeout?: number;
  }

  /**
   * An HttpsError wraps a single error from a function call.
   *
   * #### Example
   *
   * ```js
   * try {
   *  await firebase.functions().httpsCallable('order')();
   * } catch (httpsError) {
   *   console.log('Message', httpsError.message);
   *
   *   // Check code
   *   if (httpsError.code === firebase.functions.HttpsErrorCode.NOT_FOUND) {
   *     console.error('Functions endpoint "order" not found');
   *   }
   * }
   * ```
   */
  export interface HttpsError extends Error {
    /**
     * A standard error code that will be returned to the client. This also
     * determines the HTTP status code of the response, as defined in code.proto.
     *
     * #### Example
     *
     * ```js
     * try {
     *  await firebase.functions().httpsCallable('order')();
     * } catch (httpsError) {
     *   console.error(httpsError.code);
     * }
     * ```
     */
    readonly code: FunctionsErrorCode;
    /**
     * Extra data to be converted to JSON and included in the error response.
     *
     * ```js
     * try {
     *  await firebase.functions().httpsCallable('order')();
     * } catch (httpsError) {
     *   if (httpsError.details) {
     *     console.error(httpsError.details);
     *   }
     * }
     * ```
     */
    readonly details?: any;
  }

  /**
   * The HttpsErrorCode interface provides access to all FunctionsErrorCode
   * type aliases.
   *
   * #### Example
   *
   * ```js
   * try {
   *  await firebase.functions().httpsCallable('order')();
   * } catch (httpsError) {
   *  switch(httpsError.code) {
   *    case firebase.functions.HttpsErrorCode.NOT_FOUND:
   *      console.error('Functions endpoint not found');
   *      break;
   *    case firebase.functions.HttpsErrorCode.CANCELLED:
   *      console.error('The operation was cancelled');
   *      break;
   *    default:
   *      console.error('An error occurred');
   *      break;
   *  }
   * }
   * ```
   */
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

  /**
   * firebase.functions.X
   */
  export interface Statics {
    /**
     * Uppercase + underscored variables of {@link functions.FunctionsErrorCode}
     *
     * #### Example
     *
     * ```js
     * firebase.functions.HttpsErrorCode.OK;
     * firebase.functions.HttpsErrorCode.NOT_FOUND;
     * ```
     */
    HttpsErrorCode: HttpsErrorCode;
  }

  /**
   * The Firebase Cloud Functions service is available for the default app, a given app or a specified region.
   *
   * > The default functions region for all apps is `us-central1`.
   *
   * #### Example 1
   *
   * Get the functions instance for the **default app**:
   *
   * ```js
   * const functionsForDefaultApp = firebase.functions();
   * ```
   *
   * #### Example 2
   *
   * Get the functions instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const functionsForOtherApp = firebase.functions(otherApp);
   * ```
   *
   * #### Example 3
   *
   * Get the functions instance for a **specific functions region**:
   *
   * ```js
   * const defaultApp = firebase.app();
   * const functionsForRegion = defaultApp.functions('europe-west1');
   *
   * const otherApp = firebase.app('otherApp');
   * const functionsForOtherAppRegion = otherApp.functions('europe-west1');
   * ```
   *
   */
  export class Module extends FirebaseModule {
    /**
     * Gets an `HttpsCallable` instance that refers to the function with the given
     * name.
     *
     * #### Example
     *
     * ```js
     * const instance = firebase.functions().httpsCallable('order');
     *
     * try {
     *  const response = await instance({
     *    id: '12345',
     *  });
     * } catch (e) {
     *  console.error(e);
     * }
     * ```
     *
     * @param name The name of the https callable function.
     * @return The `HttpsCallable` instance.
     */
    httpsCallable(name: string, options?: HttpsCallableOptions): HttpsCallable;

    /**
     * Changes this instance to point to a Cloud Functions emulator running locally.
     *
     * See https://firebase.google.com/docs/functions/local-emulator
     *
     * #### Example
     *
     * ```js
     * if (__DEV__) {
     *   firebase.functions().useFunctionsEmulator('http://localhost:5001');
     * }
     * ```
     *
     * Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
     * "host" computer IP address for android emulators) to make the standard development experience easy.
     * If you want to use the emulator on a real android device, you will need to specify the actual host
     * computer IP address.
     *
     * @param origin url of the local emulator started via firebase tools "http://localhost:5001"
     */
    useFunctionsEmulator(origin: string): void;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseFunctionsTypes.Module,
  FirebaseFunctionsTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  functions: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { functions(): FirebaseFunctionsTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      functions: FirebaseModuleWithStaticsAndApp<
        FirebaseFunctionsTypes.Module,
        FirebaseFunctionsTypes.Statics
      >;
    }
    interface FirebaseApp {
      functions(customUrlOrRegion?: string): FirebaseFunctionsTypes.Module;
    }
  }
}
