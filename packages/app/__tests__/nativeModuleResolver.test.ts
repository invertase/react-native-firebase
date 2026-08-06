import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import { getReactNativeModule } from '../lib/internal/nativeModuleAndroidIos';

describe('getReactNativeModule (NewArch-AD-6 Phase R)', function () {
  it('throws when TurboModuleRegistry has no module for the name', function () {
    const unknownModule = 'NativeRNFBTurboNonExistentModule';
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(null);

    expect(() => getReactNativeModule(unknownModule)).toThrow(
      `Native module ${unknownModule} is not registered.`,
    );
  });
});
