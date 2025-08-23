/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import { onCall } from 'firebase-functions/v2/https';

export const testFunctionCustomRegion = onCall(
  {
    region: 'europe-west1',
  },
  () => 'europe-west1',
);
