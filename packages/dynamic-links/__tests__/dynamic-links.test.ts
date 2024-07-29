import { describe, expect, it } from '@jest/globals';

import {
  ShortLinkType,
  getDynamicLinks,
  buildLink,
  buildShortLink,
  getInitialLink,
  onLink,
  performDiagnostics,
  resolveLink,
} from '../lib';

describe('Dynamic Links', function () {
  describe('modular', function () {
    it('`ShortLinkType` constant is properly exposed to end user', function () {
      expect(ShortLinkType).toBeDefined();
    });

    it('`getDynamicLinks` function is properly exposed to end user', function () {
      expect(getDynamicLinks).toBeDefined();
    });

    it('`buildLink` function is properly exposed to end user', function () {
      expect(buildLink).toBeDefined();
    });

    it('`buildShortLink` function is properly exposed to end user', function () {
      expect(buildShortLink).toBeDefined();
    });

    it('`getInitialLink` function is properly exposed to end user', function () {
      expect(getInitialLink).toBeDefined();
    });

    it('`onLink` function is properly exposed to end user', function () {
      expect(onLink).toBeDefined();
    });

    it('`performDiagnostics` function is properly exposed to end user', function () {
      expect(performDiagnostics).toBeDefined();
    });

    it('`resolveLink` function is properly exposed to end user', function () {
      expect(resolveLink).toBeDefined();
    });
  });
});
