import { windowOrGlobal } from './';

((base) => {
  window = base || window;
  if (!window.localStorage) window.localStorage = {};
})(windowOrGlobal);

export default class Log {
  constructor(namespace) {
    this._namespace = namespace || 'RNFirebase';
    require('bows').config({ padLength: 20 });
    this.loggers = {};
  }

  get warn() {
    return this._createOrGetLogger('warn');
  }

  get info() {
    return this._createOrGetLogger('info');
  }

  get error() {
    return this._createOrGetLogger('error');
  }

  get debug() {
    return this._createOrGetLogger('debug');
  }

  static enable(booleanOrStringDebug) {
    window.localStorage.debug = booleanOrStringDebug;
    window.localStorage.debugColors = !!window.localStorage.debug;
  }

  _createOrGetLogger(level) {
    if (!this.loggers[level]) this.loggers[level] = require('bows')(this._namespace, `[${level}]`);
    return this.loggers[level];
  }
}
