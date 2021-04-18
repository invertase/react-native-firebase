import { isWeb, isIOS } from '../common';
import { PlayServicesAvailability } from './types';

export function isRunningInTestLab(): boolean {
  if (isWeb || isIOS) {
    return false;
  }

  // TODO native
  return false;
}

export function playServicesAvailability(): PlayServicesAvailability {
  if (isWeb) {
    return {
      isAvailable: false,
      status: 0,
    };
  }

  if (isIOS) {
    return {
      isAvailable: true,
      status: 0,
    };
  }

  // TODO
  return { isAvailable: true, status: 1 };
}


