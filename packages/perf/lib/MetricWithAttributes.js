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

import { hasOwnProperty, isString } from '@react-native-firebase/app/lib/common';

let id = 0;

export default class MetricWithAttributes {
  constructor(native) {
    this._id = id++;
    this.native = native;
    this._attributes = {};
  }

  getAttribute(attribute) {
    if (!isString(attribute)) {
      throw new Error("firebase.perf.*.getAttribute(*) 'attribute' must be a string.");
    }
    return this._attributes[attribute] || null;
  }

  putAttribute(attribute, value) {
    // TODO(VALIDATION): attribute: no leading or trailing whitespace, no leading underscore '_'
    if (!isString(attribute) || attribute.length > 40) {
      throw new Error(
        "firebase.perf.*.putAttribute(*, _) 'attribute' must be a string with a maximum length of 40 characters.",
      );
    }

    if (!isString(value) || value.length > 100) {
      throw new Error(
        "firebase.perf.*.putAttribute(_, *) 'value' must be a string with a maximum length of 100 characters.",
      );
    }

    if (!hasOwnProperty(this._attributes, attribute) && Object.keys(this._attributes).length > 4) {
      throw new Error(
        'firebase.perf.*.putAttribute(_, _) the maximum number of attributes (5) has been reached.',
      );
    }

    this._attributes[attribute] = value;
  }
}
