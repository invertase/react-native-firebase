import { ReactNativeFirebase } from '..';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import FirebaseAppOptions = ReactNativeFirebase.FirebaseAppOptions;
import LogLevelString = ReactNativeFirebase.LogLevelString;

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param app - FirebaseApp - The app to delete.
 * @returns Promise<void>
 */
export function deleteApp(app: FirebaseApp): Promise<void>;

/**
 * Registers a library's name and version for platform logging purposes.
 * @param libraryKeyOrName - Library name or key.
 * @param version - Library version.
 * @param variant - Library variant. Optional.
 * @returns Promise<void>
 */
export function registerVersion(
  libraryKeyOrName: string,
  version: string,
  variant?: string,
): Promise<void>;

/**
 * Sets log handler for all Firebase SDKs. Currently only supported on VertexAI.
 * @param logCallback - The callback function to handle logs.
 * @param options - Optional settings for log handling.
 * @returns <void>
 */

interface LogCallbackParams {
  level: LogLevelString;
  message: string;
  args: unknown[];
  type: string;
}

export function onLog(
  logCallback: (callbackParams: LogCallbackParams) => void,
  options?: any,
): void;

/**
 * Gets the list of all initialized apps.
 * @returns FirebaseApp[] - An array of all initialized Firebase apps.
 */
export function getApps(): FirebaseApp[];

/**
 * Initializes a Firebase app with the provided options and name.
 * @param options - Options to configure the services used in the app.
 * @param name - The optional name of the app to initialize ('[DEFAULT]' if omitted).
 * @returns FirebaseApp - The initialized Firebase app.
 */
export function initializeApp(options: FirebaseAppOptions, name?: string): FirebaseApp;

/**
 * Retrieves an instance of a Firebase app.
 * @param name - The optional name of the app to return ('[DEFAULT]' if omitted).
 * @returns FirebaseApp - The requested Firebase app instance.
 */
export function getApp(name?: string): FirebaseApp;

/**
 * Sets the log level across all Firebase SDKs.
 * @param logLevel - The log level to set ('debug', 'verbose', 'info', 'warn', 'error', 'silent').
 * @returns void
 */
export function setLogLevel(logLevel: LogLevelString): void;
