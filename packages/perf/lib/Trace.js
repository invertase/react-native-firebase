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

export default class Trace {
  constructor(native, identifier) {
    this.native = native;

    this._id = id++;
    this._identifier = identifier;

    this._metrics = {};
    this._attributes = {};

    this._started = false;
    this._stopped = false;
  }

  getAttribute(attribute) {
    if (!isString(attribute)) {
      throw new Error(`firebase.perf.Trace.getAttribute(*) 'attribute' must be a string.`);
    }
    return this._attributes[attribute] || null;
  }

  getAttributes() {
    return Object.assign({}, this._attributes);
  }

  putAttribute(attribute, value) {
    if (!isString(attribute)) {
      throw new Error(`firebase.perf.Trace.putAttribute(*, _) 'attribute' must be a string.`);
    }

    if (!isString(value)) {
      throw new Error(`firebase.perf.Trace.putAttribute(_, *) 'value' must be a string.`);
    }

    this._attributes[attribute] = value;
  }

  removeAttribute(attribute) {
    if (!isString(attribute)) {
      throw new Error(`firebase.perf.Trace.removeAttribute(*) 'attribute' must be a string.`);
    }

    delete this._attributes[attribute];
  }

  start() {
    if (this._started) return Promise.resolve(null);
    this._started = true;

    return this.native.startTrace(this._id, this._identifier);
  }

  stop() {
    if (this._stopped) return Promise.resolve(null);
    this._stopped = true;

    const traceData = {
      metrics: Object.assign({}, this._metrics),
      attributes: Object.assign({}, this._attributes),
    };

    return this.native.stopTrace(this._id, traceData);
  }
}
