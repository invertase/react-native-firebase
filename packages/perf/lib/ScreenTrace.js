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

import { isIOS } from '@react-native-firebase/app/lib/common';

let id = 0;

export default class ScreenTrace {
  constructor(native, identifier) {
    this.native = native;
    this._identifier = identifier;
    this._id = id++;
    this._started = false;
    this._stopped = false;
  }

  start() {
    if (isIOS) {
      return Promise.reject(new Error('Custom screentraces are currently not supported on iOS.'));
    }
    if (this._started) {
      return Promise.resolve(null);
    }
    this._started = true;

    return this.native.startScreenTrace(this._id, this._identifier);
  }

  stop() {
    if (!this._started || this._stopped) {
      return Promise.resolve(null);
    }
    this._stopped = true;

    return this.native.stopScreenTrace(this._id);
  }
}
