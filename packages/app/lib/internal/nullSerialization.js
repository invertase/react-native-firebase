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
    // only null values within objects are encoded
    return null;
  }
  if (typeof data !== 'object') {
    return data;
  }

  // Prepare root encoded container
  let rootEncoded;
  const stack = [];

  if (Array.isArray(data)) {
    rootEncoded = new Array(data.length);
    stack.push({
      type: 'array',
      original: data,
      encoded: rootEncoded,
      index: 0,
    });
  } else {
    rootEncoded = {};
    stack.push({
      type: 'object',
      original: data,
      encoded: rootEncoded,
      keys: Object.keys(data),
      index: 0,
    });
  }

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];

    if (frame.type === 'array') {
      const { original, encoded } = frame;

      if (frame.index >= original.length) {
        // Done with this array
        stack.pop();
        continue;
      }

      const i = frame.index++;
      const item = original[i];

      if (item === null || typeof item !== 'object') {
        // Arrays preserve nulls as null
        encoded[i] = item;
      } else if (Array.isArray(item)) {
        const childEncoded = new Array(item.length);
        encoded[i] = childEncoded;
        stack.push({
          type: 'array',
          original: item,
          encoded: childEncoded,
          index: 0,
        });
      } else {
        const childEncoded = {};
        encoded[i] = childEncoded;
        stack.push({
          type: 'object',
          original: item,
          encoded: childEncoded,
          keys: Object.keys(item),
          index: 0,
        });
      }
    } else {
      // frame.type === 'object'
      const { original, encoded, keys } = frame;

      if (frame.index >= keys.length) {
        // Done with this object
        stack.pop();
        continue;
      }

      const key = keys[frame.index++];
      const value = original[key];

      if (value === null) {
        encoded[key] = NULL_SENTINEL;
      } else if (typeof value !== 'object') {
        encoded[key] = value;
      } else if (Array.isArray(value)) {
        const childEncoded = new Array(value.length);
        encoded[key] = childEncoded;
        stack.push({
          type: 'array',
          original: value,
          encoded: childEncoded,
          index: 0,
        });
      } else {
        const childEncoded = {};
        encoded[key] = childEncoded;
        stack.push({
          type: 'object',
          original: value,
          encoded: childEncoded,
          keys: Object.keys(value),
          index: 0,
        });
      }
    }
  }

  return rootEncoded;
}
