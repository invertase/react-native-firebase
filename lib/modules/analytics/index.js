// @flow
import { NativeModules } from 'react-native';
import { Base } from './../base';

const FirebaseAnalytics = NativeModules.RNFirebaseAnalytics;
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

export default class Analytics extends Base {
  /**
   * Logs an app event.
   * @param  {string} name
   * @param params
   * @return {Promise}
   */
  logEvent(name: string, params: Object = {}): void {
    // check name is not a reserved event name
    if (ReservedEventNames.includes(name)) {
      throw new Error(`event name '${name}' is a reserved event name and can not be used.`);
    }

    // name format validation
    if (!AlphaNumericUnderscore.test(name)) {
      throw new Error(`Event name '${name}' is invalid. Names should contain 1 to 32 alphanumeric characters or underscores.`);
    }

    // maximum number of allowed params check
    if (params && Object.keys(params).length > 25) throw new Error('Maximum number of parameters exceeded (25).');

    // TODO validate param names and values
    // Parameter names can be up to 24 characters long and must start with an alphabetic character
    // and contain only alphanumeric characters and underscores. Only String, long and double param
    // types are supported. String parameter values can be up to 36 characters long. The "firebase_"
    // prefix is reserved and should not be used for parameter names.

    return FirebaseAnalytics.logEvent(name, params);
  }

  /**
   * Sets whether analytics collection is enabled for this app on this device.
   * @param enabled
   */
  setAnalyticsCollectionEnabled(enabled: boolean): void {
    return FirebaseAnalytics.setAnalyticsCollectionEnabled(enabled);
  }

  /**
   * Sets the current screen name, which specifies the current visual context in your app.
   * @param screenName
   * @param screenClassOverride
   */
  setCurrentScreen(screenName: string, screenClassOverride: string): void {
    return FirebaseAnalytics.setCurrentScreen(screenName, screenClassOverride);
  }

  /**
   * Sets the minimum engagement time required before starting a session. The default value is 10000 (10 seconds).
   * @param milliseconds
   */
  setMinimumSessionDuration(milliseconds: number = 10000): void {
    return FirebaseAnalytics.setMinimumSessionDuration(milliseconds);
  }

  /**
   * Sets the duration of inactivity that terminates the current session. The default value is 1800000 (30 minutes).
   * @param milliseconds
   */
  setSessionTimeoutDuration(milliseconds: number = 1800000): void {
    return FirebaseAnalytics.setSessionTimeoutDuration(milliseconds);
  }

  /**
   * Sets the user ID property.
   * @param id
   */
  setUserId(id: string): void {
    return FirebaseAnalytics.setUserId(id);
  }

  /**
   * Sets a user property to a given value.
   * @param name
   * @param value
   */
  setUserProperty(name: string, value: string): void {
    return FirebaseAnalytics.setUserProperty(name, value);
  }

  /**
   * Sets a user property to a given value.
   * @param object
   */
  setUserProperties(object: Object): void {
    for (const property of Object.keys(object)) {
      FirebaseAnalytics.setUserProperty(property, object[property]);
    }
  }

  get namespace(): string {
    return 'firebase:analytics';
  }
}
