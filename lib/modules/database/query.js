/**
 * @flow
 */

import Reference from './reference.js';
import { objectToUniqueId } from './../../utils';

// todo doc methods

/**
 * @class Query
 */
export default class Query {
  modifiers: Array<DatabaseModifier>;

  constructor(ref: Reference, path: string, existingModifiers?: Array<DatabaseModifier>) {
    this.modifiers = existingModifiers ? [...existingModifiers] : [];
    this._reference = ref;
  }

  /**
   *
   * @param name
   * @param key
   * @return {Reference|*}
   */
  orderBy(name: string, key?: string) {
    this.modifiers.push({
      type: 'orderBy',
      name,
      key,
    });

    return this._reference;
  }

  /**
   *
   * @param name
   * @param limit
   * @return {Reference|*}
   */
  limit(name: string, limit: number) {
    this.modifiers.push({
      type: 'limit',
      name,
      limit,
    });

    return this._reference;
  }

  /**
   *
   * @param name
   * @param value
   * @param key
   * @return {Reference|*}
   */
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

  /**
   *
   * @return {[*]}
   */
  getModifiers(): Array<DatabaseModifier> {
    return [...this.modifiers];
  }

  /**
   *
   * @return {*}
   */
  queryIdentifier() {
    // convert query modifiers array into an object for generating a unique key
    const object = {};

    for (let i = 0, len = this.modifiers.length; i < len; i++) {
      const { name, type, value } = this.modifiers[i];
      object[`${type}-${name}`] = value;
    }

    return objectToUniqueId(object);
  }
}
