import { FirebaseApp } from '../internal';

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param app - FirebaseApp - The app to delete.
 * @returns Promise<void>
 */
export function deleteApp(app: FirebaseApp): Promise<void>;

/**
 * Registers a library's name and version for platform logging purposes.
 * @returns Promise<void>
 */
export function registerVersion(
  libraryKeyOrName: string,
  version: string,
  variant: string | null,
): Promise<void>;

/**
 * Sets log handler for all Firebase SDKs.
 * @throws Error - onLog is only supported on Web
 */
export function onLog(logCallback: (logData: any) => void, options?: any): void;

export { getApps, initializeApp, getApp, setLogLevel } from '../internal';
