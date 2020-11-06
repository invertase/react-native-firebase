/**
 * 
 * Trace representation wrapper
 */
import { getNativeModule } from '../../utils/native';
export default class Trace {
  constructor(perf, identifier) {
    this._perf = perf;
    this.identifier = identifier;
  }

  getAttribute(attribute) {
    return getNativeModule(this._perf).getTraceAttribute(this.identifier, attribute);
  }

  getAttributes() {
    return getNativeModule(this._perf).getTraceAttributes(this.identifier);
  }

  getMetric(metricName) {
    return getNativeModule(this._perf).getTraceLongMetric(this.identifier, metricName);
  }

  incrementMetric(metricName, incrementBy) {
    return getNativeModule(this._perf).incrementTraceMetric(this.identifier, metricName, incrementBy);
  }

  putAttribute(attribute, value) {
    return getNativeModule(this._perf).putTraceAttribute(this.identifier, attribute, value);
  }

  putMetric(metricName, value) {
    return getNativeModule(this._perf).putTraceMetric(this.identifier, metricName, value);
  }

  removeAttribute(attribute) {
    return getNativeModule(this._perf).removeTraceAttribute(this.identifier, attribute);
  }

  start() {
    return getNativeModule(this._perf).startTrace(this.identifier);
  }

  stop() {
    return getNativeModule(this._perf).stopTrace(this.identifier);
  }

}