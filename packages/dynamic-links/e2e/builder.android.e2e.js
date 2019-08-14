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

const { baseParams } = require('./dynamicLinks.e2e');

describe('dynamicLinks() dynamicLinkParams.android', () => {
  it('throws if android is not an object', () => {
    try {
      firebase.dynamicLinks().buildLink({
        ...baseParams,
        android: 123,
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'dynamicLinksParams.android' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if android.fallbackUrl is not a string', () => {
    try {
      firebase.dynamicLinks().buildLink({
        ...baseParams,
        android: {
          fallbackUrl: 123,
        },
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'dynamicLinksParams.android.fallbackUrl' must be a string");
      return Promise.resolve();
    }
  });

  it('throws if android.minimumVersion is not a string', () => {
    try {
      firebase.dynamicLinks().buildLink({
        ...baseParams,
        android: {
          minimumVersion: 123,
        },
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'dynamicLinksParams.android.minimumVersion' must be a string");
      return Promise.resolve();
    }
  });

  it('throws if android.packageName is not a string', () => {
    try {
      firebase.dynamicLinks().buildLink({
        ...baseParams,
        android: {
          packageName: 123,
        },
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'dynamicLinksParams.android.packageName' must be a string");
      return Promise.resolve();
    }
  });

  it('throws if android.packageName is not set', () => {
    try {
      firebase.dynamicLinks().buildLink({
        ...baseParams,
        android: {
          minimumVersion: '18.0',
        },
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql(
        "'dynamicLinksParams.android' missing required 'packageName' property",
      );
      return Promise.resolve();
    }
  });
});
