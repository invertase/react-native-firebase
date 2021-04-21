import * as impl from './impl';
import { PlayServicesStatus } from './types';

export const isRunningInTestLab = impl.isRunningInTestLab;
export const playServicesAvailability = impl.playServicesAvailability;
export const FilePath = impl.FilePath;

export async function getPlayServicesStatus(): Promise<PlayServicesStatus> {
  return impl.getPlayServicesStatus();
}

export async function promptForPlayServices(): Promise<void> {
  return impl.promptForPlayServices();
}

export async function makePlayServicesAvailable(): Promise<void> {
  return impl.makePlayServicesAvailable();
}

export async function resolutionForPlayServices(): Promise<void> {
  return impl.resolutionForPlayServices();
}
