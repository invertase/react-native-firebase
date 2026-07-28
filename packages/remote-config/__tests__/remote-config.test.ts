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

import { getApp } from '@react-native-firebase/app';
import {
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
  reset,
  setDefaultsFromResource,
  onConfigUpdate,
  setCustomSignals,
  LastFetchStatus,
  ValueSource,
  SDK_VERSION,
} from '../lib';

import type { RemoteConfigInternal } from '../lib/types/internal';

describe('remoteConfig()', function () {
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

    it('`reset` function is properly exposed to end user', function () {
      expect(reset).toBeDefined();
    });

    it('`setDefaultsFromResource` function is properly exposed to end user', function () {
      expect(setDefaultsFromResource).toBeDefined();
    });

    it('`onConfigUpdate` function is properly exposed to end user', function () {
      expect(onConfigUpdate).toBeDefined();
    });

    it('`setCustomSignals` function is properly exposed to end user', function () {
      expect(setCustomSignals).toBeDefined();
    });

    it('exports statics and SDK_VERSION', function () {
      expect(LastFetchStatus).toBeDefined();
      expect(LastFetchStatus.FAILURE).toEqual('failure');
      expect(LastFetchStatus.SUCCESS).toEqual('success');
      expect(LastFetchStatus.NO_FETCH_YET).toEqual('no_fetch_yet');
      expect(LastFetchStatus.THROTTLED).toEqual('throttled');
      expect(ValueSource).toBeDefined();
      expect(ValueSource.REMOTE).toEqual('remote');
      expect(ValueSource.STATIC).toEqual('static');
      expect(ValueSource.DEFAULT).toEqual('default');
      expect(SDK_VERSION).toBeDefined();
    });

    it('supports multiple apps', function () {
      expect(getRemoteConfig().app.name).toEqual('[DEFAULT]');
      expect(getRemoteConfig(getApp('secondaryFromNative')).app.name).toEqual(
        'secondaryFromNative',
      );
    });

    describe('fetch()', function () {
      it('it throws if expiration is not a number', function () {
        expect(() => {
          (getRemoteConfig() as RemoteConfigInternal).fetch('foo' as unknown as number);
        }).toThrow('must be a number value');
      });
    });

    describe('setConfigSettings()', function () {
      it('it throws if arg is not an object', function () {
        expect(() => {
          (getRemoteConfig() as RemoteConfigInternal).setConfigSettings(
            'not an object' as unknown as { minimumFetchIntervalMillis: number },
          );
        }).toThrow('must set an object');
      });

      it('throws if minimumFetchIntervalMillis is not a number', function () {
        expect(() => {
          (getRemoteConfig() as RemoteConfigInternal).setConfigSettings({
            minimumFetchIntervalMillis: 'potato' as unknown as number,
          });
        }).toThrow('must be a number type in milliseconds.');
      });

      it('throws if fetchTimeMillis is not a number', function () {
        expect(() => {
          (getRemoteConfig() as RemoteConfigInternal).setConfigSettings({
            fetchTimeMillis: 'potato' as unknown as number,
          });
        }).toThrow('must be a number type in milliseconds.');
      });
    });

    describe('setDefaults()', function () {
      it('it throws if defaults object not provided', function () {
        expect(() => {
          (getRemoteConfig() as RemoteConfigInternal).setDefaults(
            'not an object' as unknown as Record<string, string>,
          );
        }).toThrow('must be an object.');
      });
    });

    describe('setDefaultsFromResource()', function () {
      it('throws if resourceName is not a string', function () {
        expect(() => {
          (getRemoteConfig() as RemoteConfigInternal).setDefaultsFromResource(
            1337 as unknown as string,
          );
        }).toThrow('must be a string value');
      });
    });

    describe('getAll() should not crash', function () {
      it('should return an empty object pre-fetch, pre-defaults', function () {
        const config = getAll(getRemoteConfig());
        expect(config).toBeDefined();
        expect(config).toEqual({});
      });
    });
  });
});
