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
  isArray,
  isBoolean,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/lib/common';
import MLCloudTextRecognizerModelType from './MLCloudTextRecognizerModelType';

export default function MLCloudTextRecognizerOptions(cloudTextRecognizerOptions) {
  const out = {
    enforceCertFingerprintMatch: false,
    modelType: MLCloudTextRecognizerModelType.SPARSE_MODEL,
  };

  if (isUndefined(cloudTextRecognizerOptions)) {
    return out;
  }

  if (!isObject(cloudTextRecognizerOptions)) {
    throw new Error("'cloudTextRecognizerOptions' expected an object value.");
  }

  if (hasOwnProperty(cloudTextRecognizerOptions, 'enforceCertFingerprintMatch')) {
    if (!isBoolean(cloudTextRecognizerOptions.enforceCertFingerprintMatch)) {
      throw new Error(
        "'cloudTextRecognizerOptions.enforceCertFingerprintMatch' expected a boolean value.",
      );
    }

    out.enforceCertFingerprintMatch = cloudTextRecognizerOptions.enforceCertFingerprintMatch;
  }

  if (hasOwnProperty(cloudTextRecognizerOptions, 'apiKeyOverride')) {
    if (!isString(cloudTextRecognizerOptions.apiKeyOverride)) {
      throw new Error("'cloudTextRecognizerOptions.apiKeyOverride' expected a string value.");
    }

    out.apiKeyOverride = cloudTextRecognizerOptions.apiKeyOverride;
  }

  if (cloudTextRecognizerOptions.modelType) {
    if (
      cloudTextRecognizerOptions.modelType !== MLCloudTextRecognizerModelType.DENSE_MODEL &&
      cloudTextRecognizerOptions.modelType !== MLCloudTextRecognizerModelType.SPARSE_MODEL
    ) {
      throw new Error(
        "'cloudTextRecognizerOptions.modelType' invalid model. Expected VisionCloudTextRecognizerModelType.DENSE_MODEL or VisionCloudTextRecognizerModelType.SPARSE_MODEL.",
      );
    }

    out.modelType = cloudTextRecognizerOptions.modelType;
  }

  if (cloudTextRecognizerOptions.languageHints) {
    if (
      !isArray(cloudTextRecognizerOptions.languageHints) ||
      !cloudTextRecognizerOptions.languageHints.length ||
      !isString(cloudTextRecognizerOptions.languageHints[0])
    ) {
      throw new Error(
        "'cloudTextRecognizerOptions.languageHints' must be an non empty array of strings.",
      );
    }

    out.hintedLanguages = cloudTextRecognizerOptions.languageHints;
  }

  return out;
}
