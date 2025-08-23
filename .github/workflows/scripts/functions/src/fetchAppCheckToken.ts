/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import { getAppCheck } from 'firebase-admin/app-check';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { getAdminApp } from '.';

// Note: this will only work in a live environment, not locally via the Firebase emulator.
export const fetchAppCheckTokenV2 = onCall(async (req: CallableRequest<{ appId: string }>) => {
  const { appId } = req.data;
  const expireTimeMillis = Math.floor(Date.now() / 1000) + 60 * 60;
  getAdminApp();
  const result = await getAppCheck().createToken(appId);
  return { ...result, expireTimeMillis };
});
