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

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { RemoteConfigOptions } from './modular';

type FirebaseModule = ReactNativeFirebase.FirebaseModule;

/**
 * Firebase Remote RemoteConfig package for React Native.
 *
 * @deprecated Namespaced API is deprecated. Use the modular API from '@react-native-firebase/remote-config'
 * (e.g. getRemoteConfig(), getString(), activate()) instead.
 *
 * #### Example 1
 *
 * Access the firebase export from the `config` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/remote-config';
 *
 * // firebase.remoteConfig().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `config` package:
 *
 * ```js
 * import remoteConfig from '@react-native-firebase/remote-config';
 *
 * // remoteConfig().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/remote-config';
 *
 * // firebase.remoteConfig().X
 * ```
 *
 * @firebase remote-config
 */
// eslint-disable-next-line @typescript-eslint/no-namespace -- public API shape
export namespace FirebaseRemoteConfigTypes {
  /**
   * Defines levels of Remote Config logging. Web only.
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' instead.
   */
  export declare type RemoteConfigLogLevel = 'debug' | 'error' | 'silent';
  /**
   * A pseudo-enum for usage with ConfigSettingsRead.lastFetchStatus to determine the last fetch status.
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' instead.
   *
   * #### Example
   *
   * ```js
   * firebase.remoteConfig.LastFetchStatus;
   * ```
   */
  export interface LastFetchStatus {
    /**
     * A value indicating that the last fetch was successful.
     *
     * ```js
     * firebase.remoteConfig.LastFetchStatus.SUCCESS;
     * ```
     */
    SUCCESS: 'success';

    /**
     * A value indicating that the last fetch failed.
     *
     * ```js
     * firebase.remoteConfig.LastFetchStatus.FAILURE;
     * ```
     */
    FAILURE: 'failure';

    /**
     * A value indicating that the last fetch was throttled.
     *
     * This usually occurs when calling fetch often with a low expiration duration.
     *
     * ```js
     * firebase.remoteConfig.LastFetchStatus.THROTTLED;
     * ```
     */
    THROTTLED: 'throttled';

    /**
     * A value indicating that no fetches have occurred yet.
     *
     * This usually means you've not called fetch yet.
     *
     * ```js
     * firebase.remoteConfig.LastFetchStatus.NO_FETCH_YET;
     * ```
     */
    NO_FETCH_YET: 'no_fetch_yet';
  }

  /**
   * A pseudo-enum for usage with ConfigValue.source to determine the value source.
   *
   * #### Example
   *
   * ```js
   * firebase.remoteConfig.ValueSource;
   * ```
   *
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' instead.
   */
  export interface ValueSource {
    /**
     * If the value was retrieved from the server.
     *
     * ```js
     * firebase.remoteConfig.ValueSource.REMOTE;
     * ```
     */
    REMOTE: 'remote';
    /**
     * If the value was set as a default value.
     *
     * ```js
     * firebase.remoteConfig.ValueSource.DEFAULT;
     * ```
     */
    DEFAULT: 'default';
    /**
     * If no value was found and a static default value was returned instead.
     *
     * ```js
     * firebase.remoteConfig.ValueSource.STATIC;
     * ```
     */
    STATIC: 'static';
  }

  /**
   * Firebase Remote RemoteConfig statics.
   *
   * ```js
   * firebase.config;
   * ```
   *
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' instead.
   */
  export interface Statics {
    /**
     * A pseudo-enum for usage with ConfigValue.source to determine the value source.
     *
     * #### Example
     *
     * ```js
     * firebase.remoteConfig.ValueSource;
     * ```
     */
    ValueSource: ValueSource;

    /**
     * A pseudo-enum for usage with `firebase.remoteConfig().lastFetchStatus` to determine the last fetch status.
     *
     * #### Example
     *
     * ```js
     * firebase.remoteConfig.LastFetchStatus;
     * ```
     */
    LastFetchStatus: LastFetchStatus;
    SDK_VERSION: string;
  }

