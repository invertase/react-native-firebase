/**
 * @flow
 * AndroidChannelGroup representation wrapper
 */

type NativeAndroidChannelGroup = {|
  groupId: string,
  name: string,
|};

export default class AndroidChannel {
  _groupId: string;
  _name: string;

  get groupId(): string {
    return this._groupId;
  }

  get name(): string {
    return this._name;
  }

  /**
   *
   * @param groupId
   * @returns {AndroidChannel}
   */
  setGroupId(groupId: string): AndroidChannel {
    this._groupId = groupId;
    return this;
  }

  /**
   *
   * @param name
   * @returns {AndroidChannel}
   */
  setName(name: string): AndroidChannel {
    this._name = name;
    return this;
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
      groupId: this._groupId,
      name: this._name,
    };
  }
}
