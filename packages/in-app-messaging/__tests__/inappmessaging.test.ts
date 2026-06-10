import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  firebase,
  getInAppMessaging,
  isMessagesDisplaySuppressed,
  setMessagesDisplaySuppressed,
  isAutomaticDataCollectionEnabled,
  setAutomaticDataCollectionEnabled,
  triggerEvent,
} from '../lib';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('in-app-messaging', function () {
  describe('namespace', function () {
    beforeAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.inAppMessaging).toBeDefined();
      expect(app.inAppMessaging().app).toEqual(app);
    });
  });

  describe('modular', function () {
    beforeEach(async function () {
      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: (_target, prop) => {
              if (
                prop === 'isMessagesDisplaySuppressed' ||
                prop === 'isAutomaticDataCollectionEnabled'
              ) {
                return false;
              }

              return jest.fn().mockResolvedValue(null as never);
            },
          },
        );
      });

      const inAppMessaging = getInAppMessaging();
      await setMessagesDisplaySuppressed(inAppMessaging, false);
      await setAutomaticDataCollectionEnabled(inAppMessaging, false);
    });

    it('`getInAppMessaging` function is properly exposed to end user', function () {
      expect(getInAppMessaging).toBeDefined();
    });

    it('`isMessagesDisplaySuppressed` function is properly exposed to end user', function () {
      expect(isMessagesDisplaySuppressed).toBeDefined();
    });

    it('`setMessagesDisplaySuppressed` function is properly exposed to end user', function () {
      expect(setMessagesDisplaySuppressed).toBeDefined();
    });

    it('`isAutomaticDataCollectionEnabled` function is properly exposed to end user', function () {
      expect(isAutomaticDataCollectionEnabled).toBeDefined();
    });

    it('`setAutomaticDataCollectionEnabled` function is properly exposed to end user', function () {
      expect(setAutomaticDataCollectionEnabled).toBeDefined();
    });

    it('`triggerEvent` function is properly exposed to end user', function () {
      expect(triggerEvent).toBeDefined();
    });

    it('updates isMessagesDisplaySuppressed synchronously after setMessagesDisplaySuppressed', function () {
      const inAppMessaging = getInAppMessaging();
      expect(isMessagesDisplaySuppressed(inAppMessaging)).toBe(false);
      setMessagesDisplaySuppressed(inAppMessaging, true);
      expect(isMessagesDisplaySuppressed(inAppMessaging)).toBe(true);
    });

    it('updates isMessagesDisplaySuppressed after setMessagesDisplaySuppressed resolves', async function () {
      const inAppMessaging = getInAppMessaging();
      await setMessagesDisplaySuppressed(inAppMessaging, true);
      expect(isMessagesDisplaySuppressed(inAppMessaging)).toBe(true);
    });

    it('updates isAutomaticDataCollectionEnabled synchronously after setAutomaticDataCollectionEnabled', function () {
      const inAppMessaging = getInAppMessaging();
      expect(isAutomaticDataCollectionEnabled(inAppMessaging)).toBe(false);
      setAutomaticDataCollectionEnabled(inAppMessaging, true);
      expect(isAutomaticDataCollectionEnabled(inAppMessaging)).toBe(true);
    });

    it('updates isAutomaticDataCollectionEnabled after setAutomaticDataCollectionEnabled resolves', async function () {
      const inAppMessaging = getInAppMessaging();
      await setAutomaticDataCollectionEnabled(inAppMessaging, true);
      expect(isAutomaticDataCollectionEnabled(inAppMessaging)).toBe(true);
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let inAppMessagingV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      inAppMessagingV9Deprecation = createCheckV9Deprecation(['inAppMessaging']);

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: (_target, prop) => {
              if (
                prop === 'isMessagesDisplaySuppressed' ||
                prop === 'isAutomaticDataCollectionEnabled'
              ) {
                return false;
              }

              return jest.fn().mockResolvedValue(null as never);
            },
          },
        );
      });
    });

    it('isMessagesDisplaySuppressed', function () {
      const inAppMessaging = getInAppMessaging();
      inAppMessagingV9Deprecation(
        () => isMessagesDisplaySuppressed(inAppMessaging),
        () => inAppMessaging.isMessagesDisplaySuppressed,
        'isMessagesDisplaySuppressed',
      );
    });

    it('setMessagesDisplaySuppressed', function () {
      const inAppMessaging = getInAppMessaging();
      inAppMessagingV9Deprecation(
        () => setMessagesDisplaySuppressed(inAppMessaging, true),
        () => inAppMessaging.setMessagesDisplaySuppressed(true),
        'setMessagesDisplaySuppressed',
      );
    });

    it('isAutomaticDataCollectionEnabled', function () {
      const inAppMessaging = getInAppMessaging();
      inAppMessagingV9Deprecation(
        () => isAutomaticDataCollectionEnabled(inAppMessaging),
        () => inAppMessaging.isAutomaticDataCollectionEnabled,
        'isAutomaticDataCollectionEnabled',
      );
    });

    it('setAutomaticDataCollectionEnabled', function () {
      const inAppMessaging = getInAppMessaging();
      inAppMessagingV9Deprecation(
        () => setAutomaticDataCollectionEnabled(inAppMessaging, false),
        () => inAppMessaging.setAutomaticDataCollectionEnabled(false),
        'setAutomaticDataCollectionEnabled',
      );
    });

    it('triggerEvent', function () {
      const inAppMessaging = getInAppMessaging();
      inAppMessagingV9Deprecation(
        () => triggerEvent(inAppMessaging, 'test-event'),
        () => inAppMessaging.triggerEvent('test-event'),
        'triggerEvent',
      );
    });
  });
});
