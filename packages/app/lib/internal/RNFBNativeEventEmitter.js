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

import { NativeEventEmitter } from 'react-native';
import { getReactNativeModule } from './nativeModule';

class RNFBNativeEventEmitter extends NativeEventEmitter {
  constructor() {
    const RNFBAppModule = getReactNativeModule('RNFBAppModule');
    if (!RNFBAppModule) {
      throw new Error(
        'Native module RNFBAppModule not found. Re-check module install, linking, configuration, build and install steps.',
      );
    }
    super(RNFBAppModule);
    this.ready = false;
  }

  addListener(eventType, listener, context) {
    const RNFBAppModule = getReactNativeModule('RNFBAppModule');
    if (!this.ready) {
      RNFBAppModule.eventsNotifyReady(true);
      this.ready = true;
    }
    RNFBAppModule.eventsAddListener(eventType);
    if (globalThis.RNFBDebug) {
      // eslint-disable-next-line no-console
      console.debug(`[RNFB-->Event][👂] ${eventType} -> listening`);
    }
    const listenerDebugger = (...args) => {
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
    subscription.eventType = `rnfb_${eventType}`;

    // New style is to return a remove function on the object, just in case people call that,
    // we will modify it to do our native unsubscription then call the original
    let originalRemove = subscription.remove;
    let newRemove = () => {
      RNFBAppModule.eventsRemoveListener(eventType, false);
      if (super.removeSubscription != null) {
        // This is for RN <= 0.64 - 65 and greater no longer have removeSubscription
        super.removeSubscription(subscription);
      } else if (originalRemove != null) {
        // This is for RN >= 0.65
        originalRemove();
      }
    };
    subscription.remove = newRemove;
    return subscription;
  }

  removeAllListeners(eventType) {
    const RNFBAppModule = getReactNativeModule('RNFBAppModule');
    RNFBAppModule.eventsRemoveListener(eventType, true);
    super.removeAllListeners(`rnfb_${eventType}`);
  }

  // This is likely no longer ever called, but it is here for backwards compatibility with RN <= 0.64
  removeSubscription(subscription) {
    const RNFBAppModule = getReactNativeModule('RNFBAppModule');
    RNFBAppModule.eventsRemoveListener(subscription.eventType.replace('rnfb_'), false);
    if (super.removeSubscription) {
      super.removeSubscription(subscription);
    }
  }
}

export default new RNFBNativeEventEmitter();
