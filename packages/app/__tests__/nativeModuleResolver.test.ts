import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import { getReactNativeModule } from '../lib/internal/nativeModuleAndroidIos';
import {
  getReactNativeModule as getWebReactNativeModule,
  setReactNativeModule as setWebReactNativeModule,
} from '../lib/internal/nativeModuleWeb';

describe('getReactNativeModule (NewArch-AD-6 Phase R)', function () {
  it('throws when TurboModuleRegistry has no module for the name', function () {
    const unknownModule = 'NativeRNFBTurboNonExistentModule';
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(null);

    expect(() => getReactNativeModule(unknownModule)).toThrow(
      `Native module ${unknownModule} is not registered.`,
    );
  });

  it('does not let debug serialization change a native call', function () {
    const moduleName = 'NativeRNFBTurboDebugSerializationTest';
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    circular.bigint = BigInt(1);
    const nativeModule = { echo: jest.fn((value: unknown) => value) };
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(nativeModule as any);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    globalThis.RNFBDebug = true;

    try {
      const resolvedModule = getReactNativeModule(moduleName);
      expect((resolvedModule.echo as (value: unknown) => unknown)(circular)).toBe(circular);
    } finally {
      globalThis.RNFBDebug = false;
      debugSpy.mockRestore();
    }
  });

  it('preserves non-Promise results with a non-callable then property', function () {
    const moduleName = 'NativeRNFBTurboDebugThenTest';
    const result = { then: false };
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce({ getResult: () => result } as any);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    globalThis.RNFBDebug = true;

    try {
      const resolvedModule = getReactNativeModule(moduleName);
      expect((resolvedModule.getResult as () => unknown)()).toBe(result);
    } finally {
      globalThis.RNFBDebug = false;
      debugSpy.mockRestore();
    }
  });

  it('does not let a failing debug console change a native call', function () {
    const moduleName = 'NativeRNFBTurboDebugConsoleTest';
    jest
      .mocked(TurboModuleRegistry.get)
      .mockReturnValueOnce({ echo: (value: string) => value } as any);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {
      throw new Error('console unavailable');
    });
    globalThis.RNFBDebug = true;

    try {
      const resolvedModule = getReactNativeModule(moduleName);
      expect((resolvedModule.echo as (value: string) => string)('value')).toBe('value');
    } finally {
      globalThis.RNFBDebug = false;
      debugSpy.mockRestore();
    }
  });

  it('binds and memoizes web debug module methods', function () {
    const moduleName = 'NativeRNFBTurboWebDebugTest';
    const nativeModule = {
      value: 'bound',
      getValue() {
        return this.value;
      },
    };
    setWebReactNativeModule(moduleName, nativeModule);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    globalThis.RNFBDebug = true;

    try {
      const resolvedModule = getWebReactNativeModule(moduleName)!;
      expect((resolvedModule.getValue as () => string)()).toBe('bound');
      expect(getWebReactNativeModule(moduleName)).toBe(resolvedModule);
    } finally {
      globalThis.RNFBDebug = false;
      debugSpy.mockRestore();
    }
  });
});
