import { describe, expect, it, jest, beforeEach } from '@jest/globals';
// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';
import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';
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
    let checkV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      checkV9Deprecation = createCheckV9Deprecation('crashlytics');

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () => jest.fn(),
          },
        );
      });
    });

    it('checkForUnsentReports', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => {},
        () => crashlytics.checkForUnsentReports(),
        'checkForUnsentReports',
      );
    });

    it('crash', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => crash(crashlytics),
        () => crashlytics.crash(),
        'crash',
      );
    });

    it('deleteUnsentReports', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => deleteUnsentReports(crashlytics),
        () => crashlytics.deleteUnsentReports(),
        'deleteUnsentReports',
      );
    });

    it('didCrashOnPreviousExecution', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => didCrashOnPreviousExecution(crashlytics),
        () => crashlytics.didCrashOnPreviousExecution(),
        'didCrashOnPreviousExecution',
      );
    });

    it('log', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => log(crashlytics, 'message'),
        () => crashlytics.log('message'),
        'log',
      );
    });

    it('setAttribute', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => setAttribute(crashlytics, 'name', 'value'),
        () => crashlytics.setAttribute('name', 'value'),
        'setAttribute',
      );
    });

    it('setAttributes', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => setAttributes(crashlytics, {}),
        () => crashlytics.setAttributes({}),
        'setAttributes',
      );
    });

    it('setUserId', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => setUserId(crashlytics, 'id'),
        () => crashlytics.setUserId('id'),
        'setUserId',
      );
    });

    it('recordError', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => recordError(crashlytics, new Error(), 'name'),
        () => crashlytics.recordError(new Error(), 'name'),
        'recordError',
      );
    });

    it('sendUnsentReports', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => sendUnsentReports(crashlytics),
        () => crashlytics.sendUnsentReports(),
        'sendUnsentReports',
      );
    });

    it('setCrashlyticsCollectionEnabled', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        () => setCrashlyticsCollectionEnabled(crashlytics, true),
        () => crashlytics.setCrashlyticsCollectionEnabled(true),
        'setCrashlyticsCollectionEnabled',
      );
    });

    it('isCrashlyticsCollectionEnabled', function () {
      const crashlytics = getCrashlytics();
      checkV9Deprecation(
        // swapped order here because we're deprecating the modular method and keeping the property on Crashlytics instance
        () => crashlytics.isCrashlyticsCollectionEnabled,
        () => isCrashlyticsCollectionEnabled(crashlytics),
        '',
        '`isCrashlyticsCollectionEnabled()` is deprecated, please use `Crashlytics.isCrashlyticsCollectionEnabled` property instead',
      );
    });
  });
});
