const AlphaNumericUnderscore = /^[a-zA-Z0-9_]+$/;

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
