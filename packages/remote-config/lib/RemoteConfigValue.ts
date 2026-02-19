import type { FirebaseRemoteConfigTypes } from './types/namespaced';

const BOOL_VALUES = ['1', 'true', 't', 'yes', 'y', 'on'];

type ValueSource = 'remote' | 'default' | 'static';

interface ConfigValueParams {
  value: string;
  source: ValueSource;
}

export default class ConfigValue implements FirebaseRemoteConfigTypes.ConfigValue {
  _value: string;
  _source: ValueSource;

  constructor({ value, source }: ConfigValueParams) {
    this._value = value;
    this._source = source;
  }

  get value(): undefined {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.remoteConfig().getValue(*).value has been removed. Please use one of the alternative methods such as firebase.remoteConfig().getValue(*).asString()',
    );
    return undefined;
  }

  get source(): undefined {
    // eslint-disable-next-line no-console
    console.warn(
      'firebase.remoteConfig().getValue(*).source has been removed. Please use firebase.remoteConfig().getValue(*).getSource()',
    );
    return undefined;
  }

  public asBoolean(): boolean {
    if (this._source === 'static') {
      return false;
    }
    return BOOL_VALUES.includes(this._value.toLowerCase());
  }

  public asNumber(): number {
    if (this._source === 'static') {
      return 0;
    }

    let num = Number(this._value);

    if (Number.isNaN(num)) {
      num = 0;
    }
    return num;
  }

  public asString(): string {
    return this._value;
  }

  public getSource(): ValueSource {
    return this._source;
  }
}
