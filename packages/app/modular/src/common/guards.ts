const AlphaNumericUnderscore = /^[a-zA-Z0-9_]+$/;

export function objectKeyValuesAreStrings(object: unknown): object is string[] {
  if (!isObject(object)) {
    return false;
  }

  const entries = Object.entries(object);

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (!isString(key) || !isString(value as any)) {
      return false;
    }
  }

  return true;
}

**
 * Simple is null check.
 *
 * @param value
 * @returns {boolean}
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Simple is object check.
 *
 * @param value
 * @returns {boolean}
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value ? typeof value === 'object' && !Array.isArray(value) && !isNull(value) : false;
}

/**
 * Simple is date check
 * https://stackoverflow.com/a/44198641
 * @param value
 * @returns {boolean}
 */
export function isDate(value: any): value is Date {
  // use the global isNaN() and not Number.isNaN() since it will validate an Invalid Date
  return value && Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value);
}

/**
 * Simple is function check
 *
 * @param value
 * @returns {*|boolean}
 */
// TODO(ehesp): Better function type
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: unknown): value is Function {
  return value ? typeof value === 'function' : false;
}

/**
 * Simple is string check
 * @param value
 * @return {boolean}
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Simple is number check
 * @param value
 * @return {boolean}
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

/**
 * Simple finite check
 * @param value
 * @returns {boolean}
 */
export function isFinite(value: unknown): boolean {
  return Number.isFinite(value);
}

/**
 * Simple integer check
 * @param value
 * @returns {boolean}
 */
export function isInteger(value: unknown): boolean {
  return Number.isInteger(value);
}

/**
 * Simple is boolean check
 *
 * @param value
 * @return {boolean}
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 *
 * @param value
 * @returns {arg is Array<any>}
 */
export function isArray<T = unknown>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 *
 * @param value
 * @returns {boolean}
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

/**
 * /^[a-zA-Z0-9_]+$/
 *
 * @param value
 * @returns {boolean}
 */
export function isAlphaNumericUnderscore(value: string): boolean {
  return AlphaNumericUnderscore.test(value);
}

/**
 * URL test
 * @param url
 * @returns {boolean}
 */
const IS_VALID_URL_REGEX = /^(http|https):\/\/[^ "]+$/;
export function isValidUrl(url: string): boolean {
  return IS_VALID_URL_REGEX.test(url);
}

/**
 * Array includes
 *
 * @param value
 * @param oneOf
 * @returns {boolean}
 */
export function isOneOf(value: unknown, oneOf: Array<any>): boolean {
  if (!isArray(oneOf)) {
    return false;
  }
  return oneOf.includes(value);
}

export function noop(): void {
  // noop-🐈
}