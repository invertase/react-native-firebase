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
import { describe, expect, it } from '@jest/globals';

import {
  firebase,
  getRemoteConfig,
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getAll,
  getBoolean,
  getNumber,
  getString,
  getValue,
  setLogLevel,
  isSupported,
  fetchTimeMillis,
  settings,
  lastFetchStatus,
  reset,
  setConfigSettings,
  fetch,
  setDefaults,
  setDefaultsFromResource,
  onConfigUpdated,
} from '../lib';

describe('remoteConfig()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.remoteConfig()).toBeDefined();
      expect(app.remoteConfig().app).toEqual(app);
    });

    it('supports multiple apps', async function () {
      expect(firebase.remoteConfig().app.name).toEqual('[DEFAULT]');
      expect(firebase.app('secondaryFromNative').remoteConfig().app.name).toEqual(
        'secondaryFromNative',
      );
    });
  });

  describe('statics', function () {
    it('LastFetchStatus', function () {
      expect(firebase.remoteConfig.LastFetchStatus).toBeDefined();
      expect(firebase.remoteConfig.LastFetchStatus.FAILURE).toEqual('failure');
      expect(firebase.remoteConfig.LastFetchStatus.SUCCESS).toEqual('success');
      expect(firebase.remoteConfig.LastFetchStatus.NO_FETCH_YET).toEqual('no_fetch_yet');
      expect(firebase.remoteConfig.LastFetchStatus.THROTTLED).toEqual('throttled');
    });

    it('ValueSource', function () {
      expect(firebase.remoteConfig.ValueSource).toBeDefined();
      expect(firebase.remoteConfig.ValueSource.REMOTE).toEqual('remote');
      expect(firebase.remoteConfig.ValueSource.STATIC).toEqual('static');
      expect(firebase.remoteConfig.ValueSource.DEFAULT).toEqual('default');
    });
  });

  describe('fetch()', function () {
    it('it throws if expiration is not a number', function () {
      expect(() => {
        // @ts-ignore - incorrect argument on purpose to check validation
        firebase.remoteConfig().fetch('foo');
      }).toThrow('must be a number value');
    });
  });

  describe('setConfigSettings()', function () {
    it('it throws if arg is not an object', async function () {
      expect(() => {
        // @ts-ignore - incorrect argument on purpose to check validation
        firebase.remoteConfig().setConfigSettings('not an object');
      }).toThrow('must set an object');
    });

    it('throws if minimumFetchIntervalMillis is not a number', async function () {
      expect(() => {
        // @ts-ignore - incorrect argument on purpose to check validation
        firebase.remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 'potato' });
      }).toThrow('must be a number type in milliseconds.');
    });

    it('throws if fetchTimeMillis is not a number', function () {
      expect(() => {
        // @ts-ignore - incorrect argument on purpose to check validation
        firebase.remoteConfig().setConfigSettings({ fetchTimeMillis: 'potato' });
      }).toThrow('must be a number type in milliseconds.');
    });
  });

  describe('setDefaults()', function () {
    it('it throws if defaults object not provided', function () {
      expect(() => {
        // @ts-ignore - incorrect argument on purpose to check validation
        firebase.remoteConfig().setDefaults('not an object');
      }).toThrow('must be an object.');
    });
  });

  describe('setDefaultsFromResource()', function () {
    it('throws if resourceName is not a string', function () {
      expect(() => {
        // @ts-ignore - incorrect argument on purpose to check validation
        firebase.remoteConfig().setDefaultsFromResource(1337);
      }).toThrow('must be a string value');
    });
  });

  describe('getAll() should not crash', function () {
    it('should return an empty object pre-fetch, pre-defaults', function () {
      const config = firebase.remoteConfig().getAll();
      expect(config).toBeDefined();
      expect(config).toEqual({});
    });
  });

  describe('modular', function () {
    it('`getRemoteConfig` function is properly exposed to end user', function () {
      expect(getRemoteConfig).toBeDefined();
    });

    it('`activate` function is properly exposed to end user', function () {
      expect(activate).toBeDefined();
    });

    it('`ensureInitialized` function is properly exposed to end user', function () {
      expect(ensureInitialized).toBeDefined();
    });

    it('`fetchAndActivate` function is properly exposed to end user', function () {
      expect(fetchAndActivate).toBeDefined();
    });

    it('`fetchConfig` function is properly exposed to end user', function () {
      expect(fetchConfig).toBeDefined();
    });

    it('`getAll` function is properly exposed to end user', function () {
      expect(getAll).toBeDefined();
    });

    it('`getBoolean` function is properly exposed to end user', function () {
      expect(getBoolean).toBeDefined();
    });

    it('`getNumber` function is properly exposed to end user', function () {
      expect(getNumber).toBeDefined();
    });

    it('`getString` function is properly exposed to end user', function () {
      expect(getString).toBeDefined();
    });

    it('`getValue` function is properly exposed to end user', function () {
      expect(getValue).toBeDefined();
    });

    it('`setLogLevel` function is properly exposed to end user', function () {
      expect(setLogLevel).toBeDefined();
    });

    it('`isSupported` function is properly exposed to end user', function () {
      expect(isSupported).toBeDefined();
    });

    it('`fetchTimeMillis` function is properly exposed to end user', function () {
      expect(fetchTimeMillis).toBeDefined();
    });

    it('`settings` function is properly exposed to end user', function () {
      expect(settings).toBeDefined();
    });

    it('`lastFetchStatus` function is properly exposed to end user', function () {
      expect(lastFetchStatus).toBeDefined();
    });

    it('`reset` function is properly exposed to end user', function () {
      expect(reset).toBeDefined();
    });

    it('`setConfigSettings` function is properly exposed to end user', function () {
      expect(setConfigSettings).toBeDefined();
    });

    it('`fetch` function is properly exposed to end user', function () {
      expect(fetch).toBeDefined();
    });

    it('`setDefaults` function is properly exposed to end user', function () {
      expect(setDefaults).toBeDefined();
    });

    it('`setDefaultsFromResource` function is properly exposed to end user', function () {
      expect(setDefaultsFromResource).toBeDefined();
    });

    it('`onConfigUpdated` function is properly exposed to end user', function () {
      expect(onConfigUpdated).toBeDefined();
    });
  });
});
