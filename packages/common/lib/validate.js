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

const AlphaNumericUnderscore = /^[a-zA-Z0-9_]+$/;

export function objectKeyValuesAreStrings(object) {
  if (!isObject(object)) return false;

  const entries = Object.entries(object);

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (!isString(key) || !isString(value)) return false;
  }

  return true;
}

/**
 * Simple is null check.
 *
 * @param value
 * @returns {boolean}
 */
export function isNull(value) {
  return value === null;
}

/**
 * Simple is object check.
 *
 * @param value
 * @returns {boolean}
 */
export function isObject(value) {
  return value ? typeof value === 'object' && !Array.isArray(value) && !isNull(value) : false;
}

/**
 * Simple is function check
 *
 * @param value
 * @returns {*|boolean}
 */
export function isFunction(value) {
  return value ? typeof value === 'function' : false;
}

/**
 * Simple is string check
 * @param value
 * @return {boolean}
 */
export function isString(value) {
  return typeof value === 'string';
}

/**
 * Simple is number check
 * @param value
 * @return {boolean}
 */
export function isNumber(value) {
  return typeof value === 'number';
}

/**
 * Simple is boolean check
 *
 * @param value
 * @return {boolean}
 */
export function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 *
 * @param value
 * @returns {arg is Array<any>}
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 *
 * @param value
 * @returns {boolean}
 */
export function isUndefined(value) {
  return typeof value === 'undefined';
}

/**
 * /^[a-zA-Z0-9_]+$/
 *
 * @param value
 * @returns {boolean}
 */
export function isAlphaNumericUnderscore(value) {
  return AlphaNumericUnderscore.test(value);
}

/**
 * Array includes
 *
 * @param value
 * @param oneOf
 * @returns {boolean}
 */
export function isOneOf(value, oneOf = []) {
  if (!isArray(oneOf)) return false;
  return oneOf.includes(value);
}

export function noop() {
  // noop-🐈
}
