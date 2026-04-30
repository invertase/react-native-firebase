/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import type { Value } from './types/remote-config';

// as per firebase web sdk specification
const BOOL_VALUES = ['1', 'true', 't', 'yes', 'y', 'on'];

interface ConfigValueInit {
  value: string;
  source: ReturnType<Value['getSource']>;
}

export default class RemoteConfigValue implements Value {
  private readonly _value: string;
  private readonly _source: ReturnType<Value['getSource']>;

  constructor({ value, source }: ConfigValueInit) {
    this._value = value;
    this._source = source;
  }

  asBoolean(): boolean {
    if (this._source === 'static') {
      return false;
    }

    return BOOL_VALUES.includes(this._value.toLowerCase());
  }

  asNumber(): number {
    if (this._source === 'static') {
      return 0;
    }

    const num = Number(this._value);

    if (Number.isNaN(num)) {
      return 0;
    }

    return num;
  }

  asString(): string {
    return this._value;
  }

  getSource(): ReturnType<Value['getSource']> {
    return this._source;
  }
}
