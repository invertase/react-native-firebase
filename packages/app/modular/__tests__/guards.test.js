import {
  objectKeyValuesAreStrings,
  isNull,
  isObject,
  isDate,
  isFunction,
  isString,
  isOptionalString,
  isNumber,
  isFinite,
  isInteger,
  isBoolean,
  isOptionalBoolean,
  isOptionalNumber,
  isPositiveNumber,
  isArray,
  isUndefined,
  isAlphaNumericUnderscore,
  isValidUrl,
  isOneOf,
  isPromise,
} from '../src/internal';

describe('guards', () => {
  describe('objectKeyValuesAreStrings', () => {
    test('it returns false if value is not an object', () => {
      expect(objectKeyValuesAreStrings()).toBe(false);
      expect(objectKeyValuesAreStrings('foo')).toBe(false);
      expect(objectKeyValuesAreStrings(123)).toBe(false);
      expect(objectKeyValuesAreStrings(null)).toBe(false);
      expect(objectKeyValuesAreStrings([])).toBe(false);
    });

    test('it returns false if values are not strings', () => {
      expect(objectKeyValuesAreStrings({ foo: 123 })).toBe(false);
      expect(objectKeyValuesAreStrings({ foo: null })).toBe(false);
      expect(objectKeyValuesAreStrings({ foo: {} })).toBe(false);
      expect(objectKeyValuesAreStrings({ foo: [] })).toBe(false);
    });

    test('it returns true if object is empty', () => {
      expect(objectKeyValuesAreStrings({})).toBe(true);
    });

    test('it returns true if object is valid', () => {
      expect(objectKeyValuesAreStrings({ foo: 'bar' })).toBe(true);
      expect(objectKeyValuesAreStrings({ foo: 'bar', baz: 'ben' })).toBe(true);
    });
  });

  describe('isNull', () => {
    test('it checks against a null value', () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull(123)).toBe(false);
      expect(isNull('foo')).toBe(false);
      expect(isNull({})).toBe(false);
      expect(isNull([])).toBe(false);
      expect(isNull(null)).toBe(true);
    });
  });

  describe('isObject', () => {
    test('it checks against an object value', () => {
      expect(isObject(undefined)).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject('foo')).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(() => {})).toBe(false);
      expect(isObject(new Date())).toBe(true); // Date is an object
      expect(isObject({})).toBe(true);
    });
  });

  describe('isDate', () => {
    test('it checks against an Date value', () => {
      expect(isDate(undefined)).toBe(false);
      expect(isDate(123)).toBe(false);
      expect(isDate('foo')).toBe(false);
      expect(isDate([])).toBe(false);
      expect(isDate(null)).toBe(false);
      expect(isDate({})).toBe(false);
      expect(isDate(new Date())).toBe(true);
    });
  });

  describe('isFunction', () => {
    test('it checks against an function value', () => {
      expect(isFunction(undefined)).toBe(false);
      expect(isFunction(123)).toBe(false);
      expect(isFunction('foo')).toBe(false);
      expect(isFunction([])).toBe(false);
      expect(isFunction(null)).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction(new Date())).toBe(false);
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
    });
  });

  describe('isString', () => {
    test('it checks against an string value', () => {
      expect(isString(undefined)).toBe(false);
      expect(isString(123)).toBe(false);
      expect(isString('foo')).toBe(true);
      expect(isString([])).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString(new Date())).toBe(false);
      expect(isString(() => {})).toBe(false);
      expect(isString(async () => {})).toBe(false);
    });
  });

  describe('isOptionalString', () => {
    test('it checks against an string value', () => {
      expect(isOptionalString(undefined)).toBe(true);
      expect(isOptionalString(123)).toBe(false);
      expect(isOptionalBoolean(123.456)).toBe(false);
      expect(isOptionalString('foo')).toBe(true);
      expect(isOptionalString([])).toBe(false);
      expect(isOptionalString(null)).toBe(true);
      expect(isOptionalString({})).toBe(false);
      expect(isOptionalString(new Date())).toBe(false);
      expect(isOptionalString(() => {})).toBe(false);
      expect(isOptionalString(async () => {})).toBe(false);
    });
  });

  describe('isNumber', () => {
    test('it checks against an String value', () => {
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(123.456)).toBe(true);
      expect(isNumber('foo')).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber(new Date())).toBe(false);
      expect(isNumber(() => {})).toBe(false);
      expect(isNumber(async () => {})).toBe(false);
    });
  });

  describe('isFinite', () => {
    test('it checks against an finite value', () => {
      expect(isFinite(10 / 5)).toBe(true);
      expect(isFinite(1 / 0)).toBe(false);
      expect(isFinite('foo')).toBe(false);
    });
  });

  describe('isInteger', () => {
    test('it checks against an integer value', () => {
      expect(isInteger(10)).toBe(true);
      expect(isInteger(10.1)).toBe(false);
      expect(isInteger('foo')).toBe(false);
    });
  });

  describe('isBoolean', () => {
    test('it checks against an boolean value', () => {
      expect(isBoolean(undefined)).toBe(false);
      expect(isBoolean(123)).toBe(false);
      expect(isBoolean(123.456)).toBe(false);
      expect(isBoolean('foo')).toBe(false);
      expect(isBoolean([])).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean(new Date())).toBe(false);
      expect(isBoolean(() => {})).toBe(false);
      expect(isBoolean(async () => {})).toBe(false);
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });
  });

  describe('isOptionalBoolean', () => {
    test('it checks against an boolean value', () => {
      expect(isOptionalBoolean(undefined)).toBe(true);
      expect(isOptionalBoolean(123)).toBe(false);
      expect(isOptionalBoolean(123.456)).toBe(false);
      expect(isOptionalBoolean('foo')).toBe(false);
      expect(isOptionalBoolean([])).toBe(false);
      expect(isOptionalBoolean(null)).toBe(true);
      expect(isOptionalBoolean({})).toBe(false);
      expect(isOptionalBoolean(new Date())).toBe(false);
      expect(isOptionalBoolean(() => {})).toBe(false);
      expect(isOptionalBoolean(async () => {})).toBe(false);
      expect(isOptionalBoolean(true)).toBe(true);
      expect(isOptionalBoolean(false)).toBe(true);
    });
  });

  describe('isOptionalNumber', () => {
    test('it checks against a numeric value', () => {
      expect(isOptionalNumber(undefined)).toBe(true);
      expect(isOptionalNumber(123)).toBe(true);
      expect(isOptionalBoolean(123.456)).toBe(false);
      expect(isOptionalNumber('foo')).toBe(false);
      expect(isOptionalNumber([])).toBe(false);
      expect(isOptionalNumber(null)).toBe(true);
      expect(isOptionalNumber({})).toBe(false);
      expect(isOptionalNumber(new Date())).toBe(false);
      expect(isOptionalNumber(() => {})).toBe(false);
      expect(isOptionalNumber(async () => {})).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    test('it checks against a numeric value', () => {
      expect(isPositiveNumber(undefined)).toBe(false);
      expect(isPositiveNumber(123)).toBe(true);
      expect(isOptionalBoolean(123.456)).toBe(false);
      expect(isPositiveNumber('foo')).toBe(false);
      expect(isPositiveNumber([])).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
      expect(isPositiveNumber({})).toBe(false);
      expect(isPositiveNumber(new Date())).toBe(false);
      expect(isPositiveNumber(() => {})).toBe(false);
      expect(isPositiveNumber(async () => {})).toBe(false);
    });
  });

  describe('isArray', () => {
    test('it checks against an array value', () => {
      expect(isArray(undefined)).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(123.456)).toBe(false);
      expect(isArray('foo')).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray({})).toBe(false);
      expect(isArray(new Date())).toBe(false);
      expect(isArray(() => {})).toBe(false);
      expect(isArray(async () => {})).toBe(false);
      expect(isArray(true)).toBe(false);
      expect(isArray(false)).toBe(false);
      expect(isArray([])).toBe(true);
      expect(isArray([{}])).toBe(true);
    });
  });

  describe('isUndefined', () => {
    test('it checks against an undefined value', () => {
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(123)).toBe(false);
      expect(isUndefined(123.456)).toBe(false);
      expect(isUndefined('foo')).toBe(false);
      expect(isUndefined([])).toBe(false);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined({})).toBe(false);
      expect(isUndefined(new Date())).toBe(false);
      expect(isUndefined(() => {})).toBe(false);
      expect(isUndefined(async () => {})).toBe(false);
    });
  });

  describe('isAlphaNumericUnderscore', () => {
    test('it checks against an "Alpha Numeric Underscore" value', () => {
      expect(isAlphaNumericUnderscore(undefined)).toBe(false);
      expect(isAlphaNumericUnderscore(123)).toBe(false);
      expect(isAlphaNumericUnderscore(123.456)).toBe(false);
      expect(isAlphaNumericUnderscore([])).toBe(false);
      expect(isAlphaNumericUnderscore(null)).toBe(false);
      expect(isAlphaNumericUnderscore({})).toBe(false);
      expect(isAlphaNumericUnderscore(new Date())).toBe(false);
      expect(isAlphaNumericUnderscore(() => {})).toBe(false);
      expect(isAlphaNumericUnderscore(async () => {})).toBe(false);
      expect(isAlphaNumericUnderscore('FooBarBaz_123')).toBe(true);
      expect(isAlphaNumericUnderscore('FooBarBaz!_123')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    test('it checks against a valid http(s) value', () => {
      expect(isValidUrl(123)).toBe(false);
      expect(isValidUrl('http://foo.com')).toBe(true);
      expect(isValidUrl('https://foo.com')).toBe(true);
      expect(isValidUrl('file://foo.com')).toBe(false);
    });
  });

  describe('isOneOf', () => {
    test('it checks against an array value value', () => {
      expect(isOneOf(123, 123)).toBe(false);
      expect(isOneOf(123, [])).toBe(false);
      expect(isOneOf(123, [123])).toBe(true);
    });
  });

  describe('isPromise', () => {
    test('it checks against an Promise function value', () => {
      expect(isPromise(() => {})).toBe(false);
      expect(isPromise('foo')).toBe(false);
      expect(isPromise(123)).toBe(false);
      expect(isPromise(null)).toBe(false);
      expect(isPromise()).toBe(false);

      const promise = new Promise(() => {});

      expect(isPromise(promise)).toBe(true);
    });
  });
});
