/* eslint-disable import/prefer-default-export */
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

import { isString, isNull } from '@react-native-firebase/common';

const SETTABLE_FIELDS = [
  'cacheControl',
  'contentDisposition',
  'contentEncoding',
  'contentLanguage',
  'contentType',
  'customMetadata',
];

/**
 *
 * @param metadata
 * @returns {*}
 */
export function validateMetadata(metadata) {
  const metadataEntries = Object.entries(metadata);
  for (let i = 0; i < metadataEntries.length; i++) {
    const [key, value] = metadataEntries[i];
    if (!SETTABLE_FIELDS.includes(key)) {
      throw new Error(
        `firebase.storage.StorageReference.updateMetadata(*) unknown property '${key}' provided for metadata.`,
      );
    }

    if (key !== 'customMetadata') {
      if (!isString(value) && !isNull(value)) {
        throw new Error(
          `firebase.storage.StorageReference.updateMetadata(*) property '${key}' should be a string or null value.`,
        );
      }
    } else {
      // TODO(salakar) customMetadata validate
    }
  }

  return metadata;
}
