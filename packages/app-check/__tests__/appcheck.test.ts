import { jest, beforeEach, describe, expect, it } from '@jest/globals';
// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

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
        const app = firebase.app();
        const appCheck = firebase.appCheck();
        appCheckRefV9Deprecation(
          () =>
            initializeAppCheck(app, {
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
        const appCheck = firebase.appCheck();
        appCheckRefV9Deprecation(
          () => setTokenAutoRefreshEnabled(appCheck, true),
          () => appCheck.setTokenAutoRefreshEnabled(true),
          'setTokenAutoRefreshEnabled',
        );
      });

      it('appCheck.getToken()', function () {
        const appCheck = firebase.appCheck();
        appCheckRefV9Deprecation(
          () => getToken(appCheck, true),
          () => appCheck.getToken(true),
          'getToken',
        );
      });

      it('appCheck.getLimitedUseToken()', function () {
        const appCheck = firebase.appCheck();
        appCheckRefV9Deprecation(
          () => getLimitedUseToken(appCheck),
          () => appCheck.getLimitedUseToken(),
          'getLimitedUseToken',
        );
      });

      it('appCheck.onTokenChanged()', function () {
        const appCheck = firebase.appCheck();
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
        const appCheck = firebase.appCheck;
        staticsRefV9Deprecation(
          () => CustomProvider,
          () => appCheck.CustomProvider,
          'CustomProvider',
        );
      });
    });
  });
});
