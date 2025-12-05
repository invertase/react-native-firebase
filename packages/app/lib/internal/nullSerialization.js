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
 * Replaces null values in object properties with sentinel objects for iOS TurboModule compatibility.
 * Uses iterative stack-based traversal to avoid stack overflow on deeply nested structures.
 *
 * iOS TurboModules strip null values from object properties during serialization,
 * so we replace them with sentinel objects that can survive the serialization
 * and be detected/restored on the native side.
 *
 * Note: Null values in arrays are preserved by iOS TurboModules, so we don't
 * encode them (but we still process nested objects within arrays).
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

  // Helper to process a child element and add it to the encoded container
  function processChild(child, encoded, keyOrIndex, isArray, stack) {
    if (child === null) {
      // Arrays preserve nulls as null, objects convert to sentinel
      encoded[keyOrIndex] = isArray ? null : NULL_SENTINEL;
    } else if (typeof child !== 'object') {
      encoded[keyOrIndex] = child;
    } else if (Array.isArray(child)) {
      const childEncoded = new Array(child.length);
      encoded[keyOrIndex] = childEncoded;
      stack.push({
        type: 'array',
        original: child,
        encoded: childEncoded,
        index: 0,
      });
    } else {
      const childEncoded = {};
      encoded[keyOrIndex] = childEncoded;
      stack.push({
        type: 'object',
        original: child,
        encoded: childEncoded,
        keys: Object.keys(child),
        index: 0,
      });
    }
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
      processChild(item, encoded, i, true, stack);
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
      processChild(value, encoded, key, false, stack);
    }
  }

  return rootEncoded;
}
