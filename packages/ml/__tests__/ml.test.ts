import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { firebase, getML } from '../lib';

describe('ml()', function () {
  describe('namespace', function () {
    beforeAll(async () => {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterAll(async () => {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.ml).toBeDefined();
      expect(app.ml().app).toEqual(app);
    });
  });

  describe('modular', function () {
    it('`getML` function is properly exposed to end user', function () {
      expect(getML).toBeDefined();
    });
  });
});
