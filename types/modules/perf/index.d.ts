/**
 * @flow
 * Performance monitoring representation wrapper
 */
import Trace from './Trace';
import ModuleBase from '../../utils/ModuleBase';
import App from '../core/firebase-app';
export declare const MODULE_NAME = "RNFirebasePerformance";
export default class PerformanceMonitoring extends ModuleBase {
    static NAMESPACE: string;
    constructor(app: App);
    /**
     * Globally enable or disable performance monitoring
     * @param enabled
     * @returns {*}
     */
    setPerformanceCollectionEnabled(enabled: boolean): void;
    /**
     * Returns a new trace instance
     * @param trace
     */
    newTrace(trace: string): Trace;
}
export declare const statics: {};
