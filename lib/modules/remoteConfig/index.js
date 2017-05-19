/**
 * @flow
 */
import { NativeModules } from 'react-native';

import { Base } from './../base';

const FirebaseRemoteConfig = NativeModules.RNFirebaseRemoteConfig;

type RemoteConfigOptions = {}

/**
 * @class Config
 */
export default class RemoteConfig extends Base {
  constructor(firebase: Object, options: RemoteConfigOptions = {}) {
    super(firebase, options);
    this.namespace = 'firebase:config';
    this.developerModeEnabled = false;
  }

  /**
  * Enable Remote Config developer mode to allow for frequent refreshes of the cache
  */
  enableDeveloperMode() {
    if (!this.developerModeEnabled) {
      this.log.debug('Enabled developer mode');
      FirebaseRemoteConfig.enableDeveloperMode();
      this.developerModeEnabled = true
    }
  }

  /**
   * Fetches Remote Config data
   * Call activateFetched to make fetched data available in app
   * @returns {*|Promise.<String>}:
   * One of
   *  - remoteConfitFetchStatusSuccess
   *  - remoteConfitFetchStatusFailure
   *  - remoteConfitFetchStatusThrottled
   *   rejects on remoteConfitFetchStatusFailure and remoteConfitFetchStatusThrottled
   *   resolves on remoteConfitFetchStatusSuccess
   */
  fetch() {
    this.log.debug('Fetching remote config data');
    return FirebaseRemoteConfig.fetch();
  }

  /**
   * Fetches Remote Config data and sets a duration that specifies how long config data lasts.
   * Call activateFetched to make fetched data available
   * @param expiration: Duration that defines how long fetched config data is available, in
   * seconds. When the config data expires, a new fetch is required.
   * @returns {*|Promise.<Bool>}
   * One of
   *  - remoteConfitFetchStatusSuccess
   *  - remoteConfitFetchStatusFailure
   *  - remoteConfitFetchStatusThrottled
   *   rejects on remoteConfitFetchStatusFailure and remoteConfitFetchStatusThrottled
   *   resolves on remoteConfitFetchStatusSuccess
   */
  fetchWithExpirationDuration(expiration: Number) {
    this.log.debug(`Fetching remote config data with expiration ${expiration.toString()}`);
    return FirebaseRemoteConfig.fetchWithExpirationDuration(expiration);
  }

  /**
   * Applies Fetched Config data to the Active Config
   * @returns {*|Promise.<Bool>}
   * resolves if there was a Fetched Config, and it was activated,
   * rejects if no Fetched Config was found, or the Fetched Config was already activated.
   */
  activateFetched() {
    this.log.debug('Activating remote config');
    return FirebaseRemoteConfig.activateFetched();
  }

  /**
   * Gets the config value of the default namespace.
   * @param key: Config key
   * @returns {*|Promise.<Object>}, will always resolve
   * Object looks like
   *  {
   *    "stringValue" : stringValue,
   *    "numberValue" : numberValue,
   *    "dataValue" : dataValue,
   *    "boolValue" : boolValue,
   *    "source" : OneOf<String>(remoteConfigSourceRemote|remoteConfigSourceDefault|remoteConfigSourceStatic)
   *  }
   */
  configValueForKey(key: String) {
    return FirebaseRemoteConfig.configValueForKey(key);
  }

  /**
   * Gets the config value of the default namespace.
   * @param key: Config key
   * @returns {*|Promise.<Object>}, will always resolve.
   * Result will be a dictionary of key and config objects
   * Object looks like
   *  {
   *    "stringValue" : stringValue,
   *    "numberValue" : numberValue,
   *    "dataValue" : dataValue,
   *    "boolValue" : boolValue,
   *    "source" : OneOf<String>(remoteConfigSourceRemote|remoteConfigSourceDefault|remoteConfigSourceStatic)
   *  }
   */
  configValuesForKeys(keys: Array<String>) {
    return FirebaseRemoteConfig.configValuesForKeys(keys);
  }

  /**
   * Get the set of parameter keys that start with the given prefix, from the default namespace
   * @param prefix: The key prefix to look for. If prefix is nil or empty, returns all the keys.
   * @returns {*|Promise.<Array<String>>}
   */
  keysWithPrefix(prefix: String) {
    return FirebaseRemoteConfig.keysWithPrefix(prefix);
  }

  /**
   * Sets config defaults for parameter keys and values in the default namespace config.
   * @param defaults: A dictionary mapping a String key to a Object values.
   */
  setDefaults(defaults: Object) {
    FirebaseRemoteConfig.setDefaults(defaults);
  }

  /**
   * Sets default configs from plist for default namespace;
   * @param filename: The plist file name, with no file name extension
   */
  setDefaultsFromPlistFileName(filename: String) {
    FirebaseRemoteConfig.setDefaultsFromPlistFileName(filename);
  }
}
