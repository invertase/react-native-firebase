// @flow
import { NativeModules } from 'react-native';
// import { version as ReactVersion } from 'react';
// import ReactNativeVersion from 'react-native/Libraries/Core/ReactNativeVersion';

import INTERNALS from './../../internals';
import { isIOS } from './../../utils';
import PACKAGE from './../../../package.json';

const FirebaseCoreModule = NativeModules.RNFirebase;

export default class RNFirebaseUtils {
  static _NAMESPACE = 'utils';
  static _NATIVE_DISABLED = true;
  static _NATIVE_MODULE = 'RNFirebaseUtils';

  /**
   *
   */
  checkPlayServicesAvailability() {
    if (isIOS) return null;

    const code = this.playServicesAvailability.code;

    if (!this.playServicesAvailability.isAvailable) {
      if (INTERNALS.OPTIONS.promptOnMissingPlayServices && this.playServicesAvailability.isUserResolvableError) {
        this.promptForPlayServices();
      } else {
        const error = INTERNALS.STRINGS.ERROR_PLAY_SERVICES(code);
        if (INTERNALS.OPTIONS.errorOnMissingPlayServices) {
          if (code === 2) console.warn(error); // only warn if it exists but may need an update
          else throw new Error(error);
        } else {
          console.warn(error);
        }
      }
    }

    return null;
  }

  promptForPlayServices() {
    if (isIOS) return null;
    return FirebaseCoreModule.promptForPlayServices();
  }

  resolutionForPlayServices() {
    if (isIOS) return null;
    return FirebaseCoreModule.resolutionForPlayServices();
  }

  makePlayServicesAvailable() {
    if (isIOS) return null;
    return FirebaseCoreModule.makePlayServicesAvailable();
  }

  get sharedEventEmitter(): Object {
    return INTERNALS.SharedEventEmitter;
  }

  /**
   * Set the global logging level for all logs.
   *
   * @param booleanOrDebugString
   */
  set logLevel(booleanOrDebugString) {
    INTERNALS.OPTIONS.logLevel = booleanOrDebugString;
  }


  /**
   * Returns an array of all current database registrations id strings
   */
  get databaseRegistrations(): Array<string> {
    return Object.keys(INTERNALS.SyncTree._reverseLookup);
  }

  /**
   * Call with a registration id string to get the details off this reg
   */
  get getDatabaseRegistrationDetails(): Function {
    return INTERNALS.SyncTree.getRegistration.bind(INTERNALS.SyncTree);
  }

  /**
   * Accepts an array or a single string of registration ids.
   * This will remove the refs on both the js and native sides and their listeners.
   * @return {function(this:T)}
   */
  get removeDatabaseRegistration(): Function {
    return INTERNALS.SyncTree.removeListenersForRegistrations.bind(INTERNALS.SyncTree);
  }

  /**
   * Returns props from the android GoogleApiAvailability sdk
   * @android
   * @return {RNFirebase.GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
   */
  get playServicesAvailability(): GoogleApiAvailabilityType {
    return FirebaseCoreModule.playServicesAvailability || { isAvailable: true, status: 0 };
  }

  /**
   * Enable/Disable throwing an error or warning on detecting a play services problem
   * @android
   * @param bool
   */
  set errorOnMissingPlayServices(bool: Boolean) {
    INTERNALS.OPTIONS.errorOnMissingPlayServices = bool;
  }

  /**
   * Enable/Disable automatic prompting of the play services update dialog
   * @android
   * @param bool
   */
  set promptOnMissingPlayServices(bool: Boolean) {
    INTERNALS.OPTIONS.promptOnMissingPlayServices = bool;
  }
}


export const statics = {
  DEFAULT_APP_NAME: INTERNALS.STRINGS.DEFAULT_APP_NAME,
  // VERSIONS: {
  //   react: ReactVersion,
  //   'react-native': Object.values(ReactNativeVersion.version).slice(0, 3).join('.'),
  //   'react-native-firebase': PACKAGE.version,
  // },
};

