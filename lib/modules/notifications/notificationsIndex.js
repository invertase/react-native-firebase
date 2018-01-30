/**
 * @flow
 * Messaging (FCM) representation wrapper
 */
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
import { isFunction, isObject } from '../../utils';

import type App from '../core/firebase-app';

type CreateNotification = {
  // TODO
};

type Notification = {
  // TODO
};

type OnNotification = Notification => any;

type OnNotificationObserver = {
  next: OnNotification,
};

const NATIVE_EVENTS = ['notifications_notification_received'];

export const MODULE_NAME = 'RNFirebaseNotifications';
export const NAMESPACE = 'notifications';

/**
 * @class Notifications
 */
export default class Notifications extends ModuleBase {
  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      multiApp: false,
      namespace: NAMESPACE,
    });

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onMessage
      'notifications_notification_received',
      (notification: Notification) => {
        SharedEventEmitter.emit('onNotification', notification);
      }
    );
  }

  /**
   * Cancel a local notification by id - using '*' will cancel
   * all local notifications.
   * @param id
   * @returns {*}
   */
  cancelNotification(id: string): Promise<void> {
    if (!id) return Promise.reject(new Error('Missing notification id'));
    if (id === '*') return getNativeModule(this).cancelAllLocalNotifications();
    return getNativeModule(this).cancelLocalNotification(id);
  }

  /**
   * Create and display a local notification
   * @param notification
   * @returns {*}
   */
  createNotification(notification: CreateNotification): Promise<void> {
    const _notification = Object.assign({}, notification);
    _notification.id = _notification.id || new Date().getTime().toString();
    _notification.local_notification = true;
    return getNativeModule(this).createLocalNotification(_notification);
  }

  /**
   * Returns an array of all scheduled notifications
   * @returns {Promise.<Array>}
   */
  getScheduledNotifications(): Promise<Object[]> {
    return getNativeModule(this).getScheduledLocalNotifications();
  }

  onNotification(
    nextOrObserver: OnNotification | OnNotificationObserver
  ): () => any {
    let listener;
    if (isFunction(nextOrObserver)) {
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Notifications.onNotification failed: First argument must be a function or observer object with a `next` function.'
      );
    }

    // TODO: iOS finish
    getLogger(this).info('Creating onNotification listener');
    SharedEventEmitter.addListener('onNotification', listener);

    return () => {
      getLogger(this).info('Removing onNotification listener');
      SharedEventEmitter.removeListener('onNotification', listener);
    };
  }

  /**
   * Remove a delivered notification - using '*' will remove
   * all delivered notifications.
   * @param id
   * @returns {*}
   */
  removeDeliveredNotification(id: string): Promise<void> {
    if (!id) return Promise.reject(new Error('Missing notification id'));
    if (id === '*') {
      return getNativeModule(this).removeAllDeliveredNotifications();
    }
    return getNativeModule(this).removeDeliveredNotification(id);
  }

  /**
   *
   * @param notification
   * @returns {*}
   */
  scheduleNotification(notification: CreateNotification): Promise<void> {
    const _notification = Object.assign({}, notification);
    if (!notification.id)
      return Promise.reject(
        new Error('An id is required to schedule a local notification.')
      );
    _notification.local_notification = true;
    return getNativeModule(this).scheduleLocalNotification(_notification);
  }
}
