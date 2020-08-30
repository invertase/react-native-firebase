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
  isNumber,
  isObject,
  isUndefined,
} from '@react-native-firebase/app/lib/common';

export default function visionImageLabelerOptions(imageLabelerOptions) {
  const out = {
    confidenceThreshold: 0.5,
  };

  if (isUndefined(imageLabelerOptions)) {
    return out;
  }

  if (!isObject(imageLabelerOptions)) {
    throw new Error("'imageLabelerOptions' expected an object value.");
  }

  if (hasOwnProperty(imageLabelerOptions, 'confidenceThreshold')) {
    if (!isNumber(imageLabelerOptions.confidenceThreshold)) {
      throw new Error(
        "'imageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1.",
      );
    }

    if (
      imageLabelerOptions.confidenceThreshold < 0 ||
      imageLabelerOptions.confidenceThreshold > 1
    ) {
      throw new Error(
        "'imageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1.",
      );
    }

    out.confidenceThreshold = imageLabelerOptions.confidenceThreshold;
  }

  return out;
}
