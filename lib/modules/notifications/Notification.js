/**
 * @flow
 * Notification representation wrapper
 */
import AndroidNotification from './AndroidNotification';
import IOSNotification from './IOSNotification';
import { generatePushID, isObject } from '../../utils';

import type { NativeAndroidNotification } from './AndroidNotification';
import type { NativeIOSNotification } from './IOSNotification';
import type { Schedule } from './';

type NativeNotification = {|
  android: NativeAndroidNotification,
  body: string,
  data: { [string]: string },
  ios: NativeIOSNotification,
  notificationId: string,
  schedule?: Schedule,
  sound?: string,
  subtitle?: string,
  title: string,
|};

export default class Notification {
  // iOS 8/9 | 10+ | Android
  _android: AndroidNotification;
  _body: string; // alertBody | body | contentText
  _data: { [string]: string }; // userInfo | userInfo | extras
  _ios: IOSNotification;
  _notificationId: string;
  _sound: string | void; // soundName | sound | sound
  _subtitle: string | void; // N/A | subtitle | subText
  _title: string; // alertTitle | title | contentTitle

  constructor() {
    this._android = new AndroidNotification(this);
    this._data = {};
    this._ios = new IOSNotification(this);
    // TODO: Is this the best way to generate an ID?
    this._notificationId = generatePushID();
  }

  get android(): AndroidNotification {
    return this._android;
  }

  get ios(): IOSNotification {
    return this._ios;
  }

  /**
   *
   * @param body
   * @returns {Notification}
   */
  setBody(body: string): Notification {
    this._body = body;
    return this;
  }

  /**
   *
   * @param data
   * @returns {Notification}
   */
  setData(data: Object = {}): Notification {
    if (!isObject(data)) {
      throw new Error(
        `Notification:withData expects an object but got type '${typeof data}'.`
      );
    }
    this._data = data;
    return this;
  }

  /**
   *
   * @param notificationId
   * @returns {Notification}
   */
  setNotificationId(notificationId: string): Notification {
    this._notificationId = notificationId;
    return this;
  }

  /**
   *
   * @param sound
   * @returns {Notification}
   */
  setSound(sound: string): Notification {
    this._sound = sound;
    return this;
  }

  /**
   *
   * @param subtitle
   * @returns {Notification}
   */
  setSubtitle(subtitle: string): Notification {
    this._subtitle = subtitle;
    return this;
  }

  /**
   *
   * @param title
   * @returns {Notification}
   */
  setTitle(title: string): Notification {
    this._title = title;
    return this;
  }

  build(): NativeNotification {
    // Android required fields: body, title, smallicon
    // iOS required fields: TODO
    if (!this._body) {
      throw new Error('Notification: Missing required `body` property');
    } else if (!this._notificationId) {
      throw new Error(
        'Notification: Missing required `notificationId` property'
      );
    } else if (!this._title) {
      throw new Error('Notification: Missing required `title` property');
    }

    return {
      android: this._android.build(),
      body: this._body,
      data: this._data,
      ios: this._ios.build(),
      notificationId: this._notificationId,
      sound: this._sound,
      subtitle: this._subtitle,
      title: this._title,
    };
  }
}
