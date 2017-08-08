/**
 * @flow
 */

import Reference from './reference.js';

/**
 * @class Query
 */
export default class Query {
  modifiers: Array<DatabaseModifier>;

  constructor(ref: Reference, path: string, existingModifiers?: Array<DatabaseModifier>) {
    this.modifiers = existingModifiers ? [...existingModifiers] : [];
    this._reference = ref;
  }

  orderBy(name: string, key?: string) {
    this.modifiers.push({
      type: 'orderBy',
      name,
      key,
    });

    return this._reference;
  }

  limit(name: string, limit: number) {
    this.modifiers.push({
      type: 'limit',
      name,
      limit,
    });

    return this._reference;
  }

  filter(name: string, value: any, key?: string) {
    this.modifiers.push({
      type: 'filter',
      name,
      value,
      valueType: typeof value,
      key,
    });

    return this._reference;
  }

  getModifiers(): Array<DatabaseModifier> {
    return [...this.modifiers];
  }
}
