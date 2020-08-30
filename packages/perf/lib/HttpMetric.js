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

import { isNull, isNumber, isString } from '@react-native-firebase/app/lib/common';
import MetricWithAttributes from './MetricWithAttributes';

export default class HttpMetric extends MetricWithAttributes {
  constructor(native, url, httpMethod) {
    super(native);

    this._url = url;
    this._httpMethod = httpMethod;

    this._httpResponseCode = null;
    this._requestPayloadSize = null;
    this._responsePayloadSize = null;
    this._responseContentType = null;

    this._started = false;
    this._stopped = false;
  }

  setHttpResponseCode(code) {
    if (!isNumber(code) && !isNull(code)) {
      throw new Error(
        "firebase.perf.HttpMetric.setHttpResponseCode(*) 'code' must be a number or null.",
      );
    }

    this._httpResponseCode = code;
  }

  setRequestPayloadSize(bytes) {
    if (!isNumber(bytes) && !isNull(bytes)) {
      throw new Error(
        "firebase.perf.HttpMetric.setRequestPayloadSize(*) 'bytes' must be a number or null.",
      );
    }

    this._requestPayloadSize = bytes;
  }

  setResponsePayloadSize(bytes) {
    if (!isNumber(bytes) && !isNull(bytes)) {
      throw new Error(
        "firebase.perf.HttpMetric.setResponsePayloadSize(*) 'bytes' must be a number or null.",
      );
    }

    this._responsePayloadSize = bytes;
  }

  setResponseContentType(contentType) {
    if (!isString(contentType) && !isNull(contentType)) {
      throw new Error(
        "firebase.perf.HttpMetric.setResponseContentType(*) 'contentType' must be a string or null.",
      );
    }

    this._responseContentType = contentType;
  }

  start() {
    if (this._started) {
      return Promise.resolve(null);
    }
    this._started = true;

    return this.native.startHttpMetric(this._id, this._url, this._httpMethod);
  }

  stop() {
    if (this._stopped) {
      return Promise.resolve(null);
    }
    this._stopped = true;

    const metricData = {
      attributes: Object.assign({}, this._attributes),
    };

    if (!isNull(this._httpResponseCode)) {
      metricData.httpResponseCode = this._httpResponseCode;
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: A firebase.perf.HttpMetric (${this._httpMethod}: ${this._url}) failed to provide a httpResponseCode; this metric will not be visible on the Firebase console.`,
      );
    }

    if (!isNull(this._requestPayloadSize)) {
      metricData.requestPayloadSize = this._requestPayloadSize;
    }
    if (!isNull(this._responsePayloadSize)) {
      metricData.responsePayloadSize = this._responsePayloadSize;
    }
    if (!isNull(this._responseContentType)) {
      metricData.responseContentType = this._responseContentType;
    }

    return this.native.stopHttpMetric(this._id, metricData);
  }
}
