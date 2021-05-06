import { FirebaseError } from '../internal';
import * as impl from './impl';
import { PlayServicesAvailability } from './types';

/**
 * Exported guard to quickly check whether a provided JavaScript value
 * is a FirebaseError.
 *
 * @param e
 * @returns
 */
export function isFirebaseError(e: any): e is FirebaseError {
  return e?.constructor?.name === 'Error' && e?.code !== undefined && e?.message?.includes(e?.code);
}

/**
 * Returns true if this app is running inside a Firebase Test Lab environment.
 */
export const isRunningInTestLab = impl.isRunningInTestLab;

/**
 * Returns PlayServicesAvailability.
 */
export const playServicesAvailability = impl.playServicesAvailability;

/**
 * A collection of native device file paths to aid in the usage of file path based methods.
 *
 * Concatenate a file path with your target file name when using with Storage `putFile` or `writeToFile`.
 *
 * On Web, an empty object is returned.
 */
export const FilePath = impl.FilePath;

/**
 * Resolves information regarding the availability of Google Play Services.
 *
 * On iOS and Web, the availability is marked as "available".
 * @returns A Promise containing the PlayServicesStatus object.
 */
export async function getPlayServicesStatus(): Promise<PlayServicesAvailability> {
  return impl.getPlayServicesStatus();
}

/**
 * Prompts the device to ask the user to update play services.
 *
 * This only has an effect on Android devices, on iOS and Web the promise instantly
 * resolves.
 */
export async function promptForPlayServices(): Promise<void> {
  return impl.promptForPlayServices();
}

/**
 * Attempts to make Google Play services available on this device.
 *
 * This only has an effect on Android devices, on iOS and Web the promise instantly
 * resolves.
 */
export async function makePlayServicesAvailable(): Promise<void> {
  return impl.makePlayServicesAvailable();
}

/**
 * Resolves an error by starting any intents requiring user interaction.
 *
 * This only has an effect on Android devices, on iOS and Web the promise instantly
 * resolves.
 * @returns
 */
export async function resolutionForPlayServices(): Promise<void> {
  return impl.resolutionForPlayServices();
}
