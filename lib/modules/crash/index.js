// @flow
import { NativeModules } from 'react-native';
import { Base } from './../base';

const FirebaseCrash = NativeModules.RNFirebaseCrash;

export default class Analytics extends Base {
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
   * @param {string} message
   */
  report(message: string): void {
    FirebaseCrash.report(message);
  }

  get namespace(): string {
    return 'firebase:crash';
  }
}
