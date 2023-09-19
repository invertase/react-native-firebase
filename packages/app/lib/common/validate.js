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

import { Platform } from 'react-native';

const AlphaNumericUnderscore = /^[a-zA-Z0-9_]+$/;

export function objectKeyValuesAreStrings(object) {
  if (!isObject(object)) {
    return false;
  }

  const entries = Object.entries(object);

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (!isString(key) || !isString(value)) {
      return false;
    }
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
 * Simple is date check
 * https://stackoverflow.com/a/44198641
 * @param value
 * @returns {boolean}
 */
export function isDate(value) {
  // use the global isNaN() and not Number.isNaN() since it will validate an Invalid Date
  return value && Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value);
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
 * Simple is phone number check for E.164 format
 * @param value
 * @return {boolean}
 */
export function isE164PhoneNumber(value) {
  const PHONE_NUMBER = /^\+[1-9]\d{1,14}$/; // E.164
  return PHONE_NUMBER.test(value);
}

/**
 * Simple finite check
 * @param value
 * @returns {boolean}
 */
export function isFinite(value) {
  return Number.isFinite(value);
}

/**
 * Simple integer check
 * @param value
 * @returns {boolean}
 */
export function isInteger(value) {
  return Number.isInteger(value);
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
 * URL test
 * @param url
 * @returns {boolean}
 */
const IS_VALID_URL_REGEX = /^(http|https):\/\/[^ "]+$/;
export function isValidUrl(url) {
  return IS_VALID_URL_REGEX.test(url);
}

/**
 * Array includes
 *
 * @param value
 * @param oneOf
 * @returns {boolean}
 */
export function isOneOf(value, oneOf = []) {
  if (!isArray(oneOf)) {
    return false;
  }
  return oneOf.includes(value);
}

export function noop() {
  // noop-🐈
}

export function validateOptionalNativeDependencyExists(firebaseJsonKey, apiName, nativeFnExists) {
  if (nativeFnExists) {
    return;
  }
  let errorMessage =
    "You attempted to use an optional API that's not enabled natively. \n\n To enable ";

  errorMessage += apiName;
  errorMessage += ` please set the 'react-native' -> '${firebaseJsonKey}' key to true in your firebase.json file`;

  if (Platform.OS === 'android') {
    errorMessage += ' and rebuild your Android app.';
  } else {
    errorMessage +=
      ', re-run pod install and rebuild your iOS app. ' +
      "If you're not using Pods then make sure you've have downloaded the necessary Firebase iOS SDK dependencies for this API.";
  }

  throw new Error(errorMessage);
}
