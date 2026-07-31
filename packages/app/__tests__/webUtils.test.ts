import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';

jest.mock('react-native', () => ({
  DeviceEventEmitter: {
    emit: jest.fn(),
  },
}));

import { DeviceEventEmitter } from 'react-native';
import { emitEvent } from '../lib/internal/web/utils';

describe('web/utils', () => {
  describe('emitEvent', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.mocked(DeviceEventEmitter.emit).mockClear();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('emits event with rnfb_ prefix asynchronously', async () => {
      const payload = { appName: '[DEFAULT]', user: null };
      emitEvent('auth_state_changed', payload);

      expect(DeviceEventEmitter.emit).not.toHaveBeenCalled();
      jest.runAllTimers();
      await Promise.resolve();
      expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('rnfb_auth_state_changed', payload);
    });

    it('falls back to setTimeout when setImmediate is not available', () => {
      const original = globalThis.setImmediate;
      // @ts-expect-error — removing global to simulate browser environment
      delete globalThis.setImmediate;

      try {
        const payload = { appName: '[DEFAULT]', user: null };
        emitEvent('auth_id_token_changed', payload);

        expect(DeviceEventEmitter.emit).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('rnfb_auth_id_token_changed', payload);
      } finally {
        globalThis.setImmediate = original;
      }
    });
  });
});
