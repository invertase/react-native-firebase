/**
 * @flow
 * AndroidChannelGroup representation wrapper
 */

import type { NativeAndroidChannel } from './AndroidChannel';

export type NativeAndroidChannelGroup = {|
  name: string,
  groupId: string,
  // Android API >= 28
  description: string | void,
  // Android API >= 28
  channels: void | NativeAndroidChannel[],
|};

export default class AndroidChannelGroup {
  constructor(groupId: string, name: string, description?: string) {
    this._name = name;
    this._groupId = groupId;
    this._description = description;
  }

  _groupId: string;

  get groupId(): string {
    return this._groupId;
  }

  _name: string;

  get name(): string {
    return this._name;
  }

  _description: string | void;

  get description(): string | void {
    return this._description;
  }

  build(): NativeAndroidChannelGroup {
    if (!this._groupId) {
      throw new Error(
        'AndroidChannelGroup: Missing required `groupId` property'
      );
    } else if (!this._name) {
      throw new Error('AndroidChannelGroup: Missing required `name` property');
    }

    return {
      name: this._name,
      groupId: this._groupId,
      description: this._description,
      channels: [],
    };
  }
}
