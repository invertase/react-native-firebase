/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * @typedef {import('./logger').Logger} Logger
 * @typedef {import('./logger').setLogLevel} setLogLevel
 * @typedef {import('./logger').setUserLogHandler} setUserLogHandler
 * @typedef {import('./logger').LogHandler} LogHandler
 * @typedef {import('./logger').LogLevel} LogLevel
 * @typedef {import('./logger').LevelStringToEnum} LevelStringToEnum
 * @typedef {import('./logger').DefaultLogLevel} DefaultLogLevel
 */

const LogLevel = {
  DEBUG: 0,
  VERBOSE: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  SILENT: 5,
};

// mimic the LogLevel in firebase-js-sdk TS
const reverseLogLevel = obj => {
  const reversed = {};
  for (const [key, value] of Object.entries(obj)) {
    reversed[value] = key;
  }
  return reversed;
};

const LogLevelReversed = reverseLogLevel(LogLevel);

const levelStringToEnum = {
  debug: LogLevel.DEBUG,
  verbose: LogLevel.VERBOSE,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  silent: LogLevel.SILENT,
};

/**
 * By default, `console.debug` is not displayed in the developer console (in
 * chrome). To avoid forcing users to have to opt-in to these logs twice
 * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
 * logs to the `console.log` function.
 */
const ConsoleMethod = {
  [LogLevel.DEBUG]: 'log',
  [LogLevel.VERBOSE]: 'log',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARN]: 'warn',
  [LogLevel.ERROR]: 'error',
};

/**
 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
 * messages on to their corresponding console counterparts (if the log method
 * is supported by the current log level)
 * @type {LogHandler}
 */
const defaultLogHandler = (instance, logType, ...args) => {
  if (logType < instance.logLevel) {
    return;
  }
  const now = new Date().toISOString();
  const method = ConsoleMethod[logType];
  if (method) {
    // 'log' | 'info' | 'warn' | 'error'
    // eslint-disable-next-line no-console
    console[method](`[${now}]  ${instance.name}:`, ...args);
  } else {
    throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  }
};

const defaultLogLevel = LogLevel.INFO;

export const instances = [];

/**
 * @type {Logger}
 */

export class Logger {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(name) {
    /**
     * Capture the current instance for later use
     */
    this.name = name;
    instances.push(this);
  }

  /**
   * The log level of the given Logger instance.
   */
  _logLevel = defaultLogLevel;

  get logLevel() {
    return this._logLevel;
  }

  set logLevel(val) {
    if (!(val in LogLevel)) {
      throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
    }
    this._logLevel = val;
  }

  // Workaround for setter/getter having to be the same type.
  setLogLevel(val) {
    this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
  }

  /**
   * The main (internal) log handler for the Logger instance.
   * Can be set to a new function in internal package code but not by user.
   */
  _logHandler = defaultLogHandler;
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(val) {
    if (typeof val !== 'function') {
      throw new TypeError('Value assigned to `logHandler` must be a function');
    }
    this._logHandler = val;
  }

  /**
   * The optional, additional, user-defined log handler for the Logger instance.
   */
  _userLogHandler = null;
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(val) {
    this._userLogHandler = val;
  }

  /**
   * The functions below are all based on the `console` interface
   */

  debug(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
    this._logHandler(this, LogLevel.DEBUG, ...args);
  }
  log(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
    this._logHandler(this, LogLevel.VERBOSE, ...args);
  }
  info(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
    this._logHandler(this, LogLevel.INFO, ...args);
  }
  warn(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
    this._logHandler(this, LogLevel.WARN, ...args);
  }
  error(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
    this._logHandler(this, LogLevel.ERROR, ...args);
  }
}

/**
 * @type {setLogLevel}
 */
export function setLogLevelInternal(level) {
  instances.forEach(inst => {
    inst.setLogLevel(level);
  });
}

/**
 * @type {setUserLogHandler}
 */
export function setUserLogHandler(logCallback, options) {
  for (const instance of instances) {
    let customLogLevel = null;
    if (options && options.level) {
      customLogLevel = levelStringToEnum[options.level];
    }
    if (logCallback === null) {
      instance.userLogHandler = null;
    } else {
      instance.userLogHandler = (instance, level, ...args) => {
        const message = args
          .map(arg => {
            if (arg == null) {
              return null;
            } else if (typeof arg === 'string') {
              return arg;
            } else if (typeof arg === 'number' || typeof arg === 'boolean') {
              return arg.toString();
            } else if (arg instanceof Error) {
              return arg.message;
            } else {
              try {
                return JSON.stringify(arg);
              } catch (_ignored) {
                return null;
              }
            }
          })
          .filter(arg => arg)
          .join(' ');
        if (level >= (customLogLevel ?? instance.logLevel)) {
          logCallback({
            level: LogLevelReversed[level].toLowerCase(),
            message,
            args,
            type: instance.name,
          });
        }
      };
    }
  }
}
