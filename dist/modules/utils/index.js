import { NativeModules } from 'react-native';
import INTERNALS from '../../utils/internals';
import { isIOS } from '../../utils';
import ModuleBase from '../../utils/ModuleBase';
import DatabaseUtils from './database';
const FirebaseCoreModule = NativeModules.RNFirebase;
export const MODULE_NAME = 'RNFirebaseUtils';
export const NAMESPACE = 'utils';
export default class RNFirebaseUtils extends ModuleBase {
  constructor(app) {
    super(app, {
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      hasCustomUrlSupport: false,
      namespace: NAMESPACE
    });
  }

  get database() {
    return DatabaseUtils;
  }
  /**
   *
   */


  checkPlayServicesAvailability() {
    if (isIOS) return;
    const {
      status
    } = this.playServicesAvailability;

    if (!this.playServicesAvailability.isAvailable) {
      if (INTERNALS.OPTIONS.promptOnMissingPlayServices && this.playServicesAvailability.isUserResolvableError) {
        this.promptForPlayServices();
      } else {
        const error = INTERNALS.STRINGS.ERROR_PLAY_SERVICES(status);

        if (INTERNALS.OPTIONS.errorOnMissingPlayServices) {
          if (status === 2) console.warn(error); // only warn if it exists but may need an update
          else throw new Error(error);
        } else {
          console.warn(error);
        }
      }
    }
  }

  getPlayServicesStatus() {
    if (isIOS) return Promise.resolve(null);
    return FirebaseCoreModule.getPlayServicesStatus();
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
  /**
   * Set the global logging level for all logs.
   *
   * @param logLevel
   */


  set logLevel(logLevel) {
    INTERNALS.OPTIONS.logLevel = logLevel;
  }
  /**
   * Returns props from the android GoogleApiAvailability sdk
   * @android
   * @return {RNFirebase.GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
   */


  get playServicesAvailability() {
    return FirebaseCoreModule.playServicesAvailability || {
      isAvailable: true,
      status: 0
    };
  }
  /**
   * Enable/Disable throwing an error or warning on detecting a play services problem
   * @android
   * @param bool
   */


  set errorOnMissingPlayServices(bool) {
    INTERNALS.OPTIONS.errorOnMissingPlayServices = bool;
  }
  /**
   * Enable/Disable automatic prompting of the play services update dialog
   * @android
   * @param bool
   */


  set promptOnMissingPlayServices(bool) {
    INTERNALS.OPTIONS.promptOnMissingPlayServices = bool;
  }

}
export const statics = {};