import { afterAll, beforeAll, describe, expect, it, beforeEach, jest } from '@jest/globals';

import {
  firebase,
  getInstallations,
  deleteInstallations,
  getId,
  getToken,
  onIdChange,
} from '../lib';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('installations()', function () {
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
      expect(app.installations).toBeDefined();
      expect(app.installations().app).toEqual(app);
    });

    it('supports multiple apps', async function () {
      expect(firebase.installations().app.name).toEqual('[DEFAULT]');
      expect(firebase.installations(firebase.app('secondaryFromNative')).app.name).toEqual(
        'secondaryFromNative',
      );
      expect(firebase.app('secondaryFromNative').installations().app.name).toEqual(
        'secondaryFromNative',
      );
    });
  });

  describe('modular', function () {
    it('`getInstallations` function is properly exposed to end user', function () {
      expect(getInstallations).toBeDefined();
    });

    it('`deleteInstallations` function is properly exposed to end user', function () {
      expect(deleteInstallations).toBeDefined();
    });

    it('`getId` function is properly exposed to end user', function () {
      expect(getId).toBeDefined();
    });

    it('`getToken` function is properly exposed to end user', function () {
      expect(getToken).toBeDefined();
    });

    it('`onIdChange` function is properly exposed to end user', function () {
      expect(onIdChange).toBeDefined();
    });

    describe('getInstallations', function () {
      it('returns an instance of Installations', async function () {
        const installations = getInstallations();
        expect(installations).toBeDefined();
        // expect(installations.app).toBeDefined();
      });
    });

    describe('onIdChange', function () {
      it('throws an unsupported error', async function () {
        const installations = getInstallations();
        expect(() => onIdChange(installations, () => {})).toThrow(
          'onIdChange() is unsupported by the React Native Firebase SDK.',
        );
      });
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let installationsV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      installationsV9Deprecation = createCheckV9Deprecation(['installations']);

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                constants: {},
              } as never),
          },
        );
      });
    });

    it('delete', function () {
      const installations = getInstallations();
      installationsV9Deprecation(
        () => deleteInstallations(installations),
        () => installations.delete(),
        'delete',
      );
    });

    it('getId', function () {
      const installations = getInstallations();
      installationsV9Deprecation(
        () => getId(installations),
        () => installations.getId(),
        'getId',
      );
    });

    it('getToken', function () {
      const installations = getInstallations();
      installationsV9Deprecation(
        () => getToken(installations),
        () => installations.getToken(),
        'getToken',
      );
    });
  });
});
