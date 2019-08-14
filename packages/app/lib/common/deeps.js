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

import { isArray, isObject } from './validate';

/**
 * Deep get a value from an object.
 * @website https://github.com/Salakar/deeps
 * @param object
 * @param path
 * @param joiner
 * @returns {*}
 */
export function deepGet(object, path, joiner = '/') {
  if (!isObject(object) && !Array.isArray(object)) {
    return undefined;
  }
  const keys = path.split(joiner);

  let i = 0;
  let tmp = object;
  const len = keys.length;

  while (i < len) {
    const key = keys[i++];
    if (!tmp || !Object.hasOwnProperty.call(tmp, key)) {
      return undefined;
    }
    tmp = tmp[key];
  }

  return tmp;
}

/**
 * Deep set a value
 * @param object
 * @param path
 * @param value
 * @param initPaths
 * @param joiner
 */
export function deepSet(object, path, value, initPaths = true, joiner = '.') {
  if (!isObject(object)) {
    return false;
  }
  const keys = path.split(joiner);

  let i = 0;
  let _object = object;
  const len = keys.length - 1;

  while (i < len) {
    const key = keys[i++];
    if (initPaths && !Object.hasOwnProperty.call(object, key)) {
      _object[key] = {};
    }
    _object = _object[key];
  }

  if (isObject(_object) || (isArray(_object) && !Number.isNaN(keys[i]))) {
    _object[keys[i]] = value;
  } else {
    return false;
  }

  return true;
}

/**
 * Deeply flattens an object into a 1 level deep object.
 * @param object
 * @param joiner
 * @returns {{}}
 */
export function flatten(object, joiner) {
  const _joiner = joiner || '.';
  if (!isObject(object)) {
    return null;
  }

  const stack = {};

  for (const key in object) {
    if (isObject(object[key])) {
      _flattenChild(object[key], stack, key, _joiner);
    } else {
      stack[key] = object[key];
    }
  }

  return stack;
}

/**
 *
 * @param object
 * @param stack
 * @param parent
 * @param joiner
 * @returns {*}
 * @private
 */
function _flattenChild(object, stack, parent, joiner) {
  for (const key in object) {
    if (isObject(object[key])) {
      const p = parent + joiner + key;
      _flattenChild(object[key], stack, p, joiner);
    } else {
      stack[parent + joiner + key] = object[key];
    }
  }
  return stack;
}
