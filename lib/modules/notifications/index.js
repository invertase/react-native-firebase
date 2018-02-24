/**
 * @flow
 * Messaging (FCM) representation wrapper
 */
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
import { isFunction, isObject } from '../../utils';
import Notification from './Notification';
import {
  BadgeIconType,
  Category,
  Defaults,
  GroupAlert,
  Priority,
  Visibility,
} from './types';

import type App from '../core/app';
import type { NotificationOpened } from './Notification';
import type {
  NativeNotification,
  NativeNotificationOpened,
  Schedule,
} from './types';

type OnNotification = Notification => any;

type OnNotificationObserver = {
  next: OnNotification,
};

type OnNotificationOpened = NotificationOpened => any;

type OnNotificationOpenedObserver = {
  next: OnNotificationOpened,
};

const NATIVE_EVENTS = [
  'notifications_notification_displayed',
  'notifications_notification_opened',
  'notifications_notification_received',
];

export const MODULE_NAME = 'RNFirebaseNotifications';
export const NAMESPACE = 'notifications';

// iOS 8/9 scheduling
// fireDate: Date;
// timeZone: TimeZone;
// repeatInterval: NSCalendar.Unit;
// repeatCalendar: Calendar;
// region: CLRegion;
// regionTriggersOnce: boolean;

// iOS 10 scheduling
// TODO

// Android scheduling
// TODO

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
      // public event name: onNotificationDisplayed
      'notifications_notification_displayed',
      (notification: NativeNotification) => {
        SharedEventEmitter.emit(
          'onNotificationDisplayed',
          new Notification(notification)
        );
      }
    );

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onNotificationOpened
      'notifications_notification_opened',
      (notificationOpened: NativeNotificationOpened) => {
        SharedEventEmitter.emit('OnNotificationOpened', {
          action: notificationOpened.action,
          notification: new Notification(notificationOpened.notification),
        });
      }
    );

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onNotification
      'notifications_notification_received',
      (notification: NativeNotification) => {
        SharedEventEmitter.emit(
          'onNotification',
          new Notification(notification)
        );
      }
    );
  }

  /**
   * Cancel all notifications
   */
  cancelAllNotifications(): void {
    getNativeModule(this).cancelAllNotifications();
  }

  /**
   * Cancel a notification by id.
   * @param notificationId
   */
  cancelNotification(notificationId: string): void {
    if (!notificationId) {
      throw new Error(
        'Notifications: cancelNotification expects a `notificationId`'
      );
    }
    getNativeModule(this).cancelNotification(notificationId);
  }

  /**
   * Display a notification
   * @param notification
   * @returns {*}
   */
  displayNotification(notification: Notification): Promise<void> {
    if (!(notification instanceof Notification)) {
      throw new Error(
        `Notifications:displayNotification expects a 'Notification' but got type ${typeof notification}`
      );
    }
    return getNativeModule(this).displayNotification(notification.build());
  }

  getBadge(): Promise<number> {
    return getNativeModule(this).getBadge();
  }

  getInitialNotification(): Promise<Object> {
    return getNativeModule(this).getInitialNotification();
    // TODO
    // .then(notification => (notification ? new Notification(this, notification) : null));
  }

  /**
   * Returns an array of all scheduled notifications
   * @returns {Promise.<Array>}
   */
  getScheduledNotifications(): Promise<Object[]> {
    return getNativeModule(this).getScheduledNotifications();
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

    getLogger(this).info('Creating onNotification listener');
    SharedEventEmitter.addListener('onNotification', listener);

    return () => {
      getLogger(this).info('Removing onNotification listener');
      SharedEventEmitter.removeListener('onNotification', listener);
    };
  }

  onNotificationDisplayed(
    nextOrObserver: OnNotification | OnNotificationObserver
  ): () => any {
    let listener;
    if (isFunction(nextOrObserver)) {
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Notifications.onNotificationDisplayed failed: First argument must be a function or observer object with a `next` function.'
      );
    }

    getLogger(this).info('Creating onNotificationDisplayed listener');
    SharedEventEmitter.addListener('onNotificationDisplayed', listener);

    return () => {
      getLogger(this).info('Removing onNotificationDisplayed listener');
      SharedEventEmitter.removeListener('onNotificationDisplayed', listener);
    };
  }

  onNotificationOpened(
    nextOrObserver: OnNotificationOpened | OnNotificationOpenedObserver
  ): () => any {
    let listener;
    if (isFunction(nextOrObserver)) {
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Notifications.onNotificationOpened failed: First argument must be a function or observer object with a `next` function.'
      );
    }

    getLogger(this).info('Creating onNotificationOpened listener');
    SharedEventEmitter.addListener('onNotificationOpened', listener);

    return () => {
      getLogger(this).info('Removing onNotificationOpened listener');
      SharedEventEmitter.removeListener('onNotificationOpened', listener);
    };
  }

  /**
   * Remove all delivered notifications.
   */
  removeAllDeliveredNotifications(): void {
    getNativeModule(this).removeAllDeliveredNotifications();
  }

  /**
   * Remove a delivered notification.
   * @param notificationId
   */
  removeDeliveredNotification(notificationId: string): void {
    if (!notificationId) {
      throw new Error(
        'Notifications: removeDeliveredNotification expects a `notificationId`'
      );
    }
    getNativeModule(this).removeDeliveredNotification(notificationId);
  }

  /**
   * Schedule a notification
   * @param notification
   * @returns {*}
   */
  scheduleNotification(
    notification: Notification,
    schedule: Schedule
  ): Promise<void> {
    if (!(notification instanceof Notification)) {
      throw new Error(
        `Notifications:scheduleNotification expects a 'Notification' but got type ${typeof notification}`
      );
    }
    const nativeNotification = notification.build();
    nativeNotification.schedule = schedule;
    return getNativeModule(this).scheduleNotification(nativeNotification);
  }

  setBadge(badge: number): void {
    getNativeModule(this).setBadge(badge);
  }
}

export const statics = {
  Android: {
    BadgeIconType,
    Category,
    Defaults,
    GroupAlert,
    Priority,
    Visibility,
  },
  Notification,
};
