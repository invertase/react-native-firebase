import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getApp } from '@react-native-firebase/app';
import { TurboModuleRegistry } from 'react-native';

import { initializeAppCheck, ReactNativeFirebaseAppCheckProvider } from '../lib';
import type { AppCheck, AppCheckOptions } from '../lib';
import type { AppCheckInternal } from '../lib/types/internal';

type NativeAppCheck = {
  configureProvider: jest.Mock<(...args: unknown[]) => unknown>;
  setTokenAutoRefreshEnabled: jest.Mock<(...args: unknown[]) => unknown>;
  initializeAppCheck?: jest.Mock<(...args: unknown[]) => unknown>;
};

function debugProvider(): ReactNativeFirebaseAppCheckProvider {
  const provider = new ReactNativeFirebaseAppCheckProvider();
  provider.configure({ android: { provider: 'debug' }, apple: { provider: 'debug' } });
  return provider;
}

function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// `catch` delegates to `then`, so wrapping `then` captures handlers attached either way.
function captureAttachedHandlers(
  appCheck: AppCheck,
  attached: Promise<unknown>[],
  replacement?: () => Promise<void>,
): void {
  const instance = appCheck as unknown as AppCheckInternal;
  const original = instance.initializeAppCheck.bind(instance);
  jest
    .spyOn(instance, 'initializeAppCheck')
    .mockImplementation((options: AppCheckOptions): Promise<void> => {
      const result = replacement ? replacement() : original(options);
      const then = result.then.bind(result);
      result.then = ((onFulfilled, onRejected) => {
        const derived = then(onFulfilled, onRejected);
        attached.push(derived);
        return derived;
      }) as typeof result.then;
      return result;
    });
}

async function expectRejectionHandled(attached: Promise<unknown>[]): Promise<void> {
  expect(attached).toHaveLength(1);
  await expect(attached[0]).resolves.toBeUndefined();
}

describe('initializeAppCheck provider setup errors', function () {
  const native = TurboModuleRegistry.getEnforcing(
    'NativeRNFBTurboAppCheck',
  ) as unknown as NativeAppCheck;
  let appCheck: AppCheck;
  let warn: jest.SpiedFunction<typeof console.warn>;
  let attached: Promise<unknown>[];

  beforeAll(async function () {
    appCheck = initializeAppCheck(undefined, { provider: debugProvider() });
    await flushPromises();
  });

  beforeEach(function () {
    native.configureProvider.mockReset();
    native.setTokenAutoRefreshEnabled.mockReset();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    attached = [];
  });

  afterEach(function () {
    jest.restoreAllMocks();
  });

  it('reports a native configureProvider failure instead of leaving an unhandled rejection', async function () {
    native.configureProvider.mockImplementation(() =>
      Promise.reject(new Error('provider failure')),
    );
    captureAttachedHandlers(appCheck, attached);

    const result = initializeAppCheck(undefined, {
      provider: debugProvider(),
      isTokenAutoRefreshEnabled: true,
    });

    expect(result).toBe(appCheck);
    await expectRejectionHandled(attached);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      "initializeAppCheck() could not configure the App Check provider for app '[DEFAULT]': [appCheck/unknown] provider failure",
    );
    expect(native.setTokenAutoRefreshEnabled).not.toHaveBeenCalled();
  });

  it('names the secondary app in the warning', async function () {
    const secondary = initializeAppCheck(getApp('secondaryFromNative'), {
      provider: debugProvider(),
    });
    await flushPromises();
    native.configureProvider.mockImplementation(() =>
      Promise.reject(new Error('secondary failure')),
    );
    captureAttachedHandlers(secondary, attached);

    expect(initializeAppCheck(getApp('secondaryFromNative'), { provider: debugProvider() })).toBe(
      secondary,
    );
    await expectRejectionHandled(attached);
    expect(warn).toHaveBeenCalledWith(
      "initializeAppCheck() could not configure the App Check provider for app 'secondaryFromNative': [appCheck/unknown] secondary failure",
    );
  });

  it('reports a non-Error rejection', async function () {
    // The native wrapper turns every native failure into an Error, so reject from the instance.
    captureAttachedHandlers(appCheck, attached, () => Promise.reject('plain failure'));

    initializeAppCheck(undefined, { provider: debugProvider() });

    await expectRejectionHandled(attached);
    expect(warn).toHaveBeenCalledWith(
      "initializeAppCheck() could not configure the App Check provider for app '[DEFAULT]': plain failure",
    );
  });

  it('does not warn when provider setup succeeds', async function () {
    native.configureProvider.mockImplementation(() => Promise.resolve());
    captureAttachedHandlers(appCheck, attached);

    initializeAppCheck(undefined, { provider: debugProvider(), isTokenAutoRefreshEnabled: false });

    expect(attached).toHaveLength(1);
    await attached[0];
    expect(native.setTokenAutoRefreshEnabled).toHaveBeenCalledWith('[DEFAULT]', false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('reports a native initializeAppCheck failure on other platforms', async function () {
    let otherAppCheck!: AppCheck;
    let initializeOther!: typeof initializeAppCheck;
    let otherNative!: NativeAppCheck;
    jest.isolateModules(function () {
      jest.doMock('@react-native-firebase/app/dist/module/common', function () {
        return {
          ...jest.requireActual<object>('@react-native-firebase/app/dist/module/common'),
          isOther: true,
        };
      });
      const { TurboModuleRegistry: registry } = require('react-native');
      otherNative = registry.getEnforcing('NativeRNFBTurboAppCheck');
      // The native wrapper routes only methods present when the module is first resolved.
      otherNative.initializeAppCheck = jest.fn(() => Promise.resolve());
      ({ initializeAppCheck: initializeOther } = require('../lib'));
      otherAppCheck = initializeOther(undefined, { provider: debugProvider() });
    });
    jest.dontMock('@react-native-firebase/app/dist/module/common');
    await flushPromises();

    otherNative.initializeAppCheck!.mockImplementation(() =>
      Promise.reject(new Error('web failure')),
    );
    captureAttachedHandlers(otherAppCheck, attached);

    expect(initializeOther(undefined, { provider: debugProvider() })).toBe(otherAppCheck);
    await expectRejectionHandled(attached);
    expect(otherNative.configureProvider).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "initializeAppCheck() could not configure the App Check provider for app '[DEFAULT]': [appCheck/unknown] web failure",
    );
  });

  it('still throws invalid provider options synchronously', function () {
    expect(() => initializeAppCheck(undefined, { provider: {} as never })).toThrow(
      'Invalid configuration: no provider or no provider options defined.',
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
