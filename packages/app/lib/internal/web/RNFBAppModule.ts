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

import { initializeApp, setLogLevel, getApp, getApps, deleteApp } from './firebaseApp';
import { DeviceEventEmitter } from 'react-native';
import { type ReactNativeFirebase } from '../../index';

// Types for internal state
interface QueuedEvent {
  eventName: string;
  eventBody: any;
}

interface EventListeners {
  [eventName: string]: number;
}

interface ListenersMap {
  listeners: number;
  queued: number;
  events: EventListeners;
}

interface PreferencesStorage {
  [key: string]: boolean | string;
}

interface InitializeAppResult {
  options: ReactNativeFirebase.FirebaseAppOptions;
  appConfig: ReactNativeFirebase.FirebaseAppConfig;
}

// Variables for events tracking.
let jsReady = false;
let jsListenerCount = 0;
let queuedEvents: QueuedEvent[] = [];
let jsListeners: EventListeners = {};

// For compatibility we have a fake preferences storage,
// it does not persist across app restarts.
let fakePreferencesStorage: PreferencesStorage = {};

function eventsGetListenersMap(): ListenersMap {
  return {
    listeners: jsListenerCount,
    queued: queuedEvents.length,
    events: jsListeners,
  };
}

function eventsSendEvent(eventName: string, eventBody: any): void {
  if (!jsReady || !jsListeners.hasOwnProperty(eventName)) {
    const event: QueuedEvent = {
      eventName,
      eventBody,
    };
    queuedEvents.push(event);
    return;
  }
  setImmediate(() => DeviceEventEmitter.emit('rnfb_' + eventName, eventBody));
}

function eventsSendQueuedEvents(): void {
  if (queuedEvents.length === 0) {
    return;
  }
  const events = Array.from(queuedEvents);
  queuedEvents = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event) {
      eventsSendEvent(event.eventName, event.eventBody);
    }
  }
}

