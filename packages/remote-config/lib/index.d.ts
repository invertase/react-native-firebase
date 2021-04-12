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

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Remote RemoteConfig package for React Native.
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
export namespace FirebaseRemoteConfigTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * A pseudo-enum for usage with ConfigSettingsRead.lastFetchStatus to determine the last fetch status.
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
  }

  /**
   * An Interface representing a RemoteConfig value.
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
   *    fetchTimeoutMillis: 6000,
   * });
   * ```
   */
  export interface ConfigSettings {
    /**
     * Indicates the default value in milliseconds to set for the minimum interval that needs to elapse
     * before a fetch request can again be made to the Remote Config server. Defaults to 43200000 (Twelve hours).
     */
    minimumFetchIntervalMillis?: number;
    /**
     * Indicates the default value in milliseconds to abandon a pending fetch request made to the Remote Config server. Defaults to 60000 (One minute).
     */
    fetchTimeMillis?: number;
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
   */
  export interface ConfigDefaults {
    [key: string]: number | string | boolean;
  }

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
   */
  export class Module extends FirebaseModule {
    /**
     * The number of milliseconds since the last Remote RemoteConfig fetch was performed.
     */
    fetchTimeMillis: number;
    /**
     * The status of the latest Remote RemoteConfig fetch action.
     *
     * See the `LastFetchStatus` statics definition.
     */
    lastFetchStatus: 'success' | 'failure' | 'no_fetch_yet' | 'throttled';

    /**
     * Provides an object which provides the properties `minimumFetchIntervalMillis` & `fetchTimeMillis` if they have been set
     * using setConfigSettings({ fetchTimeMillis: number, minimumFetchIntervalMillis: number }). A description of the properties
     * can be found above
     *
     */
    settings: { fetchTimeMillis: number; minimumFetchIntervalMillis: number };

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
     */
    setDefaultsFromResource(resourceName: string): Promise<null>;

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
     */
    reset(): Promise<void>;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStatics<
  FirebaseRemoteConfigTypes.Module,
  FirebaseRemoteConfigTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  remoteConfig: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { remoteConfig(): FirebaseRemoteConfigTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;
    interface Module {
      remoteConfig: FirebaseModuleWithStatics<
        FirebaseRemoteConfigTypes.Module,
        FirebaseRemoteConfigTypes.Statics
      >;
    }
    interface FirebaseApp {
      remoteConfig(): FirebaseRemoteConfigTypes.Module;
    }
  }
}
