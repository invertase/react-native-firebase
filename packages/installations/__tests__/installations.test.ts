import { describe, expect, it } from '@jest/globals';

import { firebase } from '../lib';

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
});
