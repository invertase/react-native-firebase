import { describe, expect, it, jest } from '@jest/globals';

import {
  firebase,
  getCrashlytics,
  isCrashlyticsCollectionEnabled,
  checkForUnsentReports,
  deleteUnsentReports,
  didCrashOnPreviousExecution,
  crash,
  log,
  recordError,
  sendUnsentReports,
  setUserId,
  setAttribute,
  setAttributes,
  setCrashlyticsCollectionEnabled,
} from '../lib';

describe('Crashlytics', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.crashlytics).toBeDefined();
      expect(app.crashlytics().app).toEqual(app);
    });
  });

  describe('modular', function () {
    it('`getCrashlytics` function is properly exposed to end user', function () {
      expect(getCrashlytics).toBeDefined();
    });

    it('`isCrashlyticsCollectionEnabled` function is properly exposed to end user', function () {
      expect(isCrashlyticsCollectionEnabled).toBeDefined();
    });

    it('`checkForUnsentReports` function is properly exposed to end user', function () {
      expect(checkForUnsentReports).toBeDefined();
    });

    it('`deleteUnsentReports` function is properly exposed to end user', function () {
      expect(deleteUnsentReports).toBeDefined();
    });

    it('`didCrashOnPreviousExecution` function is properly exposed to end user', function () {
      expect(didCrashOnPreviousExecution).toBeDefined();
    });

    it('`crash` function is properly exposed to end user', function () {
      expect(crash).toBeDefined();
    });

    it('`log` function is properly exposed to end user', function () {
      expect(log).toBeDefined();
    });

    it('`recordError` function is properly exposed to end user', function () {
      expect(recordError).toBeDefined();
    });

    it('`sendUnsentReports` function is properly exposed to end user', function () {
      expect(sendUnsentReports).toBeDefined();
    });

    it('`setUserId` function is properly exposed to end user', function () {
      expect(setUserId).toBeDefined();
    });

    it('`setAttribute` function is properly exposed to end user', function () {
      expect(setAttribute).toBeDefined();
    });

    it('`setAttributes` function is properly exposed to end user', function () {
      expect(setAttributes).toBeDefined();
    });

    it('`setCrashlyticsCollectionEnabled` function is properly exposed to end user', function () {
      expect(setCrashlyticsCollectionEnabled).toBeDefined();
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    it('checkForUnsentReports', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { checkForUnsentReports: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkForUnsentReports(crashlytics);
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.checkForUnsentReports();
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('crash', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { crash: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      crash(crashlytics);
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.crash();
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('deleteUnsentReports', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { deleteUnsentReports: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      deleteUnsentReports(crashlytics);
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.deleteUnsentReports();
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('didCrashOnPreviousExecution', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { didCrashOnPreviousExecution: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      didCrashOnPreviousExecution(crashlytics);
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.didCrashOnPreviousExecution();
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('log', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { log: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      log(crashlytics, 'message');
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.log('message');
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('setAttribute', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { setAttribute: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      setAttribute(crashlytics, 'name', 'value');
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.setAttribute('name', 'value');
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('setAttributes', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { setAttributes: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      setAttributes(crashlytics, {});
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.setAttributes({});
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('setUserId', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { setUserId: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      setUserId(crashlytics, 'id');
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.setUserId('id');
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('recordError', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { recordError: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      recordError(crashlytics, new Error(), 'name');
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.recordError(new Error(), 'name');
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('sendUnsentReports', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { sendUnsentReports: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      sendUnsentReports(crashlytics);
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.sendUnsentReports();
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });

    it('setCrashlyticsCollectionEnabled', function () {
      const crashlytics = getCrashlytics();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-ignore test
      const nativeMock = { setCrashlyticsCollectionEnabled: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      setCrashlyticsCollectionEnabled(crashlytics, true);
      // Check that console.warn was not called for v9 method call
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      crashlytics.setCrashlyticsCollectionEnabled(true);
      // Check that console.warn was called for v8 method call
      expect(consoleWarnSpy).toHaveBeenCalled();
      // Restore the original console.warn
      consoleWarnSpy.mockRestore();
    });
  });
});
