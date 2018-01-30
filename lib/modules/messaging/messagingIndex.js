/**
 * @flow
 * Messaging (FCM) representation wrapper
 */
import { SharedEventEmitter } from '../../utils/events';
import INTERNALS from '../../utils/internals';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
import { isFunction, isObject } from '../../utils';

import type App from '../core/firebase-app';

type Message = {
  // TODO
};

type OnMessage = Message => any;

type OnMessageObserver = {
  next: OnMessage,
};

type OnTokenRefresh = String => any;

type OnTokenRefreshObserver = {
  next: OnTokenRefresh,
};

type RemoteMessage = {
  // TODO
};

const NATIVE_EVENTS = [
  'messaging_message_received',
  'messaging_token_refreshed',
];

export const MODULE_NAME = 'NewRNFirebaseMessaging';
export const NAMESPACE = 'newmessaging';

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

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onMessage
      'messaging_message_received',
      (message: Message) => {
        SharedEventEmitter.emit('onMessage', message);
      }
    );

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onMessage
      'messaging_token_refreshed',
      (token: string) => {
        SharedEventEmitter.emit('onTokenRefresh', token);
      }
    );
  }

  deleteToken(token: string): Promise<void> {
    return getNativeModule(this).deleteToken(token);
  }

  getToken(): Promise<string> {
    return getNativeModule(this).getToken();
  }

  onMessage(nextOrObserver: OnMessage | OnMessageObserver): () => any {
    let listener;
    if (isFunction(nextOrObserver)) {
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Messaging.onMessage failed: First argument must be a function or observer object with a `next` function.'
      );
    }

    // TODO: iOS finish
    getLogger(this).info('Creating onMessage listener');
    SharedEventEmitter.addListener('onMessage', listener);

    return () => {
      getLogger(this).info('Removing onMessage listener');
      SharedEventEmitter.removeListener('onMessage', listener);
    };
  }

  onTokenRefresh(
    nextOrObserver: OnTokenRefresh | OnTokenRefreshObserver
  ): () => any {
    let listener;
    if (isFunction(nextOrObserver)) {
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Messaging.OnTokenRefresh failed: First argument must be a function or observer object with a `next` function.'
      );
    }

    getLogger(this).info('Creating onTokenRefresh listener');
    SharedEventEmitter.addListener('onTokenRefresh', listener);

    return () => {
      getLogger(this).info('Removing onTokenRefresh listener');
      SharedEventEmitter.removeListener('onTokenRefresh', listener);
    };
  }

  requestPermission(): Promise<void> {
    return getNativeModule(this).requestPermission();
  }

  /**
   * NON WEB-SDK METHODS
   */
  deleteInstanceId(): Promise<void> {
    return getNativeModule(this).deleteInstanceId();
  }

  getBadgeNumber(): Promise<number> {
    return getNativeModule(this).getBadgeNumber();
  }

  getInitialMessage(): Promise<Message> {
    return getNativeModule(this).getInitialMessage();
  }

  sendMessage(remoteMessage: RemoteMessage): Promise<void> {
    return getNativeModule(this).send(remoteMessage);
  }

  setBadgeNumber(badge: number): void {
    getNativeModule(this).setBadgeNumber(badge);
  }

  subscribeToTopic(topic: string): void {
    getNativeModule(this).subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic: string): void {
    getNativeModule(this).unsubscribeFromTopic(topic);
  }

  /**
   * KNOWN UNSUPPORTED METHODS
   */

  setBackgroundMessageHandler() {
    throw new Error(
      INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(
        'messaging',
        'setBackgroundMessageHandler'
      )
    );
  }

  useServiceWorker() {
    throw new Error(
      INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(
        'messaging',
        'useServiceWorker'
      )
    );
  }
}

export const statics = {
  // RemoteMessage,
};
