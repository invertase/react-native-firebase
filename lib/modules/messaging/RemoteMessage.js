/**
 * @flow
 * RemoteMessage representation wrapper
 */
import { isObject, generatePushID } from './../../utils';

type NativeRemoteMessage = {
  collapseKey?: string,
  data: { [string]: string },
  messageId: string,
  messageType?: string,
  to: string,
  ttl: number,
};

export default class RemoteMessage {
  collapseKey: string | void;
  data: { [string]: string };
  messageId: string;
  messageType: string | void;
  to: string;
  ttl: number;

  constructor() {
    this.data = {};
    this.messageId = generatePushID();
    this.ttl = 3600;
  }

  /**
   *
   * @param collapseKey
   * @returns {RemoteMessage}
   */
  withCollapseKey(collapseKey: string): RemoteMessage {
    this.collapseKey = collapseKey;
    return this;
  }

  /**
   *
   * @param data
   * @returns {RemoteMessage}
   */
  withData(data: Object = {}) {
    if (!isObject(data)) {
      throw new Error(
        `RemoteMessage:withData expects an object but got type '${typeof data}'.`
      );
    }
    this.data = data;
    return this;
  }

  /**
   *
   * @param messageId
   * @returns {RemoteMessage}
   */
  withMessageId(messageId: string): RemoteMessage {
    this.messageId = messageId;
    return this;
  }

  /**
   *
   * @param messageType
   * @returns {RemoteMessage}
   */
  withMessageType(messageType: string): RemoteMessage {
    this.messageType = messageType;
    return this;
  }

  /**
   *
   * @param ttl
   * @returns {RemoteMessage}
   */
  withTtl(ttl: number): RemoteMessage {
    this.ttl = ttl;
    return this;
  }

  build(): NativeRemoteMessage {
    if (!this.data) {
      throw new Error('RemoteMessage: Missing required `data` property');
    } else if (!this.messageId) {
      throw new Error('RemoteMessage: Missing required `messageId` property');
    } else if (!this.to) {
      throw new Error('RemoteMessage: Missing required `to` property');
    } else if (!this.ttl) {
      throw new Error('RemoteMessage: Missing required `ttl` property');
    }

    return {
      collapseKey: this.collapseKey,
      data: this.data,
      messageId: this.messageId,
      messageType: this.messageType,
      to: this.to,
      ttl: this.ttl,
    };
  }
}
