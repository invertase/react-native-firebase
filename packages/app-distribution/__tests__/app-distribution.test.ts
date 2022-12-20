import { describe, expect, it } from '@jest/globals';

import { firebase } from '../lib';

describe('appDistribution()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.appDistribution).toBeDefined();
      expect(app.appDistribution().app).toEqual(app);
    });
  });
});
