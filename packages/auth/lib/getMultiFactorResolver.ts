/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { isOther } from '@react-native-firebase/app/dist/module/common';
import MultiFactorResolver from './MultiFactorResolver';
import type { AuthInternal } from './types/internal';
import type {
  MultiFactorError,
  MultiFactorInfo,
  MultiFactorResolver as MultiFactorResolverType,
} from './types/auth';

interface ErrorWithResolver {
  userInfo?: { resolver?: unknown };
}

/**
 * Create a new resolver based on an auth instance and error
 * object.
 *
 * Returns null if no resolver object can be found on the error.
 */
export function getMultiFactorResolver(
  auth: AuthInternal,
  error: MultiFactorError | ErrorWithResolver,
): MultiFactorResolverType | null {
  if (isOther && auth.native.getMultiFactorResolver) {
    return auth.native.getMultiFactorResolver(error) as MultiFactorResolverType | null;
  }
  const err = error as ErrorWithResolver;
  if (
    Object.prototype.hasOwnProperty.call(err, 'userInfo') &&
    err.userInfo &&
    Object.prototype.hasOwnProperty.call(err.userInfo, 'resolver') &&
    err.userInfo.resolver
  ) {
    return new MultiFactorResolver(
      auth,
      err.userInfo.resolver as { hints: MultiFactorInfo[]; session: string },
    ) as MultiFactorResolverType;
  }

  return null;
}
