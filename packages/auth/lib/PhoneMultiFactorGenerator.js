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

export default class PhoneMultiFactorGenerator {
  static FACTOR_ID = 'phone';

  constructor() {
    throw new Error(
      '`new PhoneMultiFactorGenerator()` is not supported on the native Firebase SDKs.',
    );
  }

  static assertion(credential) {
    // There is no logic here, we mainly do this for API compatibility
    // (following the Web API).
    const { token, secret } = credential;
    return { token, secret };
  }
}
