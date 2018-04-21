/**
 * @flow
 * Messaging (FCM) representation wrapper
 */
import { Platform } from 'react-native';
import { SharedEventEmitter } from '../../utils/events';
import INTERNALS from '../../utils/internals';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
import { isFunction, isObject } from '../../utils';
import RemoteMessage from './RemoteMessage';

import type App from '../core/app';
import type { NativeInboundRemoteMessage } from './types';

type OnMessage = RemoteMessage => any;

type OnMessageObserver = {
  next: OnMessage,
};

type OnTokenRefresh = string => any;

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
      hasShards: false,
      namespace: NAMESPACE,
    });

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onMessage
      'messaging_message_received',
      (message: NativeInboundRemoteMessage) => {
        SharedEventEmitter.emit('onMessage', new RemoteMessage(message));
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

    // Tell the native module that we're ready to receive events
    if (Platform.OS === 'ios') {
      getNativeModule(this).jsInitialised();
    }
  }

  getToken(): Promise<string> {
    return getNativeModule(this).getToken();
  }

  onMessage(nextOrObserver: OnMessage | OnMessageObserver): () => any {
    let listener: RemoteMessage => any;
    if (isFunction(nextOrObserver)) {
      // $FlowExpectedError: Not coping with the overloaded method signature
      listener = nextOrObserver;
    } else if (isObject(nextOrObserver) && isFunction(nextOrObserver.next)) {
      listener = nextOrObserver.next;
    } else {
      throw new Error(
        'Messaging.onMessage failed: First argument must be a function or observer object with a `next` function.'
      );
    }

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
    let listener: string => any;
    if (isFunction(nextOrObserver)) {
      // $FlowExpectedError: Not coping with the overloaded method signature
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
  hasPermission(): Promise<boolean> {
    return getNativeModule(this).hasPermission();
  }

  sendMessage(remoteMessage: RemoteMessage): Promise<void> {
    if (!(remoteMessage instanceof RemoteMessage)) {
      return Promise.reject(
        new Error(
          `Messaging:sendMessage expects a 'RemoteMessage' but got type ${typeof remoteMessage}`
        )
      );
    }
    try {
      return getNativeModule(this).sendMessage(remoteMessage.build());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  subscribeToTopic(topic: string): Promise<void> {
    return getNativeModule(this).subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic: string): Promise<void> {
    return getNativeModule(this).unsubscribeFromTopic(topic);
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
  RemoteMessage,
};
