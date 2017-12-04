/**
 * @flow
 * Trace representation wrapper
 */
import type PerformanceMonitoring from './';

export default class Trace {
  identifier: string;
  perf: PerformanceMonitoring;

  constructor(perf: PerformanceMonitoring, identifier: string) {
    this.perf = perf;
    this.identifier = identifier;
  }

  start(): void {
    this.perf._native.start(this.identifier);
  }

  stop(): void {
    this.perf._native.stop(this.identifier);
  }

  incrementCounter(event: string): void {
    this.perf._native.incrementCounter(this.identifier, event);
  }
}
