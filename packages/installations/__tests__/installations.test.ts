import { describe, expect, it } from '@jest/globals';

import { firebase, getInstallations, onIdChange } from '../lib';

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
    describe('getInstallations', function () {
      it('returns an instance of Installations', async function () {
        const installations = getInstallations();
        expect(installations).toBeDefined();
        // expect(installations.app).toBeDefined();
      });

      // it('supports multiple apps', async function () {
      //   const app = firebase.app();
      //   const secondaryApp = firebase.app('secondaryFromNative');

      //   const installations = getInstallations();
      //   const installationsForApp = getInstallations(secondaryApp);

      //   expect(installations.app).toEqual(app);
      //   expect(installationsForApp.app).toEqual(secondaryApp);
      // });
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
