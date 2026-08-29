import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';

jest.mock('react-native', () => ({
  DeviceEventEmitter: {
    emit: jest.fn(),
  },
}));

jest.mock('../lib/internal/web/firebaseApp', () => ({
  initializeApp: jest.fn(),
  setLogLevel: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn(() => []),
  deleteApp: jest.fn(),
}));

const appModule = require('../lib/internal/web/RNFBAppModule.ts').default;

describe('RNFBAppModule Promise contracts', () => {
  it('matches native async configuration and event methods', async () => {
    await expect(appModule.metaGetAll()).resolves.toEqual({});
    await expect(appModule.jsonGetAll()).resolves.toEqual({});

    await expect(
      appModule.preferencesSetString('promise-contract', 'value'),
    ).resolves.toBeUndefined();
    await expect(appModule.preferencesGetAll()).resolves.toMatchObject({
      'promise-contract': 'value',
    });
    await expect(appModule.preferencesClearAll()).resolves.toBeUndefined();

    await expect(appModule.eventsGetListeners()).resolves.toMatchObject({
      listeners: expect.any(Number),
      queued: expect.any(Number),
      events: expect.any(Object),
    });
    await expect(appModule.eventsPing('promise_contract_event', { value: true })).resolves.toEqual({
      value: true,
    });
  });
});

describe('RNFBAppModule setImmediate guards', () => {
  describe('with setImmediate available', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('eventsSendEvent uses setImmediate when available', () => {
      const spy = jest.spyOn(globalThis, 'setImmediate');
      appModule.eventsAddListener('test_event');
      appModule.eventsNotifyReady(true);
      appModule.eventsPing('test_event', { data: 1 });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('eventsNotifyReady uses setImmediate when available', () => {
      const spy = jest.spyOn(globalThis, 'setImmediate');
      appModule.eventsNotifyReady(true);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('eventsAddListener uses setImmediate when available', () => {
      const spy = jest.spyOn(globalThis, 'setImmediate');
      appModule.eventsAddListener('another_event');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('without setImmediate (browser environment)', () => {
    let savedSetImmediate: typeof setImmediate;

    beforeEach(() => {
      jest.useFakeTimers();
      savedSetImmediate = globalThis.setImmediate;
      // @ts-expect-error — simulating browser where setImmediate is absent
      delete globalThis.setImmediate;
    });

    afterEach(() => {
      globalThis.setImmediate = savedSetImmediate;
      jest.useRealTimers();
    });

    it('eventsSendEvent falls back to setTimeout', () => {
      const spy = jest.spyOn(globalThis, 'setTimeout');
      appModule.eventsAddListener('browser_event');
      appModule.eventsNotifyReady(true);
      appModule.eventsPing('browser_event', { data: 2 });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('eventsNotifyReady falls back to setTimeout', () => {
      const spy = jest.spyOn(globalThis, 'setTimeout');
      appModule.eventsNotifyReady(true);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('eventsAddListener falls back to setTimeout', () => {
      const spy = jest.spyOn(globalThis, 'setTimeout');
      appModule.eventsAddListener('browser_event_2');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
