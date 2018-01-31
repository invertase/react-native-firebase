import PerformanceMonitoring from './';
export default class Trace {
    identifier: string;
    private _perf;
    constructor(perf: PerformanceMonitoring, identifier: string);
    start(): void;
    stop(): void;
    incrementCounter(event: string): void;
}
