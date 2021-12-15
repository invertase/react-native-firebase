/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import * as functions from 'firebase-functions';

export const testFunctionCustomRegion = functions
  .region('europe-west1')
  .https.onCall(() => 'europe-west1');
