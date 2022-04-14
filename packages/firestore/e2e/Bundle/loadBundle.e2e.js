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
const { wipe } = require('../helpers');
require('isomorphic-fetch');
const BUNDLE_URL = 'https://api.rnfirebase.io/firestore/bundle';

describe('firestore().loadBundle()', function () {
  before(function () {
    return wipe();
  });
  it('loads the bundle contents', async function () {
    const resp = await fetch(BUNDLE_URL);
    const bundleString = await resp.text();
    await firebase.firestore().loadBundle(bundleString);
  });
  it('throws if invalid bundle', async function () {
    try {
      await firebase.firestore().loadBundle('not-a-bundle');
    } catch (error) {
      error.message.should.containEql('Client specified an invalid argument');
      return Promise.resolve();
    }
  });
});
