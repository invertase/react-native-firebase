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

/**
 * Validates that all key-value pairs in an object are strings.
 */
export function objectKeyValuesAreStrings(object: any): boolean;

/**
 * Simple is null check.
 */
export function isNull(value: any): value is null;

/**
 * Simple is object check.
 */
export function isObject(value: any): value is Record<string, any>;

/**
 * Simple is date check
 */
export function isDate(value: any): value is Date;

/**
 * Simple is function check
 */
export function isFunction(value: any): value is (...args: any[]) => any;

/**
 * Simple is string check
 */
export function isString(value: any): value is string;

/**
 * Simple is number check
 */
export function isNumber(value: any): value is number;

/**
 * Simple is phone number check for E.164 format
 */
export function isE164PhoneNumber(value: any): boolean;

/**
 * Simple finite check
 */
export function isFinite(value: any): boolean;

/**
 * Simple integer check
 */
export function isInteger(value: any): boolean;

/**
 * Simple is boolean check
 */
export function isBoolean(value: any): value is boolean;

/**
 * Array check
 */
export function isArray(value: any): value is Array<any>;

/**
 * Undefined check
 */
export function isUndefined(value: any): value is undefined;

/**
 * Alphanumeric underscore pattern check (/^[a-zA-Z0-9_]+$/)
 */
export function isAlphaNumericUnderscore(value: any): boolean;

/**
 * URL validation test
 */
export function isValidUrl(url: any): boolean;

/**
 * Array includes check
 */
export function isOneOf(value: any, oneOf?: any[]): boolean;

/**
 * No-operation function
 */
export function noop(): void;

/**
 * Validates that an optional native dependency exists
 */
export function validateOptionalNativeDependencyExists(
  firebaseJsonKey: string,
  apiName: string,
  nativeFnExists: boolean,
): void;
