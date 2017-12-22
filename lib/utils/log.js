/*
 * @flow
 */
import { windowOrGlobal } from './';

import type ModuleBase from './ModuleBase';

((base) => {
  window = base || window;
  if (!window.localStorage) window.localStorage = {};
})(windowOrGlobal);

// clean up time

const NATIVE_LOGGERS: { [ModuleBase]: Object } = {};

export const getLogger = (module: ModuleBase) => {
  if (!NATIVE_LOGGERS[module]) {
    NATIVE_LOGGERS[module] = require('bows')(`🔥 ${module._namespace.toUpperCase()}`);
  }
  return NATIVE_LOGGERS[module];
};

export default class Log {
  static createLogger(namespace) {
    return require('bows')(namespace);
  }

  static setLevel(booleanOrDebugString) {
    window.localStorage.debug = booleanOrDebugString;
    window.localStorage.debugColors = !!booleanOrDebugString;
  }
}
