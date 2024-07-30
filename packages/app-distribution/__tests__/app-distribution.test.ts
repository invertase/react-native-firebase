import { describe, expect, it } from '@jest/globals';

import {
  firebase,
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  checkForUpdate,
  signOutTester,
} from '../lib';

describe('appDistribution()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.appDistribution).toBeDefined();
      expect(app.appDistribution().app).toEqual(app);
    });
  });

  describe('modular', function () {
    it('`getAppDistribution` function is properly exposed to end user', function () {
      expect(getAppDistribution).toBeDefined();
    });

    it('`isTesterSignedIn` function is properly exposed to end user', function () {
      expect(isTesterSignedIn).toBeDefined();
    });

    it('`signInTester` function is properly exposed to end user', function () {
      expect(signInTester).toBeDefined();
    });

    it('`checkForUpdate` function is properly exposed to end user', function () {
      expect(checkForUpdate).toBeDefined();
    });

    it('`signOutTester` function is properly exposed to end user', function () {
      expect(signOutTester).toBeDefined();
    });
  });
});
