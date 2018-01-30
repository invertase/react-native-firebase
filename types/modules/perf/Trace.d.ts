import PerformanceMonitoring from './';
export default class Trace {
    identifier: string;
    _perf: PerformanceMonitoring;
    constructor(perf: PerformanceMonitoring, identifier: string);
    start(): void;
    stop(): void;
    incrementCounter(event: string): void;
}
