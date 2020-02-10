/**
 * 
 * Trace representation wrapper
 */
import { getNativeModule } from '../../utils/native';
export default class HttpMetric {
  constructor(perf, url, httpMethod) {
    this._perf = perf;
    this.url = url;
    this.httpMethod = httpMethod;
  }

  getAttribute(attribute) {
    return getNativeModule(this._perf).getHttpMetricAttribute(this.url, this.httpMethod, attribute);
  }

  getAttributes() {
    return getNativeModule(this._perf).getHttpMetricAttributes(this.url, this.httpMethod);
  }

  putAttribute(attribute, value) {
    return getNativeModule(this._perf).putHttpMetricAttribute(this.url, this.httpMethod, attribute, value);
  }

  removeAttribute(attribute) {
    return getNativeModule(this._perf).removeHttpMetricAttribute(this.url, this.httpMethod, attribute);
  }

  setHttpResponseCode(code) {
    return getNativeModule(this._perf).setHttpMetricResponseCode(this.url, this.httpMethod, code);
  }

  setRequestPayloadSize(bytes) {
    return getNativeModule(this._perf).setHttpMetricRequestPayloadSize(this.url, this.httpMethod, bytes);
  }

  setResponseContentType(type) {
    return getNativeModule(this._perf).setHttpMetricResponseContentType(this.url, this.httpMethod, type);
  }

  setResponsePayloadSize(bytes) {
    return getNativeModule(this._perf).setHttpMetricResponsePayloadSize(this.url, this.httpMethod, bytes);
  }

  start() {
    return getNativeModule(this._perf).startHttpMetric(this.url, this.httpMethod);
  }

  stop() {
    return getNativeModule(this._perf).stopHttpMetric(this.url, this.httpMethod);
  }

}