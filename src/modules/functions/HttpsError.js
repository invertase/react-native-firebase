import type { FunctionsErrorCode } from './types.flow';

export default class HttpsError {
  // TODO extends Error
  +details: ?any;

  +message: string;

  +code: FunctionsErrorCode;

  constructor(code: FunctionsErrorCode, message?: string, details?: any) {
    // this.code = code;
    // this.details = details;
    // this.message = message;
    // TODO babel 7 issue... can't extend builtin classes properly.
    this._error = new Error(message);
    this._error.code = code;
    this._error.details = details;
    this._error.constructor = HttpsError;
    return this._error;
  }
}
