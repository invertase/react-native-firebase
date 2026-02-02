import { afterAll, beforeAll, describe, expect, it, beforeEach, jest } from '@jest/globals';

import {
  firebase,
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  checkForUpdate,
  signOutTester,
} from '../lib';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

// Mock isIOS to be true so the app distribution methods work in tests
jest.mock('@react-native-firebase/app/dist/module/common', () => {
  const actualCommon = jest.requireActual('@react-native-firebase/app/dist/module/common');
  return Object.assign({}, actualCommon, {
    isIOS: true,
  });
});

describe('appDistribution()', function () {
  describe('namespace', function () {
    beforeAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

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

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let appDistributionV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      appDistributionV9Deprecation = createCheckV9Deprecation(['appDistribution']);

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                constants: {
                  isTesterSignedIn: true,
                },
              } as never),
          },
        );
      });
    });

    it('isTesterSignedIn', function () {
      const appDistribution = getAppDistribution();
      appDistributionV9Deprecation(
        () => isTesterSignedIn(appDistribution),
        () => appDistribution.isTesterSignedIn(),
        'isTesterSignedIn',
      );
    });

    it('signInTester', function () {
      const appDistribution = getAppDistribution();
      appDistributionV9Deprecation(
        () => signInTester(appDistribution),
        () => appDistribution.signInTester(),
        'signInTester',
      );
    });

    it('checkForUpdate', function () {
      const appDistribution = getAppDistribution();
      appDistributionV9Deprecation(
        () => checkForUpdate(appDistribution),
        () => appDistribution.checkForUpdate(),
        'checkForUpdate',
      );
    });

    it('signOutTester', function () {
      const appDistribution = getAppDistribution();
      appDistributionV9Deprecation(
        () => signOutTester(appDistribution),
        () => appDistribution.signOutTester(),
        'signOutTester',
      );
    });
  });
});
