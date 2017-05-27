import { Platform } from 'react-native';

/**
 * @flow
 */
// modeled after base64 web-safe chars, but ordered by ASCII
const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
const hasOwnProperty = Object.hasOwnProperty;
const DEFAULT_CHUNK_SIZE = 50;

// internal promise handler
const _handler = (resolve, reject, errorPrefix, err, resp) => {
  // resolve / reject after events etc
  setImmediate(() => {
    if (err) {
      // $FlowFixMe
      const firebaseError: FirebaseError = new Error(err.message);

      if (isObject(err)) {
        Object.keys(err).forEach(key => Object.defineProperty(firebaseError, key, { value: err[key] }));
        if (errorPrefix) {
          firebaseError.code = toWebSDKErrorCode(err.code || '', errorPrefix);
        }
      }

      return reject(firebaseError);
    }
    return resolve(resp);
  });
};


export function nativeSDKMissing(sdkName) {
  console.warn(`Firebase ${sdkName} native sdk has not been included in your ${Platform.OS === 'ios' ? 'podfile' : 'build.gradle'} - ${sdkName} methods have been disabled.`);
}

export function toWebSDKErrorCode(code: any, prefix: string): string {
  if (!code || typeof code !== 'string') return '';
  return code.toLowerCase().replace('error_', prefix).replace(/_/g, '-');
}

/**
 * Deep get a value from an object.
 * @website https://github.com/Salakar/deeps
 * @param object
 * @param path
 * @param joiner
 * @returns {*}
 */
export function deepGet(object: Object,
                        path: string,
                        joiner?: string = '/'): any {
  const keys = path.split(joiner);

  let i = 0;
  let tmp = object;
  const len = keys.length;

  while (i < len) {
    const key = keys[i++];
    if (!tmp || !hasOwnProperty.call(tmp, key)) return null;
    tmp = tmp[key];
  }

  return tmp;
}

/**
 * Deep check if a key exists.
 * @website https://github.com/Salakar/deeps
 * @param object
 * @param path
 * @param joiner
 * @returns {*}
 */
export function deepExists(object: Object,
                           path: string,
                           joiner?: string = '/'): boolean {
  const keys = path.split(joiner);

  let i = 0;
  let tmp = object;
  const len = keys.length;

  while (i < len) {
    const key = keys[i++];
    if (!tmp || !hasOwnProperty.call(tmp, key)) return false;
    tmp = tmp[key];
  }

  return tmp !== undefined;
}

/**
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

/**
 * Simple is function check
 * @param item
 * @returns {*|boolean}
 */
export function isFunction(item?: any): boolean {
  return Boolean(item && typeof item === 'function');
}

/**
 *
 * @param string
 * @returns {*}
 */
export function tryJSONParse(string: string | null): any {
  try {
    return string && JSON.parse(string);
  } catch (jsonError) {
    return string;
  }
}

/**
 *
 * @param data
 * @returns {*}
 */
export function tryJSONStringify(data: any): string | null {
  try {
    return JSON.stringify(data);
  } catch (jsonError) {
    return null;
  }
}


// noinspection Eslint
export const windowOrGlobal = (typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global) || this;

/**
 * Makes an objects keys it's values
 * @param object
 * @returns {{}}
 */
export function reverseKeyValues(object: Object): Object {
  const output = {};
  for (const key in object) {
    output[object[key]] = key;
  }
  return output;
}

/**
 * No operation func
 */
export function noop(): void {
}

/**
 * Wraps a native module method to support promises.
 * @param fn
 * @param NativeModule
 * @param errorPrefix
 */
export function promisify(fn: Function | string,
                          NativeModule: Object,
                          errorPrefix?: string): (args: any) => Promise<> {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const _fn = typeof fn === 'function' ? fn : NativeModule[fn];
      if (!_fn || typeof _fn !== 'function') return reject(new Error('Missing function for promisify.'));
      return _fn.apply(NativeModule, [...args, _handler.bind(_handler, resolve, reject, errorPrefix)]);
    });
  };
}


