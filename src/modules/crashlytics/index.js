/**
 * @flow
 * Crash Reporting representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';

export const MODULE_NAME = 'RNFirebaseCrashlytics';
export const NAMESPACE = 'crashlytics';

export default class Crashlytics extends ModuleBase {
  constructor(app: App) {
    super(app, {
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      hasCustomUrlSupport: false,
      namespace: NAMESPACE,
    });
  }

  /**
   * Forces a crash. Useful for testing your application is set up correctly.
   */
  crash(): void {
    getNativeModule(this).crash();
  }

  /**
   * Logs a message that will appear in any subsequent crash reports.
   * @param {string} message
   */
  log(message: string): void {
    getNativeModule(this).log(message);
  }

  /**
   * Logs a non fatal exception.
   * @param {string} code
   * @param {string} message
   */
  recordError(code: number, message: string): void {
    getNativeModule(this).recordError(code, message);
  }

  /**
   * Set a boolean value to show alongside any subsequent crash reports.
   */
  setBoolValue(key: string, value: boolean): void {
    getNativeModule(this).setBoolValue(key, value);
  }

  /**
   * Set a float value to show alongside any subsequent crash reports.
   */
  setFloatValue(key: string, value: number): void {
    getNativeModule(this).setFloatValue(key, value);
  }

  /**
   * Set an integer value to show alongside any subsequent crash reports.
   */
  setIntValue(key: string, value: number): void {
    getNativeModule(this).setIntValue(key, value);
  }

  /**
   * Set a string value to show alongside any subsequent crash reports.
   */
  setStringValue(key: string, value: string): void {
    getNativeModule(this).setStringValue(key, value);
  }

  /**
   * Set the user ID to show alongside any subsequent crash reports.
   */
  setUserIdentifier(userId: string): void {
    getNativeModule(this).setUserIdentifier(userId);
  }

  /**
   * Enable Crashlytics reporting. Only avaliable when disabled automatic initialization
   */
  enableCrashlyticsCollection(): void {
    getNativeModule(this).enableCrashlyticsCollection();
  }
}

export const statics = {};
