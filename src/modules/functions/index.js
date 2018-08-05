/**
 * @flow
 * Functions representation wrapper
 */
import ModuleBase from '../../utils/ModuleBase';
import { isObject } from '../../utils';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';
import HttpsError from './HttpsError';

import type {
  HttpsCallable,
  HttpsErrorCode,
  HttpsCallablePromise,
} from './types.flow';

export const NAMESPACE = 'functions';
export const MODULE_NAME = 'RNFirebaseFunctions';

/**
 * -------------
 *   INTERNALS
 * -------------
 */
function errorOrResult(possibleError): HttpsCallablePromise {
  if (isObject(possibleError) && possibleError.__error) {
    const { code, message, details } = possibleError;
    return Promise.reject(
      new HttpsError(
        statics.HttpsErrorCode[code] || statics.HttpsErrorCode.UNKNOWN,
        message,
        details
      )
    );
  }

  return Promise.resolve(possibleError);
}

export default class Functions extends ModuleBase {
  constructor(app: App) {
    super(app, {
      multiApp: false,
      hasShards: false,
      namespace: NAMESPACE,
      moduleName: MODULE_NAME,
    });
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
  httpsCallable(name: string): HttpsCallable {
    return (data?: any): HttpsCallablePromise => {
      const promise = getNativeModule(this).httpsCallable(name, { data });
      return promise.then(errorOrResult);
    };
  }
}

export const statics: { HttpsErrorCode: HttpsErrorCode } = {
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
    DATA_LOSS: 'data-loss',
  },
};
