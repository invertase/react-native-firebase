import { Platform, NativeModules } from 'react-native';
import ModuleBase from './../../utils/ModuleBase';
import RemoteMessage from './RemoteMessage';

const EVENT_TYPE = {
  RefreshToken: 'messaging_token_refreshed',
  Notification: 'messaging_notification_received',
};

const NOTIFICATION_TYPE = {
  Remote: 'remote_notification',
  NotificationResponse: 'notification_response',
  WillPresent: 'will_present_notification',
  Local: 'local_notification',
};

const REMOTE_NOTIFICATION_RESULT = {
  NewData: 'UIBackgroundFetchResultNewData',
  NoData: 'UIBackgroundFetchResultNoData',
  ResultFailed: 'UIBackgroundFetchResultFailed',
};

const WILL_PRESENT_RESULT = {
  All: 'UNNotificationPresentationOptionAll',
  None: 'UNNotificationPresentationOptionNone',
};

const FirebaseMessaging = NativeModules.RNFirebaseMessaging;

/**
 * IOS only finish function
 * @param data
 */
function finish(data) {
  if (Platform.OS !== 'ios') {
    return;
  }


  if (!this._finishCalled && this._completionHandlerId) {
    let result = data;

    this._finishCalled = true;

    switch (this._notificationType) {
      case NOTIFICATION_TYPE.Remote:
        result = result || REMOTE_NOTIFICATION_RESULT.NoData;
        if (!Object.values(REMOTE_NOTIFICATION_RESULT).includes(result)) {
          throw new Error('Invalid REMOTE_NOTIFICATION_RESULT value, use messaging().REMOTE_NOTIFICATION_RESULT');
        }

        FirebaseMessaging.finishRemoteNotification(this._completionHandlerId, result);
        return;
      case NOTIFICATION_TYPE.NotificationResponse:
        FirebaseMessaging.finishNotificationResponse(this._completionHandlerId);
        return;
      case NOTIFICATION_TYPE.WillPresent:
        result = result || (this.show_in_foreground ? WILL_PRESENT_RESULT.All : WILL_PRESENT_RESULT.None);
        if (!Object.values(WILL_PRESENT_RESULT).includes(result)) {
          throw new Error('Invalid WILL_PRESENT_RESULT value, use messaging().WILL_PRESENT_RESULT');
        }

        FirebaseMessaging.finishWillPresentNotification(this._completionHandlerId, result);
        break;
      default:
    }
  }
}


/**
 * @class Messaging
 */
export default class Messaging extends ModuleBase {
  static _NAMESPACE = 'messaging';
  static _NATIVE_MODULE = 'RNFirebaseMessaging';

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, true);
  }

  get EVENT_TYPE() {
    return EVENT_TYPE;
  }

  get NOTIFICATION_TYPE() {
    return NOTIFICATION_TYPE;
  }

  get REMOTE_NOTIFICATION_RESULT() {
    return REMOTE_NOTIFICATION_RESULT;
  }

  get WILL_PRESENT_RESULT() {
    return WILL_PRESENT_RESULT;
  }

  /**
   * Returns the notification that triggered application open
   * @returns {*}
   */
  getInitialNotification() {
    return this._native.getInitialNotification();
  }

  /**
   * Returns the fcm token for the current device
   * @returns {*|Promise.<String>}
   */
  getToken() {
    return this._native.getToken();
  }

  /**
   * Reset Instance ID and revokes all tokens.
   * @returns {*|Promise.<*>}
   */
  deleteInstanceId() {
    return this._native.deleteInstanceId();
  }

  /**
   * Create and display a local notification
   * @param notification
   * @returns {*}
   */
  createLocalNotification(notification: Object) {
    const _notification = Object.assign({}, notification);
    _notification.id = _notification.id || new Date().getTime().toString();
    _notification.local_notification = true;
    return this._native.createLocalNotification(_notification);
  }

  /**
   *
   * @param notification
   * @returns {*}
   */
  scheduleLocalNotification(notification: Object) {
    const _notification = Object.assign({}, notification);
    if (!notification.id) return Promise.reject(new Error('An id is required to schedule a local notification.'));
    _notification.local_notification = true;
    return this._native.scheduleLocalNotification(_notification);
  }

  /**
   * Returns an array of all scheduled notifications
   * @returns {Promise.<Array>}
   */
  getScheduledLocalNotifications() {
    return this._native.getScheduledLocalNotifications();
  }

  /**
   * Cancel a local notification by id - using '*' will cancel
   * all local notifications.
   * @param id
   * @returns {*}
   */
  cancelLocalNotification(id: string) {
    if (!id) return null;
    if (id === '*') return this._native.cancelAllLocalNotifications();
    return this._native.cancelLocalNotification(id);
  }

  /**
   * Remove a delivered notification - using '*' will remove
   * all delivered notifications.
   * @param id
   * @returns {*}
   */
  removeDeliveredNotification(id: string) {
    if (!id) return null;
    if (id === '*') return this._native.removeAllDeliveredNotifications();
    return this._native.removeDeliveredNotification(id);
  }

  /**
   * Request notification permission
   * @platforms ios
   * @returns {*|Promise.<*>}
   */
  requestPermissions() {
    return this._native.requestPermissions();
  }


  /**
   * Set notification count badge number
   * @param n
   */
  setBadgeNumber(n: number) {
    this._native.setBadgeNumber(n);
  }

  /**
   * set notification count badge number
   * @returns {Promise.<Number>}
   */
  getBadgeNumber() {
    return this._native.getBadgeNumber();
  }

  /**
   * Subscribe to messages / notifications
   * @param listener
   * @returns {*}
   */
  onMessage(listener: Function): () => any {
    const rnListener = this._eventEmitter.addListener(
      EVENT_TYPE.Notification,
      async (event) => {
        const data = {
          ...event,
          finish,
        };
        await listener(data);

        if (!data._finishCalled) {
          data.finish();
        }
      },
    );
    return () => rnListener.remove();
  }

  /**
   * Subscribe to token refresh events
   * @param listener
   * @returns {*}
   */
  onTokenRefresh(listener: Function): () => any {
    const rnListener = this._eventEmitter.addListener(EVENT_TYPE.RefreshToken, listener);
    return () => rnListener.remove();
  }

  /**
   * Subscribe to a topic
   * @param topic
   */
  subscribeToTopic(topic: String) {
    this._native.subscribeToTopic(topic);
  }

  /**
   * Unsubscribe from a topic
   * @param topic
   */
  unsubscribeFromTopic(topic: String) {
    this._native.unsubscribeFromTopic(topic);
  }

  /**
   * Send an upstream message
   * @param remoteMessage
   */
  send(remoteMessage: RemoteMessage) {
    if (!(remoteMessage instanceof RemoteMessage)) {
      throw new Error('messaging().send requires an instance of RemoteMessage as the first argument.');
    }

    return this._native.send(remoteMessage.toJSON());
  }
}

export const statics = {
  EVENT_TYPE,
  NOTIFICATION_TYPE,
  REMOTE_NOTIFICATION_RESULT,
  WILL_PRESENT_RESULT,
  RemoteMessage,
};