  /**
   * An Interface representing a RemoteConfig value.
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. getValue()) instead.
   */
  export interface ConfigValue {
    /**
     * Where the value was retrieved from.
     *
     * - `remote`:  If the value was retrieved from the server.
     * - `default`: If the value was set as a default value.
     * - `static`: If no value was found and a static default value was returned instead.
     *
     * See the `ValueSource` statics definition.
     *
     * #### Example
     *
     * ```js
     * const configValue = firebase.remoteConfig().getValue('beta_enabled');
     * console.log('Value source: ', configValue.getSource());
     * ```
     */
    getSource(): 'remote' | 'default' | 'static';
    /**
     * The returned value.
     *
     * #### Example
     *
     * ```js
     * const configValue = firebase.remoteConfig().getValue('dev_mode');
     * console.log('Boolean: ', configValue.asBoolean());
     * ```
     */
    asBoolean(): true | false;
    /**
     * The returned value.
     *
     * #### Example
     *
     * ```js
     * const configValue = firebase.remoteConfig().getValue('user_count');
     * console.log('Count: ', configValue.asNumber());
     * ```
     */
    asNumber(): number;
    /**
     * The returned value.
     *
     * #### Example
     *
     * ```js
     * const configValue = firebase.remoteConfig().getValue('username');
     * console.log('Name: ', configValue.asString());
     * ```
     */
    asString(): string;
  }

  /**
   * An Interface representing multiple RemoteConfig Values.
   *
   * #### Example
   *
   * ```js
   * const values = firebase.remoteConfig().getAll();
   * ```
   *
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. getAll()) instead.
   */
  export interface ConfigValues {
    [key: string]: ConfigValue;
  }

  /**
   * An Interface representing settable config settings.
   *
   * #### Example
   *
   * The example below shows how to set a time limit to the length of time the request for remote config values
   *
   * ```js
   * await firebase.remoteConfig().setConfigSettings({
   *    fetchTimeMillis: 6000,
   * });
   * ```
   *
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. setConfigSettings()) instead.
   */
  export interface ConfigSettings {
    /**
     * Indicates the default value in milliseconds to set for the minimum interval that needs to elapse
     * before a fetch request can again be made to the Remote Config server. Defaults to 43200000 (Twelve hours).
     */
    minimumFetchIntervalMillis: number;
    /**
     * Indicates the default value in milliseconds to abandon a pending fetch request made to the Remote Config server. Defaults to 60000 (One minute).
     * @deprecated Use fetchTimeoutMillis to match Firebase Web SDK. This is an alias for the same value.
     */
    fetchTimeMillis?: number;
    /**
     * Defines the maximum amount of milliseconds to wait for a response when fetching configuration.
     * Defaults to 60000 (One minute). Matches Firebase Web SDK RemoteConfigSettings.
     */
    fetchTimeoutMillis: number;
  }

  /**
   * Set default config values by updating `defaultConfig` with an object & the properties you require as default.
   *
   * #### Example
   *
   * ```js
   * await firebase.remoteConfig().setDefaults({
   *   experiment_enabled: false,
   * });
   * ```
   *
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. setDefaults()) instead.
   */
  export interface ConfigDefaults {
    [key: string]: number | string | boolean;
  }

  /**
   * The status of the latest Remote Config fetch action.
   * Use with the namespaced API (e.g. `firebase.remoteConfig().lastFetchStatus`).
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. lastFetchStatus()) instead.
   */
  export type FetchStatus = 'success' | 'failure' | 'no_fetch_yet' | 'throttled';

  /**
   * Contains information about which keys have been updated.
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. onConfigUpdate()) instead.
   */
  export interface ConfigUpdate {
    /**
     * Parameter keys whose values have been updated from the currently activated values.
     * Includes keys that are added, deleted, or whose value, value source, or metadata has changed.
     */
    getUpdatedKeys(): Set<string>;
  }

