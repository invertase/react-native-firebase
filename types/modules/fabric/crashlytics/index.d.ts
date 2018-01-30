/**
 * @flow
 * Crash Reporting representation wrapper
 */
import ModuleBase from '../../../utils/ModuleBase';
import App from '../../core/firebase-app';
export declare const MODULE_NAME = "RNFirebaseCrashlytics";
export default class Crashlytics extends ModuleBase {
    static NAMESPACE: string;
    constructor(app: App);
    /**
     * Forces a crash. Useful for testing your application is set up correctly.
     */
    crash(): void;
    /**
     * Logs a message that will appear in any subsequent crash reports.
     * @param {string} message
     */
    log(message: string): void;
    /**
     * Logs a non fatal exception.
     * @param {string} code
     * @param {string} message
     */
    recordError(code: number, message: string): void;
    /**
     * Set a boolean value to show alongside any subsequent crash reports.
     */
    setBoolValue(key: string, value: boolean): void;
    /**
     * Set a float value to show alongside any subsequent crash reports.
     */
    setFloatValue(key: string, value: number): void;
    /**
     * Set an integer value to show alongside any subsequent crash reports.
     */
    setIntValue(key: string, value: number): void;
    /**
     * Set a string value to show alongside any subsequent crash reports.
     */
    setStringValue(key: string, value: string): void;
    /**
     * Set the user ID to show alongside any subsequent crash reports.
     */
    setUserIdentifier(userId: string): void;
}
export declare const statics: {};
