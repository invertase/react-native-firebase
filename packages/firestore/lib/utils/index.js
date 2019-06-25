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

import { isObject, isString } from '@react-native-firebase/common';

export function extractFieldPathData(data, segmenets) {
  if (!isObject(data)) {
    return undefined;
  }

  const pathValue = data[segmenets[0]];

  if (segmenets.length === 1) {
    return pathValue;
  }

  return extractFieldPathData(pathValue, segmenets.slice(1));
}

export function parseUpdateArgs(args) {
  let data = {};
  if (args.length === 1) {
    if (!isObject(args[0])) {
      throw new Error(`if using a single update argument, it must be an object.`);
    }
    [data] = args;
  } else if (args.length % 2 === 1) {
    throw new Error(
      `the update arguments must be either a single object argument, or equal numbers of key/value pairs.`,
    );
  } else {
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      if (isString(key)) {
        data[key] = value;
      } else if (key instanceof FieldPath) {
        data = mergeFieldPathData(data, key._segments, value);
      } else {
        throw new Error(`argument at index ${i} must be a string or FieldPath`);
      }
    }
  }
  return data;
}

function buildFieldPathData(segments, value) {
  if (segments.length === 1) {
    return {
      [segments[0]]: value,
    };
  }
  return {
    [segments[0]]: buildFieldPathData(segments.slice(1), value),
  };
}

export function mergeFieldPathData(data, segments, value) {
  if (segments.length === 1) {
    return {
      ...data,
      [segments[0]]: value,
    };
  }
  if (data[segments[0]]) {
    return {
      ...data,
      [segments[0]]: mergeFieldPathData(data[segments[0]], segments.slice(1), value),
    };
  }
  return {
    ...data,
    [segments[0]]: buildFieldPathData(segments.slice(1), value),
  };
}
