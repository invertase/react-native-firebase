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

describe('database()', function() {
  describe('namespace', function() {
    it('accessible from firebase.app()', function() {
      const app = firebase.app();
      should.exist(app.database);
      app.database().app.should.eql(app);
    });

    it('supports multiple apps', async function() {
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

  it('supports custom database URL', async function() {
    firebase.database().app.name.should.eql('[DEFAULT]');

    firebase
      .database(firebase.app('secondaryFromNative'))
      .app.name.should.eql('secondaryFromNative');

    firebase
      .app('secondaryFromNative')
      .database()
      .app.name.should.eql('secondaryFromNative');
  });

  describe('ref()', function() {
    it('throws if path is not a string', async function() {
      try {
        firebase.database().ref({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'path' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if path is not a valid string', async function() {
      try {
        firebase.database().ref('$$$$$');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "Paths must be non-empty strings and can't contain #, $, [, ], ' or ?",
        );
        return Promise.resolve();
      }
    });
  });

  describe('refFromURL()', function() {
    it('throws if url is not a url', async function() {
      try {
        firebase.database().refFromURL('foobar');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'url' must be a valid database URL");
        return Promise.resolve();
      }
    });

    it('throws if url from a different domain', async function() {
      try {
        firebase.database().refFromURL('https://foobar.firebaseio.com');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'url' must be the same domain as the current instance");
        return Promise.resolve();
      }
    });

    it('returns a reference', async function() {
      const ref1 = firebase.database().refFromURL(firebase.database()._customUrlOrRegion);
      const ref2 = firebase
        .database()
        .refFromURL(`${firebase.database()._customUrlOrRegion}/foo/bar`);
      const ref3 = firebase
        .database()
        .refFromURL(`${firebase.database()._customUrlOrRegion}/foo/bar?baz=foo`);
      should.equal(ref1.path, '/');
      should.equal(ref2.path, 'foo/bar');
      should.equal(ref3.path, 'foo/bar');
    });
  });

  describe('goOnline()', function() {
    it('calls goOnline successfully', async function() {
      await firebase.database().goOnline();
    });
  });

  describe('goOffline()', function() {
    it('calls goOffline successfully', async function() {
      // await Utils.sleep(5000);
      await firebase.database().goOffline();

      await firebase.database().goOnline();
    });
  });

  describe('setPersistenceEnabled()', function() {
    it('throws if enabled is not a boolean', async function() {
      try {
        firebase.database().setPersistenceEnabled('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'enabled' must be a boolean value");
        return Promise.resolve();
      }
    });

    it('calls setPersistenceEnabled successfully', async function() {
      firebase.database().setPersistenceEnabled(true);
      firebase.database().setPersistenceEnabled(false);
    });
  });

  describe('setLoggingEnabled()', function() {
    it('throws if enabled is not a boolean', async function() {
      try {
        firebase.database().setLoggingEnabled('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'enabled' must be a boolean value");
        return Promise.resolve();
      }
    });

    it('calls setLoggingEnabled successfully', async function() {
      firebase.database().setLoggingEnabled(true);
      firebase.database().setLoggingEnabled(false);
    });
  });

  describe('setPersistenceCacheSizeBytes()', function() {
    it('throws if bytes is not a number', async function() {
      try {
        firebase.database().setPersistenceCacheSizeBytes('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'bytes' must be a number value");
        return Promise.resolve();
      }
    });

    it('throws if bytes is less than 1MB', async function() {
      try {
        firebase.database().setPersistenceCacheSizeBytes(1234);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'bytes' must be greater than 1048576 bytes (1MB)");
        return Promise.resolve();
      }
    });

    it('throws if bytes is greater than 10MB', async function() {
      try {
        firebase.database().setPersistenceCacheSizeBytes(100000000000000);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'bytes' must be less than 104857600 bytes (100MB)");
        return Promise.resolve();
      }
    });

    it('calls setPersistenceCacheSizeBytes successfully', async function() {
      firebase.database().setPersistenceCacheSizeBytes(1048576); // 1mb
    });
  });

  describe('getServerTime()', function() {
    it('returns a valid date', async function() {
      const date = firebase.database().getServerTime();
      date.getDate.should.be.Function();
    });
  });

  describe('handles invalid references()', function() {
    it('returns a valid date', async function() {
      try {
        firebase.database().ref('$');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "Paths must be non-empty strings and can't contain #, $, [, ], ' or ?",
        );
        return Promise.resolve();
      }
    });
  });
});
