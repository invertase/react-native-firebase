import { windowOrGlobal } from './';

((base) => {
  window = base || window;
  if (!window.localStorage) window.localStorage = {};
})(windowOrGlobal);

// clean up time

export default class Log {
  static createLogger(namespace) {
    return require('bows')(namespace);
  }

  static setLevel(booleanOrDebugString) {
    window.localStorage.debug = booleanOrDebugString;
    window.localStorage.debugColors = !!booleanOrDebugString;
  }
}
