import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NativeEventEmitter } from 'react-native';

import { APP_NATIVE_MODULE } from '../lib/internal/constants';
import { getReactNativeModule } from '../lib/internal/nativeModule';
import emitter from '../lib/internal/RNFBNativeEventEmitter';

describe('RNFBNativeEventEmitter removeAllListeners', function () {
  const nativeModule = getReactNativeModule(APP_NATIVE_MODULE) as {
    eventsRemoveListener: (eventType: string, removeAll: boolean) => void;
  };

  beforeEach(function () {
    jest.restoreAllMocks();
  });

  it('forwards a missing event type to NativeEventEmitter and skips native removal', function () {
    const removeListener = jest.spyOn(nativeModule, 'eventsRemoveListener');
    const superRemove = jest
      .spyOn(NativeEventEmitter.prototype, 'removeAllListeners')
      .mockImplementation(() => undefined);
    jest.spyOn(NativeEventEmitter.prototype, 'addListener').mockImplementation(() => {
      return { remove: jest.fn() } as never;
    });

    emitter.addListener('ping', () => undefined);
    emitter.removeAllListeners();
    emitter.removeAllListeners(null);
    emitter.removeAllListeners('ping');

    expect(removeListener).toHaveBeenCalledTimes(1);
    expect(removeListener).toHaveBeenCalledWith('ping', true);
    expect(superRemove.mock.calls[0][0]).toBeUndefined();
    expect(superRemove.mock.calls[1][0]).toBeNull();
    expect(superRemove.mock.calls[2][0]).toBe('rnfb_ping');
  });
});
