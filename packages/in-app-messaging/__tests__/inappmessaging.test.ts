import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  getInAppMessaging,
  isMessagesDisplaySuppressed,
  setMessagesDisplaySuppressed,
  isAutomaticDataCollectionEnabled,
  setAutomaticDataCollectionEnabled,
  triggerEvent,
} from '../lib';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('in-app-messaging', function () {
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
});
