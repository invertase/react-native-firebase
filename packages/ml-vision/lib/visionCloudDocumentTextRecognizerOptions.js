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

export default function visionCloudDocumentTextRecognizerOptions(
  cloudDocumentTextRecognizerOptions,
) {
  const out = {
    enforceCertFingerprintMatch: false,
  };

  if (isUndefined(cloudDocumentTextRecognizerOptions)) {
    return out;
  }

  if (!isObject(cloudDocumentTextRecognizerOptions)) {
    throw new Error("'cloudDocumentTextRecognizerOptions' expected an object value.");
  }

  if (hasOwnProperty(cloudDocumentTextRecognizerOptions, 'enforceCertFingerprintMatch')) {
    if (!isBoolean(cloudDocumentTextRecognizerOptions.enforceCertFingerprintMatch)) {
      throw new Error(
        "'cloudDocumentTextRecognizerOptions.enforceCertFingerprintMatch' expected a boolean value.",
      );
    }

    out.enforceCertFingerprintMatch =
      cloudDocumentTextRecognizerOptions.enforceCertFingerprintMatch;
  }

  if (hasOwnProperty(cloudDocumentTextRecognizerOptions, 'apiKeyOverride')) {
    if (!isString(cloudDocumentTextRecognizerOptions.apiKeyOverride)) {
      throw new Error(
        "'cloudDocumentTextRecognizerOptions.apiKeyOverride' expected a string value.",
      );
    }

    out.apiKeyOverride = cloudDocumentTextRecognizerOptions.apiKeyOverride;
  }

  if (cloudDocumentTextRecognizerOptions.languageHints) {
    if (
      !isArray(cloudDocumentTextRecognizerOptions.languageHints) ||
      !cloudDocumentTextRecognizerOptions.languageHints.length ||
      !isString(cloudDocumentTextRecognizerOptions.languageHints[0])
    ) {
      throw new Error(
        "'cloudDocumentTextRecognizerOptions.languageHints' must be an non empty array of strings.",
      );
    }

    out.hintedLanguages = cloudDocumentTextRecognizerOptions.languageHints;
  }

  return out;
}
