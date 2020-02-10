/**
 * @flow
 * Performance monitoring representation wrapper
 */
import Trace from './Trace';
import HttpMetric from './HttpMetric';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';

export const MODULE_NAME = 'RNFirebasePerformance';
export const NAMESPACE = 'perf';

const HTTP_METHODS = {
  CONNECT: true,
  DELETE: true,
  GET: true,
  HEAD: true,
  OPTIONS: true,
  PATCH: true,
  POST: true,
  PUT: true,
  TRACE: true,
};

type HttpMethod =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export default class PerformanceMonitoring extends ModuleBase {
  constructor(app: App) {
    super(app, {
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      hasCustomUrlSupport: false,
      namespace: NAMESPACE,
    });
  }

  /**
   * Globally enable or disable performance monitoring
   * @param enabled
   * @returns {*}
   */
  setPerformanceCollectionEnabled(enabled: boolean): void {
    if (typeof enabled !== 'boolean') {
      throw new Error(
        'firebase.perf().setPerformanceCollectionEnabled() requires a boolean value'
      );
    }

    return getNativeModule(this).setPerformanceCollectionEnabled(enabled);
  }

  /**
   * Returns a new trace instance
   * @param trace
   */
  newTrace(trace: string): Trace {
    if (typeof trace !== 'string') {
      throw new Error('firebase.perf().newTrace() requires a string value');
    }

    return new Trace(this, trace);
  }

  /**
   * Return a new HttpMetric instance
   * @param url
   * @param httpMethod
   * @returns {HttpMetric}
   */
  newHttpMetric(url: string, httpMethod: HttpMethod): HttpMetric {
    if (typeof url !== 'string' || typeof httpMethod !== 'string') {
      throw new Error(
        'firebase.perf().newHttpMetric() requires url and httpMethod string values'
      );
    }

    if (!HTTP_METHODS[httpMethod]) {
      throw new Error(
        `firebase.perf().newHttpMetric() httpMethod should be one of ${Object.keys(
          HTTP_METHODS
        ).join(', ')}`
      );
    }

    return new HttpMetric(this, url, httpMethod);
  }
}

export const statics = {};
