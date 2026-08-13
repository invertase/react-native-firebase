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
import { beforeEach, describe, expect, it } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';

import {
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getRemoteConfig,
} from '../lib';

// The native module is exposed through a Proxy that refuses `set`, so `jest.spyOn` cannot be used
// here. The jest setup already installs `jest.fn()`s for every method, so ordering is read straight
// off `mock.invocationCallOrder`, which is a process-wide monotonic counter shared by all mocks.
const native = TurboModuleRegistry.get('NativeRNFBTurboConfig') as any;

const MOCKED_METHODS = [
  'setConfigSettings',
  'setDefaults',
  'activate',
  'fetch',
  'fetchAndActivate',
  'ensureInitialized',
];

function firstCallOrderOf(method: string): number {
  const calls: number[] = native[method].mock.invocationCallOrder;
  if (calls.length === 0) {
    throw new Error(`expected the native \`${method}\` to have been called, but it never was`);
  }
  return calls[0];
}

/** Resolves after every pending microtask has run. */
function flushMicrotasks(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

const CONSTANTS = {
  lastFetchTime: Date.now(),
  lastFetchStatus: 'success',
  fetchTimeout: 60,
  minimumFetchInterval: 43200,
  values: {},
};

describe('remoteConfig() native call ordering', function () {
  let config: any;

  beforeEach(async function () {
    config = getRemoteConfig();
    // `getRemoteConfig()` is a singleton, so drain any mutation left queued by a previous test
    // before clearing the recorded call order.
    await flushMicrotasks();
    MOCKED_METHODS.forEach(method => native[method].mockClear());
  });

  describe('deferring reads behind queued property writes', function () {
    // The `settings` and `defaultConfig` setters cannot return a promise, so they hand the native
    // write to a microtask queue. Reads used to call native synchronously and therefore overtook
    // that queued write. On iOS, `setConfigSettings:` landing mid-fetch tears down and recreates
    // the SDK's URL session, cancelling the in-flight request with NSURLErrorCancelled (-999).
    // https://github.com/invertase/react-native-firebase/issues/9194

    it('sends a queued `settings` write before `fetchAndActivate`', async function () {
      config.settings = { minimumFetchIntervalMillis: 0, fetchTimeoutMillis: 60000 };
      await fetchAndActivate(config);

      expect(native.setConfigSettings).toHaveBeenCalledTimes(1);
      expect(native.fetchAndActivate).toHaveBeenCalledTimes(1);
      expect(firstCallOrderOf('setConfigSettings')).toBeLessThan(
        firstCallOrderOf('fetchAndActivate'),
      );
    });

    it('sends a queued `defaultConfig` write before `fetchAndActivate`', async function () {
      config.defaultConfig = { some_flag: true };
      await fetchAndActivate(config);

      expect(native.setDefaults).toHaveBeenCalledTimes(1);
      expect(native.fetchAndActivate).toHaveBeenCalledTimes(1);
      expect(firstCallOrderOf('setDefaults')).toBeLessThan(firstCallOrderOf('fetchAndActivate'));
    });

    it('sends a queued `settings` write before `fetch`', async function () {
      config.settings = { minimumFetchIntervalMillis: 0 };
      await fetchConfig(config);

      expect(firstCallOrderOf('setConfigSettings')).toBeLessThan(firstCallOrderOf('fetch'));
    });

    it('sends a queued `settings` write before `activate`', async function () {
      config.settings = { minimumFetchIntervalMillis: 0 };
      await activate(config);

      expect(firstCallOrderOf('setConfigSettings')).toBeLessThan(firstCallOrderOf('activate'));
    });

    it('sends a queued `settings` write before `ensureInitialized`', async function () {
      config.settings = { minimumFetchIntervalMillis: 0 };
      await ensureInitialized(config);

      expect(firstCallOrderOf('setConfigSettings')).toBeLessThan(
        firstCallOrderOf('ensureInitialized'),
      );
    });

    it('keeps the writes in order when both setters run before a fetch', async function () {
      config.defaultConfig = { some_flag: true };
      config.settings = { minimumFetchIntervalMillis: 0 };
      await fetchAndActivate(config);

      expect(firstCallOrderOf('setDefaults')).toBeLessThan(firstCallOrderOf('setConfigSettings'));
      expect(firstCallOrderOf('setConfigSettings')).toBeLessThan(
        firstCallOrderOf('fetchAndActivate'),
      );
    });
  });

  describe('reads with nothing queued', function () {
    it('still reaches native and resolves with the native result', async function () {
      await expect(fetchAndActivate(config)).resolves.toBe(true);
      await expect(activate(config)).resolves.toBe(true);
      await expect(ensureInitialized(config)).resolves.toBe(true);
      await expect(fetchConfig(config)).resolves.toBe(true);

      expect(native.fetchAndActivate).toHaveBeenCalledTimes(1);
      expect(native.activate).toHaveBeenCalledTimes(1);
      expect(native.ensureInitialized).toHaveBeenCalledTimes(1);
      expect(native.fetch).toHaveBeenCalledTimes(1);
      expect(native.setConfigSettings).not.toHaveBeenCalled();
      expect(native.setDefaults).not.toHaveBeenCalled();
    });

    it('keeps validating `fetch` arguments synchronously', function () {
      expect(() => config.fetch('not a number')).toThrow(
        "firebase.remoteConfig().fetch(): 'expirationDurationSeconds' must be a number value.",
      );
      expect(native.fetch).not.toHaveBeenCalled();
    });
  });

  describe('reads do not hold up later writes', function () {
    it('lets a `settings` write through while a fetch is still in flight', async function () {
      // A fetch may run for up to `fetchTimeoutMillis`. Reads wait for the queue but must not join
      // it, otherwise every later property write would be stuck behind an in-flight fetch.
      let releaseFetch: () => void = () => {};
      native.fetchAndActivate.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            releaseFetch = () => resolve({ result: true, constants: CONSTANTS });
          }),
      );

      const pendingFetch = fetchAndActivate(config);
      config.settings = { minimumFetchIntervalMillis: 0 };

      await flushMicrotasks();
      expect(native.fetchAndActivate).toHaveBeenCalledTimes(1);
      expect(native.setConfigSettings).toHaveBeenCalledTimes(1);

      releaseFetch();
      await expect(pendingFetch).resolves.toBe(true);
    });
  });
});
