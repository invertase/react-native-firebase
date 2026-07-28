import { describe, expect, it } from '@jest/globals';

import { getML } from '../lib';

describe('ml()', function () {
  describe('modular', function () {
    it('`getML` function is properly exposed to end user', function () {
      expect(getML).toBeDefined();
    });
  });
});
