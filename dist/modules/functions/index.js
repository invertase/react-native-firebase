/**
 * 
 * Functions representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import { isObject } from '../../utils';
import { getNativeModule } from '../../utils/native';
import firebase from '../core/firebase';
import HttpsError from './HttpsError';
export const NAMESPACE = 'functions';
export const MODULE_NAME = 'RNFirebaseFunctions';
/**
 * -------------
 *   INTERNALS
 * -------------
 */

function errorOrResult(possibleError) {
  if (isObject(possibleError) && possibleError.__error) {
    const {
      code,
      message,
      details
    } = possibleError;
    return Promise.reject(new HttpsError(statics.HttpsErrorCode[code] || statics.HttpsErrorCode.UNKNOWN, message, details));
  }

  return Promise.resolve(possibleError);
}
/**
 * -------------
 *  functions()
 * -------------
 */


export default class Functions extends ModuleBase {
  constructor(appOrRegion, region) {
    let _app = appOrRegion;

    let _region = region || 'us-central1';

    if (typeof _app === 'string') {
      _region = _app;
      _app = firebase.app();
    }

    super(_app, {
      hasMultiAppSupport: true,
      hasCustomUrlSupport: false,
      hasRegionsSupport: true,
      namespace: NAMESPACE,
      moduleName: MODULE_NAME
    }, _region);
  }
  /**
   * -------------
   *  PUBLIC API
   * -------------
   */

  /**
   * Returns a reference to the callable https trigger with the given name.
   * @param name The name of the trigger.
   */


  httpsCallable(name) {
    return data => {
      const promise = getNativeModule(this).httpsCallable(name, {
        data
      });
      return promise.then(errorOrResult);
    };
  }
  /**
   * Changes this instance to point to a Cloud Functions emulator running
   * locally.
   *
   * See https://firebase.google.com/docs/functions/local-emulator
   *
   * @param origin the origin string of the local emulator started via firebase tools
   * "http://10.0.0.8:1337".
   */


  useFunctionsEmulator(origin) {
    return getNativeModule(this).useFunctionsEmulator(origin);
  }

}
export const statics = {
  HttpsErrorCode: {
    OK: 'ok',
    CANCELLED: 'cancelled',
    UNKNOWN: 'unknown',
    INVALID_ARGUMENT: 'invalid-argument',
    DEADLINE_EXCEEDED: 'deadline-exceeded',
    NOT_FOUND: 'not-found',
    ALREADY_EXISTS: 'already-exists',
    PERMISSION_DENIED: 'permission-denied',
    UNAUTHENTICATED: 'unauthenticated',
    RESOURCE_EXHAUSTED: 'resource-exhausted',
    FAILED_PRECONDITION: 'failed-precondition',
    ABORTED: 'aborted',
    OUT_OF_RANGE: 'out-of-range',
    UNIMPLEMENTED: 'unimplemented',
    INTERNAL: 'internal',
    UNAVAILABLE: 'unavailable',
    DATA_LOSS: 'data-loss'
  }
};