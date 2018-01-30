/**
 * @flow
 * Analytics representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import App from '../core/firebase-app';
export declare const MODULE_NAME = "RNFirebaseAnalytics";
export default class Analytics extends ModuleBase {
    static NAMESPACE: string;
    constructor(app: App);
    /**
     * Logs an app event.
     * @param  {string} name
     * @param params
     * @return {Promise}
     */
    logEvent(name: string, params?: Object): void;
    /**
     * Sets whether analytics collection is enabled for this app on this device.
     * @param enabled
     */
    setAnalyticsCollectionEnabled(enabled: boolean): void;
    /**
     * Sets the current screen name, which specifies the current visual context in your app.
     * @param screenName
     * @param screenClassOverride
     */
    setCurrentScreen(screenName: string, screenClassOverride: string): void;
    /**
     * Sets the minimum engagement time required before starting a session. The default value is 10000 (10 seconds).
     * @param milliseconds
     */
    setMinimumSessionDuration(milliseconds?: number): void;
    /**
     * Sets the duration of inactivity that terminates the current session. The default value is 1800000 (30 minutes).
     * @param milliseconds
     */
    setSessionTimeoutDuration(milliseconds?: number): void;
    /**
     * Sets the user ID property.
     * @param id
     */
    setUserId(id: string): void;
    /**
     * Sets a user property to a given value.
     * @param name
     * @param value
     */
    setUserProperty(name: string, value: string): void;
    /**
     * Sets a user property to a given value.
     * @RNFirebaseSpecific
     * @param object
     */
    setUserProperties(object: Object): void;
}
export declare const statics: {};
