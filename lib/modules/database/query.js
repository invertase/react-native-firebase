/**
 * @flow
 */

import ReferenceBase from './../../utils/ModuleBase';
import Reference from './reference.js';

/**
 * @class Query
 */
export default class Query extends ReferenceBase {
  modifiers: Array<DatabaseModifier>;

  constructor(ref: Reference, path: string, existingModifiers?: Array<DatabaseModifier>) {
    super(path);
    this.log.debug('creating Query ', path, existingModifiers);
    this.modifiers = existingModifiers ? [...existingModifiers] : [];
  }

  orderBy(name: string, key?: string) {
    this.modifiers.push({
      type: 'orderBy',
      name,
      key,
    });
  }

  limit(name: string, limit: number) {
    this.modifiers.push({
      type: 'limit',
      name,
      limit,
    });
  }

  filter(name: string, value: any, key?:string) {
    this.modifiers.push({
      type: 'filter',
      name,
      value,
      valueType: typeof value,
      key,
    });
  }

  getModifiers(): Array<DatabaseModifier> {
    return [...this.modifiers];
  }
}
