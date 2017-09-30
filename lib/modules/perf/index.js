// @flow
import Trace from './Trace';
import ModuleBase from '../../utils/ModuleBase';

export default class PerformanceMonitoring extends ModuleBase {
  static _NAMESPACE = 'perf';
  static _NATIVE_MODULE = 'RNFirebasePerformance';

  _native: Object;

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options);
  }

  /**
   * Globally enable or disable performance monitoring
   * @param enabled
   * @returns {*}
   */
  setPerformanceCollectionEnabled(enabled: boolean) {
    return this._native.setPerformanceCollectionEnabled(enabled);
  }

  /**
   * Returns a new trace instance
   * @param trace
   */
  newTrace(trace: string): void {
    return new Trace(this, trace);
  }
}
