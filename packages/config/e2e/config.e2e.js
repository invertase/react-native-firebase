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

describe.only('config()', () => {
  // afterEach(() => Utils.sleep(2000))
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

    // TODO(salakar) test bad args
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

    // TODO(salakar) test return value of setConfigSettings - ios missing return value
    // TODO(salakar) test bad args
  });

  describe('getKeys()', () => {
    it('should return an array of all available keys if no prefix provided', async () => {
      const keys = await firebase.config().getKeysByPrefix();
      keys.length.should.equal(8);
      keys[0].should.be.a.String();
    });

    it('should return an array of prefixed keys', async () => {
      const keys = await firebase.config().getKeysByPrefix('prefix_');
      keys.length.should.equal(3);
      keys[0].should.be.a.String();
    });
  });

  describe('setDefaults()', () => {
    it.only('sets default values from key values object', async () => {
      await firebase.config().setDefaults({
        some_key: 'I do not exist',
        some_key_1: 1337,
        some_key_2: true,
      });

      const values = await firebase.config().getValues(['some_key', 'some_key_1', 'some_key_2']);

      values.some_key.value.should.equal('I do not exist');
      values.some_key_1.value.should.equal(1337);
      should.equal(values.some_key_2.value, true);

      values.some_key.source.should.equal('static');
      values.some_key_1.source.should.equal('static');
      values.some_key_2.source.should.equal('static');
    });
  });

  describe('getValues()', () => {
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

    it('errors if any key is not a string', async () => {
      // TODO needs input validation adding to lib
    });
  });
});
