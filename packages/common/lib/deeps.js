import { isObject } from './validate';

/**
 * Deep get a value from an object.
 * @website https://github.com/Salakar/deeps
 * @param object
 * @param path
 * @param joiner
 * @returns {*}
 */
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
