import { FilePaths, PlayServicesConnectionStatus, PlayServicesAvailability } from './types';

const _stubPlayServiceStatus: PlayServicesAvailability = {
  isAvailable: true,
  status: PlayServicesConnectionStatus.SUCCESS,
};

export const isRunningInTestLab = false;
export const playServicesAvailability = _stubPlayServiceStatus;
export const FilePath: FilePaths = {};
export async function getPlayServicesStatus(): Promise<PlayServicesAvailability> {
  return _stubPlayServiceStatus;
}
export async function promptForPlayServices(): Promise<void> {}
export async function makePlayServicesAvailable(): Promise<void> {}
export async function resolutionForPlayServices(): Promise<void> {}
