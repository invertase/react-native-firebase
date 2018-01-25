/**
 * @flow
 * Analytics representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/firebase-app';

const AlphaNumericUnderscore = /^[a-zA-Z0-9_]+$/;

const ReservedEventNames = [
  'app_clear_data',
  'app_uninstall',
  'app_update',
  'error',
  'first_open',
  'in_app_purchase',
  'notification_dismiss',
  'notification_foreground',
  'notification_open',
  'notification_receive',
  'os_update',
  'session_start',
  'user_engagement',
];

export const MODULE_NAME = 'RNFirebaseAnalytics';
export const NAMESPACE = 'analytics';

export default class Analytics extends ModuleBase {
  constructor(app: App) {
    super(app, {
      moduleName: MODULE_NAME,
      multiApp: false,
      namespace: NAMESPACE,
    });
  }

  /**
   * Logs an app event.
   * @param  {string} name
   * @param params
   * @return {Promise}
   */
  logEvent(name: string, params: Object = {}): void {
    // check name is not a reserved event name
    if (ReservedEventNames.includes(name)) {
      throw new Error(
        `event name '${name}' is a reserved event name and can not be used.`
      );
    }

    // name format validation
    if (!AlphaNumericUnderscore.test(name)) {
      throw new Error(
        `Event name '${name}' is invalid. Names should contain 1 to 32 alphanumeric characters or underscores.`
      );
    }

    // maximum number of allowed params check
    if (params && Object.keys(params).length > 25)
      throw new Error('Maximum number of parameters exceeded (25).');

    // Parameter names can be up to 24 characters long and must start with an alphabetic character
    // and contain only alphanumeric characters and underscores. Only String, long and double param
    // types are supported. String parameter values can be up to 36 characters long. The "firebase_"
    // prefix is reserved and should not be used for parameter names.

    getNativeModule(this).logEvent(name, params);
  }

  /**
   * Sets whether analytics collection is enabled for this app on this device.
   * @param enabled
   */
  setAnalyticsCollectionEnabled(enabled: boolean): void {
    getNativeModule(this).setAnalyticsCollectionEnabled(enabled);
  }

  /**
   * Sets the current screen name, which specifies the current visual context in your app.
   * @param screenName
   * @param screenClassOverride
   */
  setCurrentScreen(screenName: string, screenClassOverride: string): void {
    getNativeModule(this).setCurrentScreen(screenName, screenClassOverride);
  }

  /**
   * Sets the minimum engagement time required before starting a session. The default value is 10000 (10 seconds).
   * @param milliseconds
   */
  setMinimumSessionDuration(milliseconds: number = 10000): void {
    getNativeModule(this).setMinimumSessionDuration(milliseconds);
  }

  /**
   * Sets the duration of inactivity that terminates the current session. The default value is 1800000 (30 minutes).
   * @param milliseconds
   */
  setSessionTimeoutDuration(milliseconds: number = 1800000): void {
    getNativeModule(this).setSessionTimeoutDuration(milliseconds);
  }

  /**
   * Sets the user ID property.
   * @param id
   */
  setUserId(id: string): void {
    getNativeModule(this).setUserId(id);
  }

  /**
   * Sets a user property to a given value.
   * @param name
   * @param value
   */
  setUserProperty(name: string, value: string): void {
    getNativeModule(this).setUserProperty(name, value);
  }

  /**
   * Sets a user property to a given value.
   * @RNFirebaseSpecific
   * @param object
   */
  setUserProperties(object: Object): void {
    Object.keys(object).forEach(property => {
      getNativeModule(this).setUserProperty(property, object[property]);
    });
  }
}

export const statics = {};