/**
 * Delays chunks based on sizes per event loop.
 * @param collection
 * @param chunkSize
 * @param operation
 * @param callback
 * @private
 */
function _delayChunk(collection: Array<*>,
                     chunkSize: number,
                     operation: Function,
                     callback: Function): void {
  const length = collection.length;
  const iterations = Math.ceil(length / chunkSize);

  // noinspection ES6ConvertVarToLetConst
  let thisIteration = 0;

  setImmediate(function next() {
    const start = thisIteration * chunkSize;
    const _end = start + chunkSize;
    const end = _end >= length ? length : _end;
    const result = operation(collection.slice(start, end), start, end);

    if (thisIteration++ > iterations) {
      callback(null, result);
    } else {
      setImmediate(next);
    }
  });
}

/**
 * Async each with optional chunk size limit
 * @param array
 * @param chunkSize
 * @param iterator
 * @param cb
 */
export function each(array: Array<*>,
                     chunkSize: number | Function,
                     iterator: Function,
                     cb?: Function): void {
  if (typeof chunkSize === 'function') {
    cb = iterator;
    iterator = chunkSize;
    chunkSize = DEFAULT_CHUNK_SIZE;
  }

  if (cb) {
    _delayChunk(array, chunkSize, (slice, start) => {
      for (let ii = 0, jj = slice.length; ii < jj; ii += 1) {
        iterator(slice[ii], start + ii);
      }
    }, cb);
  }
}

export function typeOf(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Async map with optional chunk size limit
 * @param array
 * @param chunkSize
 * @param iterator
 * @param cb
 * @returns {*}
 */
export function map(array: Array<*>,
                    chunkSize: number | Function,
                    iterator: Function,
                    cb?: Function): void {
  if (typeof chunkSize === 'function') {
    cb = iterator;
    iterator = chunkSize;
    chunkSize = DEFAULT_CHUNK_SIZE;
  }

  const result = [];
  _delayChunk(array, chunkSize, (slice, start) => {
    for (let ii = 0, jj = slice.length; ii < jj; ii += 1) {
      result.push(iterator(slice[ii], start + ii, array));
    }
    return result;
  }, () => cb && cb(result));
}


// timestamp of last push, used to prevent local collisions if you push twice in one ms.
let lastPushTime = 0;

// we generate 72-bits of randomness which get turned into 12 characters and appended to the
// timestamp to prevent collisions with other clients.  We store the last characters we
// generated because in the event of a collision, we'll use those same characters except
// "incremented" by one.
const lastRandChars = [];

/**
 * Generate a firebase id - for use with ref().push(val, cb) - e.g. -KXMr7k2tXUFQqiaZRY4'
 * @param serverTimeOffset - pass in server time offset from native side
 * @returns {string}
 */
export function generatePushID(serverTimeOffset?: number = 0): string {
  const timeStampChars = new Array(8);
  let now = new Date().getTime() + serverTimeOffset;
  const duplicateTime = (now === lastPushTime);

  lastPushTime = now;

  for (let i = 7; i >= 0; i -= 1) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
    now = Math.floor(now / 64);
  }

  if (now !== 0) throw new Error('We should have converted the entire timestamp.');

  let id = timeStampChars.join('');

  if (!duplicateTime) {
    for (let i = 0; i < 12; i += 1) {
      lastRandChars[i] = Math.floor(Math.random() * 64);
    }
  } else {
    // if the timestamp hasn't changed since last push,
    // use the same random number, but increment it by 1.
    let i;
    for (i = 11; i >= 0 && lastRandChars[i] === 63; i -= 1) {
      lastRandChars[i] = 0;
    }

    lastRandChars[i] += 1;
  }

  for (let i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(lastRandChars[i]);
  }

  if (id.length !== 20) throw new Error('Length should be 20.');

  return id;
}

/**
 * Converts a code and message from a native event to a JS Error
 * @param code
 * @param message
 * @returns {Error}
 */
export function nativeToJSError(code: string, message: string) {
  const error = new Error(message);
  error.code = code;
  return error;
}
