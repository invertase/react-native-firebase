import { isOther } from '@react-native-firebase/app/dist/module/common';
import MultiFactorResolver from './MultiFactorResolver';
import type { FirebaseAuthTypes } from './types/namespaced';
import type { AuthInternal } from './types/internal';

type ErrorWithResolver = FirebaseAuthTypes.MultiFactorError & {
  userInfo?: {
    resolver?: {
      hints: FirebaseAuthTypes.MultiFactorResolver['hints'];
      session: FirebaseAuthTypes.MultiFactorResolver['session'];
    };
  };
};

/**
 * Create a new resolver based on an auth instance and error
 * object.
 *
 * Returns null if no resolver object can be found on the error.
 */
export function getMultiFactorResolver(
  auth: AuthInternal,
  error: ErrorWithResolver,
): FirebaseAuthTypes.MultiFactorResolver | null {
  if (isOther) {
    return auth.native.getMultiFactorResolver(error) as FirebaseAuthTypes.MultiFactorResolver | null;
  }
  if (
    error.hasOwnProperty('userInfo') &&
    error.userInfo?.hasOwnProperty('resolver') &&
    error.userInfo.resolver
  ) {
    return new MultiFactorResolver(
      auth,
      error.userInfo.resolver,
    ) as unknown as FirebaseAuthTypes.MultiFactorResolver;
  }

  return null;
}
