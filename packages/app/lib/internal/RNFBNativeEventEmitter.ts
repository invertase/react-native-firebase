/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { type EmitterSubscription, NativeEventEmitter } from 'react-native';
import { APP_NATIVE_MODULE } from './constants';
import { getReactNativeModule } from './nativeModule';
import type { RNFBAppModuleInterface } from './NativeModules';

/**
 * Type for the eventsNotifyReady native method
 */
type EventsNotifyReadyMethod = (ready: boolean) => void;

/**
 * Type for the eventsAddListener native method
 */
type EventsAddListenerMethod = (eventType: string) => void;

/**
 * Type for the eventsRemoveListener native method
 */
type EventsRemoveListenerMethod = (eventType: string, removeAll: boolean) => void;

class RNFBNativeEventEmitter extends NativeEventEmitter {
  ready: boolean;

  constructor() {
    // NewArch-AD-18 E1: NativeEventEmitter must receive the same raw host that implements addListener/removeListeners.
    const RNFBAppModule = getReactNativeModule(APP_NATIVE_MODULE);
    if (!RNFBAppModule) {
      throw new Error(
        `Native module ${APP_NATIVE_MODULE} not found. Re-check module install, linking, configuration, build and install steps.`,
      );
    }
    // Cast to any for NativeEventEmitter constructor which expects React Native's NativeModule type
    super(RNFBAppModule as any);
    this.ready = false;
  }

  addListener(
    eventType: string,
    listener: (...args: unknown[]) => unknown,
    context?: object,
  ): EmitterSubscription {
    // NewArch-AD-18 E1: event bridge identity requires raw app-module host for listener registration.
    const RNFBAppModule = getReactNativeModule(
      APP_NATIVE_MODULE,
    ) as unknown as RNFBAppModuleInterface;
    if (!this.ready) {
      (RNFBAppModule.eventsNotifyReady as EventsNotifyReadyMethod)(true);
      this.ready = true;
    }
    (RNFBAppModule.eventsAddListener as EventsAddListenerMethod)(eventType);
    if (globalThis.RNFBDebug) {
      // eslint-disable-next-line no-console
      console.debug(`[RNFB-->Event][👂] ${eventType} -> listening`);
    }
    const listenerDebugger = (...args: unknown[]) => {
      if (globalThis.RNFBDebug) {
        // eslint-disable-next-line no-console
        console.debug(`[RNFB<--Event][📣] ${eventType} <-`, JSON.stringify(args[0]));
        // Possible leaking test if events are still being received after the test.
        // This is not super accurate but it's better than nothing, e.g. if doing setup/teardown
        // logic outside of a test this may cause false positives.
        if (globalThis.RNFBTest && !globalThis.RNFBDebugInTestLeakDetection) {
          // eslint-disable-next-line no-console
          console.debug(
            `[TEST--->Leak][💡] Possible leaking test detected! An event (☝️) ` +
              `was received outside of any running tests which may indicates that some ` +
              `listeners/event subscriptions that have not been unsubscribed from in your ` +
              `test code. The last test that ran was: "${globalThis.RNFBDebugLastTest}".`,
          );
        }
      }
      return listener(...args);
    };

    let subscription = super.addListener(`rnfb_${eventType}`, listenerDebugger, context);

    // React Native 0.65+ altered EventEmitter:
    // - removeSubscription is gone
    // - addListener returns an unsubscriber instead of a more complex object with eventType etc

    // make sure eventType for backwards compatibility just in case
    (subscription as any).eventType = `rnfb_${eventType}`;

    // New style is to return a remove function on the object, just in case people call that,
    // we will modify it to do our native unsubscription then call the original
    const originalRemove = subscription.remove;
    const newRemove = () => {
      // NewArch-AD-18 E1: raw host for eventsRemoveListener on unsubscribe.
      const module = getReactNativeModule(APP_NATIVE_MODULE) as unknown as RNFBAppModuleInterface;
      (module.eventsRemoveListener as EventsRemoveListenerMethod)(eventType, false);
      const superClass = Object.getPrototypeOf(Object.getPrototypeOf(this));
      if (superClass.removeSubscription != null) {
        // This is for RN <= 0.64 - 65 and greater no longer have removeSubscription
        superClass.removeSubscription(subscription);
      } else if (originalRemove != null) {
        // This is for RN >= 0.65
        originalRemove();
      }
    };
    subscription.remove = newRemove;
    return subscription;
  }

  removeAllListeners(eventType: string): void {
    // NewArch-AD-18 E1: raw host for eventsRemoveListener.
    const RNFBAppModule = getReactNativeModule(
      APP_NATIVE_MODULE,
    ) as unknown as RNFBAppModuleInterface;
    (RNFBAppModule.eventsRemoveListener as EventsRemoveListenerMethod)(eventType, true);
    super.removeAllListeners(`rnfb_${eventType}`);
  }

  // This is likely no longer ever called, but it is here for backwards compatibility with RN <= 0.64
  removeSubscription(subscription: EmitterSubscription & { eventType?: string }): void {
    // NewArch-AD-18 E1: raw host for legacy removeSubscription path.
    const RNFBAppModule = getReactNativeModule(
      APP_NATIVE_MODULE,
    ) as unknown as RNFBAppModuleInterface;
    const eventType = subscription.eventType?.replace('rnfb_', '') || '';
    (RNFBAppModule.eventsRemoveListener as EventsRemoveListenerMethod)(eventType, false);
    const superClass = Object.getPrototypeOf(Object.getPrototypeOf(this));
    if (superClass.removeSubscription) {
      superClass.removeSubscription(subscription);
    }
  }
}

export default new RNFBNativeEventEmitter();
