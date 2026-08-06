import { describe, expect, it, jest } from '@jest/globals';

import {
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  checkForUpdate,
  signOutTester,
} from '../lib';

jest.mock('@react-native-firebase/app/dist/module/common', () => {
  const actualCommon = jest.requireActual('@react-native-firebase/app/dist/module/common');
  return Object.assign({}, actualCommon, {
    isIOS: true,
  });
});

describe('appDistribution()', function () {
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
