// @flow
import { NativeModules } from 'react-native';
import { Base } from './../base';
import Trace from './Trace';

const FirebasePerformance = NativeModules.RNFirebasePerformance;

export default class PerformanceMonitoring extends Base {

  /**
   * Globally enable or disable performance monitoring
   * @param enabled
   * @returns {*}
   */
  setPerformanceCollectionEnabled(enabled: boolean) {
    return FirebasePerformance.setPerformanceCollectionEnabled(enabled);
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
