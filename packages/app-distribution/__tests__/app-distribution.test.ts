import { afterAll, beforeAll, describe, expect, it, beforeEach, jest } from '@jest/globals';

import {
  firebase,
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  checkForUpdate,
  signOutTester,
  type FirebaseAppDistribution,
  type AppDistributionRelease,
  type FirebaseApp,
} from '../lib';

import {
  createCheckV9Deprecation,
  type CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

// Mock isIOS to be true so the app distribution methods work in tests
jest.mock('@react-native-firebase/app/lib/common', () => {
  const actualCommon = jest.requireActual('@react-native-firebase/app/lib/common');
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

    describe('types', function () {
      it('`FirebaseAppDistribution` type is properly exposed to end user', function () {
        const appDistribution: FirebaseAppDistribution = (
          firebase.app() as unknown as FirebaseApp
        ).appDistribution();
        expect(appDistribution).toBeDefined();
        expect(appDistribution.isTesterSignedIn).toBeDefined();
        expect(appDistribution.signInTester).toBeDefined();
        expect(appDistribution.checkForUpdate).toBeDefined();
        expect(appDistribution.signOutTester).toBeDefined();
      });

      it('`AppDistributionRelease` type is properly exposed to end user', function () {
        // Type check - this will fail at compile time if type is not exported
        const release: AppDistributionRelease = {
          displayVersion: '1.0.0',
          buildVersion: '123',
          releaseNotes: 'Test release notes',
          downloadURL: 'https://example.com/download',
          isExpired: false,
        };
        expect(release).toBeDefined();
        expect(release.displayVersion).toBe('1.0.0');
      });

      it('`FirebaseApp` type is properly exposed to end user', function () {
        const app = firebase.app() as unknown as FirebaseApp;
        expect(app).toBeDefined();
        expect(app.appDistribution).toBeDefined();
      });
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
