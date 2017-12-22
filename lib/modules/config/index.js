/**
 * @flow
 * Remote Config representation wrapper
 */
import { getLogger } from '../../utils/log';
import ModuleBase from './../../utils/ModuleBase';

import type FirebaseApp from '../core/firebase-app';

type NativeValue = {
  stringValue?: string,
  numberValue?: number,
  dataValue?: Object,
  boolValue?: boolean,
  source: 'remoteConfigSourceRemote' | 'remoteConfigSourceDefault' | ' remoteConfigSourceStatic',
}

/**
 * @class Config
 */
export default class RemoteConfig extends ModuleBase {
  static _NAMESPACE = 'config';
  static _NATIVE_MODULE = 'RNFirebaseRemoteConfig';

  _developerModeEnabled: boolean;

  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options);
    this._developerModeEnabled = false;
  }

  /**
   * Converts a native map to single JS value
   * @param nativeValue
   * @returns {*}
   * @private
   */
  _nativeValueToJS(nativeValue: NativeValue) {
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
    if (!this._developerModeEnabled) {
      getLogger(this).debug('Enabled developer mode');
      this._native.enableDeveloperMode();
      this._developerModeEnabled = true;
    }
  }

  /**
   * Fetches Remote Config data
   * Call activateFetched to make fetched data available in app
   * @returns {*|Promise.<String>}:
   */
  fetch(expiration?: number) {
    if (expiration !== undefined) {
      getLogger(this).debug(`Fetching remote config data with expiration ${expiration.toString()}`);
      return this._native.fetchWithExpirationDuration(expiration);
    }
    getLogger(this).debug('Fetching remote config data');
    return this._native.fetch();
  }

  /**
   * Applies Fetched Config data to the Active Config
   * @returns {*|Promise.<Bool>}
   * resolves if there was a Fetched Config, and it was activated,
   * rejects if no Fetched Config was found, or the Fetched Config was already activated.
   */
  activateFetched() {
    getLogger(this).debug('Activating remote config');
    return this._native.activateFetched();
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
    return this._native
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
    return this._native
      .getValues(keys || [])
      .then((nativeValues) => {
        const values: { [String]: Object } = {};
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
    return this._native.getKeysByPrefix(prefix);
  }

  /**
   * Sets config defaults for parameter keys and values in the default namespace config.
   * @param defaults: A dictionary mapping a String key to a Object values.
   */
  setDefaults(defaults: Object) {
    this._native.setDefaults(defaults);
  }

  /**
   * Sets default configs from plist for default namespace;
   * @param resource: The plist file name or resource ID
   */
  setDefaultsFromResource(resource: String | number) {
    this._native.setDefaultsFromResource(resource);
  }
}

export const statics = {};
