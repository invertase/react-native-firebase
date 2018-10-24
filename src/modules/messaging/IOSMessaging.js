import { getNativeModule } from '../../utils/native';

import type Messaging from './';

export default class IOSMessaging {
  constructor(messaging: Messaging) {
    const nativeModule = getNativeModule(messaging);
    this._getAPNSToken = nativeModule.getAPNSToken;
  }

  getAPNSToken(): Promise<string> {
    return this._getAPNSToken();
  }
}
