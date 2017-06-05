/**
 * @flow
 */
import { NativeModules } from 'react-native';

import { Base } from './../base';
import { nativeSDKMissing } from './../../utils';

const FirebaseRemoteConfig = NativeModules.RNFirebaseRemoteConfig;

type RemoteConfigOptions = {}

/**
 * @class Config
 */
export default class RemoteConfig extends Base {
  constructor(firebase: Object, options: RemoteConfigOptions = {}) {
    super(firebase, options);
    if (!FirebaseRemoteConfig) {
      return nativeSDKMissing('remote config');
    }

    this.namespace = 'firebase:config';
    this.developerModeEnabled = false;
  }

  /**
   * Converts a native map to single JS value
   * @param nativeValue
   * @returns {*}
   * @private
   */
  _nativeValueToJS(nativeValue) {
    return {
      source: nativeValue.source,
      val() {
        if (nativeValue.boolValue !== null && (nativeValue.stringValue === 'true' || nativeValue.stringValue === 'false' || nativeValue.stringValue === null)) return nativeValue.boolValue;
        if (nativeValue.numberValue !== null && (nativeValue.stringValue == null || nativeValue.stringValue === '' || `${nativeValue.numberValue}` === nativeValue.stringValue)) return nativeValue.numberValue;
        if (nativeValue.dataValue !== nativeValue.stringValue && (nativeValue.stringValue == null || nativeValue.stringValue === '')) return nativeValue.dataValue;
        return nativeValue.stringValue;
      },
    };
  }

  /**
   * Enable Remote Config developer mode to allow for frequent refreshes of the cache
   */
  enableDeveloperMode() {
    if (!this.developerModeEnabled) {
      this.log.debug('Enabled developer mode');
      FirebaseRemoteConfig.enableDeveloperMode();
      this.developerModeEnabled = true;
    }
  }

  /**
   * Fetches Remote Config data
   * Call activateFetched to make fetched data available in app
   * @returns {*|Promise.<String>}:
   */
  fetch(expiration?: number) {
    if (expiration !== undefined) {
      this.log.debug(`Fetching remote config data with expiration ${expiration.toString()}`);
      return FirebaseRemoteConfig.fetchWithExpirationDuration(expiration);
    }
    this.log.debug('Fetching remote config data');
    return FirebaseRemoteConfig.fetch();
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
  getValue(key: String) {
    return FirebaseRemoteConfig
      .getValue(key || '')
      .then(this._nativeValueToJS);
  }

  /**
   * Gets the config value of the default namespace.
   * @param keys: Config key
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
  getValues(keys: Array<String>) {
    return FirebaseRemoteConfig
      .getValues(keys || [])
      .then((nativeValues) => {
        const values:{[String]: Object} = {};
        for (let i = 0, len = keys.length; i < len; i++) {
          values[keys[i]] = this._nativeValueToJS(nativeValues[i]);
        }
        return values;
      });
  }

  /**
   * Get the set of parameter keys that start with the given prefix, from the default namespace
   * @param prefix: The key prefix to look for. If prefix is nil or empty, returns all the keys.
   * @returns {*|Promise.<Array<String>>}
   */
  getKeysByPrefix(prefix?: String) {
    return FirebaseRemoteConfig.getKeysByPrefix(prefix);
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
   * @param resource: The plist file name or resource ID
   */
  setDefaultsFromResource(resource: String | number) {
    FirebaseRemoteConfig.setDefaultsFromResource(resource);
  }
}
