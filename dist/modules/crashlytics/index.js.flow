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
    if (typeof message === 'string') {
      getNativeModule(this).log(message);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Logs a non fatal exception.
   * @param {number} code
   * @param {string} message
   */
  recordError(code: number, message: string): void {
    if (typeof code === 'number' && typeof message === 'string') {
      getNativeModule(this).recordError(code, message);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Logs a custom non fatal exception.
   * @param {string} name
   * @param {string} message
   * @param {Object[]} stack Optional
   */
  recordCustomError(name: string, message: string, stack?: Object[]): void {
    if (typeof stack === 'undefined') {
      if (typeof name === 'string' && typeof message === 'string') {
        getNativeModule(this).recordCustomError(name, message, []);
      } else {
        throw new Error('Invalid parameter type!');
      }
    } else if (
      typeof name === 'string' &&
      typeof message === 'string' &&
      Array.isArray(stack)
    ) {
      let hasKey = true;

      stack.forEach(v => {
        if (!Object.prototype.hasOwnProperty.call(v, 'fileName')) {
          hasKey = false;
        }
      });

      if (hasKey) {
        getNativeModule(this).recordCustomError(name, message, stack);
      } else {
        throw new Error('Missing required argument fileName!');
      }
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Set a boolean value to show alongside any subsequent crash reports.
   */
  setBoolValue(key: string, value: boolean): void {
    if (typeof key === 'string' && typeof value === 'boolean') {
      getNativeModule(this).setBoolValue(key, value);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Set a float value to show alongside any subsequent crash reports.
   */
  setFloatValue(key: string, value: number): void {
    if (typeof key === 'string' && typeof value === 'number') {
      getNativeModule(this).setFloatValue(key, value);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Set an integer value to show alongside any subsequent crash reports.
   */
  setIntValue(key: string, value: number): void {
    if (typeof key === 'string' && typeof value === 'number') {
      getNativeModule(this).setIntValue(key, value);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Set a string value to show alongside any subsequent crash reports.
   */
  setStringValue(key: string, value: string): void {
    if (typeof key === 'string' && typeof value === 'string') {
      getNativeModule(this).setStringValue(key, value);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Set the user ID to show alongside any subsequent crash reports.
   */
  setUserIdentifier(userId: string): void {
    if (typeof userId === 'string') {
      getNativeModule(this).setUserIdentifier(userId);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Set the user name to show alongside any subsequent crash reports.
   */
  setUserName(userName: string): void {
    if (typeof userName === 'string') {
      return getNativeModule(this).setUserName(userName);
    }
    throw new Error('Invalid parameter type!');
  }

  /**
   * Set the user email to show alongside any subsequent crash reports.
   */
  setUserEmail(userEmail: string): void {
    if (typeof userEmail === 'string') {
      getNativeModule(this).setUserEmail(userEmail);
    } else {
      throw new Error('Invalid parameter type!');
    }
  }

  /**
   * Enable Crashlytics reporting. Only avaliable when disabled automatic initialization
   */
  enableCrashlyticsCollection(): void {
    getNativeModule(this).enableCrashlyticsCollection();
  }
}

export const statics = {};
