import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { getInstallations, deleteInstallations, getId, getToken, onIdChange } from '../lib';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('installations()', function () {
  describe('modular', function () {
    beforeEach(function () {
      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                constants: {},
              } as never),
          },
        );
      });
    });

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
        expect(installations.app).toBeDefined();
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
