/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import * as functions from 'firebase-functions/v1';

// stay v1 here - v2 functions don't support custom regions well,
// they require httpsCallableFromUrl which is tested separately
export const testFunctionCustomRegion = functions
  .region('europe-west1')
  .https.onCall(() => 'europe-west1');
