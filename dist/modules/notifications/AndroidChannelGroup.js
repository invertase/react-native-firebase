/**
 * 
 * AndroidChannelGroup representation wrapper
 */
export default class AndroidChannelGroup {
  constructor(groupId, name, description) {
    this._name = name;
    this._groupId = groupId;
    this._description = description;
  }

  get groupId() {
    return this._groupId;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  build() {
    if (!this._groupId) {
      throw new Error('AndroidChannelGroup: Missing required `groupId` property');
    } else if (!this._name) {
      throw new Error('AndroidChannelGroup: Missing required `name` property');
    }

    return {
      name: this._name,
      groupId: this._groupId,
      description: this._description,
      channels: []
    };
  }

}