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

const NULL_SENTINEL = { __rnfbNull: true };

/**
 * Recursively replaces null values in object properties with sentinel objects
 * for iOS TurboModule compatibility.
 *
 * iOS TurboModules strip null values from object properties during serialization,
 * so we replace them with sentinel objects that can survive the serialization
 * and be detected/restored on the native side.
 *
 * Note: Null values in arrays are preserved by iOS TurboModules, so we don't
 * encode them (but we still recursively process nested objects within arrays).
 *
 * @param {any} data - The data to encode
 * @returns {any} - The encoded data with null object properties replaced by sentinels
 */
export function encodeNullValues(data) {
  if (data === null) {
    return NULL_SENTINEL;
  }

  if (Array.isArray(data)) {
    // Arrays preserve null values, but we still need to process nested objects
    return data.map(item => {
      if (item !== null && typeof item === 'object') {
        return encodeNullValues(item);
      }
      return item; // Keep primitives and nulls as-is in arrays
    });
  }

  if (typeof data === 'object' && data !== null) {
    const encoded = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        encoded[key] = encodeNullValues(data[key]);
      }
    }
    return encoded;
  }

  return data;
}
