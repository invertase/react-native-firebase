import { describe, expect, it } from '@jest/globals';

import { firebase, getML } from '../lib';

describe('ml()', function () {
  describe('namespace', function () {
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
