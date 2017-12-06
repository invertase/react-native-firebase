/**
 * @flow
 * Crash Reporting representation wrapper
 */
import ModuleBase from '../../../utils/ModuleBase';

import type FirebaseApp from '../../core/firebase-app';

export default class Crashlytics extends ModuleBase {
  static _NAMESPACE = 'crashlytics';
  static _NATIVE_MODULE = 'RNFirebaseCrashlytics';

  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options);
  }

  /**
   * Forces a crash. Useful for testing your application is set up correctly.
   */
  crash(): void {
    this._native.crash();
  }

  /**
   * Logs a message that will appear in any subsequent crash reports.
   * @param {string} message
   */
  log(message: string): void {
    this._native.log(message);
  }

  /**
   * Logs a non fatal exception.
   * @param {string} code
   * @param {string} message
   */
  recordError(code: number, message: string): void {
    this._native.recordError(code, message);
  }

  /**
   * Set a boolean value to show alongside any subsequent crash reports.
   */
  setBoolValue(key: string, value: boolean): void {
    this._native.setBoolValue(key, value);
  }

  /**
   * Set a float value to show alongside any subsequent crash reports.
   */
  setFloatValue(key: string, value: number): void {
    this._native.setFloatValue(key, value);
  }

  /**
   * Set an integer value to show alongside any subsequent crash reports.
   */
  setIntValue(key: string, value: number): void {
    this._native.setIntValue(key, value);
  }

  /**
   * Set a string value to show alongside any subsequent crash reports.
   */
  setStringValue(key: string, value: string): void {
    this._native.setStringValue(key, value);
  }

  /**
   * Set the user ID to show alongside any subsequent crash reports.
   */
  setUserIdentifier(userId: string): void {
    this._native.setUserIdentifier(userId);
  }
}

export const statics = {};
