import { describe, expect, it } from '@jest/globals';

import {
  firebase,
  getInstallations,
  deleteInstallations,
  getId,
  getToken,
  onIdChange,
} from '../lib';

describe('installations()', function () {
  describe('namespace', function () {
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
});
