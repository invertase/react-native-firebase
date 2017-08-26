/**
 * @flow
 */
export default class ReferenceBase {
  constructor(path: string, module) {
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

  get log() {
    return this._module.log;
  }
}
