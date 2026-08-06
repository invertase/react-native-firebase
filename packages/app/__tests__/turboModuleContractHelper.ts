import { expect, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';

export function createTurboModuleFixture(
  methods: Record<string, jest.Mock> = {},
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

export type TurboContractConfig = ModuleConfig & {
  specMethods: readonly string[];
  createMock?: (method: string) => jest.Mock;
  constants?: Record<string, unknown>;
  customizeRaw?: (raw: Record<string, unknown>, mocks: Record<string, jest.Mock>) => void;
  customUrlOrRegion?: string | null;
  assertExtra?: (
    wrapped: WrappedNativeModule & Record<string, unknown>,
    mocks: Record<string, jest.Mock>,
  ) => void;
};

export type TurboMethodFixtures = Partial<
  Record<
    string,
    (wrapped: WrappedNativeModule & Record<string, (...args: unknown[]) => unknown>) => void
  >
>;

export function assertTurboContract(
  config: TurboContractConfig,
  methodFixtures: TurboMethodFixtures = {},
): {
  wrapped: WrappedNativeModule & Record<string, unknown>;
  mocks: Record<string, jest.Mock>;
} {
  const {
    specMethods,
    createMock,
    constants,
    customizeRaw,
    customUrlOrRegion,
    assertExtra,
    ...moduleConfig
  } = config;

  const mocks = Object.fromEntries(
    specMethods.map(method => [method, createMock ? createMock(method) : jest.fn()]),
  ) as Record<string, jest.Mock>;

  const raw = createTurboModuleFixture(mocks, constants ?? {});
  customizeRaw?.(raw, mocks);
  jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(raw);

  class ContractModule extends FirebaseModule<any> {
    constructor() {
      super({ name: '[DEFAULT]' } as any, moduleConfig, customUrlOrRegion);
    }
  }

  const wrapped = getNativeModule(new ContractModule()) as WrappedNativeModule &
    Record<string, (...args: unknown[]) => unknown>;

  for (const method of specMethods) {
    const invoke = methodFixtures[method];
    if (invoke) {
      invoke(wrapped);
    } else {
      void wrapped[method]();
    }
    expect(mocks[method]).toHaveBeenCalledTimes(1);
    expect(Object.keys(wrapped)).toContain(method);
  }

  assertExtra?.(wrapped, mocks);

  return { wrapped, mocks };
}
