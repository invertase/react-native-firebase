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

import { isAndroid } from '@react-native-firebase/app/lib/common';

export default class Settings {
  constructor(auth) {
    this._auth = auth;
    this._appVerificationDisabledForTesting = false;
  }

  get appVerificationDisabledForTesting() {
    return this._appVerificationDisabledForTesting;
  }

  set appVerificationDisabledForTesting(disabled) {
    this._appVerificationDisabledForTesting = disabled;
    this._auth.native.setAppVerificationDisabledForTesting(disabled);
  }

  setAutoRetrievedSmsCodeForPhoneNumber(phoneNumber, smsCode) {
    if (isAndroid) {
      return this._auth.native.setAutoRetrievedSmsCodeForPhoneNumber(phoneNumber, smsCode);
    }

    return Promise.resolve(null);
  }
}
