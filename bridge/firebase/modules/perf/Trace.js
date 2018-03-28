/**
 * @flow
 * Trace representation wrapper
 */
import { getNativeModule } from '../../utils/native';
import type PerformanceMonitoring from './';

export default class Trace {
  identifier: string;
  _perf: PerformanceMonitoring;

  constructor(perf: PerformanceMonitoring, identifier: string) {
    this._perf = perf;
    this.identifier = identifier;
  }

  start(): void {
    getNativeModule(this._perf).start(this.identifier);
  }

  stop(): void {
    getNativeModule(this._perf).stop(this.identifier);
  }

  incrementCounter(event: string): void {
    getNativeModule(this._perf).incrementCounter(this.identifier, event);
  }
}
