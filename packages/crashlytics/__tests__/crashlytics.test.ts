import { describe, expect, it } from '@jest/globals';

import { firebase } from '../lib';

describe('Crashlytics', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.crashlytics).toBeDefined();
      expect(app.crashlytics().app).toEqual(app);
    });
  });
});
