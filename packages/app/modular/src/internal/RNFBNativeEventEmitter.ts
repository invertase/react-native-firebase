import { NativeModules, NativeEventEmitter, NativeModule, EmitterSubscription } from 'react-native';

const { RNFBAppModule } = NativeModules;

export interface NativeEvent<T = unknown> {
  eventName: string;
  body: T;
  appName?: string;
}

class RNFBNativeEventEmitter extends NativeEventEmitter {
  constructor() {
    super(RNFBAppModule as NativeModule);
    this.ready = false;
  }

  private ready: boolean;

  addListener<T = unknown>(
    type: string,
    listener: (event: NativeEvent<T>) => void,
    context?: any,
  ): EmitterSubscription {
    if (!this.ready) {
      RNFBAppModule.eventsNotifyReady(true);
      this.ready = true;
    }

    RNFBAppModule.eventsAddListener(type);
    return super.addListener(`rnfb_${type}`, listener, context);
  }

  removeAllListeners(type: string): void {
    RNFBAppModule.eventsRemoveListener(type, true);
    super.removeAllListeners(`rnfb_${type}`);
  }

  removeSubscription(subscription: EmitterSubscription): void {
    RNFBAppModule.eventsRemoveListener(subscription.eventType.replace('rnfb_', ''), false);
    super.removeSubscription(subscription);
  }
}

export default new RNFBNativeEventEmitter();