  /**
   * Observer interface for receiving real-time Remote Config update notifications.
   *
   * NOTE: Although an `complete` callback can be provided, it will
   * never be called because the ConfigUpdate stream is never-ending.
   *
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. onConfigUpdate()) instead.
   */
  export interface ConfigUpdateObserver {
    /**
     * Called when a new ConfigUpdate is available.
     */
    next: (configUpdate: ConfigUpdate) => void;

    /**
     * Called if an error occurs during the stream.
     */
    error: (error: Error) => void;

    /**
     * Called when the stream is gracefully terminated.
     */
    complete: () => void;
  }

  /**
   * A function that unsubscribes from a real-time event stream.
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' instead.
   */
  export type Unsubscribe = () => void;

  /**
   * The Firebase Remote RemoteConfig service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Remote RemoteConfig service for the default app:
   *
   * ```js
   * const defaultAppRemoteConfig = firebase.remoteConfig();
   * ```
   *
   * @deprecated Use the modular API from '@react-native-firebase/remote-config' (e.g. getRemoteConfig()) instead.
   */
  export interface Module extends FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     * @deprecated Use the modular API from '@react-native-firebase/remote-config' instead.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * The number of milliseconds since the last Remote RemoteConfig fetch was performed.
     * @deprecated Use the modular API fetchTimeMillis() from '@react-native-firebase/remote-config' instead.
     */
    fetchTimeMillis: number;
    /**
     * The status of the latest Remote RemoteConfig fetch action.
     *
     * See the `LastFetchStatus` statics definition.
     * @deprecated Use the modular API lastFetchStatus() from '@react-native-firebase/remote-config' instead.
     */
    lastFetchStatus: FetchStatus;

    /**
     * Provides an object which provides the properties `minimumFetchIntervalMillis` & `fetchTimeMillis` if they have been set
     * using setConfigSettings({ fetchTimeMillis: number, minimumFetchIntervalMillis: number }). A description of the properties
     * can be found above
     *
     * @deprecated Use the modular API settings() from '@react-native-firebase/remote-config' instead.
     */
    settings: ConfigSettings;

    /**
     * Provides an object with the type ConfigDefaults for default configuration values
     * @deprecated Use the modular API from '@react-native-firebase/remote-config' instead.
     */
    defaultConfig: ConfigDefaults;

    /**
     * Set the Remote RemoteConfig settings, currently able to set `fetchTimeMillis` & `minimumFetchIntervalMillis`
     *
     * #### Example
     *
     * ```js
     * await firebase.remoteConfig().setConfigSettings({
     *   minimumFetchIntervalMillis: 30000,
     * });
     * ```
     *
     * @param configSettings A ConfigSettingsWrite instance used to set Remote RemoteConfig settings.
     * @deprecated Use the modular API setConfigSettings() from '@react-native-firebase/remote-config' instead.
     */
    setConfigSettings(configSettings: ConfigSettings): Promise<void>;

    /**
     * Sets default values for the app to use when accessing values.
     * Any data fetched and activated will override any default values. Any values in the defaults but not on Firebase will be untouched.
     *
     * #### Example
     *
     * ```js
     * await firebase.remoteConfig().setDefaults({
     *   experiment_enabled: false,
     * });
     * ```
     *
     * @param defaults A ConfigDefaults instance used to set default values.
     * @deprecated Use the modular API setDefaults() from '@react-native-firebase/remote-config' instead.
     */
    setDefaults(defaults: ConfigDefaults): Promise<null>;

    /**
     * Sets the default values from a resource file.
     * On iOS this is a plist file and on Android this is an XML defaultsMap file.
     *
     * ```js
     * // put in either your iOS or Android directory without the file extension included (.plist or .xml)
     *  await firebase.remoteConfig().setDefaultsFromResource('config_resource');
     *
     * // resource values will now be loaded in with your other config values
     * const config = firebase.remoteConfig().getAll();
     * ```
     *
     * @param resourceName The plist/xml file name with no extension.
     * @deprecated Use the modular API setDefaultsFromResource() from '@react-native-firebase/remote-config' instead.
     */
    setDefaultsFromResource(resourceName: string): Promise<null>;

