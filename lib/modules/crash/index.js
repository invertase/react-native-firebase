// @flow
import { NativeModules } from 'react-native';
import { nativeSDKMissing } from './../../utils';

const FirebaseCrash = NativeModules.RNFirebaseCrash;

export default class Crash {
  constructor() {
    if (!FirebaseCrash) {
      return nativeSDKMissing('crash');
    }
  }

  /**
   * Enables/Disables crash reporting
   * @param enabled
   */
  setCrashCollectionEnabled(enabled: boolean): void {
    FirebaseCrash.setCrashCollectionEnabled(enabled);
  }

  /**
   * Returns whether or not crash reporting is currently enabled
   * @returns {Promise.<boolean>}
   */
  isCrashCollectionEnabled(): Promise<boolean> {
    return FirebaseCrash.isCrashCollectionEnabled();
  }

  /**
   * Logs a message that will appear in a subsequent crash report.
   * @param {string} message
   * @param params
   */
  log(message: string): void {
    FirebaseCrash.log(message);
  }

  /**
   * Logs a message that will appear in a subsequent crash report as well as in logcat.
   * NOTE: Android only functionality. iOS will just log the message.
   * @param {string} message
   * @param {number} level
   * @param {string} tag
   */
  logcat(level: number, tag: string, message: string): void {
    FirebaseCrash.logcat(level, tag, message);
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
    if (!error || !error.code || !error.message) return;

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

    FirebaseCrash.report(errorMessage);
  }

  get namespace(): string {
    return 'firebase:crash';
  }
}
