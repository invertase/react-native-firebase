import { describe, expect, it } from '@jest/globals';

import {
  firebase,
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  addTokenListener,
  setTokenAutoRefreshEnabled,
} from '../lib';

describe('appCheck()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.appCheck).toBeDefined();
      expect(app.appCheck().app).toEqual(app);
    });

    it('supports multiple apps', async function () {
      expect(firebase.appCheck().app.name).toEqual('[DEFAULT]');
      expect(firebase.appCheck(firebase.app('secondaryFromNative')).app.name).toEqual(
        'secondaryFromNative',
      );
      expect(firebase.app('secondaryFromNative').appCheck().app.name).toEqual(
        'secondaryFromNative',
      );
    });
  });

  describe('react-native-firebase provider', function () {
    it('correctly creates a provider instance', function () {
      expect(firebase.appCheck().newReactNativeFirebaseAppCheckProvider()).toBeDefined();
    });
  });

  describe('modular', function () {
    it('`initializeAppCheck` function is properly exposed to end user', function () {
      expect(initializeAppCheck).toBeDefined();
    });

    it('`getToken` function is properly exposed to end user', function () {
      expect(getToken).toBeDefined();
    });

    it('`getLimitedUseToken` function is properly exposed to end user', function () {
      expect(getLimitedUseToken).toBeDefined();
    });

    it('`addTokenListener` function is properly exposed to end user', function () {
      expect(addTokenListener).toBeDefined();
    });

    it('`setTokenAutoRefreshEnabled` function is properly exposed to end user', function () {
      expect(setTokenAutoRefreshEnabled).toBeDefined();
    });
  });
});
