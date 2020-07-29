// as per firebase web sdk specification
const BOOL_VALUES = ['1', 'true', 't', 'yes', 'y', 'on'];

export default class ConfigValue {
  constructor({ value, source }) {
    this._value = value;
    this._source = source;
  }

  get value() {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.remoteConfig().getValue(*).value has been removed. Please use one of the alternative methods such as firebase.remoteConfig().getValue(*).asString()',
    );
  }

  get source() {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.remoteConfig().getValue(*).source has been removed. Please use firebase.remoteConfig().getValue(*).getSource()',
    );
  }

  asBoolean() {
    if (this._source === 'static') {
      return false;
    }
    return BOOL_VALUES.includes(this._value.toLowerCase());
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
