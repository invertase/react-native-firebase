/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { CallableRequest } from 'firebase-functions/v2/https';

// Note: this will only work in a live environment, not locally via the Firebase emulator.
export const fetchAppCheckTokenV2 = functions.https.onCall(
  async (req: CallableRequest<{ appId: string }>) => {
    const { appId } = req.data;
    const expireTimeMillis = Math.floor(Date.now() / 1000) + 60 * 60;
    const result = await admin.appCheck().createToken(appId);
    return { ...result, expireTimeMillis };
  },
);
