/**
 * @flow
 * IOSNotification representation wrapper
 */
import type Notification from './Notification';
import type Notifications from './';
import { type BackgroundFetchResultValue } from './IOSNotifications';
import type {
  IOSAttachment,
  IOSAttachmentOptions,
  NativeIOSNotification,
} from './types';

import { isIOS } from '../../utils';
import { getLogger } from '../../utils/log';
import { getNativeModule } from '../../utils/native';

type CompletionHandler = BackgroundFetchResultValue => void;

export default class IOSNotification {
  _alertAction: string | void;

  _attachments: IOSAttachment[];

  _badge: number | void;

  _category: string | void;

  _hasAction: boolean | void;

  _launchImage: string | void;

  _notification: Notification;

  _threadIdentifier: string | void;

  _complete: CompletionHandler;

  constructor(
    notification: Notification,
    notifications?: Notifications,
    data?: NativeIOSNotification
  ) {
    this._notification = notification;

    if (data) {
      this._alertAction = data.alertAction;
      this._attachments = data.attachments || [];
      this._badge = data.badge;
      this._category = data.category;
      this._hasAction = data.hasAction;
      this._launchImage = data.launchImage;
      this._threadIdentifier = data.threadIdentifier;
    } else {
      this._attachments = [];
    }

    if (!isIOS || !notifications || !notifications.ios) {
      return this;
    }

    // IOS + Native Notification Only
    const complete = (fetchResult: BackgroundFetchResultValue) => {
      const { notificationId } = notification;
      // && notifications check for Flow
      if (notificationId && notifications) {
        getLogger(notifications).debug(
          `Completion handler called for notificationId=${notificationId}`
        );
        getNativeModule(notifications).complete(notificationId, fetchResult);
      }
    };

    if (notifications.ios.shouldAutoComplete) {
      complete(notifications.ios.backgroundFetchResult.noData);
    } else {
      this._complete = complete;
    }
  }

  get alertAction(): ?string {
    return this._alertAction;
  }

  get attachments(): IOSAttachment[] {
    return this._attachments;
  }

  get badge(): ?number {
    return this._badge;
  }

  get category(): ?string {
    return this._category;
  }

  get hasAction(): ?boolean {
    return this._hasAction;
  }

  get launchImage(): ?string {
    return this._launchImage;
  }

  get threadIdentifier(): ?string {
    return this._threadIdentifier;
  }

  get complete(): CompletionHandler {
    return this._complete;
  }

  /**
   *
   * @param identifier
   * @param url
   * @param options
   * @returns {Notification}
   */
  addAttachment(
    identifier: string,
    url: string,
    options?: IOSAttachmentOptions
  ): Notification {
    this._attachments.push({
      identifier,
      options,
      url,
    });
    return this._notification;
  }

  /**
   *
   * @param alertAction
   * @returns {Notification}
   */
  setAlertAction(alertAction: string): Notification {
    this._alertAction = alertAction;
    return this._notification;
  }

  /**
   *
   * @param badge
   * @returns {Notification}
   */
  setBadge(badge: number): Notification {
    this._badge = badge;
    return this._notification;
  }

  /**
   *
   * @param category
   * @returns {Notification}
   */
  setCategory(category: string): Notification {
    this._category = category;
    return this._notification;
  }

  /**
   *
   * @param hasAction
   * @returns {Notification}
   */
  setHasAction(hasAction: boolean): Notification {
    this._hasAction = hasAction;
    return this._notification;
  }

  /**
   *
   * @param launchImage
   * @returns {Notification}
   */
  setLaunchImage(launchImage: string): Notification {
    this._launchImage = launchImage;
    return this._notification;
  }

  /**
   *
   * @param threadIdentifier
   * @returns {Notification}
   */
  setThreadIdentifier(threadIdentifier: string): Notification {
    this._threadIdentifier = threadIdentifier;
    return this._notification;
  }

  build(): NativeIOSNotification {
    // TODO: Validation of required fields

    return {
      alertAction: this._alertAction,
      attachments: this._attachments,
      badge: this._badge,
      category: this._category,
      hasAction: this._hasAction,
      launchImage: this._launchImage,
      threadIdentifier: this._threadIdentifier,
    };
  }
}
