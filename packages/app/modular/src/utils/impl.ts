import { FilePaths, PlayServicesConnectionStatus, PlayServicesStatus } from './types';

export const isRunningInTestLab = false;
export const playServicesAvailability = false;
export const FilePath: FilePaths = {};
export async function getPlayServicesStatus(): Promise<PlayServicesStatus> {
  return { isAvailable: true, status: PlayServicesConnectionStatus.SUCCESS };
}
export async function promptForPlayServices(): Promise<void> {}
export async function makePlayServicesAvailable(): Promise<void> {}
export async function resolutionForPlayServices(): Promise<void> {}
