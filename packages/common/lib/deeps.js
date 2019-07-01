import { isArray, isObject } from './validate';

/**
 * Deep get a value from an object.
 * @website https://github.com/Salakar/deeps
 * @param object
 * @param path
 * @param joiner
 * @returns {*}
 */
// eslint-disable-next-line import/prefer-default-export
export function deepGet(object, path, joiner = '/') {
  if (!isObject(object) && !Array.isArray(object)) return undefined;
  const keys = path.split(joiner);

  let i = 0;
  let tmp = object;
  const len = keys.length;

  while (i < len) {
    const key = keys[i++];
    if (!tmp || !Object.hasOwnProperty.call(tmp, key)) return undefined;
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
  if (!isObject(object)) return false;
  const keys = path.split(joiner);

  let i = 0;
  let _object = object;
  const len = keys.length - 1;

  while (i < len) {
    const key = keys[i++];
    if (initPaths && !Object.hasOwnProperty.call(object, key)) _object[key] = {};
    _object = _object[key];
  }

  if (isObject(_object) || (isArray(_object) && !Number.isNaN(keys[i]))) {
    _object[keys[i]] = value;
  } else {
    return false;
  }

  return true;
}
