import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@react-native-firebase/app/dist/module/common', () => {
  const actualCommon = jest.requireActual(
    '@react-native-firebase/app/dist/module/common',
  ) as Record<string, unknown>;
  return {
    ...actualCommon,
    isOther: false,
    isAndroid: true,
  };
});

// @ts-ignore test
import { getFunctions, httpsCallable } from '../lib';

function timeoutFromNativeCall(nativeMock: jest.Mock): number {
  const call = nativeMock.mock.calls[0] as unknown[] | undefined;
  expect(call).toBeDefined();
  const options = call?.[4] as { timeout?: number } | undefined;
  expect(options?.timeout).toBeDefined();
  return options?.timeout as number;
}

describe('httpsCallable timeout units on native platforms', function () {
  let httpsCallableNative: jest.Mock;

  beforeEach(function () {
    httpsCallableNative = jest
      .fn<(...args: unknown[]) => Promise<{ data: null }>>()
      .mockResolvedValue({ data: null });

    const functions = getFunctions();
    // @ts-ignore test-only internal cache
    functions._nativeModule = {
      httpsCallable: (
        _host: unknown,
        _port: unknown,
        _name: unknown,
        _wrapper: unknown,
        options: { timeout?: number },
      ) => httpsCallableNative(_host, _port, _name, _wrapper, options),
    };
  });

  it('converts milliseconds to seconds for httpsCallable (Android/iOS)', async function () {
    const functions = getFunctions();
    const runner = httpsCallable(functions, 'example', { timeout: 30000 });
    await runner();

    expect(httpsCallableNative).toHaveBeenCalledTimes(1);
    expect(timeoutFromNativeCall(httpsCallableNative)).toBe(30);
  });

  it('does not mutate a reused options object on native platforms', async function () {
    const functions = getFunctions();
    const sharedOptions = { timeout: 30000 };
    const runnerA = httpsCallable(functions, 'exampleA', sharedOptions);
    const runnerB = httpsCallable(functions, 'exampleB', sharedOptions);

    await runnerA();
    await runnerB();

    expect(sharedOptions.timeout).toBe(30000);
    expect(httpsCallableNative).toHaveBeenCalledTimes(2);
    expect((httpsCallableNative.mock.calls[0]?.[4] as { timeout?: number }).timeout).toBe(30);
    expect((httpsCallableNative.mock.calls[1]?.[4] as { timeout?: number }).timeout).toBe(30);
  });
});
