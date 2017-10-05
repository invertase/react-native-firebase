/**
 * @flow
 * Path representation wrapper
 */

 /**
 * @class Path
 */
export default class Path {
  _parts: string[];

  constructor(pathComponents: string[]) {
    this._parts = pathComponents;
  }

  get id(): string | null {
    if (this._parts.length > 0) {
      return this._parts[this._parts.length - 1];
    }
    return null;
  }

  get isDocument(): boolean {
    return this._parts.length > 0 && this._parts.length % 2 === 0;
  }

  get isCollection(): boolean {
    return this._parts.length % 2 === 1;
  }

  get relativeName(): string {
    return this._parts.join('/');
  }

  child(relativePath: string): Path {
    return new Path(this._parts.concat(relativePath.split('/')));
  }

  parent(): Path | null {
    if (this._parts.length === 0) {
      return null;
    }

    return new Path(this._parts.slice(0, this._parts.length - 1));
  }

  /**
   *
   * @package
   */
  static fromName(name): Path {
    const parts = name.split('/');

    if (parts.length === 0) {
      return new Path([]);
    }
    return new Path(parts);
  }
}
