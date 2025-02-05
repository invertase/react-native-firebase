import { initializeApp, setLogLevel, getApp, getApps, deleteApp } from './firebaseApp';

import { DeviceEventEmitter } from 'react-native';

// Variables for events tracking.
let jsReady = false;
let jsListenerCount = 0;
let queuedEvents = [];
let jsListeners = {};

// For compatibility we have a fake preferences storage,
// it does not persist across app restarts.
let fakePreferencesStorage = {};

function eventsGetListenersMap() {
  return {
    listeners: jsListenerCount,
    queued: queuedEvents.length,
    events: jsListeners,
  };
}

function eventsSendEvent(eventName, eventBody) {
  if (!jsReady || !jsListeners.hasOwnProperty(eventName)) {
    const event = {
      eventName,
      eventBody,
    };
    queuedEvents.push(event);
    return;
  }
  setImmediate(() => DeviceEventEmitter.emit('rnfb_' + eventName, eventBody));
}

function eventsSendQueuedEvents() {
  if (queuedEvents.length === 0) {
    return;
  }
  const events = Array.from(queuedEvents);
  queuedEvents = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    eventsSendEvent(event.eventName, event.eventBody);
  }
}

export default {
  // Natively initialized apps, but in the case of web, we don't have any.
  NATIVE_FIREBASE_APPS: [],
  // The raw JSON string of the Firebase config, from the users firebase.json file.
  // In the case of web, we can't support this.
  FIREBASE_RAW_JSON: '{}',

  /**
   * Initializes a Firebase app.
   *
   * @param {object} options - The Firebase app options.
   * @param {object} appConfig - The Firebase app config.
   * @returns {object} - The Firebase app instance.
   */
  async initializeApp(options, appConfig) {
    const name = appConfig.name;
    const existingApp = getApps().find(app => app.name === name);
    if (existingApp) {
      return existingApp;
    }
    const newAppConfig = {
      name,
    };
    if (
      appConfig.automaticDataCollectionEnabled === true ||
      appConfig.automaticDataCollectionEnabled === false
    ) {
      newAppConfig.automaticDataCollectionEnabled = appConfig.automaticDataCollectionEnabled;
    }
    const optionsCopy = Object.assign({}, options);
    // TODO RNFB is using the old gaTrackingId property, we should remove this in the future
    // in favor of the measurementId property.
    if (optionsCopy.gaTrackingId) {
      optionsCopy.measurementId = optionsCopy.gaTrackingId;
    }
    delete optionsCopy.clientId;
    initializeApp(optionsCopy, newAppConfig);
    return {
      options,
      appConfig,
    };
  },

  /**
   * Sets the log level for the Firebase app.
   *
   * @param {string} logLevel - The log level to set.
   */
  setLogLevel(logLevel) {
    setLogLevel(logLevel);
  },

  /**
   * Sets the automatic data collection for the Firebase app.
   *
   * @param {string} appName - The name of the Firebase app.
   * @param {boolean} enabled - Whether to enable automatic data collection.
   */
  setAutomaticDataCollectionEnabled(appName, enabled) {
    getApp(appName).automaticDataCollectionEnabled = enabled;
  },

  /**
   * Deletes a Firebase app.
   *
   * @param {string} appName - The name of the Firebase app to delete.
   */
  async deleteApp(appName) {
    if (getApp(appName)) {
      deleteApp(appName);
    }
  },

  /**
   * Gets the meta data.
   * Unsupported on web.
   *
   * @returns {object} - The meta data
   */
  metaGetAll() {
    return {};
  },

  /**
   * Gets the firebase.json data.
   * Unsupported on web.
   *
   * @returns {object} - The JSON data for the firebase.json file.
   */
  jsonGetAll() {
    return {};
  },

  /**
   * Sets a boolean value for a preference.
   * Unsupported on web.
   *
   * @param {string} key - The key of the preference.
   * @param {boolean} value - The value to set.
   */
  async preferencesSetBool(key, value) {
    fakePreferencesStorage[key] = value;
  },

  /**
   * Sets a string value for a preference.
   * Unsupported on web.
   *
   * @param {string} key - The key of the preference.
   * @param {string} value - The value to set.
   */
  preferencesSetString(key, value) {
    fakePreferencesStorage[key] = value;
  },

  /**
   * Gets all preferences.
   * Unsupported on web.
   *
   * @returns {object} - The preferences.
   */
  preferencesGetAll() {
    return Object.assign({}, fakePreferencesStorage);
  },

  /**
   * Clears all preferences.
   * Unsupported on web.
   */
  preferencesClearAll() {
    fakePreferencesStorage = {};
  },

  /**
   * Adds a listener for an event.
   * Unsupported on web.
   *
   * @param {string} eventName - The name of the event to listen for.
   */
  addListener() {
    // Keep: Required for RN built in Event Emitter Calls.
  },
  /**
   * Removes a listener for an event.
   * Unsupported on web.
   *
   * @param {string} eventName - The name of the event to remove the listener for.
   */
  removeListeners() {
    // Keep: Required for RN built in Event Emitter Calls.
  },

  /**
   * Notifies the app that it is ready to receive events.
   *
   * @param {boolean} ready - Whether the app is ready to receive events.
   * @returns {void}
   */
  eventsNotifyReady(ready) {
    jsReady = ready;
    if (jsReady) {
      setImmediate(() => eventsSendQueuedEvents());
    }
  },

  /**
   * Gets all the listeners registered.
   *
   * @returns {object} - The listeners for the event.
   */
  eventsGetListeners() {
    return eventsGetListenersMap();
  },

  /**
   * Sends an event to the app for testing purposes.
   *
   * @param {string} eventName - The name of the event to send.
   * @param {object} eventBody - The body of the event to send.
   * @returns {void}
   */
  eventsPing(eventName, eventBody) {
    eventsSendEvent(eventName, eventBody);
  },

  /**
   * Adds a listener for an event.
   *
   * @param {string} eventName - The name of the event to listen for.
   */
  eventsAddListener(eventName) {
    jsListenerCount++;
    if (!jsListeners.hasOwnProperty(eventName)) {
      jsListeners[eventName] = 1;
    } else {
      jsListeners[eventName]++;
    }
    setImmediate(() => eventsSendQueuedEvents());
  },

  /**
   * Removes a single listener for an event or all listeners for an event.
   *
   * @param {string} eventName - The name of the event to remove the listener for.
   * @param {boolean} all - Optional. Whether to remove all listeners for the event.
   */
  eventsRemoveListener(eventName, all) {
    if (jsListeners.hasOwnProperty(eventName)) {
      if (jsListeners[eventName] <= 1 || all) {
        const count = jsListeners[eventName];
        jsListenerCount -= count;
        delete jsListeners[eventName];
      } else {
        jsListenerCount--;
        jsListeners[eventName]--;
      }
    }
  },
};
