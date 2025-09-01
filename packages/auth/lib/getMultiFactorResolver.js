import { isOther } from '@react-native-firebase/app/lib/common';
import MultiFactorResolver from './MultiFactorResolver.js';

/**
 * Create a new resolver based on an auth instance and error
 * object.
 *
 * Returns null if no resolver object can be found on the error.
 */
export function getMultiFactorResolver(auth, error) {
  if (isOther) {
    return auth.native.getMultiFactorResolver(error);
  }
  if (
    error.hasOwnProperty('userInfo') &&
    error.userInfo.hasOwnProperty('resolver') &&
    error.userInfo.resolver
  ) {
    return new MultiFactorResolver(auth, error.userInfo.resolver);
  }

  return null;
}
