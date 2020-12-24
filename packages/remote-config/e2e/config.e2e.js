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

describe('remoteConfig()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      should.exist(app.remoteConfig);
      app.remoteConfig().app.should.equal(app);
    });

    it('supports multiple apps', async function () {
      firebase.firestore().app.name.should.equal('[DEFAULT]');

      firebase
        .firestore(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .remoteConfig()
        .app.name.should.equal('secondaryFromNative');
    });
  });

  describe('statics', function () {
    it('LastFetchStatus', function () {
      firebase.remoteConfig.LastFetchStatus.should.be.an.Object();
      firebase.remoteConfig.LastFetchStatus.FAILURE.should.equal('failure');
      firebase.remoteConfig.LastFetchStatus.SUCCESS.should.equal('success');
      firebase.remoteConfig.LastFetchStatus.NO_FETCH_YET.should.equal('no_fetch_yet');
      firebase.remoteConfig.LastFetchStatus.THROTTLED.should.equal('throttled');
    });

    it('ValueSource', function () {
      firebase.remoteConfig.ValueSource.should.be.an.Object();
      firebase.remoteConfig.ValueSource.REMOTE.should.equal('remote');
      firebase.remoteConfig.ValueSource.STATIC.should.equal('static');
      firebase.remoteConfig.ValueSource.DEFAULT.should.equal('default');
    });
  });

  describe('fetch()', function () {
    it('with expiration provided', async function () {
      const date = Date.now() - 30000;
      await firebase.remoteConfig().ensureInitialized();

      if (device.getPlatform() === 'android') {
        // iOS persists last fetch status so this test will fail sometimes
        firebase.remoteConfig().fetchTimeMillis.should.be.a.Number();
      }

      await firebase.remoteConfig().fetch(0);
      firebase
        .remoteConfig()
        .lastFetchStatus.should.equal(firebase.remoteConfig.LastFetchStatus.SUCCESS);
      // TODO leave logger here - need to investigate flakey test
      // eslint-disable-next-line no-console
      console.log(firebase.remoteConfig().fetchTimeMillis, date);
      should.equal(firebase.remoteConfig().fetchTimeMillis >= date, true);
    });
    it('without expiration provided', function () {
      return firebase.remoteConfig().fetch();
    });
    it('it throws if expiration is not a number', function () {
      try {
        firebase.remoteConfig().fetch('foo');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a number value');
        return Promise.resolve();
      }
    });
  });

  describe('fetchAndActivate()', function () {
    it('returns true/false if activated', async function () {
      const activated = await firebase.remoteConfig().fetchAndActivate();
      activated.should.be.a.Boolean();
    });
  });

  describe('activate()', function () {
    it('with expiration provided', async function () {
      await firebase.remoteConfig().fetch(0);
      const activated = await firebase.remoteConfig().activate();
      activated.should.be.a.Boolean();
    });

    it('without expiration provided', async function () {
      await firebase.remoteConfig().fetch();
      const activated = await firebase.remoteConfig().activate();
      activated.should.be.a.Boolean();
    });
  });

  describe('config settings', function () {
    it('should be immediately available', async function () {
      firebase.remoteConfig().lastFetchStatus.should.be.a.String();
      firebase.remoteConfig().lastFetchStatus.should.equal('success');
      firebase.remoteConfig().fetchTimeMillis.should.be.a.Number();
    });
  });

  describe('setConfigSettings()', function () {
    it('it throws if arg is not an object', async function () {
      try {
        firebase.remoteConfig().setConfigSettings('not an object');

        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must set an object');
        return Promise.resolve();
      }
    });

    it('minimumFetchIntervalMillis sets correctly', async function () {
      await firebase.remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 3000 });

      firebase.remoteConfig().settings.minimumFetchIntervalMillis.should.be.equal(3000);
    });

    it('throws if minimumFetchIntervalMillis is not a number', async function () {
      try {
        firebase.remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 'potato' });

        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a number type in milliseconds.');
        return Promise.resolve();
      }
    });

    it('fetchTimeMillis sets correctly', async function () {
      await firebase.remoteConfig().setConfigSettings({ fetchTimeMillis: 3000 });

      firebase.remoteConfig().settings.fetchTimeMillis.should.be.equal(3000);
    });

    it('throws if fetchTimeMillis is not a number', function () {
      try {
        firebase.remoteConfig().setConfigSettings({ fetchTimeMillis: 'potato' });

        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a number type in milliseconds.');
        return Promise.resolve();
      }
    });
  });

  describe('ensureInitialized()', function () {
    it('should ensure remote config has been initialized and values are accessible', async function () {
      const ensure = await firebase.remoteConfig().ensureInitialized();
      const number = firebase.remoteConfig().getValue('number');

      should(ensure).equal(null);
      number.getSource().should.equal('remote');
      number.asNumber().should.equal(1337);
    });
  });

  describe('getAll() with remote', function () {
    it('should return an object of all available values', function () {
      const config = firebase.remoteConfig().getAll();
      config.number.asNumber().should.equal(1337);
      config.number.getSource().should.equal('remote');
      // firebase console stores as a string
      config.float.asNumber().should.equal(123.456);
      config.float.getSource().should.equal('remote');
      config.prefix_1.asNumber().should.equal(1);
      config.prefix_1.getSource().should.equal('remote');
    });
  });

  describe('setDefaults()', function () {
    it('sets default values from key values object', async function () {
      await firebase.remoteConfig().setDefaults({
        some_key: 'I do not exist',
        some_key_1: 1337,
        some_key_2: true,
      });

      const values = firebase.remoteConfig().getAll();
      values.some_key.asString().should.equal('I do not exist');
      values.some_key_1.asNumber().should.equal(1337);
      should.equal(values.some_key_2.asBoolean(), true);

      values.some_key.getSource().should.equal('default');
      values.some_key_1.getSource().should.equal('default');
      values.some_key_2.getSource().should.equal('default');
    });

    it('it throws if defaults object not provided', function () {
      try {
        firebase.remoteConfig().setDefaults('not an object');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an object.');
        return Promise.resolve();
      }
    });
  });

  describe('getValue()', function () {
    describe('getValue().asBoolean()', function () {
      it("returns 'true' for the specified keys: '1', 'true', 't', 'yes', 'y', 'on'", async function () {
        //Boolean truthy values as defined by web sdk
        await firebase.remoteConfig().setDefaults({
          test1: '1',
          test2: 'true',
          test3: 't',
          test4: 'yes',
          test5: 'y',
          test6: 'on',
        });

        const test1 = firebase.remoteConfig().getValue('test1').asBoolean();

        const test2 = firebase.remoteConfig().getValue('test2').asBoolean();
        const test3 = firebase.remoteConfig().getValue('test3').asBoolean();
        const test4 = firebase.remoteConfig().getValue('test4').asBoolean();
        const test5 = firebase.remoteConfig().getValue('test5').asBoolean();
        const test6 = firebase.remoteConfig().getValue('test6').asBoolean();

        test1.should.equal(true);
        test2.should.equal(true);
        test3.should.equal(true);
        test4.should.equal(true);
        test5.should.equal(true);
        test6.should.equal(true);
      });

      it("returns 'false' for values that resolve to a falsy", async function () {
        await firebase.remoteConfig().setDefaults({
          test1: '2',
          test2: 'foo',
        });

        const test1 = firebase.remoteConfig().getValue('test1').asBoolean();

        const test2 = firebase.remoteConfig().getValue('test2').asBoolean();

        test1.should.equal(false);
        test2.should.equal(false);
      });

      it("returns 'false' if the source is static", function () {
        const unknownKey = firebase.remoteConfig().getValue('unknownKey').asBoolean();

        unknownKey.should.equal(false);
      });
    });

    describe('getValue().asString()', function () {
      it('returns the value as a string', function () {
        const config = firebase.remoteConfig().getAll();

        config.number.asString().should.equal('1337');
        config.float.asString().should.equal('123.456');
        config.prefix_1.asString().should.equal('1');
        config.bool.asString().should.equal('true');
      });
    });

    describe('getValue().asNumber()', function () {
      it('returns the value as a number if it can be evaluated as a number', function () {
        const config = firebase.remoteConfig().getAll();

        config.number.asNumber().should.equal(1337);
        config.float.asNumber().should.equal(123.456);
        config.prefix_1.asNumber().should.equal(1);
      });

      it('returns the value "0" if it cannot be evaluated as a number', function () {
        const config = firebase.remoteConfig().getAll();

        config.bool.asNumber().should.equal(0);
        config.string.asNumber().should.equal(0);
      });

      it("returns '0' if the source is static", function () {
        const unknownKey = firebase.remoteConfig().getValue('unknownKey').asNumber();

        unknownKey.should.equal(0);
      });
    });

    describe('getValue().getSource()', function () {
      it('returns the correct source as default or remote', async function () {
        await firebase.remoteConfig().setDefaults({
          test1: '2',
          test2: 'foo',
        });

        const config = firebase.remoteConfig().getAll();

        config.number.getSource().should.equal('remote');
        config.bool.getSource().should.equal('remote');
        config.string.getSource().should.equal('remote');

        config.test1.getSource().should.equal('default');
        config.test2.getSource().should.equal('default');
      });
    });

    it("returns an empty string for a static value for keys that doesn't exist", function () {
      const configValue = firebase.remoteConfig().getValue('fourOhFour');
      configValue.getSource().should.equal('static');
      should.equal(configValue.asString(), '');
    });

    it('errors if no key provided', async function () {
      try {
        firebase.remoteConfig().getValue();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });

    it('errors if key not a string', async function () {
      try {
        firebase.remoteConfig().getValue(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });
  });

  describe('getAll()', function () {
    it('gets all values', async function () {
      const config = firebase.remoteConfig().getAll();

      config.should.be.a.Object();
      config.should.have.keys('bool', 'string', 'number');

      const boolValue = config.bool.asBoolean();
      const stringValue = config.string.asString();
      const numberValue = config.number.asNumber();

      boolValue.should.be.equal(true);
      stringValue.should.be.equal('invertase');
      numberValue.should.be.equal(1337);
    });
  });

  describe('setDefaultsFromResource()', function () {
    it('sets defaults from remote_config_resource_test file', async function () {
      await firebase.remoteConfig().setDefaultsFromResource('remote_config_resource_test');
      const config = firebase.remoteConfig().getAll();
      config.company.getSource().should.equal('default');
      config.company.asString().should.equal('invertase');
    });

    it('rejects if resource not found', async function () {
      const [error] = await A2A(firebase.remoteConfig().setDefaultsFromResource('i_do_not_exist'));
      if (!error) {
        throw new Error('Did not reject');
      }
      // TODO dasherize error namespace
      error.code.should.equal('remoteConfig/resource_not_found');
      error.message.should.containEql('was not found');
    });

    it('throws if resourceName is not a string', function () {
      try {
        firebase.remoteConfig().setDefaultsFromResource(1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string value');
        return Promise.resolve();
      }
    });
  });

  describe('reset()', function () {
    android.it('resets all activated, fetched and default config', async () => {
      await firebase.remoteConfig().setDefaults({
        some_key: 'I do not exist',
      });

      const config = firebase.remoteConfig().getAll();

      const remoteProps = ['some_key'];

      config.should.have.keys(...remoteProps);

      await firebase.remoteConfig().reset();

      const configRetrieveAgain = firebase.remoteConfig().getAll();

      should(configRetrieveAgain).not.have.properties(remoteProps);
    });

    it('returns a "null" value as reset() API is not supported on iOS', async function () {
      if (device.getPlatform() === 'ios') {
        const reset = await firebase.remoteConfig().reset();

        should(reset).equal(null);
      }
    });
  });
});
