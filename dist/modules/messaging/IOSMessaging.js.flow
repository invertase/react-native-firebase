import { getNativeModule } from '../../utils/native';

import { isIOS } from '../../utils';

import type Messaging from './';

export default class IOSMessaging {
  constructor(messaging: Messaging) {
    this._messaging = messaging;
  }

  getAPNSToken(): Promise<string | null> {
    if (!isIOS) {
      return null;
    }
    return getNativeModule(this._messaging).getAPNSToken();
  }

  registerForRemoteNotifications(): Promise<void> {
    if (!isIOS) {
      return undefined;
    }
    return getNativeModule(this._messaging).registerForRemoteNotifications();
  }
}