    /**
     * Starts listening for real-time config updates from the Remote Config backend and automatically
     * fetches updates from the Remote Config backend when they are available.
     *
     * @remarks
     * If a connection to the Remote Config backend is not already open, calling this method will
     * open it. Multiple listeners can be added by calling this method again, but subsequent calls
     * re-use the same connection to the backend.
     *
     * The list of updated keys passed to the callback will include all keys not currently active,
     * and the config update process fetches the new config but does not automatically activate
     * it for you. Typically you will activate the config in your callback to use the new values.
     *
     * @param observer - The {@link ConfigUpdateObserver} to be notified of config updates.
     * @returns An {@link Unsubscribe} function to remove the listener.
     * @deprecated Use the modular API onConfigUpdate() from '@react-native-firebase/remote-config' instead.
     */
    onConfigUpdate(observer: ConfigUpdateObserver): Unsubscribe;

    /**
     * Start listening for real-time config updates from the Remote Config backend and
     * automatically fetch updates when they’re available. Note that the list of updated keys
     * passed to the callback will include all keys not currently active, and the config update
     * process fetches the new config but does not automatically activate for you. Typically
     * you will want to activate the config in your callback so the new values are in force.
     * @param listener called with either array of updated keys or error arg when config changes
     * @deprecated use official firebase-js-sdk onConfigUpdate now that web supports realtime
     */
    onConfigUpdated(listener: CallbackOrObserver<OnConfigUpdatedListenerCallback>): () => void;

    /**
     * Moves fetched data to the apps active config.
     * Resolves with a boolean value true if new local values were activated
     *
     * #### Example
     *
     * ```js
     * // Fetch values
     * await firebase.remoteConfig().fetch();
     * const activated = await firebase.remoteConfig().activate();
     *
     * if (activated) {
     *  console.log('Fetched values successfully activated.');
     * } else {
     *   console.log('Fetched values were already activated.');
     * }
     * ```
     *
     * @deprecated Use the modular API activate() from '@react-native-firebase/remote-config' instead.
     */
    activate(): Promise<boolean>;
    /**
     * Ensures the last activated config are available to the getters.
     *
     * #### Example
     *
     * ```js
     * await firebase.remoteConfig().ensureInitialized();
     * // get remote config values
     * ```
     *
     * @deprecated Use the modular API ensureInitialized() from '@react-native-firebase/remote-config' instead.
     */
    ensureInitialized(): Promise<void>;

    /**
     * Fetches the remote config data from Firebase, as defined in the dashboard. If duration is defined (seconds), data will be locally cached for this duration.
     *
     * #### Example
     *
     * ```js
     * // Fetch and cache for 5 minutes
     * await firebase.remoteConfig().fetch(300);
     * ```
     *
     * @param expirationDurationSeconds Duration in seconds to cache the data for. To skip cache, use a duration of 0.
     * @deprecated Use the modular API fetch() from '@react-native-firebase/remote-config' instead.
     */
    fetch(expirationDurationSeconds?: number): Promise<void>;

    /**
     * Fetches the remote config data from Firebase, as defined in the dashboard.
     * Once fetching is complete this method immediately calls activate and returns a boolean value true if new values were activated
     *
     * #### Example
     *
     * ```js
     * // Fetch, cache for 5 minutes and activate
     * const fetchedRemotely = await firebase.remoteConfig().fetchAndActivate();
     *
     * if (fetchedRemotely) {
     *   console.log('New configs were retrieved from the backend and activated.');
     * } else {
     *   console.log('No new configs were fetched from the backend, and the local configs were already activated');
     * }
     * ```
     *
     * @deprecated Use the modular API fetchAndActivate() from '@react-native-firebase/remote-config' instead.
     */
    fetchAndActivate(): Promise<boolean>;

