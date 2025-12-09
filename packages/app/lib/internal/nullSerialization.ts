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

type Encodable = string | number | boolean | null | EncodableObject | EncodableArray;
type EncodableObject = { [key: string]: Encodable };
type EncodableArray = Encodable[];

type ArrayFrame = {
  type: 'array';
  original: unknown[];
  encoded: unknown[];
  index: number;
};

type ObjectFrame = {
  type: 'object';
  original: Record<string, unknown>;
  encoded: Record<string, unknown>;
  keys: string[];
  index: number;
};

type StackFrame = ArrayFrame | ObjectFrame;

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
 * @param data - The data to encode
 * @returns The encoded data with null object properties replaced by sentinels
 */
export function encodeNullValues(data: unknown): unknown {
  if (data === null) {
    // only null values within objects are encoded
    return null;
  }
  if (typeof data !== 'object') {
    return data;
  }

  // Helper to process a child element and add it to the encoded container
  function processArrayChild(
    child: unknown,
    encoded: unknown[],
    index: number,
    stack: StackFrame[],
  ): void {
    if (child === null) {
      // Arrays preserve nulls as null
      encoded[index] = null;
    } else if (typeof child !== 'object') {
      encoded[index] = child;
    } else if (Array.isArray(child)) {
      const childEncoded: unknown[] = new Array(child.length);
      encoded[index] = childEncoded;
      stack.push({
        type: 'array',
        original: child,
        encoded: childEncoded,
        index: 0,
      });
    } else {
      const childEncoded: Record<string, unknown> = {};
      encoded[index] = childEncoded;
      stack.push({
        type: 'object',
        original: child as Record<string, unknown>,
        encoded: childEncoded,
        keys: Object.keys(child),
        index: 0,
      });
    }
  }

  function processObjectChild(
    child: unknown,
    encoded: Record<string, unknown>,
    key: string,
    stack: StackFrame[],
  ): void {
    if (child === null) {
      // Objects convert null to sentinel
      encoded[key] = NULL_SENTINEL;
    } else if (typeof child !== 'object') {
      encoded[key] = child;
    } else if (Array.isArray(child)) {
      const childEncoded: unknown[] = new Array(child.length);
      encoded[key] = childEncoded;
      stack.push({
        type: 'array',
        original: child,
        encoded: childEncoded,
        index: 0,
      });
    } else {
      const childEncoded: Record<string, unknown> = {};
      encoded[key] = childEncoded;
      stack.push({
        type: 'object',
        original: child as Record<string, unknown>,
        encoded: childEncoded,
        keys: Object.keys(child),
        index: 0,
      });
    }
  }

  // Prepare root encoded container
  let rootEncoded: unknown[] | Record<string, unknown>;
  const stack: StackFrame[] = [];

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
      original: data as Record<string, unknown>,
      encoded: rootEncoded,
      keys: Object.keys(data),
      index: 0,
    });
  }

  while (stack.length > 0) {
    const frame = stack[stack.length - 1]!; // Non-null assertion safe due to while condition

    if (frame.type === 'array') {
      const { original, encoded } = frame;

      if (frame.index >= original.length) {
        // Done with this array
        stack.pop();
        continue;
      }

      const i = frame.index++;
      const item = original[i];
      processArrayChild(item, encoded, i, stack);
    } else {
      // frame.type === 'object'
      const { original, encoded, keys } = frame;

      if (frame.index >= keys.length) {
        // Done with this object
        stack.pop();
        continue;
      }

      const key = keys[frame.index++]!; // Non-null assertion safe due to length check above
      const value = original[key];
      processObjectChild(value, encoded, key, stack);
    }
  }

  return rootEncoded;
}
