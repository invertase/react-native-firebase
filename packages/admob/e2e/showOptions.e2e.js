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

let validator = null;

describe('admob() showOptions', function () {
  before(function () {
    validator = jet.require('packages/admob/lib/validateAdShowOptions');
  });

  it('returns an empty object is not defined', function () {
    const v = validator();
    v.should.eql(jet.contextify({}));
  });

  it('throws if options is not an object', function () {
    try {
      validator('foo');
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'options' expected an object value");
      return Promise.resolve();
    }
  });

  it('throws if immersiveModeEnabled is not a boolean', function () {
    try {
      validator({
        immersiveModeEnabled: 'true',
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'options.immersiveModeEnabled' expected a boolean value");
      return Promise.resolve();
    }
  });

  it('sets immersiveMode', function () {
    const v = validator({
      immersiveModeEnabled: true,
    });
    v.immersiveModeEnabled.should.eql(true);
  });
});
