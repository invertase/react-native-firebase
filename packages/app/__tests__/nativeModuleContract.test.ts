import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import FirebaseModule from '../lib/internal/FirebaseModule';
import type { ModuleConfig } from '../lib/internal';
import { getNativeModule } from '../lib/internal/registry/nativeModule';
import type { WrappedNativeModule } from '../lib/internal/NativeModules';

function createTurboModuleFixture(
  methods: Record<string, jest.Mock>,
  constants: Record<string, unknown> = {},
): Record<string, unknown> {
  const proto = Object.create(Object.prototype, {
    getConstants: {
      value: () => constants,
      enumerable: true,
    },
  });

  for (const [name, fn] of Object.entries(methods)) {
    Object.defineProperty(proto, name, {
      value: fn,
      enumerable: true,
      configurable: true,
    });
  }

  return Object.create(proto);
}

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('models TurboModule host: methods non-own on prototype, Object.keys(raw) === []', function () {
    const methodA = jest.fn(() => 'a');
    const raw = createTurboModuleFixture({ methodA }, { CONSTANT: 'x' });

    expect(Object.keys(raw)).toEqual([]);
    expect(typeof raw.methodA).toBe('function');
    expect(Object.prototype.hasOwnProperty.call(raw, 'methodA')).toBe(false);
    expect((raw.getConstants as () => Record<string, unknown>)().CONSTANT).toBe('x');
  });

  it('exposes every spec method callable through the real wrapper', function () {
    const methodA = jest.fn(() => 'ok-a');
    const methodB = jest.fn(() => 'ok-b');
    const raw = createTurboModuleFixture({ methodA, methodB });

    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(raw);

    const config: ModuleConfig = {
      namespace: 'contractSingle',
      nativeModuleName: 'NativeRNFBTurboContractSingle',
      nativeEvents: false,
      hasMultiAppSupport: false,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
    };

    class ContractModule extends FirebaseModule<any> {
      constructor() {
        super({ name: '[DEFAULT]' } as any, config);
      }
    }

    const wrapped = getNativeModule(new ContractModule()) as WrappedNativeModule & {
      methodA: () => string;
      methodB: () => string;
    };

    expect(wrapped.methodA()).toBe('ok-a');
    expect(wrapped.methodB()).toBe('ok-b');
    expect(methodA).toHaveBeenCalledTimes(1);
    expect(methodB).toHaveBeenCalledTimes(1);
    expect(Object.keys(wrapped)).toContain('methodA');
    expect(Object.keys(wrapped)).toContain('methodB');
  });

  it('routes methods through a 2-host merge composite Proxy (NewArch-AD-14a)', function () {
    const hostAMethod = jest.fn(() => 'from-a');
    const hostBMethod = jest.fn(() => 'from-b');
    const hostA = createTurboModuleFixture({ methodFromA: hostAMethod });
    const hostB = createTurboModuleFixture({ methodFromB: hostBMethod });

    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(hostA).mockReturnValueOnce(hostB);

    const config: ModuleConfig = {
      namespace: 'contractMerge',
      nativeModuleName: ['NativeRNFBTurboContractA', 'NativeRNFBTurboContractB'],
      nativeEvents: false,
      hasMultiAppSupport: false,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
    };

    class MergeModule extends FirebaseModule<any> {
      constructor() {
        super({ name: '[DEFAULT]' } as any, config);
      }
    }

    const wrapped = getNativeModule(new MergeModule()) as WrappedNativeModule & {
      methodFromA: () => string;
      methodFromB: () => string;
    };

    expect(wrapped.methodFromA()).toBe('from-a');
    expect(wrapped.methodFromB()).toBe('from-b');
    expect(hostAMethod).toHaveBeenCalledTimes(1);
    expect(hostBMethod).toHaveBeenCalledTimes(1);
    expect('methodFromA' in wrapped).toBe(true);
    expect('methodFromB' in wrapped).toBe(true);
    expect(Object.keys(wrapped).sort()).toEqual(['methodFromA', 'methodFromB']);
  });
});
