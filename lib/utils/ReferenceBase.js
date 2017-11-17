/**
 * @flow
 */
import Log from './log';

import type Database from '../modules/database';
import type Storage from '../modules/storage';

export default class ReferenceBase {
  _module: Database | Storage;
  path: string;

  constructor(path: string, module: Database | Storage) {
    this._module = module;
    this.path = path || '/';
  }

  /**
   * The last part of a Reference's path (after the last '/')
   * The key of a root Reference is null.
   * @type {String}
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#key}
   */
  get key(): string | null {
    return this.path === '/' ? null : this.path.substring(this.path.lastIndexOf('/') + 1);
  }

  get log(): Log {
    return this._module.log;
  }
}
