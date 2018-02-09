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
import Message from './Message';
import RemoteMessage from './RemoteMessage';
import {
  MessageType,
  RemoteNotificationResult,
  WillPresentNotificationResult,
} from './types';

import type App from '../core/firebase-app';
import type { NativeMessage } from './types';

type OnMessage = Message => any;

type OnMessageObserver = {
  next: OnMessage,
};

type OnTokenRefresh = String => any;

type OnTokenRefreshObserver = {
  next: OnTokenRefresh,
};

const NATIVE_EVENTS = [
  'messaging_message_received',
  'messaging_token_refreshed',
];

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

  getToken(): Promise<string> {
    return getNativeModule(this).getToken();
  }

  onMessage(nextOrObserver: OnMessage | OnMessageObserver): () => any {
    let listener: Message => any;
    if (isFunction(nextOrObserver)) {
      // $FlowBug: Not coping with the overloaded method signature
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Messaging.onMessage failed: First argument must be a function or observer object with a `next` function.'
      );
    }

    getLogger(this).info('Creating onMessage listener');

    const wrappedListener = async (nativeMessage: NativeMessage) => {
      const message = new Message(this, nativeMessage);
      await listener(message);
      message.finish();
    };

    SharedEventEmitter.addListener('onMessage', wrappedListener);

    return () => {
      getLogger(this).info('Removing onMessage listener');
      SharedEventEmitter.removeListener('onMessage', wrappedListener);
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

  // TODO: Permission structure?
  requestPermission(): Promise<void> {
    return getNativeModule(this).requestPermission();
  }

  /**
   * NON WEB-SDK METHODS
   */
  getBadge(): Promise<number> {
    return getNativeModule(this).getBadge();
  }

  getInitialMessage(): Promise<?Message> {
    return getNativeModule(this).getInitialMessage();
  }

  hasPermission(): Promise<boolean> {
    return getNativeModule(this).hasPermission();
  }

  sendMessage(remoteMessage: RemoteMessage): Promise<void> {
    if (!(remoteMessage instanceof RemoteMessage)) {
      throw new Error(
        `Messaging:sendMessage expects a 'RemoteMessage' but got type ${typeof remoteMessage}`
      );
    }
    return getNativeModule(this).send(remoteMessage.build());
  }

  setBadge(badge: number): void {
    getNativeModule(this).setBadge(badge);
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

  deleteToken() {
    throw new Error(
      INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(
        'messaging',
        'deleteToken'
      )
    );
  }

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
  MessageType,
  RemoteMessage,
  RemoteNotificationResult,
  WillPresentNotificationResult,
};
