import { describe, expect, it } from '@jest/globals';

import { firebase } from '../lib';

describe('appCheck()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.appCheck).toBeDefined();
      expect(app.appCheck().app).toEqual(app);
    });

    it('supports multiple apps', async function () {
      expect(firebase.appCheck().app.name).toEqual('[DEFAULT]');
      expect(firebase.appCheck(firebase.app('secondaryFromNative')).app.name).toEqual(
        'secondaryFromNative',
      );
      expect(firebase.app('secondaryFromNative').appCheck().app.name).toEqual(
        'secondaryFromNative',
      );
    });
  });
});
