import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore
import { MODULAR_DEPRECATION_ARG } from '../../app/lib/common';

import { getApp } from '../../app/lib';

import {
  firebase,
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  onTokenChanged,
  CustomProvider,
} from '../lib';

describe('appCheck()', function () {
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

    describe('react-native-firebase provider', function () {
      it('correctly creates a provider instance', function () {
        expect(firebase.appCheck().newReactNativeFirebaseAppCheckProvider()).toBeDefined();
      });
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

    it('`setTokenAutoRefreshEnabled` function is properly exposed to end user', function () {
      expect(setTokenAutoRefreshEnabled).toBeDefined();
    });

    it('`CustomProvider` function is properly exposed to end user', function () {
      expect(CustomProvider).toBeDefined();
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let appCheckRefV9Deprecation: CheckV9DeprecationFunction;
    let staticsRefV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      appCheckRefV9Deprecation = createCheckV9Deprecation(['appCheck']);
      staticsRefV9Deprecation = createCheckV9Deprecation(['appCheck', 'statics']);

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                source: 'cache',
                changes: [],
                documents: [],
                metadata: {},
                path: 'foo',
              } as never),
          },
        );
      });
    });

    describe('AppCheck', function () {
      it('appCheck.activate()', function () {
        const appCheck = firebase.appCheck.call(null, getApp(), MODULAR_DEPRECATION_ARG);
        appCheckRefV9Deprecation(
          () =>
            initializeAppCheck(getApp(), {
              provider: {
                providerOptions: {
                  android: {
                    provider: 'playIntegrity',
                  },
                },
              },
              isTokenAutoRefreshEnabled: true,
            }),
          () => appCheck.activate('string'),
          'activate',
        );
      });

      it('appCheck.setTokenAutoRefreshEnabled()', function () {
        const appCheck = firebase.appCheck.call(null, getApp(), MODULAR_DEPRECATION_ARG);
        appCheckRefV9Deprecation(
          () => setTokenAutoRefreshEnabled(appCheck, true),
          () => appCheck.setTokenAutoRefreshEnabled(true),
          'setTokenAutoRefreshEnabled',
        );
      });

      it('appCheck.getToken()', function () {
        const appCheck = firebase.appCheck.call(null, getApp(), MODULAR_DEPRECATION_ARG);
        appCheckRefV9Deprecation(
          () => getToken(appCheck, true),
          () => appCheck.getToken(true),
          'getToken',
        );
      });

      it('appCheck.getLimitedUseToken()', function () {
        const appCheck = firebase.appCheck.call(null, getApp(), MODULAR_DEPRECATION_ARG);
        appCheckRefV9Deprecation(
          () => getLimitedUseToken(appCheck),
          () => appCheck.getLimitedUseToken(),
          'getLimitedUseToken',
        );
      });

      it('appCheck.onTokenChanged()', function () {
        const appCheck = firebase.appCheck.call(null, getApp(), MODULAR_DEPRECATION_ARG);
        appCheckRefV9Deprecation(
          () =>
            onTokenChanged(
              appCheck,
              () => {},
              () => {},
              () => {},
            ),
          () =>
            appCheck.onTokenChanged(
              () => {},
              () => {},
              () => {},
            ),
          'onTokenChanged',
        );
      });

      it('CustomProvider', function () {
        // @ts-ignore
        globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
        const appCheck = firebase.appCheck;
        // @ts-ignore
        globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
        staticsRefV9Deprecation(
          () => CustomProvider,
          () => appCheck.CustomProvider,
          'CustomProvider',
        );
      });
    });
  });
});
