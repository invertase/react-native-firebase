import { isObject, generatePushID } from './../../utils';

export default class RemoteMessage {
  constructor(sender: String) {
    this.properties = {
      id: generatePushID(),
      ttl: 3600,
      // add the googleapis sender id part if not already added.
      sender: `${sender}`.includes('@') ? sender : `${sender}@gcm.googleapis.com`,
      type: 'remote',
      data: {},
    };
  }

  /**
   *
   * @param ttl
   * @returns {RemoteMessage}
   */
  setTtl(ttl: Number): RemoteMessage {
    this.properties.ttl = ttl;
    return this;
  }

  /**
   *
   * @param id
   */
  setId(id: string): RemoteMessage {
    this.properties.id = `${id}`;
    return this;
  }

  /**
   *
   * @param type
   * @returns {RemoteMessage}
   */
  setType(type: string): RemoteMessage {
    this.properties.type = `${type}`;
    return this;
  }

  /**
   *
   * @param key
   * @returns {RemoteMessage}
   */
  setCollapseKey(key: string): RemoteMessage {
    this.properties.collapseKey = `${key}`;
    return this;
  }


  /**
   *
   * @param data
   * @returns {RemoteMessage}
   */
  setData(data: Object = {}) {
    if (!isObject(data)) {
      throw new Error(`RemoteMessage:setData expects an object as the first parameter but got type '${typeof data}'.`);
    }

    const props = Object.keys(data);

    // coerce all property values to strings as
    // remote message data only supports strings
    for (let i = 0, len = props.length; i < len; i++) {
      const prop = props[i];
      this.properties.data[prop] = `${data[prop]}`;
    }

    return this;
  }

  toJSON() {
    return Object.assign({}, this.properties);
  }
}
