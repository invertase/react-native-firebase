import { FirebaseApp } from '@firebase/app';
import { FirebaseFunctionsTypes } from '..';

import Functions = FirebaseFunctionsTypes.Module;
import HttpsCallable = FirebaseFunctionsTypes.HttpsCallable;
import HttpsCallableOptions = FirebaseFunctionsTypes.HttpsCallableOptions;
/**
 * Get a {@link Functions} instance for the given app.
 * @param {FirebaseApp | undefined} app - The FirebaseApp to use. Optional.
 * @param {string | undefined} regionOrCustomDomain - One of: a) The region the callable functions are located in (ex: us-central1) b) A custom domain hosting the callable functions (ex: https://mydomain.com). optional
 * @returns {Functions} Returns a {@link Functions} instance for the given app.
 */
export declare function getFunctions(app?: FirebaseApp, regionOrCustomDomain?: string): Functions;

/**
 * Modify this instance to communicate with the Cloud Functions emulator.
 * Note: this must be called before this instance has been used to do any operations.
 * @param {Functions} functionsInstance
 * @param {string} host The emulator host. (ex: localhost)
 * @param {number} port The emulator port. (ex: 5001)
 */
export declare function connectFunctionsEmulator(
  functionsInstance: Functions,
  host: string,
  port: number,
): void;

/**
 * Returns a reference to the {@link HttpsCallable} trigger with the given name.
 * @param {Functions} functionsInstance A functions instance.
 * @param {string} name The name of the trigger.
 * @param {HttpsCallableOptions | undefined} options An instance of {@link HttpsCallableOptions} containing metadata about how calls should be executed.
 * @returns {HttpsCallable}
 */
export declare function httpsCallable<RequestData = unknown, ResponseData = unknown>(
  functionsInstance: Functions,
  name: string,
  options?: HttpsCallableOptions,
): HttpsCallable<RequestData, ResponseData>;

/**
 * Returns a reference to the {@link HttpsCallable} trigger with the specified url.
 * @param {Functions} functionsInstance A functions instance.
 * @param {string} url The url of the trigger.
 * @param {HttpsCallableOptions | undefined} options An instance of {@link HttpsCallableOptions} containing metadata about how calls should be executed.
 * @returns {HttpsCallable}
 */
export declare function httpsCallableFromUrl<RequestData = unknown, ResponseData = unknown>(
  functionsInstance: Functions,
  url: string,
  options?: HttpsCallableOptions,
): HttpsCallable<RequestData, ResponseData>;
