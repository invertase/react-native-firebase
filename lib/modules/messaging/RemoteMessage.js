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
  _collapseKey: string | void;
  _data: { [string]: string };
  _messageId: string;
  _messageType: string | void;
  _to: string;
  _ttl: number;

  constructor() {
    this._data = {};
    // TODO: Is this the best way to generate an ID?
    this._messageId = generatePushID();
    this._ttl = 3600;
  }

  /**
   *
   * @param collapseKey
   * @returns {RemoteMessage}
   */
  setCollapseKey(collapseKey: string): RemoteMessage {
    this._collapseKey = collapseKey;
    return this;
  }

  /**
   *
   * @param data
   * @returns {RemoteMessage}
   */
  setData(data: { [string]: string } = {}) {
    if (!isObject(data)) {
      throw new Error(
        `RemoteMessage:setData expects an object but got type '${typeof data}'.`
      );
    }
    this._data = data;
    return this;
  }

  /**
   *
   * @param messageId
   * @returns {RemoteMessage}
   */
  setMessageId(messageId: string): RemoteMessage {
    this._messageId = messageId;
    return this;
  }

  /**
   *
   * @param messageType
   * @returns {RemoteMessage}
   */
  setMessageType(messageType: string): RemoteMessage {
    this._messageType = messageType;
    return this;
  }

  /**
   *
   * @param ttl
   * @returns {RemoteMessage}
   */
  setTtl(ttl: number): RemoteMessage {
    this._ttl = ttl;
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
      collapseKey: this._collapseKey,
      data: this._data,
      messageId: this._messageId,
      messageType: this._messageType,
      to: this._to,
      ttl: this._ttl,
    };
  }
}
