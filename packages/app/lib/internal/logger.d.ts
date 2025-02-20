export type LogLevelString = 'debug' | 'verbose' | 'info' | 'warn' | 'error' | 'silent';

export interface LogOptions {
  level: LogLevelString;
}

export type LogCallback = (callbackParams: LogCallbackParams) => void;

export interface LogCallbackParams {
  level: LogLevelString;
  message: string;
  args: unknown[];
  type: string;
}

/**
 * A container for all of the Logger instances
 */
export const instances: Logger[] = [];

/**
 * The JS SDK supports 5 log levels and also allows a user the ability to
 * silence the logs altogether.
 *
 * The order is a follows:
 * DEBUG < VERBOSE < INFO < WARN < ERROR
 *
 * All of the log types above the current log level will be captured (i.e. if
 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
 * `VERBOSE` logs will not)
 */
export enum LogLevel {
  DEBUG,
  VERBOSE,
  INFO,
  WARN,
  ERROR,
  SILENT,
}

type LevelStringToEnum = {
  debug: LogLevel.DEBUG;
  verbose: LogLevel.VERBOSE;
  info: LogLevel.INFO;
  warn: LogLevel.WARN;
  error: LogLevel.ERROR;
  silent: LogLevel.SILENT;
};

/**
 * The default log level
 */
type DefaultLogLevel = LogLevel.INFO;

/**
 * We allow users the ability to pass their own log handler. We will pass the
 * type of log, the current log level, and any other arguments passed (i.e. the
 * messages that the user wants to log) to this function.
 */
export type LogHandler = (loggerInstance: Logger, logType: LogLevel, ...args: unknown[]) => void;

export class Logger {
  constructor(name: string);

  get logLevel(): LogLevel;
  set logLevel(val: LogLevel);

  setLogLevel(val: LogLevel | LogLevelString): void;

  get logHandler(): LogHandler;
  set logHandler(val: LogHandler);

  get userLogHandler(): LogHandler | null;
  set userLogHandler(val: LogHandler | null);

  debug(...args: unknown[]): void;
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export const setLogLevel: (level: LogLevelString | LogLevel) => void;

export const setUserLogHandler: (logCallback: LogCallback | null, options?: LogOptions) => void;
