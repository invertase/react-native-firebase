import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseFunctionsTypes } from '..';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import Functions = FirebaseFunctionsTypes.Module;
import HttpsCallable = FirebaseFunctionsTypes.HttpsCallable;
import HttpsCallableOptions = FirebaseFunctionsTypes.HttpsCallableOptions;
import HttpsCallableStreamEvent = FirebaseFunctionsTypes.HttpsCallableStreamEvent;
import HttpsErrorCodeType = FirebaseFunctionsTypes.HttpsErrorCode;

export const HttpsErrorCode: HttpsErrorCodeType;

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

/**
 * Convenience helper to start a streaming callable by name from modular API.
 * Returns a function that when called with data and an event callback, starts the stream and returns an unsubscribe function.
 * 
 * #### Example
 * 
 * ```js
 * import { getFunctions, httpsCallableStream } from '@react-native-firebase/functions/lib/modular';
 * 
 * const functions = getFunctions();
 * const startStream = httpsCallableStream(functions, 'myStreamingFunction');
 * 
 * const unsubscribe = startStream({ input: 'data' }, (event) => {
 *   if (event.error) {
 *     console.error('Error:', event.error);
 *   } else if (event.done) {
 *     console.log('Stream complete');
 *   } else if (event.text) {
 *     console.log('Received:', event.text);
 *   }
 * });
 * 
 * // Stop the stream
 * unsubscribe();
 * ```
 * 
 * @param {Functions} functionsInstance A functions instance.
 * @param {string} name The name of the trigger.
 * @param {HttpsCallableOptions | undefined} options Options for execution.
 * @returns A function that starts the stream and returns an unsubscribe function
 */
export declare function httpsCallableStream<RequestData = unknown>(
  functionsInstance: Functions,
  name: string,
  options?: HttpsCallableOptions,
): (
  data?: RequestData | null,
  onEvent?: (event: HttpsCallableStreamEvent) => void,
  streamOptions?: HttpsCallableOptions,
) => () => void;

/**
 * Convenience helper to start a streaming callable by URL from modular API.
 * Returns a function that when called with data and an event callback, starts the stream and returns an unsubscribe function.
 * 
 * #### Example
 * 
 * ```js
 * import { getFunctions, httpsCallableFromUrlStream } from '@react-native-firebase/functions/lib/modular';
 * 
 * const functions = getFunctions();
 * const startStream = httpsCallableFromUrlStream(functions, 'https://mydomain.com/myFunction');
 * 
 * const unsubscribe = startStream({ input: 'data' }, (event) => {
 *   if (event.error) {
 *     console.error('Error:', event.error);
 *   } else if (event.done) {
 *     console.log('Stream complete');
 *   } else if (event.text) {
 *     console.log('Received:', event.text);
 *   }
 * });
 * 
 * // Stop the stream
 * unsubscribe();
 * ```
 * 
 * @param {Functions} functionsInstance A functions instance.
 * @param {string} url The URL of the trigger.
 * @param {HttpsCallableOptions | undefined} options Options for execution.
 * @returns A function that starts the stream and returns an unsubscribe function
 */
export declare function httpsCallableFromUrlStream<RequestData = unknown>(
  functionsInstance: Functions,
  url: string,
  options?: HttpsCallableOptions,
): (
  data?: RequestData | null,
  onEvent?: (event: HttpsCallableStreamEvent) => void,
  streamOptions?: HttpsCallableOptions,
) => () => void;
