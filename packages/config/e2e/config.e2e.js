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

  describe('statics', () => {
    it('LastFetchStatus', () => {
      firebase.config.LastFetchStatus.should.be.an.Object();
      firebase.config.LastFetchStatus.FAILURE.should.equal('failure');
      firebase.config.LastFetchStatus.SUCCESS.should.equal('success');
      firebase.config.LastFetchStatus.NO_FETCH_YET.should.equal('no_fetch_yet');
      firebase.config.LastFetchStatus.THROTTLED.should.equal('throttled');
    });

    it('ValueSource', () => {
      firebase.config.ValueSource.should.be.an.Object();
      firebase.config.ValueSource.REMOTE.should.equal('remote');
      firebase.config.ValueSource.STATIC.should.equal('static');
      firebase.config.ValueSource.DEFAULT.should.equal('default');
    });
  });

  describe('fetch()', () => {
    it('with expiration provided', async () => {
      const date = Date.now() - 30000;
      firebase.config().lastFetchTime.should.equal(0);
      firebase.config().lastFetchStatus.should.equal(firebase.config.LastFetchStatus.NO_FETCH_YET);
      await firebase.config().fetch(0);
      firebase.config().lastFetchStatus.should.equal(firebase.config.LastFetchStatus.SUCCESS);
      // TODO leave logger here - need to investigate flakey test
      console.log(firebase.config().lastFetchTime, date);
      should.equal(firebase.config().lastFetchTime >= date, true);
    });
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
      const activated = await firebase.config().fetchAndActivate();
      activated.should.be.a.Boolean();
    });
  });

  describe('activate()', () => {
    it('with expiration provided', async () => {
      await firebase.config().fetch(0);
      const activated = await firebase.config().activate();
      activated.should.be.a.Boolean();
    });

    it('without expiration provided', async () => {
      await firebase.config().fetch();
      const activated = await firebase.config().activate();
      activated.should.be.a.Boolean();
    });
  });

  describe('config settings', () => {
    it('should be immediately available', async () => {
      firebase.config().isDeveloperModeEnabled.should.be.a.Boolean();
      firebase.config().isDeveloperModeEnabled.should.equal(false);
      firebase.config().lastFetchStatus.should.be.a.String();
      firebase.config().lastFetchStatus.should.equal('success');
      firebase.config().lastFetchTime.should.be.a.Number();
    });
  });

  describe('setConfigSettings()', () => {
    it('isDeveloperModeEnabled sets correctly', async () => {
      firebase.config().isDeveloperModeEnabled.should.equal(false);
      firebase.config().isDeveloperModeEnabled.should.be.a.Boolean();

      await firebase.config().setConfigSettings({ isDeveloperModeEnabled: true });

      firebase.config().isDeveloperModeEnabled.should.equal(true);
      firebase.config().isDeveloperModeEnabled.should.be.a.Boolean();

      await firebase.config().setConfigSettings({ isDeveloperModeEnabled: false });

      firebase.config().isDeveloperModeEnabled.should.equal(false);
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

  describe('getAll()', () => {
    it('should return an object of all available values', async () => {
      const config = firebase.config().getAll();
      config.number.value.should.equal(1337);
      config.number.source.should.equal('remote');
      // firebase console stores as a string
      config.float.value.should.equal(123.456);
      config.float.source.should.equal('remote');
      config.prefix_1.value.should.equal(1);
      config.prefix_1.source.should.equal('remote');
    });
  });

  describe('setDefaults()', () => {
    it('sets default values from key values object', async () => {
      await firebase.config().setDefaults({
        some_key: 'I do not exist',
        some_key_1: 1337,
        some_key_2: true,
      });

      await firebase.config().fetchAndActivate(0);
      const values = firebase.config().getAll();
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
      await firebase.config().setDefaultsFromResource('remote_config_resource_test');
      const config = firebase.config().getAll();
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
      const configValue = firebase.config().getValue('string');
      configValue.source.should.equal('remote');
      configValue.value.should.equal('invertase');
    });

    it('returns an undefined static value for keys that dont exist', async () => {
      const configValue = firebase.config().getValue('fourOhFour');
      configValue.source.should.equal('static');
      should.equal(configValue.value, undefined);
    });

    it('errors if no key provided', async () => {
      try {
        firebase.config().getValue();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });

    it('errors if key not a string', async () => {
      try {
        firebase.config().getValue(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });
  });

  describe('getAll()', () => {
    it('gets all values', async () => {
      const config = firebase.config().getAll();

      config.should.be.a.Object();
      config.should.have.keys('bool', 'string', 'number');

      const boolValue = config.bool.value;
      const stringValue = config.string.value;
      const numberValue = config.number.value;

      boolValue.should.be.equal(true);
      stringValue.should.be.equal('invertase');
      numberValue.should.be.equal(1337);
    });
  });
});
