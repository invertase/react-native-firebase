import { Platform } from 'react-native';
import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';

/** Same host mapping as `packages/app/e2e/helpers.js` `getE2eEmulatorHost`. */
export function getAuthEmulatorHost(): string {
  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
}

/** Default auth port from `.github/workflows/scripts/firebase.emulator.template.json`. */
export const AUTH_EMULATOR_PORT = 9099;

let emulatorConnected = false;

/** Connect once per JS runtime to the Local Emulator Suite auth emulator. */
export function ensureAuthEmulator(): void {
  if (emulatorConnected) {
    return;
  }
  connectAuthEmulator(getAuth(), `http://${getAuthEmulatorHost()}:${AUTH_EMULATOR_PORT}`);
  emulatorConnected = true;
}
