import { describe, expect, it } from '@jest/globals';

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
});
