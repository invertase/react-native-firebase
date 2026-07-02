import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';
import { createTurboModuleFixture } from '../../app/__tests__/turboModuleContractHelper';

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('resolves an empty stub turbo module through the real wrapper', function () {
    const raw = createTurboModuleFixture();
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(raw);

    const config: ModuleConfig = {
      namespace: 'ml',
      nativeModuleName: 'NativeRNFBTurboML',
      nativeEvents: false,
      hasMultiAppSupport: true,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
    };

    class ContractModule extends FirebaseModule<any> {
      constructor() {
        super({ name: '[DEFAULT]' } as any, config);
      }
    }

    const wrapped = getNativeModule(new ContractModule()) as WrappedNativeModule;
    expect(wrapped).toBeDefined();
    expect(Object.keys(wrapped)).toEqual([]);
  });
});
