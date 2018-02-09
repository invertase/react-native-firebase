/**
 * @flow
 * IOSNotification representation wrapper
 */
import { generatePushID } from '../../utils';
import type Notification from './Notification';

type AttachmentOptions = {|
  TypeHint: string,
  ThumbnailHidden: boolean,
  ThumbnailClippingRect: {
    height: number,
    width: number,
    x: number,
    y: number,
  },
  ThumbnailTime: number,
|};

type Attachment = {|
  identifier: string,
  options?: AttachmentOptions,
  url: string,
|};

export type NativeIOSNotification = {
  alertAction?: string,
  attachments: Attachment[],
  badge?: number,
  category?: string,
  hasAction?: boolean,
  identifier?: string,
  launchImage?: string,
  threadIdentifier?: string,
};

export default class IOSNotification {
  _alertAction: string; // alertAction | N/A
  _attachments: Attachment[]; // N/A | attachments
  _badge: number; // applicationIconBadgeNumber | badge
  _category: string;
  _hasAction: boolean; // hasAction | N/A
  _identifier: string; // N/A | identifier
  _launchImage: string; // alertLaunchImage | launchImageName
  _notification: Notification;
  _threadIdentifier: string; // N/A | threadIdentifier

  constructor(notification: Notification) {
    this._attachments = [];
    // TODO: Is this the best way to generate an ID?
    this._identifier = generatePushID();
    this._notification = notification;
  }

  /**
   *
   * @param identifier
   * @param identifier
   * @param identifier
   * @returns {Notification}
   */
  addAttachment(
    identifier: string,
    url: string,
    options?: AttachmentOptions
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
   * @param identifier
   * @returns {Notification}
   */
  setIdentifier(identifier: string): Notification {
    this._identifier = identifier;
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
    // TODO: Validation

    return {
      alertAction: this._alertAction,
      attachments: this._attachments,
      badge: this._badge,
      category: this._category,
      hasAction: this._hasAction,
      identifier: this._identifier,
      launchImage: this._launchImage,
      threadIdentifier: this._threadIdentifier,
    };
  }
}
