import { isOther } from '@react-native-firebase/app/dist/module/common';
import MultiFactorResolverClass from './MultiFactorResolver';
import type { MultiFactorError, MultiFactorResolver } from './types/auth';
import type { AuthInternal } from './types/internal';

type ErrorWithResolver = MultiFactorError & {
  userInfo?: {
    resolver?: {
      hints: MultiFactorResolver['hints'];
      session: MultiFactorResolver['session'];
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
): MultiFactorResolver | null {
  if (isOther) {
    return auth.native.getMultiFactorResolver(error) as MultiFactorResolver | null;
  }
  if (
    error.hasOwnProperty('userInfo') &&
    error.userInfo?.hasOwnProperty('resolver') &&
    error.userInfo.resolver
  ) {
    return new MultiFactorResolverClass(
      auth,
      error.userInfo.resolver,
    ) as unknown as MultiFactorResolver;
  }

  return null;
}
