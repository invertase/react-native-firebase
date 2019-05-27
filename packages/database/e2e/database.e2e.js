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

describe('database()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.database);
      app.database().app.should.eql(app);
    });

    it('supports multiple apps', async () => {
      firebase.database().app.name.should.eql('[DEFAULT]');

      firebase
        .database(firebase.app('secondaryFromNative'))
        .app.name.should.eql('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .database()
        .app.name.should.eql('secondaryFromNative');
    });
  });

  it('supports custom database URL', async () => {
    firebase.database().app.name.should.eql('[DEFAULT]');

    firebase
      .database(firebase.app('secondaryFromNative'))
      .app.name.should.eql('secondaryFromNative');

    firebase
      .app('secondaryFromNative')
      .database()
      .app.name.should.eql('secondaryFromNative');
  });

  describe('ref()', () => {
    it('throws if path is not a string', async () => {
      try {
        firebase.database().ref({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'path' must be a string value`);
        return Promise.resolve();
      }
    });

    it('throws if path is not a valid string', async () => {
      try {
        firebase.database().ref('$$$$$');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'path' can't contain`);
        return Promise.resolve();
      }
    });
  });

  describe('refFromURL()', () => {
    it('throws if url is not a url', async () => {
      try {
        firebase.database().refFromURL('foobar');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'url' must be a valid database URL`);
        return Promise.resolve();
      }
    });

    it('throws if url from a different domain', async () => {
      try {
        firebase.database().refFromURL('https://foobar.firebaseio.com');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'url' must be the same domain as the current instance`);
        return Promise.resolve();
      }
    });

    it('returns a reference', async () => {
      const ref1 = firebase.database().refFromURL(firebase.database()._customUrlOrRegion);
      const ref2 = firebase.database().refFromURL(`${firebase.database()._customUrlOrRegion}/foo/bar`);
      const ref3 = firebase.database().refFromURL(`${firebase.database()._customUrlOrRegion}/foo/bar?baz=foo`);
      should.equal(ref1.path, '/');
      should.equal(ref2.path, 'foo/bar');
      should.equal(ref3.path, 'foo/bar');
    });
  });

  describe('goOnline()', () => {
    it('calls goOnline successfully', async () => {
      await firebase.database().goOnline();
    });
  });

  describe('goOffline()', () => {
    it('calls goOffline successfully', async () => {
      await firebase.database().goOffline();
      // Go back online
      await firebase.database().goOnline();
    });
  });
});
