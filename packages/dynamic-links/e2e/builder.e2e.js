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

describe('dynamicLinks() dynamicLinkParams', () => {
  it('throws if params are not an object', () => {
    try {
      firebase.dynamicLinks().buildLink(123);
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'dynamicLinksParams' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if link is not provided', () => {
    try {
      firebase.dynamicLinks().buildLink({});
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("missing required 'link' property");
      return Promise.resolve();
    }
  });

  it('throws if link is not a string', () => {
    try {
      firebase.dynamicLinks().buildLink({
        link: 123,
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'link' expected a string");
      return Promise.resolve();
    }
  });

  it('throws if link is invalid', () => {
    try {
      firebase.dynamicLinks().buildLink({
        link: 'invertase.io',
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql(
        "'link' expected a well-formatted URL using the HTTP or HTTPS scheme",
      );
      return Promise.resolve();
    }
  });

  it('throws if domainUriPrefix is not provided', () => {
    try {
      firebase.dynamicLinks().buildLink({
        link: 'https://invertase.io',
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("missing required 'domainUriPrefix' property");
      return Promise.resolve();
    }
  });

  it('throws if domainUriPrefix is not a string', () => {
    try {
      firebase.dynamicLinks().buildLink({
        link: 'https://invertase.io',
        domainUriPrefix: 123,
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'domainUriPrefix' expected a string");
      return Promise.resolve();
    }
  });

  it('throws if domainUriPrefix is invalid', () => {
    try {
      firebase.dynamicLinks().buildLink({
        link: 'https://invertase.io',
        domainUriPrefix: 'xyz.page.com',
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql(
        "'domainUriPrefix' expected a well-formatted URL using the HTTP or HTTPS scheme",
      );
      return Promise.resolve();
    }
  });
});
