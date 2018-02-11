/**
 * @flow
 * Messaging representation wrapper
 */
import { Platform, NativeModules } from 'react-native';
import { SharedEventEmitter } from '../../utils/events';
import ModuleBase from '../../utils/ModuleBase';
import RemoteMessage from './RemoteMessage';
import { getNativeModule } from '../../utils/native';

import type App from '../core/firebase-app';

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

const NATIVE_EVENTS = [EVENT_TYPE.RefreshToken, EVENT_TYPE.Notification];

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
          throw new Error(
            'Invalid REMOTE_NOTIFICATION_RESULT value, use messaging().REMOTE_NOTIFICATION_RESULT'
          );
        }

        FirebaseMessaging.finishRemoteNotification(
          this._completionHandlerId,
          result
        );
        return;
      case NOTIFICATION_TYPE.NotificationResponse:
        FirebaseMessaging.finishNotificationResponse(this._completionHandlerId);
        return;
      case NOTIFICATION_TYPE.WillPresent:
        result =
          result ||
          (this.show_in_foreground
            ? WILL_PRESENT_RESULT.All
            : WILL_PRESENT_RESULT.None);
        if (!Object.values(WILL_PRESENT_RESULT).includes(result)) {
          throw new Error(
            'Invalid WILL_PRESENT_RESULT value, use messaging().WILL_PRESENT_RESULT'
          );
        }

        FirebaseMessaging.finishWillPresentNotification(
          this._completionHandlerId,
          result
        );
        break;
      default:
    }
  }
}

export const MODULE_NAME = 'RNFirebaseMessaging';
export const NAMESPACE = 'messaging';

/**
 * @class Messaging
 */
export default class Messaging extends ModuleBase {
  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      multiApp: false,
      namespace: NAMESPACE,
    });
  }

  get EVENT_TYPE(): Object {
    return EVENT_TYPE;
  }

  get NOTIFICATION_TYPE(): Object {
    return NOTIFICATION_TYPE;
  }

  get REMOTE_NOTIFICATION_RESULT(): Object {
    return REMOTE_NOTIFICATION_RESULT;
  }

  get WILL_PRESENT_RESULT(): Object {
    return WILL_PRESENT_RESULT;
  }

  /**
   * Returns the notification that triggered application open
   * @returns {*}
   */
  getInitialNotification(): Promise<Object> {
    return getNativeModule(this).getInitialNotification();
  }

  /**
   * Returns the fcm token for the current device
   * @returns {*|Promise.<String>}
   */
  getToken(): Promise<string> {
    return getNativeModule(this).getToken();
  }

  /**
   * Reset Instance ID and revokes all tokens.
   * @returns {*|Promise.<*>}
   */
  deleteInstanceId(): Promise<void> {
    return getNativeModule(this).deleteInstanceId();
  }

  /**
   * Create and display a local notification
   * @param notification
   * @returns {*}
   */
  createLocalNotification(notification: Object): Promise<void> {
    const _notification = Object.assign({}, notification);
    _notification.id = _notification.id || new Date().getTime().toString();
    _notification.local_notification = true;
    return getNativeModule(this).createLocalNotification(_notification);
  }

  /**
   *
   * @param notification
   * @returns {*}
   */
  scheduleLocalNotification(notification: Object): Promise<void> {
    const _notification = Object.assign({}, notification);
    if (!notification.id)
      return Promise.reject(
        new Error('An id is required to schedule a local notification.')
      );
    _notification.local_notification = true;
    return getNativeModule(this).scheduleLocalNotification(_notification);
  }

  /**
   * Returns an array of all scheduled notifications
   * @returns {Promise.<Array>}
   */
  getScheduledLocalNotifications(): Promise<Object[]> {
    return getNativeModule(this).getScheduledLocalNotifications();
  }

  /**
   * Cancel a local notification by id - using '*' will cancel
   * all local notifications.
   * @param id
   * @returns {*}
   */
  cancelLocalNotification(id: string): Promise<void> {
    if (!id) return Promise.reject(new Error('Missing notification id'));
    if (id === '*') return getNativeModule(this).cancelAllLocalNotifications();
    return getNativeModule(this).cancelLocalNotification(id);
  }

  /**
   * Remove a delivered notification - using '*' will remove
   * all delivered notifications.
   * @param id
   * @returns {*}
   */
  removeDeliveredNotification(id: string): Promise<void> {
    if (!id) return Promise.reject(new Error('Missing notification id'));
    if (id === '*')
      return getNativeModule(this).removeAllDeliveredNotifications();
    return getNativeModule(this).removeDeliveredNotification(id);
  }

  /**
   * Request notification permission
   * @platforms ios
   * @returns {*|Promise.<*>}
   */
  requestPermissions(): Promise<void> {
    return getNativeModule(this).requestPermissions();
  }

  /**
   * Set notification count badge number
   * @param n
   */
  setBadgeNumber(n: number): void {
    getNativeModule(this).setBadgeNumber(n);
  }

  /**
   * set notification count badge number
   * @returns {Promise.<Number>}
   */
  getBadgeNumber(): Promise<number> {
    return getNativeModule(this).getBadgeNumber();
  }

  /**
   * Subscribe to messages / notifications
   * @param listener
   * @returns {*}
   */
  onMessage(listener: Object => any): () => any {
    const rnListener = SharedEventEmitter.addListener(
      EVENT_TYPE.Notification,
      async event => {
        const data = {
          ...event,
          finish,
        };
        await listener(data);

        if (!data._finishCalled) {
          data.finish();
        }
      }
    );
    return () => rnListener.remove();
  }

  /**
   * Subscribe to token refresh events
   * @param listener
   * @returns {*}
   */
  onTokenRefresh(listener: string => any): () => any {
    const rnListener = SharedEventEmitter.addListener(
      EVENT_TYPE.RefreshToken,
      listener
    );
    return () => rnListener.remove();
  }

  /**
   * Subscribe to a topic
   * @param topic
   */
  subscribeToTopic(topic: string): void {
    getNativeModule(this).subscribeToTopic(topic);
  }

  /**
   * Unsubscribe from a topic
   * @param topic
   */
  unsubscribeFromTopic(topic: string): void {
    getNativeModule(this).unsubscribeFromTopic(topic);
  }

  /**
   * Send an upstream message
   * @param remoteMessage
   */
  send(remoteMessage: RemoteMessage): Promise<void> {
    if (!(remoteMessage instanceof RemoteMessage)) {
      throw new Error(
        'messaging().send requires an instance of RemoteMessage as the first argument.'
      );
    }

    return getNativeModule(this).send(remoteMessage.toJSON());
  }
}

export const statics = {
  EVENT_TYPE,
  NOTIFICATION_TYPE,
  REMOTE_NOTIFICATION_RESULT,
  WILL_PRESENT_RESULT,
  RemoteMessage,
};
