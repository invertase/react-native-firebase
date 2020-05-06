// as per firebase web sdk specification
const BOOLEAN_TRUTHY_VALUES = ['1', 'true', 't', 'yes', 'y', 'on'];

export default class Value {
  constructor({ value, source }) {
    this._value = value;
    this._source = source;
  }

  get value() {
    console.warn('firebase.remoteConfig().getValue().value has been removed');
  }

  get source() {
    console.warn('firebase.remoteConfig().getValue().source has been removed');
  }

  asBoolean() {
    if (this._source === 'static') {
      return false;
    }
    return BOOLEAN_TRUTHY_VALUES.includes(this._value.toLowerCase());
  }
  asNumber() {
    if (this._source === 'static') {
      return 0;
    }

    let num = Number(this._value);

    if (isNaN(num)) {
      num = 0;
    }
    return num;
  }
  asString() {
    return this._value;
  }
  getSource() {
    return this._source;
  }
}
