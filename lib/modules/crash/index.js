/**
 * @flow
 * Crash Reporting representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';

import type FirebaseApp from '../core/firebase-app';
import type { FirebaseError } from '../../types';

export const MODULE_NAME = 'RNFirebaseCrash';
export const NAMESPACE = 'crash';

export default class Crash extends ModuleBase {
  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options, {
      moduleName: MODULE_NAME,
      namespace: NAMESPACE,
    });
  }

  /**
   * Enables/Disables crash reporting
   * @param enabled
   */
  setCrashCollectionEnabled(enabled: boolean): void {
    this._native.setCrashCollectionEnabled(enabled);
  }

  /**
   * Returns whether or not crash reporting is currently enabled
   * @returns {Promise.<boolean>}
   */
  isCrashCollectionEnabled(): Promise<boolean> {
    return this._native.isCrashCollectionEnabled();
  }

  /**
   * Logs a message that will appear in a subsequent crash report.
   * @param {string} message
   */
  log(message: string): void {
    this._native.log(message);
  }

  /**
   * Logs a message that will appear in a subsequent crash report as well as in logcat.
   * NOTE: Android only functionality. iOS will just log the message.
   * @param {string} message
   * @param {number} level
   * @param {string} tag
   */
  logcat(level: number, tag: string, message: string): void {
    this._native.logcat(level, tag, message);
  }

  /**
   * Generates a crash report for the given message. This method should be used for unexpected
   * exceptions where recovery is not possible.
   * NOTE: on iOS, this will cause the app to crash as it's the only way to ensure the exception
   * gets sent to Firebase.  Otherwise it just gets lost as a log message.
   * @param {Error} error
   * @param maxStackSize
   */
  report(error: FirebaseError, maxStackSize: number = 10): void {
    if (!error || !error.message) return;

    let errorMessage = `Message: ${error.message}\r\n`;

    if (error.code) {
      errorMessage = `${errorMessage}Code: ${error.code}\r\n`;
    }

    const stackRows = error.stack.split('\n');
    errorMessage = `${errorMessage}\r\nStack: \r\n`;
    for (let i = 0, len = stackRows.length; i < len; i++) {
      if (i === maxStackSize) break;
      errorMessage = `${errorMessage}  -  ${stackRows[i]}\r\n`;
    }

    this._native.report(errorMessage);
  }
}

export const statics = {};
