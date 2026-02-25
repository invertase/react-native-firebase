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

import { isNull, isNumber, isString } from '@react-native-firebase/app/dist/module/common';
import type { FirebasePerformanceTypes } from './types/namespaced';
import MetricWithAttributes from './MetricWithAttributes';
import type { RNFBPerfNativeModule } from './types/internal';

export default class HttpMetric extends MetricWithAttributes {
  private _url: string;
  private _httpMethod: FirebasePerformanceTypes.HttpMethod;
  private _httpResponseCode: number | null;
  private _requestPayloadSize: number | null;
  private _responsePayloadSize: number | null;
  private _responseContentType: string | null;
  private _started: boolean;
  private _stopped: boolean;

  constructor(
    native: RNFBPerfNativeModule,
    url: string,
    httpMethod: FirebasePerformanceTypes.HttpMethod,
  ) {
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

  setHttpResponseCode(code: number | null): void {
    if (!isNumber(code) && !isNull(code)) {
      throw new Error(
        "firebase.perf.HttpMetric.setHttpResponseCode(*) 'code' must be a number or null.",
      );
    }

    this._httpResponseCode = code;
  }

  setRequestPayloadSize(bytes: number | null): void {
    if (!isNumber(bytes) && !isNull(bytes)) {
      throw new Error(
        "firebase.perf.HttpMetric.setRequestPayloadSize(*) 'bytes' must be a number or null.",
      );
    }

    this._requestPayloadSize = bytes;
  }

  setResponsePayloadSize(bytes: number | null): void {
    if (!isNumber(bytes) && !isNull(bytes)) {
      throw new Error(
        "firebase.perf.HttpMetric.setResponsePayloadSize(*) 'bytes' must be a number or null.",
      );
    }

    this._responsePayloadSize = bytes;
  }

  setResponseContentType(contentType: string | null): void {
    if (!isString(contentType) && !isNull(contentType)) {
      throw new Error(
        "firebase.perf.HttpMetric.setResponseContentType(*) 'contentType' must be a string or null.",
      );
    }

    this._responseContentType = contentType;
  }

  start(): Promise<null> {
    if (this._started) {
      return Promise.resolve(null);
    }
    this._started = true;

    return (this.native as RNFBPerfNativeModule).startHttpMetric(
      this._id,
      this._url,
      this._httpMethod,
    );
  }

  stop(): Promise<null> {
    if (this._stopped) {
      return Promise.resolve(null);
    }
    this._stopped = true;

    const metricData: {
      attributes: Record<string, string>;
      httpResponseCode?: number;
      requestPayloadSize?: number;
      responsePayloadSize?: number;
      responseContentType?: string;
    } = {
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

    return (this.native as RNFBPerfNativeModule).stopHttpMetric(this._id, metricData);
  }
}
