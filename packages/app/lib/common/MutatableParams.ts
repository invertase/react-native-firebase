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

import { deepGet, deepSet } from './deeps';

export default class MutatableParams {
  _mutatableParams: Record<string, any>;
  _parentInstance: MutatableParams;

  constructor(parentInstance?: MutatableParams) {
    if (parentInstance) {
      this._mutatableParams = parentInstance._mutatableParams;
      this._parentInstance = parentInstance;
    } else {
      this._mutatableParams = {};
      this._parentInstance = this;
    }
  }

  set(param: string, value: any): MutatableParams {
    deepSet(this._mutatableParams, param, value);
    return this._parentInstance;
  }

  get(param: string): any {
    return deepGet(this._mutatableParams, param, '.');
  }

  toJSON(): Record<string, any> {
    return Object.assign({}, this._mutatableParams);
  }

  validate(): void {
    // do nothing
  }
}
