/**
 * @flow
 */

import { ReferenceBase } from './../base';
import Reference from './reference.js';

/**
 * @class Query
 */
export default class Query extends ReferenceBase {
  static ref: Reference;

  static modifiers: Array<string>;

  ref: Reference;

  constructor(ref: Reference, path: string, existingModifiers?: Array<string>) {
    super(ref.database, path);
    this.log.debug('creating Query ', path, existingModifiers);
    this.ref = ref;
    this.modifiers = existingModifiers ? [...existingModifiers] : [];
  }

  setOrderBy(name: string, key?: string) {
    if (key) {
      this.modifiers.push(`${name}:${key}`);
    } else {
      this.modifiers.push(name);
    }
  }

  setLimit(name: string, limit: number) {
    this.modifiers.push(`${name}:${limit}`);
  }

  setFilter(name: string, value: any, key?:string) {
    if (key) {
      this.modifiers.push(`${name}:${value}:${typeof value}:${key}`);
    } else {
      this.modifiers.push(`${name}:${value}:${typeof value}`);
    }
  }

  getModifiers(): Array<string> {
    return [...this.modifiers];
  }

  getModifiersString(): string {
    if (!this.modifiers || !Array.isArray(this.modifiers)) {
      return '';
    }
    return this.modifiers.join('|');
  }
}
