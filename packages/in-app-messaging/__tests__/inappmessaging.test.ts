import { describe, expect, it } from '@jest/globals';

import {
  firebase,
  getInAppMessaging,
  isMessagesDisplaySuppressed,
  setMessagesDisplaySuppressed,
  isAutomaticDataCollectionEnabled,
  setAutomaticDataCollectionEnabled,
  triggerEvent,
} from '../lib';

describe('in-app-messaging', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.inAppMessaging).toBeDefined();
    });
  });

  describe('modular', function () {
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
  });
});