    /**
     * Returns all available config values.
     *
     * #### Example
     *
     * ```js
     * const values = firebase.remoteConfig().getAll();
     *
     * Object.entries(values).forEach(($) => {
     *   const [key, entry] = $;
     *   console.log('Key: ', key);
     *   console.log('Source: ', entry.getSource());
     *   console.log('Value: ', entry.asString());
     * });
     * ```
     *
     * @deprecated Use the modular API getAll() from '@react-native-firebase/remote-config' instead.
     */
    getAll(): ConfigValues;

    /**
     * Gets a ConfigValue by key.
     *
     * #### Example
     *
     * ```js
     * const configValue = firebase.remoteConfig().getValue('experiment');
     * console.log('Source: ', configValue.getSource());
     * console.log('Value: ', configValue.asString());
     * ```
     *
     * @param key A key used to retrieve a specific value.
     * @deprecated Use the modular API getValue() from '@react-native-firebase/remote-config' instead.
     */
    getValue(key: string): ConfigValue;
    /**
     * Gets a config property using the key and converts to a boolean value
     *
     * #### Example
     *
     * ```js
     * // true or false depending on truthy or falsy nature of value
     * const configValue = firebase.remoteConfig().getBoolean('experiment');
     * ```
     *
     * @param key A key used to retrieve a specific value.
     * @deprecated Use the modular API getBoolean() from '@react-native-firebase/remote-config' instead.
     */
    getBoolean(key: string): boolean;
    /**
     * Gets a config property using the key and converts to a string value
     *
     * #### Example
     *
     * ```js
     * // string value of 'experiment' property
     * const configValue = firebase.remoteConfig().getString('experiment');
     * ```
     *
     * @param key A key used to retrieve a specific value.
     * @deprecated Use the modular API getString() from '@react-native-firebase/remote-config' instead.
     */
    getString(key: string): string;
    /**
     * Gets a config property using the key and converts to a number value. It
     * will be 0 if the value is not a number.
     *
     * #### Example
     *
     * ```js
     * // number value of 'experiment' property
     * const configValue = firebase.remoteConfig().getNumber('experiment');
     * ```
     *
     * @param key A key used to retrieve a specific value.
     * @deprecated Use the modular API getNumber() from '@react-native-firebase/remote-config' instead.
     */
    getNumber(key: string): number;

    /**
     * Deletes all activated, fetched and defaults configs and resets all Firebase Remote Config settings.
     * @android Android only - iOS returns Promise<null> but does not reset anything
     *
     * #### Example
     *
     * ```js
     * await firebase.remoteConfig().reset();
     * // get remote config values
     * ```
     *
     * @deprecated Use the modular API reset() from '@react-native-firebase/remote-config' instead.
     */
    reset(): Promise<void>;
  }

  /**
   * @deprecated Use the modular API onConfigUpdate() from '@react-native-firebase/remote-config' instead.
   */
  export type CallbackOrObserver<T extends (...args: any[]) => any> = T | { next: T };

  /**
   * @deprecated Use the modular API onConfigUpdate() from '@react-native-firebase/remote-config' instead.
   */
  export type OnConfigUpdatedListenerCallback = (
    event?: { updatedKeys: string[] },
    error?: {
      code: string;
      message: string;
      nativeErrorMessage: string;
    },
  ) => void;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`
 *
 * @deprecated Namespaced API is deprecated. Use the modular API from '@react-native-firebase/remote-config' instead.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- module augmentation
  namespace ReactNativeFirebase {
    interface Module {
      /** @deprecated Use getRemoteConfig() from '@react-native-firebase/remote-config' instead. */
      remoteConfig: ReactNativeFirebase.FirebaseModuleWithStatics<
        FirebaseRemoteConfigTypes.Module,
        FirebaseRemoteConfigTypes.Statics
      >;
    }
    interface FirebaseApp {
      /** @deprecated Use getRemoteConfig(app) from '@react-native-firebase/remote-config' instead. */
      remoteConfig(options?: RemoteConfigOptions): FirebaseRemoteConfigTypes.Module;
    }
  }
}
