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
  isString,
  isUndefined,
} from '@react-native-firebase/common';

import VisionCloudLandmarkRecognizerModelType from './VisionCloudLandmarkRecognizerModelType';

export default function visionCloudLandmarkRecognizerOptions(cloudLandmarkRecognizerOptions) {
  const out = {
    enforceCertFingerprintMatch: false,
    maxResults: 10,
    model: VisionCloudLandmarkRecognizerModelType.STABLE_MODEL,
  };

  if (isUndefined(cloudLandmarkRecognizerOptions)) {
    return out;
  }

  if (!isObject(cloudLandmarkRecognizerOptions)) {
    throw new Error("'cloudLandmarkRecognizerOptions' expected an object value.");
  }

  if (hasOwnProperty(cloudLandmarkRecognizerOptions, 'enforceCertFingerprintMatch')) {
    if (!isBoolean(cloudLandmarkRecognizerOptions.enforceCertFingerprintMatch)) {
      throw new Error(
        "'cloudLandmarkRecognizerOptions.enforceCertFingerprintMatch' expected a boolean value.",
      );
    }

    out.enforceCertFingerprintMatch = cloudLandmarkRecognizerOptions.enforceCertFingerprintMatch;
  }

  if (hasOwnProperty(cloudLandmarkRecognizerOptions, 'apiKeyOverride')) {
    if (!isString(cloudLandmarkRecognizerOptions.apiKeyOverride)) {
      throw new Error("'cloudLandmarkRecognizerOptions.apiKeyOverride' expected a string value.");
    }

    out.apiKeyOverride = cloudLandmarkRecognizerOptions.apiKeyOverride;
  }

  if (hasOwnProperty(cloudLandmarkRecognizerOptions, 'maxResults')) {
    if (!isNumber(cloudLandmarkRecognizerOptions.maxResults)) {
      throw new Error("'cloudLandmarkRecognizerOptions.maxResults' expected a number value.");
    }

    out.maxResults = cloudLandmarkRecognizerOptions.maxResults;
  }

  if (cloudLandmarkRecognizerOptions.modelType) {
    if (
      cloudLandmarkRecognizerOptions.modelType !==
        VisionCloudLandmarkRecognizerModelType.STABLE_MODEL &&
      cloudLandmarkRecognizerOptions.modelType !==
        VisionCloudLandmarkRecognizerModelType.LATEST_MODEL
    ) {
      throw new Error(
        "'cloudLandmarkRecognizerOptions.modelType' invalid model. Expected VisionCloudLandmarkRecognizerModelType.STABLE_MODEL or VisionCloudLandmarkRecognizerModelType.LATEST_MODEL.",
      );
    }

    out.modelType = cloudLandmarkRecognizerOptions.modelType;
  }

  return out;
}
