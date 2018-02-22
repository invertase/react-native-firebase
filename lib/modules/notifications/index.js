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
import type { NotificationPressed } from './Notification';
import type {
  NativeNotification,
  NativeNotificationPressed,
  Schedule,
} from './types';

type OnNotification = Notification => any;

type OnNotificationObserver = {
  next: OnNotification,
};

type OnNotificationPressed = NotificationPressed => any;

type OnNotificationPressedObserver = {
  next: OnNotificationPressed,
};

const NATIVE_EVENTS = [
  'notifications_notification_displayed',
  'notifications_notification_pressed',
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
      // public event name: onNotificationPressed
      'notifications_notification_pressed',
      (notificationPressed: NativeNotificationPressed) => {
        SharedEventEmitter.emit('onNotificationPressed', {
          action: notificationPressed.action,
          notification: new Notification(notificationPressed.notification),
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
   * @returns {*}
   */
  cancelAllNotifications(): Promise<void> {
    return getNativeModule(this).cancelAllNotifications();
  }

  /**
   * Cancel a notification by id.
   * @param id
   * @returns {*}
   */
  cancelNotification(notificationId: string): Promise<void> {
    if (!notificationId) {
      return Promise.reject(new Error('Missing notificationId'));
    }
    return getNativeModule(this).cancelNotification(notificationId);
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

  onNotificationPressed(
    nextOrObserver: OnNotificationPressed | OnNotificationPressedObserver
  ): () => any {
    let listener;
    if (isFunction(nextOrObserver)) {
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Notifications.onNotificationPressed failed: First argument must be a function or observer object with a `next` function.'
      );
    }

    getLogger(this).info('Creating onNotificationPressed listener');
    SharedEventEmitter.addListener('onNotificationPressed', listener);

    return () => {
      getLogger(this).info('Removing onNotificationPressed listener');
      SharedEventEmitter.removeListener('onNotificationPressed', listener);
    };
  }

  /**
   * Remove all delivered notifications.
   * @returns {*}
   */
  removeAllDeliveredNotifications(): Promise<void> {
    return getNativeModule(this).removeAllDeliveredNotifications();
  }

  /**
   * Remove a delivered notification.
   * @param notificationId
   * @returns {*}
   */
  removeDeliveredNotification(notificationId: string): Promise<void> {
    if (!notificationId) {
      return Promise.reject(new Error('Missing notificationId'));
    }
    return getNativeModule(this).removeDeliveredNotification(notificationId);
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
