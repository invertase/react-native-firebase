// @flow
import { NativeModules } from 'react-native';
import INTERNALS from '../../utils/internals';
import { isIOS } from '../../utils';
import ModuleBase from '../../utils/ModuleBase';
import type App from '../core/app';
import DatabaseUtils from './database';

const FirebaseCoreModule = NativeModules.RNFirebase;

type GoogleApiAvailabilityType = {
  status: number,
  isAvailable: boolean,
  isUserResolvableError?: boolean,
  hasResolution?: boolean,
  error?: string,
};

export const MODULE_NAME = 'RNFirebaseUtils';
export const NAMESPACE = 'utils';

export default class RNFirebaseUtils extends ModuleBase {
  constructor(app: App) {
    super(app, {
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      hasCustomUrlSupport: false,
      namespace: NAMESPACE,
    });
  }

  get database(): DatabaseUtils {
    return DatabaseUtils;
  }

  /**
   *
   */
  checkPlayServicesAvailability() {
    if (isIOS) return;

    const { status } = this.playServicesAvailability;

    if (!this.playServicesAvailability.isAvailable) {
      if (
        INTERNALS.OPTIONS.promptOnMissingPlayServices &&
        this.playServicesAvailability.isUserResolvableError
      ) {
        this.promptForPlayServices();
      } else {
        const error = INTERNALS.STRINGS.ERROR_PLAY_SERVICES(status);
        if (INTERNALS.OPTIONS.errorOnMissingPlayServices) {
          if (status === 2) console.warn(error);
          // only warn if it exists but may need an update
          else throw new Error(error);
        } else {
          console.warn(error);
        }
      }
    }
  }

  getPlayServicesStatus(): Promise<GoogleApiAvailabilityType | null> {
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
  set logLevel(logLevel: string) {
    INTERNALS.OPTIONS.logLevel = logLevel;
  }

  /**
   * Returns props from the android GoogleApiAvailability sdk
   * @android
   * @return {RNFirebase.GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
   */
  get playServicesAvailability(): GoogleApiAvailabilityType {
    return (
      FirebaseCoreModule.playServicesAvailability || {
        isAvailable: true,
        status: 0,
      }
    );
  }

  /**
   * Enable/Disable throwing an error or warning on detecting a play services problem
   * @android
   * @param bool
   */
  set errorOnMissingPlayServices(bool: boolean) {
    INTERNALS.OPTIONS.errorOnMissingPlayServices = bool;
  }

  /**
   * Enable/Disable automatic prompting of the play services update dialog
   * @android
   * @param bool
   */
  set promptOnMissingPlayServices(bool: boolean) {
    INTERNALS.OPTIONS.promptOnMissingPlayServices = bool;
  }
}

export const statics = {};
