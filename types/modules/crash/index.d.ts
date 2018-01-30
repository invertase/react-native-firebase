/**
 * @flow
 * Crash Reporting representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import App from '../core/firebase-app';
import { FirebaseError } from '../../types';
export declare const MODULE_NAME = "RNFirebaseCrash";
export default class Crash extends ModuleBase {
    static NAMESPACE: string;
    constructor(app: App);
    /**
     * Enables/Disables crash reporting
     * @param enabled
     */
    setCrashCollectionEnabled(enabled: boolean): void;
    /**
     * Returns whether or not crash reporting is currently enabled
     * @returns {Promise.<boolean>}
     */
    isCrashCollectionEnabled(): Promise<boolean>;
    /**
     * Logs a message that will appear in a subsequent crash report.
     * @param {string} message
     */
    log(message: string): void;
    /**
     * Logs a message that will appear in a subsequent crash report as well as in logcat.
     * NOTE: Android only functionality. iOS will just log the message.
     * @param {string} message
     * @param {number} level
     * @param {string} tag
     */
    logcat(level: number, tag: string, message: string): void;
    /**
     * Generates a crash report for the given message. This method should be used for unexpected
     * exceptions where recovery is not possible.
     * NOTE: on iOS, this will cause the app to crash as it's the only way to ensure the exception
     * gets sent to Firebase.  Otherwise it just gets lost as a log message.
     * @param {Error} error
     * @param maxStackSize
     */
    report(error: FirebaseError, maxStackSize?: number): void;
}
export declare const statics: {};
