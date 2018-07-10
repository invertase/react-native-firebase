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

export default class PerformanceMonitoring extends ModuleBase {
  constructor(app: App) {
    super(app, {
      moduleName: MODULE_NAME,
      multiApp: false,
      hasShards: false,
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

  newHttpMetric(url: string, httpMethod: string) {
    if (typeof url !== 'string' || typeof httpMethod !== 'string') {
      throw new Error(
        'firebase.perf().newHttpMetric() requires url and httpMethod string values'
      );
    }

    return new HttpMetric(this, url, httpMethod);
  }
}

export const statics = {};
