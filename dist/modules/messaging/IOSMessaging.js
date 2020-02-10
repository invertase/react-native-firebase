import { getNativeModule } from '../../utils/native';
import { isIOS } from '../../utils';
export default class IOSMessaging {
  constructor(messaging) {
    this._messaging = messaging;
  }

  getAPNSToken() {
    if (!isIOS) {
      return null;
    }

    return getNativeModule(this._messaging).getAPNSToken();
  }

  registerForRemoteNotifications() {
    if (!isIOS) {
      return undefined;
    }

    return getNativeModule(this._messaging).registerForRemoteNotifications();
  }

}