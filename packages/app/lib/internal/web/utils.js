import { DeviceEventEmitter } from 'react-native';

// A general purpose guard function to catch errors and return a structured error object.
export function guard(fn) {
  return fn().catch(e => Promise.reject(getWebError(e)));
}

// Converts a thrown error to a structured error object
// required by RNFirebase native module internals.
export function getWebError(error) {
  const obj = {
    code: error.code || 'unknown',
    message: error.message,
  };
  // Split out prefix, since we internally prefix all error codes already.
  if (obj.code.includes('/')) {
    obj.code = obj.code.split('/')[1];
  }
  return {
    ...obj,
    userInfo: obj,
  };
}

export function emitEvent(eventName, event) {
  setImmediate(() => DeviceEventEmitter.emit('rnfb_' + eventName, event));
}
