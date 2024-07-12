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

const { updateTemplate } = require('./helpers');

describe('remoteConfig()', function () {
  describe('firebase v8 compatibility', function () {
    describe('fetch()', function () {
      it('with expiration provided', async function () {
        const date = Date.now() - 30000;
        await firebase.remoteConfig().ensureInitialized();

        if (Platform.android) {
          // iOS persists last fetch status so this test will fail sometimes
          firebase.remoteConfig().fetchTimeMillis.should.be.a.Number();
        }

        await firebase.remoteConfig().fetch(0);
        firebase
          .remoteConfig()
          .lastFetchStatus.should.equal(firebase.remoteConfig.LastFetchStatus.SUCCESS);
        should.equal(firebase.remoteConfig().fetchTimeMillis >= date, true);
      });

      it('without expiration provided', function () {
        return firebase.remoteConfig().fetch();
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
      // TODO: flakey in jet e2e tests
      xit('minimumFetchIntervalMillis sets correctly', async function () {
        await firebase.remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 3000 });

        firebase.remoteConfig().settings.minimumFetchIntervalMillis.should.be.equal(3000);
      });

      it('fetchTimeMillis sets correctly', async function () {
        await firebase.remoteConfig().setConfigSettings({ fetchTimeMillis: 3000 });

        firebase.remoteConfig().settings.fetchTimeMillis.should.be.equal(3000);
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
      if (Platform.other) {
        // Not supported on Web.
        return;
      }

      it('sets defaults from remote_config_resource_test file', async function () {
        await firebase.remoteConfig().setDefaultsFromResource('remote_config_resource_test');
        const config = firebase.remoteConfig().getAll();
        config.company.getSource().should.equal('default');
        config.company.asString().should.equal('invertase');
      });

      it('rejects if resource not found', async function () {
        let error;
        try {
          await firebase.remoteConfig().setDefaultsFromResource('i_do_not_exist');
        } catch (e) {
          error = e;
        }
        if (!error) {
          throw new Error('Did not reject');
        }
        // TODO dasherize error namespace
        error.code.should.equal('remoteConfig/resource_not_found');
        error.message.should.containEql('was not found');
      });
    });

    describe('defaultConfig', function () {
      it('gets plain key/value object of defaults', async function () {
        await firebase.remoteConfig().setDefaults({
          test_key: 'foo',
        });

        should(firebase.remoteConfig().defaultConfig.test_key).equal('foo');
      });
    });

    describe('reset()', function () {
      it('resets all activated, fetched and default config', async function () {
        if (Platform.android) {
          await firebase.remoteConfig().setDefaults({
            some_key: 'I do not exist',
          });

          const config = firebase.remoteConfig().getAll();

          const remoteProps = ['some_key'];

          config.should.have.keys(...remoteProps);

          await firebase.remoteConfig().reset();

          const configRetrieveAgain = firebase.remoteConfig().getAll();

          should(configRetrieveAgain).not.have.properties(remoteProps);
        } else {
          this.skip();
        }
      });

      it('returns a "null" value as reset() API is not supported on iOS', async function () {
        if (Platform.ios) {
          const reset = await firebase.remoteConfig().reset();

          should(reset).equal(null);
        }
      });
    });
  });

  describe('modular', function () {
    describe('getRemoteConfig', function () {
      it('pass app as argument', function () {
        const { getRemoteConfig } = remoteConfigModular;

        const remoteConfig = getRemoteConfig(firebase.app());

        remoteConfig.constructor.name.should.be.equal('FirebaseConfigModule');
      });

      it('no app as argument', function () {
        const { getRemoteConfig } = remoteConfigModular;

        const remoteConfig = getRemoteConfig(firebase.app());

        remoteConfig.constructor.name.should.be.equal('FirebaseConfigModule');
      });
    });

    describe('fetch()', function () {
      it('with expiration provided', async function () {
        const { getRemoteConfig, ensureInitialized, fetch } = remoteConfigModular;
        const date = Date.now() - 30000;
        const remoteConfig = getRemoteConfig();
        await ensureInitialized(remoteConfig);

        if (Platform.android) {
          // iOS persists last fetch status so this test will fail sometimes
          remoteConfig.fetchTimeMillis.should.be.a.Number();
        }

        await fetch(remoteConfig, 0);
        remoteConfig.lastFetchStatus.should.equal(firebase.remoteConfig.LastFetchStatus.SUCCESS);
        should.equal(firebase.remoteConfig().fetchTimeMillis >= date, true);
      });

      it('without expiration provided', function () {
        const { getRemoteConfig, fetch } = remoteConfigModular;
        return fetch(getRemoteConfig());
      });
    });

    describe('fetchAndActivate()', function () {
      it('returns true/false if activated', async function () {
        const { getRemoteConfig, fetchAndActivate } = remoteConfigModular;
        const activated = await fetchAndActivate(getRemoteConfig());
        activated.should.be.a.Boolean();
      });
    });

    describe('activate()', function () {
      it('with expiration provided', async function () {
        const { getRemoteConfig, fetch, activate } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();

        await fetch(remoteConfig, 0);
        const activated = await activate(remoteConfig);
        activated.should.be.a.Boolean();
      });

      it('without expiration provided', async function () {
        const { getRemoteConfig, fetch, activate } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        await fetch(remoteConfig);
        const activated = await activate(remoteConfig);
        activated.should.be.a.Boolean();
      });
    });

    describe('config settings', function () {
      it('should be immediately available', async function () {
        const { getRemoteConfig } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        remoteConfig.lastFetchStatus.should.be.a.String();
        remoteConfig.lastFetchStatus.should.equal('success');
        remoteConfig.fetchTimeMillis.should.be.a.Number();
      });
    });

    describe('setConfigSettings()', function () {
      // TODO flakey in jet e2e tests
      xit('minimumFetchIntervalMillis sets correctly', async function () {
        const { getRemoteConfig, setConfigSettings } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        await setConfigSettings(remoteConfig, { minimumFetchIntervalMillis: 3000 });

        remoteConfig.settings.minimumFetchIntervalMillis.should.be.equal(3000);
      });

      it('fetchTimeMillis sets correctly', async function () {
        const { getRemoteConfig, setConfigSettings } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        await setConfigSettings(remoteConfig, { fetchTimeMillis: 3000 });

        remoteConfig.settings.fetchTimeMillis.should.be.equal(3000);
      });
    });

    describe('ensureInitialized()', function () {
      it('should ensure remote config has been initialized and values are accessible', async function () {
        const { getRemoteConfig, ensureInitialized, getValue } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();

        const ensure = await ensureInitialized(remoteConfig);
        const number = getValue(remoteConfig, 'number');

        should(ensure).equal(null);
        number.getSource().should.equal('remote');
        number.asNumber().should.equal(1337);
      });
    });

    describe('getAll() with remote', function () {
      it('should return an object of all available values', function () {
        const { getRemoteConfig, getAll } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        const config = getAll(remoteConfig);
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
        const { getRemoteConfig, setDefaults, getAll } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        await setDefaults(remoteConfig, {
          some_key: 'I do not exist',
          some_key_1: 1337,
          some_key_2: true,
        });

        const values = getAll(remoteConfig);
        values.some_key.asString().should.equal('I do not exist');
        values.some_key_1.asNumber().should.equal(1337);
        should.equal(values.some_key_2.asBoolean(), true);

        values.some_key.getSource().should.equal('default');
        values.some_key_1.getSource().should.equal('default');
        values.some_key_2.getSource().should.equal('default');
      });
    });

    describe('getValue()', function () {
      describe('getValue().asBoolean()', function () {
        it("returns 'true' for the specified keys: '1', 'true', 't', 'yes', 'y', 'on'", async function () {
          const { getRemoteConfig, setDefaults, getValue } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          //Boolean truthy values as defined by web sdk
          await setDefaults(remoteConfig, {
            test1: '1',
            test2: 'true',
            test3: 't',
            test4: 'yes',
            test5: 'y',
            test6: 'on',
          });

          const test1 = getValue(remoteConfig, 'test1').asBoolean();

          const test2 = getValue(remoteConfig, 'test2').asBoolean();
          const test3 = getValue(remoteConfig, 'test3').asBoolean();
          const test4 = getValue(remoteConfig, 'test4').asBoolean();
          const test5 = getValue(remoteConfig, 'test5').asBoolean();
          const test6 = getValue(remoteConfig, 'test6').asBoolean();

          test1.should.equal(true);
          test2.should.equal(true);
          test3.should.equal(true);
          test4.should.equal(true);
          test5.should.equal(true);
          test6.should.equal(true);
        });

        it("returns 'false' for values that resolve to a falsy", async function () {
          const { getRemoteConfig, setDefaults, getValue } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          await setDefaults(remoteConfig, {
            test1: '2',
            test2: 'foo',
          });

          const test1 = getValue(remoteConfig, 'test1').asBoolean();

          const test2 = getValue(remoteConfig, 'test2').asBoolean();

          test1.should.equal(false);
          test2.should.equal(false);
        });

        it("returns 'false' if the source is static", function () {
          const { getRemoteConfig, getValue } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          const unknownKey = getValue(remoteConfig, 'unknownKey').asBoolean();

          unknownKey.should.equal(false);
        });
      });

      describe('getValue().asString()', function () {
        it('returns the value as a string', function () {
          const { getRemoteConfig, getAll } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          const config = getAll(remoteConfig);

          config.number.asString().should.equal('1337');
          config.float.asString().should.equal('123.456');
          config.prefix_1.asString().should.equal('1');
          config.bool.asString().should.equal('true');
        });
      });

      describe('getValue().asNumber()', function () {
        it('returns the value as a number if it can be evaluated as a number', function () {
          const { getRemoteConfig, getAll } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          const config = getAll(remoteConfig);

          config.number.asNumber().should.equal(1337);
          config.float.asNumber().should.equal(123.456);
          config.prefix_1.asNumber().should.equal(1);
        });

        it('returns the value "0" if it cannot be evaluated as a number', function () {
          const { getRemoteConfig, getAll } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          const config = getAll(remoteConfig);

          config.bool.asNumber().should.equal(0);
          config.string.asNumber().should.equal(0);
        });

        it("returns '0' if the source is static", function () {
          const { getRemoteConfig, getValue } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          const unknownKey = getValue(remoteConfig, 'unknownKey').asNumber();

          unknownKey.should.equal(0);
        });
      });

      describe('getValue().getSource()', function () {
        it('returns the correct source as default or remote', async function () {
          const { getRemoteConfig, setDefaults, getAll } = remoteConfigModular;
          const remoteConfig = getRemoteConfig();
          await setDefaults(remoteConfig, {
            test1: '2',
            test2: 'foo',
          });

          const config = getAll(remoteConfig);

          config.number.getSource().should.equal('remote');
          config.bool.getSource().should.equal('remote');
          config.string.getSource().should.equal('remote');

          config.test1.getSource().should.equal('default');
          config.test2.getSource().should.equal('default');
        });
      });

      it("returns an empty string for a static value for keys that doesn't exist", function () {
        const { getRemoteConfig, getValue } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();

        const configValue = getValue(remoteConfig, 'fourOhFour');
        configValue.getSource().should.equal('static');
        should.equal(configValue.asString(), '');
      });

      it('errors if no key provided', async function () {
        const { getRemoteConfig, getValue } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        try {
          getValue(remoteConfig);
          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          error.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });

      it('errors if key not a string', async function () {
        const { getRemoteConfig, getValue } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        try {
          getValue(remoteConfig, 1234);
          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          error.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });
    });

    describe('getAll()', function () {
      it('gets all values', async function () {
        const { getRemoteConfig, getAll } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        const config = getAll(remoteConfig);

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
      if (Platform.other) {
        // Not supported on Web.
        return;
      }

      it('sets defaults from remote_config_resource_test file', async function () {
        const { getRemoteConfig, getAll, setDefaultsFromResource } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();

        await setDefaultsFromResource(remoteConfig, 'remote_config_resource_test');
        const config = getAll(remoteConfig);
        config.company.getSource().should.equal('default');
        config.company.asString().should.equal('invertase');
      });

      it('rejects if resource not found', async function () {
        const { getRemoteConfig, setDefaultsFromResource } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        let error;
        try {
          await setDefaultsFromResource(remoteConfig, 'i_do_not_exist');
        } catch (e) {
          error = e;
        }
        if (!error) {
          throw new Error('Did not reject');
        }
        // TODO dasherize error namespace
        error.code.should.equal('remoteConfig/resource_not_found');
        error.message.should.containEql('was not found');
      });
    });

    describe('reset()', function () {
      it('resets all activated, fetched and default config', async function () {
        const { getRemoteConfig, setDefaults, getAll, reset } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        if (Platform.android) {
          await setDefaults(remoteConfig, {
            some_key: 'I do not exist',
          });

          const config = getAll(remoteConfig);

          const remoteProps = ['some_key'];

          config.should.have.keys(...remoteProps);

          await reset(remoteConfig);

          const configRetrieveAgain = getAll(remoteConfig);

          should(configRetrieveAgain).not.have.properties(remoteProps);
        } else {
          this.skip();
        }
      });

      it('returns a "null" value as reset() API is not supported on iOS', async function () {
        const { getRemoteConfig, reset } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();
        if (Platform.ios) {
          const resetConfig = await reset(remoteConfig);

          should(resetConfig).equal(null);
        }
      });
    });

    describe('defaultConfig', function () {
      it('gets plain key/value object of defaults', async function () {
        const { getRemoteConfig, setDefaults } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();

        await setDefaults(remoteConfig, {
          some_key: 'some_key',
        });

        should(remoteConfig.defaultConfig.some_key).equal('some_key');
      });
    });

    describe('setLogLevel', function () {
      it('should return "error" log level', function () {
        const { getRemoteConfig, setLogLevel } = remoteConfigModular;
        const remoteConfig = getRemoteConfig();

        const logLevel = setLogLevel(remoteConfig, 'error');

        should(logLevel).equal('error');
      });
    });

    describe('isSupported', function () {
      it('should return "true"', async function () {
        const { isSupported } = remoteConfigModular;

        const supported = await isSupported();

        should(supported).equal(true);
      });
    });

    describe('onConfigUpdated', function () {
      if (Platform.other) {
        // Not supported on Web.
        return;
      }

      let unsubscribers = [];

      before(async function () {
        // configure a listener so any new templates are fetched and cached locally
        const { fetchAndActivate, getRemoteConfig, onConfigUpdated } = remoteConfigModular;
        const config = getRemoteConfig();
        const unsubscribe = onConfigUpdated(config, () => {});

        // clear out old test data
        const response = await updateTemplate({
          operations: {
            delete: ['rttest_param1', 'rttest_param2', 'rttest_param3'],
          },
        });
        should(response.result !== undefined).equal(true, 'response result not defined');
        // console.error('before updateTemplate version: ' + response.result.templateVersion);

        // activate to make sure all values are in effect,
        // thus realtime updates only shows our testing work
        await fetchAndActivate(getRemoteConfig());
        unsubscribe();
      });

      after(async function () {
        const response = await updateTemplate({
          operations: {
            delete: ['rttest_param1', 'rttest_param2', 'rttest_param3'],
          },
        });
        should(response.result !== undefined).equal(true, 'response result not defined');
        // console.error('after updateTemplate version: ' + response.result.templateVersion);
      });

      afterEach(async function () {
        for (let i = 0; i < unsubscribers.length; i++) {
          unsubscribers[i]();
        }
        unsubscribers = [];
      });

      // TODO:
      //  native listener emits, so verifying native listener count is same as counting callback events
      //  - so main idea is to focus on callback counts and make sure they are exactly as expected
      // TODO: flakey in Jet e2e
      xit('adds a listener and receives updates', async function () {
        // Configure our listener
        const { fetchAndActivate, getRemoteConfig, onConfigUpdated } = remoteConfigModular;
        const config = getRemoteConfig();
        await fetchAndActivate(config);
        const callback = sinon.spy();
        const unsubscribe = onConfigUpdated(config, (event, error) => callback(event, error));
        unsubscribers.push(unsubscribe);
        // Update the template using our cloud function, so our listeners are called
        let response = await updateTemplate({
          operations: {
            add: [{ name: 'rttest_param1', value: Date.now() + '' }],
          },
        });
        should(response.result !== undefined).equal(true, 'response result not defined');

        // Assert: we were called exactly once with expected update event contents
        await Utils.spyToBeCalledTimesAsync(callback, 1, 60000);
        should(callback.callCount).equal(1);
        let callbackError = callback.getCall(0).args[1];
        should(callbackError).equal(undefined, 'error ' + JSON.stringify(callbackError));
        let callbackEvent = callback.getCall(0).args[0];
        should(callbackEvent.updatedKeys.includes('rttest_param1')).equal(
          true,
          'updated param not in callback updated keys set',
        );
        unsubscribe();
      });

      // TODO: flakey in Jet e2e, are we not clearing out old listeners properly?
      //       AssertionError: expected 16 to be 2 at:
      //       should(callbackEvent.updatedKeys.length).equal(2);
      xit('manages multiple listeners', async function () {
        const { fetchAndActivate, getRemoteConfig, onConfigUpdated } = remoteConfigModular;
        const config = getRemoteConfig();

        // activate the current config so the "updated" list starts empty
        await fetchAndActivate(config);

        // Set up our listeners
        const callback1 = sinon.spy();
        const unsubscribe1 = onConfigUpdated(config, (event, error) => callback1(event, error));
        unsubscribers.push(unsubscribe1);
        const callback2 = sinon.spy();
        const unsubscribe2 = onConfigUpdated(config, (event, error) => callback2(event, error));
        unsubscribers.push(unsubscribe2);
        const callback3 = sinon.spy();
        const unsubscribe3 = onConfigUpdated(config, (event, error) => callback3(event, error));
        unsubscribers.push(unsubscribe3);

        // Trigger an update that should call them all
        let response = await updateTemplate({
          operations: {
            add: [{ name: 'rttest_param1', value: Date.now() + '' }],
          },
        });
        should(response.result !== undefined).equal(true, 'response result not defined');

        // Assert all were called with expected values
        await Utils.spyToBeCalledTimesAsync(callback1, 1, 60000);
        await Utils.spyToBeCalledTimesAsync(callback2, 1, 60000);
        await Utils.spyToBeCalledTimesAsync(callback3, 1, 60000);
        [callback1, callback2, callback3].forEach(callback => {
          should(callback.callCount).equal(1);
          should(callback.getCall(0).args[1]).equal(
            undefined,
            'error ' + JSON.stringify(callback.getCall(0).args[1]),
          );
          let callbackEvent = callback.getCall(0).args[0];
          should(callbackEvent.updatedKeys.length).equal(1);
          should(callbackEvent.updatedKeys.includes('rttest_param1')).equal(
            true,
            'updated param not in callback updated keys set',
          );
        });

        // Unsubscribe second listener and repeat, this time expecting no call on second listener
        unsubscribe2();

        // Trigger update that should call listener 1 and 3
        response = await updateTemplate({
          operations: {
            add: [{ name: 'rttest_param2', value: Date.now() + '' }],
          },
        });
        should(response.result !== undefined).equal(true, 'response result not defined');

        // Assert first and third were called with expected values
        await Utils.spyToBeCalledTimesAsync(callback1, 2, 60000);
        await Utils.spyToBeCalledTimesAsync(callback3, 2, 60000);

        // callback2 should not have been called again - same call count expected
        should(callback2.callCount).equal(1);

        // assert callback 1 and 3 have new information
        [callback1, callback3].forEach(callback => {
          should(callback.callCount).equal(2);
          should(callback.getCall(1).args[1]).equal(
            undefined,
            'error ' + JSON.stringify(callback.getCall(1).args[1]),
          );
          let callbackEvent = callback.getCall(1).args[0];
          should(callbackEvent.updatedKeys.length).equal(2);
          should(callbackEvent.updatedKeys.includes('rttest_param2')).equal(
            true,
            'updated param not in callback updated keys set',
          );
        });

        // Unsubscribe remaining listeners
        unsubscribe1();
        unsubscribe3();

        // Trigger an update that should call no listeners
        response = await updateTemplate({
          operations: {
            add: [{ name: 'rttest_param3', value: Date.now() + '' }],
          },
        });
        should(response.result !== undefined).equal(true, 'response result not defined');
        // Give the servers plenty of time to call us
        await Utils.sleep(20000);
        should(callback1.callCount).equal(2);
        should(callback3.callCount).equal(2);
      });

      // - react-native reload
      //   - make sure native count is zero
      //   - add a listener, assert native count one
      //   - rnReload via detox, assert native count is zero
      it('handles react-native reload', async function () {
        // TODO implement rnReload test
        // console.log('checking listener functionality across javascript layer reload');
      });
    });
  });
});
