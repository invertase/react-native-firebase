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

import {
  hasOwnProperty,
  isBoolean,
  isNumber,
  isObject,
  isUndefined,
} from '@react-native-firebase/common';

export default function visionCloudImageLabelerOptions(cloudImageLabelerOptions) {
  const out = {
    enforceCertFingerprintMatch: false,
    confidenceThreshold: 0.5,
  };

  if (isUndefined(cloudImageLabelerOptions)) {
    return out;
  }

  if (!isObject(cloudImageLabelerOptions)) {
    throw new Error(`'cloudImageLabelerOptions' expected an object value.`);
  }

  if (hasOwnProperty(cloudImageLabelerOptions, 'enforceCertFingerprintMatch')) {
    if (!isBoolean(cloudImageLabelerOptions.enforceCertFingerprintMatch)) {
      throw new Error(
        `'cloudImageLabelerOptions.enforceCertFingerprintMatch' expected a boolean value.`,
      );
    }

    out.enforceCertFingerprintMatch = cloudImageLabelerOptions.enforceCertFingerprintMatch;
  }

  if (cloudImageLabelerOptions.confidenceThreshold) {
    if (!isNumber(cloudImageLabelerOptions.confidenceThreshold)) {
      throw new Error(
        `'cloudImageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1.`,
      );
    }

    if (
      cloudImageLabelerOptions.confidenceThreshold < 0 ||
      cloudImageLabelerOptions.confidenceThreshold > 1
    ) {
      throw new Error(
        `'cloudImageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1.`,
      );
    }

    out.confidenceThreshold = cloudImageLabelerOptions.confidenceThreshold;
  }

  return out;
}
