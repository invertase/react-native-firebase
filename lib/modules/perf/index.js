// @flow
import Trace from './Trace';
import ModuleBase from '../../utils/ModuleBase';

export default class PerformanceMonitoring extends ModuleBase {
  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, 'Perf');
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

  get namespace(): string {
    return 'firebase:perf';
  }
}
