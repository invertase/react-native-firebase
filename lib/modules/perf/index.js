// @flow
import { Base } from './../base';
import Trace from './Trace';

export default class PerformanceMonitoring extends Base {

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
