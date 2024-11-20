import { describe, expect, it, jest } from '@jest/globals';
import { checkV9Deprecation } from '../../app/lib/common/unitTestUtils';
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
      // @ts-ignore test
      const nativeMock = { checkForUnsentReports: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => checkForUnsentReports(crashlytics),
        () => crashlytics.checkForUnsentReports(),
      );
    });

    it('crash', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { crash: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => crash(crashlytics),
        () => crashlytics.crash(),
      );
    });

    it('deleteUnsentReports', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { deleteUnsentReports: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => deleteUnsentReports(crashlytics),
        () => crashlytics.deleteUnsentReports(),
      );
    });

    it('didCrashOnPreviousExecution', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { didCrashOnPreviousExecution: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => didCrashOnPreviousExecution(crashlytics),
        () => crashlytics.didCrashOnPreviousExecution(),
      );
    });

    it('log', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { log: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => log(crashlytics, 'message'),
        () => crashlytics.log('message'),
      );
    });

    it('setAttribute', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { setAttribute: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => setAttribute(crashlytics, 'name', 'value'),
        () => crashlytics.setAttribute('name', 'value'),
      );
    });

    it('setAttributes', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { setAttributes: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => setAttributes(crashlytics, {}),
        () => crashlytics.setAttributes({}),
      );
    });

    it('setUserId', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { setUserId: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => setUserId(crashlytics, 'id'),
        () => crashlytics.setUserId('id'),
      );
    });

    it('recordError', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { recordError: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => recordError(crashlytics, new Error(), 'name'),
        () => crashlytics.recordError(new Error(), 'name'),
      );
    });

    it('sendUnsentReports', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { sendUnsentReports: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => sendUnsentReports(crashlytics),
        () => crashlytics.sendUnsentReports(),
      );
    });

    it('setCrashlyticsCollectionEnabled', function () {
      const crashlytics = getCrashlytics();
      // @ts-ignore test
      const nativeMock = { setCrashlyticsCollectionEnabled: jest.fn() };
      // @ts-ignore test
      jest.spyOn(crashlytics, 'native', 'get').mockReturnValue(nativeMock);

      checkV9Deprecation(
        () => setCrashlyticsCollectionEnabled(crashlytics, true),
        () => crashlytics.setCrashlyticsCollectionEnabled(true),
      );
    });

    it('isCrashlyticsCollectionEnabled', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        // swapped order here because we're deprecating the modular method and keeping the property on Crashlytics instance
        () => crashlytics.isCrashlyticsCollectionEnabled,
        () => isCrashlyticsCollectionEnabled(crashlytics),
      );
    });
  });
});
