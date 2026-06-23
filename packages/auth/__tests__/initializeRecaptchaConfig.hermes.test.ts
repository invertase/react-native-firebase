import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@react-native-firebase/app/dist/module/common', () => ({
  ...jest.requireActual<typeof import('@react-native-firebase/app/dist/module/common')>(
    '@react-native-firebase/app/dist/module/common',
  ),
  isOtherHermes: true,
  isOther: true,
  isWeb: false,
}));

import { initializeRecaptchaConfig } from '../lib/modular';

describe('initializeRecaptchaConfig Other/Hermes', function () {
  it('resolves without calling auth bridge and warns', async function () {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const mockAuth = {
      app: { name: '[DEFAULT]' },
      initializeRecaptchaConfig: jest.fn(),
    };

    await expect(initializeRecaptchaConfig(mockAuth as never)).resolves.toBeUndefined();

    expect(mockAuth.initializeRecaptchaConfig).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('initializeRecaptchaConfig() is not supported on this platform'),
    );

    warnSpy.mockRestore();
  });
});