export default {
  // Natively initialized apps, but in the case of web, we don't have any.
  NATIVE_FIREBASE_APPS: [] as any[],
  // The raw JSON string of the Firebase config, from the users firebase.json file.
  // In the case of web, we can't support this.
  FIREBASE_RAW_JSON: '{}',

  /**
   * Initializes a Firebase app.
   *
   * @param options - The Firebase app options.
   * @param appConfig - The Firebase app config.
   * @returns The Firebase app instance.
   */
  async initializeApp(
    options: ReactNativeFirebase.FirebaseAppOptions,
    appConfig: ReactNativeFirebase.FirebaseAppConfig,
  ): Promise<InitializeAppResult> {
    const name = appConfig.name;
    const existingApp = getApps().find(app => app.name === name);
    if (existingApp) {
      return {
        options,
        appConfig,
      };
    }
    const newAppConfig: any = {
      name,
    };
    if (
      appConfig.automaticDataCollectionEnabled === true ||
      appConfig.automaticDataCollectionEnabled === false
    ) {
      newAppConfig.automaticDataCollectionEnabled = appConfig.automaticDataCollectionEnabled;
    }
    const optionsCopy = Object.assign({}, options);

    delete (optionsCopy as any).clientId;
    initializeApp(optionsCopy, newAppConfig);
    return {
      options,
      appConfig,
    };
  },

  /**
   * Sets the log level for the Firebase app.
   *
   * @param logLevel - The log level to set.
   */
  setLogLevel(logLevel: ReactNativeFirebase.LogLevelString): void {
    setLogLevel(logLevel as any);
  },

  /**
   * Sets the automatic data collection for the Firebase app.
   *
   * @param appName - The name of the Firebase app.
   * @param enabled - Whether to enable automatic data collection.
   */
  setAutomaticDataCollectionEnabled(appName: string, enabled: boolean): void {
    (getApp(appName) as any).automaticDataCollectionEnabled = enabled;
  },

  /**
   * Deletes a Firebase app.
   *
   * @param appName - The name of the Firebase app to delete.
   */
  async deleteApp(appName: string): Promise<void> {
    if (getApp(appName)) {
      await deleteApp(getApp(appName) as any);
    }
  },

  /**
   * Gets the meta data.
   * Unsupported on web.
   *
   * @returns The meta data
   */
  metaGetAll(): Record<string, never> {
    return {};
  },

  /**
   * Gets the firebase.json data.
   * Unsupported on web.
   *
   * @returns The JSON data for the firebase.json file.
   */
  jsonGetAll(): Record<string, never> {
    return {};
  },

  /**
   * Sets a boolean value for a preference.
   * Unsupported on web.
   *
   * @param key - The key of the preference.
   * @param value - The value to set.
   */
  async preferencesSetBool(key: string, value: boolean): Promise<void> {
    fakePreferencesStorage[key] = value;
  },

  /**
   * Sets a string value for a preference.
   * Unsupported on web.
   *
   * @param key - The key of the preference.
   * @param value - The value to set.
   */
  preferencesSetString(key: string, value: string): void {
    fakePreferencesStorage[key] = value;
  },

  /**
   * Gets all preferences.
   * Unsupported on web.
   *
   * @returns The preferences.
   */
  preferencesGetAll(): PreferencesStorage {
    return Object.assign({}, fakePreferencesStorage);
  },

  /**
   * Clears all preferences.
   * Unsupported on web.
   */
  preferencesClearAll(): void {
    fakePreferencesStorage = {};
  },

  /**
   * Adds a listener for an event.
   * Unsupported on web.
   *
   * @param eventName - The name of the event to listen for.
   */
  addListener(): void {
    // Keep: Required for RN built in Event Emitter Calls.
  },
  /**
   * Removes a listener for an event.
   * Unsupported on web.
   *
   * @param eventName - The name of the event to remove the listener for.
   */
  removeListeners(): void {
    // Keep: Required for RN built in Event Emitter Calls.
  },

  /**
   * Notifies the app that it is ready to receive events.
   *
   * @param ready - Whether the app is ready to receive events.
   * @returns void
   */
  eventsNotifyReady(ready: boolean): void {
    jsReady = ready;
    if (jsReady) {
      setImmediate(() => eventsSendQueuedEvents());
    }
  },

  /**
   * Gets all the listeners registered.
   *
   * @returns The listeners for the event.
   */
  eventsGetListeners(): ListenersMap {
    return eventsGetListenersMap();
  },

  /**
   * Sends an event to the app for testing purposes.
   *
   * @param eventName - The name of the event to send.
   * @param eventBody - The body of the event to send.
   * @returns void
   */
  eventsPing(eventName: string, eventBody: any): void {
    eventsSendEvent(eventName, eventBody);
  },

  /**
   * Adds a listener for an event.
   *
   * @param eventName - The name of the event to listen for.
   */
  eventsAddListener(eventName: string): void {
    jsListenerCount++;
    if (!jsListeners.hasOwnProperty(eventName)) {
      jsListeners[eventName] = 1;
    } else {
      if (jsListeners[eventName] !== undefined) {
        jsListeners[eventName]++;
      }
    }
    setImmediate(() => eventsSendQueuedEvents());
  },

  /**
   * Removes a single listener for an event or all listeners for an event.
   *
   * @param eventName - The name of the event to remove the listener for.
   * @param all - Optional. Whether to remove all listeners for the event.
   */
  eventsRemoveListener(eventName: string, all?: boolean): void {
    if (jsListeners.hasOwnProperty(eventName)) {
      const count = jsListeners[eventName];
      if (count !== undefined) {
        if (count <= 1 || all) {
          jsListenerCount -= count;
          delete jsListeners[eventName];
        } else {
          jsListenerCount--;
          const currentCount = jsListeners[eventName];
          if (currentCount !== undefined) {
            jsListeners[eventName] = currentCount - 1;
          }
        }
      }
    }
  },
};
