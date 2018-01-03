/**
 * @flow
 * Performance monitoring representation wrapper
 */
import Trace from './Trace';
import ModuleBase from '../../utils/ModuleBase';

import type FirebaseApp from '../core/firebase-app';

export const MODULE_NAME = 'RNFirebasePerformance';
export const NAMESPACE = 'perf';

export default class PerformanceMonitoring extends ModuleBase {
  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options, {
      moduleName: MODULE_NAME,
      namespace: NAMESPACE,
    });
  }

  /**
   * Globally enable or disable performance monitoring
   * @param enabled
   * @returns {*}
   */
  setPerformanceCollectionEnabled(enabled: boolean): void {
    this._native.setPerformanceCollectionEnabled(enabled);
  }

  /**
   * Returns a new trace instance
   * @param trace
   */
  newTrace(trace: string): Trace {
    return new Trace(this, trace);
  }
}

export const statics = {};
