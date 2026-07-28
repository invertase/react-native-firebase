/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import { onCall } from 'firebase-functions/v2/https';
import { E2E_TEST_FUNCTION_TIMEOUT_SECONDS } from './e2eCallOptions';

export const testFunctionCustomRegion = onCall(
  {
    region: 'europe-west1',
    timeoutSeconds: E2E_TEST_FUNCTION_TIMEOUT_SECONDS,
  },
  () => 'europe-west1',
);
