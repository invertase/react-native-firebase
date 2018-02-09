/**
 * @flow
 * Message representation wrapper
 */
import { Platform } from 'react-native';
import { getNativeModule } from '../../utils/native';
import {
  MessageType,
  PresentNotificationResult,
  RemoteNotificationResult,
} from './types';
import type Messaging from './';
import type {
  MessageTypeType,
  NativeMessage,
  Notification,
  PresentNotificationResultType,
  RemoteNotificationResultType,
} from './types';

/**
 * @class Message
 */
export default class Message {
  _completed: boolean;
  _messaging: Messaging;
  _message: NativeMessage;

  constructor(messaging: Messaging, message: NativeMessage) {
    this._messaging = messaging;
    this._message = message;
  }

  get collapseKey(): ?string {
    return this._message.collapseKey;
  }

  get data(): { [string]: string } {
    return this._message.data;
  }

  get from(): ?string {
    return this._message.from;
  }

  get messageId(): ?string {
    return this._message.messageId;
  }

  get messageType(): ?MessageTypeType {
    return this._message.messageType;
  }

  get openedFromTray(): boolean {
    return this._message.openedFromTray;
  }

  get notification(): ?Notification {
    return this._message.notification;
  }

  get sentTime(): ?number {
    return this._message.sentTime;
  }

  get to(): ?string {
    return this._message.to;
  }

  get ttl(): ?number {
    return this._message.ttl;
  }

  complete(
    result?: PresentNotificationResultType | RemoteNotificationResultType
  ): void {
    if (Platform.OS !== 'ios') {
      return;
    }

    if (!this._completed) {
      this._completed = true;

      switch (this.messageType) {
        case MessageType.NotificationResponse:
          getNativeModule(this._messaging).completeNotificationResponse(
            this.messageId
          );
          break;

        case MessageType.PresentNotification:
          if (
            result &&
            !Object.values(PresentNotificationResult).includes(result)
          ) {
            throw new Error(`Invalid PresentNotificationResult: ${result}`);
          }
          getNativeModule(this._messaging).completePresentNotification(
            this.messageId,
            result || PresentNotificationResult.None
          );
          break;

        case MessageType.RemoteNotificationHandler:
          if (
            result &&
            !Object.values(RemoteNotificationResult).includes(result)
          ) {
            throw new Error(`Invalid RemoteNotificationResult: ${result}`);
          }
          getNativeModule(this._messaging).completeRemoteNotification(
            this.messageId,
            result || RemoteNotificationResult.NoData
          );
          break;

        default:
          break;
      }
    }
  }
}
