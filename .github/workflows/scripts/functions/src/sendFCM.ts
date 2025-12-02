/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import { logger } from 'firebase-functions/v2';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { getMessaging, TokenMessage } from 'firebase-admin/messaging';

// Note: this will only work in a live environment, not locally via the Firebase emulator.
export const sendFCM = onCall(
  async (req: CallableRequest<{ message: TokenMessage; delay?: number }>) => {
    const { message, delay } = req.data;
    return await new Promise(() => {
      logger.info('Sleeping this many milliseconds: ' + (delay ?? 0));
      setTimeout(async () => {
        logger.info('done sleeping');
        const result = await getMessaging().send(message);
        return { messageId: result };
      }, delay ?? 0);
    });
  },
);
