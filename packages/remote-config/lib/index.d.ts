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
   * An Interface representing a Remote RemoteConfig value.
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
     * console.log('Value source: ', configValue.source);
     * ```
     */
    source: 'remote' | 'default' | 'static';

    /**
     * The returned value.
     *
     * #### Example
     *
     * ```js
     * const configValue = firebase.remoteConfig().getValue('beta_enabled');
     * console.log('Value: ', configValue.value);
     * ```
     */
    value: undefined | number | boolean | string;
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
   * The example below makes use of the React Native `__DEV__` global JavaScript variable which
   * is exposed.
   *
   * ```js
   * await firebase.remoteConfig().setConfigSettings({
   *   isDeveloperModeEnabled: __DEV__,
   * });
   * ```
   */
  export interface ConfigSettings {
    /**
     * If enabled, default behaviour such as caching is disabled for a better debugging
     * experience.
     */
    isDeveloperModeEnabled: boolean;
    /**
     * The time that remote config should cache flags for.
     */
    minimumFetchInterval?: number;
  }

  /**
   * An Interface representing a RemoteConfig Defaults object.
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
    lastFetchTime: number;
    /**
     * Whether developer mode is enabled. This is set manually via {@link config#setConfigSettings}
     */
    isDeveloperModeEnabled: boolean;
    /**
     * The status of the latest Remote RemoteConfig fetch action.
     *
     * See the `LastFetchStatus` statics definition.
     */
    lastFetchStatus: 'success' | 'failure' | 'no_fetch_yet' | 'throttled';

    /**
     * Moves fetched data to the apps active config.
     * Resolves with a boolean value of whether the fetched config was moved successfully.
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
     *   console.log('Fetched values failed to activate.');
     * }
     * ```
     */
    activate(): Promise<boolean>;

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
    fetch(expirationDurationSeconds?: number): Promise<null>;

    /**
     * Fetches the remote config data from Firebase, as defined in the dashboard.
     *
     * Once fetching is complete this method immediately calls activate and returns a boolean value of the activation status.
     *
     * #### Example
     *
     * ```js
     * // Fetch, cache for 5 minutes and activate
     * const activated = await firebase.remoteConfig().fetchAndActivate();
     *
     * if (activated) {
     *  console.log('Fetched values successfully activated.');
     * } else {
     *   console.log('Fetched values failed to activate.');
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
     *   console.log('Source: ', entry.source);
     *   console.log('Value: ', entry.value);
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
     * console.log('Source: ', configValue.source);
     * console.log('Value: ', configValue.value);
     * ```
     *
     * @param key A key used to retrieve a specific value.
     */
    getValue(key: string): ConfigValue;

    /**
     * Set the Remote RemoteConfig settings, specifically the `isDeveloperModeEnabled` flag.
     *
     * #### Example
     *
     * ```js
     * await firebase.remoteConfig().setConfigSettings({
     *   isDeveloperModeEnabled: __DEV__,
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
     *  // TODO @ehesp
     * ```
     *
     * @param resourceName The plist/xml file name with no extension.
     */
    setDefaultsFromResource(resourceName: string): Promise<null>;
  }
}

declare module '@react-native-firebase/remote-config' {
  // tslint:disable-next-line:no-duplicate-imports required otherwise doesn't work
  import { ReactNativeFirebase } from '@react-native-firebase/app';
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const defaultExport: FirebaseModuleWithStatics<
    FirebaseRemoteConfigTypes.Module,
    FirebaseRemoteConfigTypes.Statics
  >;
  export default defaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
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
