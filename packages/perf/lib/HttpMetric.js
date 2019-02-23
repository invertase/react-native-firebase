/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { isString, isNumber, isNull } from '@react-native-firebase/common';

let id = 0;

export default class HttpMetric {
  constructor(native, url, httpMethod) {
    this.native = native;

    this._id = id++;
    this._url = url;
    this._httpMethod = httpMethod;

    this._attributes = {};
    this._httpResponseCode = null;
    this._requestPayloadSize = null;
    this._responsePayloadSize = null;
    this._responseContentType = null;

    this._started = false;
    this._stopped = false;
  }

  getAttribute(attribute) {
    if (!isString(attribute)) {
      throw new Error(`firebase.perf.HttpMetric.getAttribute(*) 'attribute' must be a string.`);
    }
    return this._attributes[attribute] || null;
  }

  getAttributes() {
    return Object.assign({}, this._attributes);
  }

  putAttribute(attribute, value) {
    if (!isString(attribute)) {
      throw new Error(`firebase.perf.HttpMetric.putAttribute(*, _) 'attribute' must be a string.`);
    }

    if (!isString(value)) {
      throw new Error(`firebase.perf.HttpMetric.putAttribute(_, *) 'value' must be a string.`);
    }

    this._attributes[attribute] = value;
  }

  removeAttribute(attribute) {
    if (!isString(attribute)) {
      throw new Error(`firebase.perf.HttpMetric.removeAttribute(*) 'attribute' must be a string.`);
    }

    delete this._attributes[attribute];
  }

  setHttpResponseCode(code) {
    if (!isNumber(code) && !isNull(code)) {
      throw new Error(
        `firebase.perf.HttpMetric.setHttpResponseCode(*) 'code' must be a number or null.`,
      );
    }

    this._httpResponseCode = code;
  }

  setRequestPayloadSize(bytes) {
    if (!isNumber(bytes) && !isNull(bytes)) {
      throw new Error(
        `firebase.perf.HttpMetric.setRequestPayloadSize(*) 'bytes' must be a number or null.`,
      );
    }

    this._requestPayloadSize = bytes;
  }

  setResponsePayloadSize(bytes) {
    if (!isNumber(bytes) && !isNull(bytes)) {
      throw new Error(
        `firebase.perf.HttpMetric.setResponsePayloadSize(*) 'bytes' must be a number or null.`,
      );
    }

    this._responsePayloadSize = bytes;
  }

  setResponseContentType(type) {
    if (!isString(type) && !isNull(type)) {
      throw new Error(
        `firebase.perf.HttpMetric.setResponseContentType(*) 'type' must be a string or null.`,
      );
    }

    this._responseContentType = type;
  }

  start() {
    if (this._started) return Promise.resolve(null);
    this._started = true;

    return this.native.startHttpMetric(this._id, this._url, this._httpMethod);
  }

  stop() {
    if (this._stopped) return Promise.resolve(null);
    this._stopped = true;

    const metricData = {
      attributes: Object.assign({}, this._attributes),
    };

    if (!isNull(this._httpResponseCode)) metricData.httpResponseCode = this._httpResponseCode;
    if (!isNull(this._requestPayloadSize)) metricData.requestPayloadSize = this._requestPayloadSize;
    if (!isNull(this._responsePayloadSize))
      metricData.responsePayloadSize = this._responsePayloadSize;
    if (!isNull(this._responseContentType))
      metricData.responseContentType = this._responseContentType;

    return this.native.stopHttpMetric(this._id, metricData);
  }
}
