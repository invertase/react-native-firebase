import { afterEach, describe, expect, it, jest } from '@jest/globals';

type CommonModule = typeof import('../lib/common');

function loadCommonWithPlatformOS(os: string): CommonModule {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    Platform: { OS: os, select: jest.fn() },
    NativeModules: {},
    AppRegistry: { registerHeadlessTask: jest.fn() },
  }));
  return require('../lib/common');
}

describe('platform helpers', function () {
  afterEach(function () {
    jest.resetModules();
    jest.dontMock('react-native');
  });

  describe('isWeb', function () {
    it('is true on web', function () {
      const { isWeb } = loadCommonWithPlatformOS('web');
      expect(isWeb).toBe(true);
    });

    it.each(['ios', 'android', 'macos'])('is false on %s', function (os) {
      const { isWeb } = loadCommonWithPlatformOS(os);
      expect(isWeb).toBe(false);
    });
  });

  describe('isOtherHermes', function () {
    it.each(['macos', 'windows'])('is true on %s', function (os) {
      const { isOtherHermes } = loadCommonWithPlatformOS(os);
      expect(isOtherHermes).toBe(true);
    });

    it('is false on web', function () {
      const { isOtherHermes } = loadCommonWithPlatformOS('web');
      expect(isOtherHermes).toBe(false);
    });

    it.each(['ios', 'android'])('is false on %s', function (os) {
      const { isOtherHermes } = loadCommonWithPlatformOS(os);
      expect(isOtherHermes).toBe(false);
    });
  });
});
