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

describe('config()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.config);
      app.config().app.should.equal(app);
    });
  });

  describe('fetch()', () => {
    it('with expiration provided', () => firebase.config().fetch(0));
    it('without expiration provided', () => firebase.config().fetch());
    it('it throws if expiration is not a number', () => {
      try {
        firebase.config().fetch('foo');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a number value');
        return Promise.resolve();
      }
    });
  });

  describe('fetchAndActivate()', () => {
    it('returns true/false if activated', async () => {
      const activated = await firebase.config().fetchAndActivate(0);
      activated.should.be.a.Boolean();
    });
    it('with expiration provided', () => firebase.config().fetchAndActivate(0));
    it('without expiration provided', () => firebase.config().fetchAndActivate());
    it('it throws if expiration is not a number', () => {
      try {
        firebase.config().fetchAndActivate('foo');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a number value');
        return Promise.resolve();
      }
    });
  });

  describe('activateFetched()', () => {
    it('with expiration provided', async () => {
      await firebase.config().fetch(0);
      const activated = await firebase.config().activateFetched();
      activated.should.be.a.Boolean();
    });

    it('without expiration provided', async () => {
      await firebase.config().fetch();
      const activated = await firebase.config().activateFetched();
      activated.should.be.a.Boolean();
    });
  });

  describe('getConfigSettings()', () => {
    it('gets settings', async () => {
      const settings = await firebase.config().getConfigSettings();
      settings.isDeveloperModeEnabled.should.be.a.Boolean();
      settings.isDeveloperModeEnabled.should.equal(false);
      settings.lastFetchStatus.should.be.a.String();
      settings.lastFetchStatus.should.equal('success');
      settings.lastFetchTime.should.be.a.Number();
    });
  });

  describe('setConfigSettings()', () => {
    it('isDeveloperModeEnabled sets correctly', async () => {
      const settingsBefore = await firebase.config().getConfigSettings();
      settingsBefore.isDeveloperModeEnabled.should.equal(false);
      settingsBefore.isDeveloperModeEnabled.should.be.a.Boolean();

      await firebase.config().setConfigSettings({ isDeveloperModeEnabled: true });

      const settingsAfter = await firebase.config().getConfigSettings();
      settingsAfter.isDeveloperModeEnabled.should.equal(true);
      settingsAfter.isDeveloperModeEnabled.should.be.a.Boolean();

      await firebase.config().setConfigSettings({ isDeveloperModeEnabled: false });
    });

    it('returns the new config settings', async () => {
      const settings = await firebase.config().setConfigSettings({ isDeveloperModeEnabled: false });
      settings.isDeveloperModeEnabled.should.be.a.Boolean();
      settings.isDeveloperModeEnabled.should.equal(false);
      settings.lastFetchStatus.should.be.a.String();
      settings.lastFetchStatus.should.equal('success');
      settings.lastFetchTime.should.be.a.Number();
    });

    it('it throws if no args', async () => {
      try {
        await firebase.config().setConfigSettings();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an object');
        return Promise.resolve();
      }
    });

    it('it throws if object does not contain isDeveloperModeEnabled key', async () => {
      try {
        await firebase.config().setConfigSettings({});
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'isDeveloperModeEnabled' key`);
        return Promise.resolve();
      }
    });

    it('it throws if isDeveloperModeEnabled key is not a boolean', async () => {
      try {
        await firebase.config().setConfigSettings({ isDeveloperModeEnabled: 'potato' });
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(
          `'settings.isDeveloperModeEnabled' must be a boolean value`,
        );
        return Promise.resolve();
      }
    });
  });

  describe('getKeysByPrefix()', () => {
    it('should return an object of all available values if no key prefix provided', async () => {
      const config = await firebase.config().getValuesByKeysPrefix();
      config.number.value.should.equal(1337);
      config.number.source.should.equal('remote');
      // firebase console stores as a string
      config.float.value.should.equal(123.456);
      config.float.source.should.equal('remote');
    });

    it('should return an object filtered by prefixed keys', async () => {
      const config = await firebase.config().getValuesByKeysPrefix('prefix_');
      Object.keys(config).length.should.equal(3);
      config.prefix_1.value.should.equal(1);
      config.prefix_1.source.should.equal('remote');
    });

    it('it throws if prefix is not a string', async () => {
      try {
        await firebase.config().getValuesByKeysPrefix(1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string value');
        return Promise.resolve();
      }
    });
  });

  describe('getKeysByPrefix()', () => {
    it('should return an array of all available keys if no prefix provided', async () => {
      const keys = await firebase.config().getKeysByPrefix();
      keys.length.should.equal(9);
      keys[0].should.be.a.String();
    });

    it('should return an array of prefixed keys', async () => {
      const keys = await firebase.config().getKeysByPrefix('prefix_');
      keys.length.should.equal(3);
      keys[0].should.be.a.String();
    });

    it('it throws if prefix is not a string', () => {
      try {
        firebase.config().getKeysByPrefix(1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string value');
        return Promise.resolve();
      }
    });
  });

  describe('setDefaults()', () => {
    it('sets default values from key values object', async () => {
      await firebase.config().setDefaults({
        some_key: 'I do not exist',
        some_key_1: 1337,
        some_key_2: true,
      });

      await firebase.config().fetch(0);

      const values = await firebase.config().getValues(['some_key', 'some_key_1', 'some_key_2']);

      values.some_key.value.should.equal('I do not exist');
      values.some_key_1.value.should.equal(1337);
      should.equal(values.some_key_2.value, true);

      values.some_key.source.should.equal('default');
      values.some_key_1.source.should.equal('default');
      values.some_key_2.source.should.equal('default');
    });

    it('it throws if defaults object not provided', () => {
      try {
        firebase.config().setDefaults();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an object');
        return Promise.resolve();
      }
    });

    it('it throws if defaults arg is not an object', () => {
      try {
        firebase.config().setDefaults(1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an object');
        return Promise.resolve();
      }
    });
  });

  describe('setDefaultsFromResource()', () => {
    it('sets defaults from remote_config_resource_test file', async () => {
      await Utils.sleep(10000);
      await firebase.config().setDefaultsFromResource('remote_config_resource_test');
      const config = await firebase.config().getValues(['company']);
      config.company.source.should.equal('default');
      config.company.value.should.equal('invertase');
    });

    it('it rejects if resource not found', async () => {
      const [error] = await A2A(firebase.config().setDefaultsFromResource('i_do_not_exist'));
      if (!error) throw new Error('Did not reject');
      error.code.should.equal('config/resource_not_found');
      error.message.should.containEql('was not found');
    });

    it('it throws if resourceName is not a string', () => {
      try {
        firebase.config().setDefaultsFromResource(1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string value');
        return Promise.resolve();
      }
    });
  });

  describe('getValue()', () => {
    it('returns a value for the specified key', async () => {
      const configValue = await firebase.config().getValue('string');
      configValue.source.should.equal('remote');
      configValue.value.should.equal('invertase');
    });

    it('errors if no key provided', async () => {
      try {
        await firebase.config().getValue();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });

    it('errors if key not a string', async () => {
      try {
        await firebase.config().getValue(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });
  });

  describe('getValues()', () => {
    it('returns undefined for non existent keys', async () => {
      const config = await firebase.config().getValues(['boopy', 'shoopy']);
      should.equal(config.boopy.value, undefined);
      should.equal(config.boopy.source, 'static');
      should.equal(config.shoopy.value, undefined);
      should.equal(config.shoopy.source, 'static');
    });

    it('get multiple values by an array of keys', async () => {
      const config = await firebase.config().getValues(['bool', 'string', 'number']);

      config.should.be.a.Object();
      config.should.have.keys('bool', 'string', 'number');

      const boolValue = config.bool.value;
      const stringValue = config.string.value;
      const numberValue = config.number.value;

      boolValue.should.be.equal(true);
      stringValue.should.be.equal('invertase');
      numberValue.should.be.equal(1337);
    });

    it('errors if no args', async () => {
      try {
        await firebase.config().getValues();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an non empty array');
        return Promise.resolve();
      }
    });

    it('errors if not an array', async () => {
      try {
        await firebase.config().getValues({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an non empty array');
        return Promise.resolve();
      }
    });

    it('errors if array is empty', async () => {
      try {
        await firebase.config().getValues([]);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an non empty array');
        return Promise.resolve();
      }
    });

    it('errors if array values are not strings', async () => {
      try {
        await firebase.config().getValues([1, 2, 3]);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be an array of strings');
        return Promise.resolve();
      }
    });
  });
});
