import { jest, afterAll, beforeAll, describe, expect, it, xit, beforeEach } from '@jest/globals';

// @ts-ignore test
import FirebaseModule from '@react-native-firebase/app/lib/internal/FirebaseModule';

import analytics, {
  firebase,
  getAnalytics,
  initializeAnalytics,
  getGoogleAnalyticsClientId,
  logEvent,
  setAnalyticsCollectionEnabled,
  setSessionTimeoutDuration,
  getAppInstanceId,
  getSessionId,
  setUserId,
  setUserProperty,
  setUserProperties,
  resetAnalyticsData,
  logAddPaymentInfo,
  logScreenView,
  logAddShippingInfo,
  logAddToCart,
  logAddToWishlist,
  logAppOpen,
  logBeginCheckout,
  logCampaignDetails,
  logEarnVirtualCurrency,
  logGenerateLead,
  logJoinGroup,
  logLevelEnd,
  logLevelStart,
  logLevelUp,
  logLogin,
  logPostScore,
  logSelectContent,
  logPurchase,
  logRefund,
  logRemoveFromCart,
  logSearch,
  logSelectItem,
  logSetCheckoutOption,
  logSelectPromotion,
  logShare,
  logSignUp,
  logSpendVirtualCurrency,
  logTutorialBegin,
  logTutorialComplete,
  logUnlockAchievement,
  logViewCart,
  logViewItem,
  logViewItemList,
  logViewPromotion,
  logViewSearchResults,
  setDefaultEventParameters,
  initiateOnDeviceConversionMeasurementWithEmailAddress,
  initiateOnDeviceConversionMeasurementWithHashedEmailAddress,
  initiateOnDeviceConversionMeasurementWithPhoneNumber,
  initiateOnDeviceConversionMeasurementWithHashedPhoneNumber,
  isSupported,
  setConsent,
  settings,
} from '../lib';

import { createCheckV9Deprecation } from '@react-native-firebase/app/common/unitTestUtils';
import type { CheckV9DeprecationFunction } from '@react-native-firebase/app/common/unitTestUtils';

describe('Analytics', function () {
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
      expect(app.analytics).toBeDefined();
      expect(app.analytics().app).toEqual(app);
    });

    it('throws if non default app arg provided to firebase.analytics(APP)', function () {
      const app = firebase.app('secondaryFromNative');

      const expectedError = [
        'You attempted to call "firebase.analytics(app)" but; analytics does not support multiple Firebase Apps.',
        '',
        'Ensure the app provided is the default Firebase app only and not the "secondaryFromNative" app.',
      ].join('\r\n');

      // @ts-ignore test
      expect(() => firebase.analytics(app)).toThrow(expectedError);
    });

    it('throws if analytics access from a non default app', function () {
      const app = firebase.app('secondaryFromNative');

      const expectedError = [
        'You attempted to call "firebase.app(\'secondaryFromNative\').analytics" but; analytics does not support multiple Firebase Apps.',
        '',
        'Ensure you access analytics from the default application only.',
      ].join('\r\n');

      expect(() => app.analytics()).toThrow(expectedError);
    });

    // TODO in app/registry/namespace.js - if (!hasCustomUrlOrRegionSupport)
    xit('throws if args provided to firebase.app().analytics(ARGS)', function () {
      try {
        // @ts-ignore test
        firebase.app().analytics('foo', 'arg2');
        return Promise.reject(new Error('Did not throw'));
      } catch (e: any) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });

    it('errors if milliseconds not a number', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setSessionTimeoutDuration('123')).toThrow(
        "'milliseconds' expected a number value",
      );
    });

    it('throws if none string none null values', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setUserId(123)).toThrow("'id' expected a string value");
    });

    it('throws if name is not a string', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setUserProperty(1337, 'invertase')).toThrow(
        "'name' expected a string value",
      );
    });

    it('throws if value is invalid', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setUserProperty('invertase3', 33.3333)).toThrow(
        "'value' expected a string value",
      );
    });

    it('throws if properties is not an object', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setUserProperties(1337)).toThrow(
        "'properties' expected an object of key/value pairs",
      );
    });

    it('throws if property value is invalid', function () {
      const props = {
        test: '123',
        foo: {
          bar: 'baz',
        },
      };
      // @ts-ignore test
      expect(() => firebase.analytics().setUserProperties(props)).toThrow(
        "'properties' value for parameter 'foo' is invalid",
      );
    });

    it('throws if value is a number', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setUserProperties({ invertase1: 123 })).toThrow(
        "'properties' value for parameter 'invertase1' is invalid, expected a string.",
      );
    });

    it('throws if consentSettings is not an object', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setConsent(1337)).toThrow(
        'The supplied arg must be an object of key/values.',
      );
    });

    it('throws if consentSettings is invalid', function () {
      const consentSettings = {
        ad_storage: true,
        foo: {
          bar: 'baz',
        },
      };
      // @ts-ignore test
      expect(() => firebase.analytics().setConsent(consentSettings)).toThrow(
        "'consentSettings' value for parameter 'foo' is invalid, expected a boolean.",
      );
    });

    it('throws if one value of consentSettings is a number', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().setConsent({ ad_storage: 123 })).toThrow(
        "'consentSettings' value for parameter 'ad_storage' is invalid, expected a boolean.",
      );
    });

    it('errors when no parameters are set', function () {
      // @ts-ignore test
      expect(() => firebase.analytics().logSearch()).toThrow(
        'The supplied arg must be an object of key/values',
      );
    });

    describe('logEvent()', function () {
      it('errors if name is not a string', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logEvent(123)).toThrow(
          "firebase.analytics().logEvent(*) 'name' expected a string value.",
        );
      });

      it('errors if params is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logEvent('invertase_event', 'foobar')).toThrow(
          "firebase.analytics().logEvent(_, *) 'params' expected an object value.",
        );
      });

      it('errors on using a reserved name', function () {
        expect(() => firebase.analytics().logEvent('session_start')).toThrow(
          "firebase.analytics().logEvent(*) 'name' the event name 'session_start' is reserved and can not be used.",
        );
      });

      it('errors if name not alphanumeric', function () {
        expect(() => firebase.analytics().logEvent('!@£$%^&*')).toThrow(
          "firebase.analytics().logEvent(*) 'name' invalid event name '!@£$%^&*'. Names should contain 1 to 40 alphanumeric characters or underscores.",
        );
      });

      describe('logScreenView()', function () {
        it('errors if param is not an object', function () {
          // @ts-ignore test
          expect(() => firebase.analytics().logScreenView(123)).toThrow(
            'firebase.analytics().logScreenView(*):',
          );
        });

        it('accepts arbitrary custom event parameters while rejecting defined parameters with wrong types', function () {
          expect(() => firebase.analytics().logScreenView({ foo: 'bar' })).not.toThrow();
          expect(() =>
            // @ts-ignore test
            firebase.analytics().logScreenView({ screen_name: 123, foo: 'bar' }),
          ).toThrow('firebase.analytics().logScreenView(*):');
        });
      });

      describe('logAddPaymentInfo()', function () {
        it('errors if param is not an object', function () {
          // @ts-ignore test
          expect(() => firebase.analytics().logAddPaymentInfo(123)).toThrow(
            'firebase.analytics().logAddPaymentInfo(*):',
          );
        });

        it('errors when compound values are not set', function () {
          expect(() =>
            firebase.analytics().logAddPaymentInfo({
              value: 123,
            }),
          ).toThrow('firebase.analytics().logAddPaymentInfo(*):');
        });
      });
    });

    describe('setDefaultEventParameters()', function () {
      it('errors if params is not a object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().setDefaultEventParameters('123')).toThrow(
          "firebase.analytics().setDefaultEventParameters(*) 'params' expected an object value when it is defined.",
        );
      });
    });

    describe('logAddToCart()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logAddToCart(123)).toThrow(
          'firebase.analytics().logAddToCart(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logAddToCart({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logAddToCart(*):');
      });
    });

    describe('logAddShippingInfo()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logAddShippingInfo(123)).toThrow(
          'firebase.analytics().logAddShippingInfo(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logAddShippingInfo({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logAddShippingInfo(*):');
      });
    });

    describe('logAddToWishlist()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logAddToWishlist(123)).toThrow(
          'firebase.analytics().logAddToWishlist(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logAddToWishlist({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logAddToWishlist(*):');
      });

      it('items accept arbitrary custom event parameters', function () {
        expect(() =>
          firebase.analytics().logAddToWishlist({ items: [{ foo: 'bar' }] }),
        ).not.toThrow();
      });
    });

    describe('logBeginCheckout()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logBeginCheckout(123)).toThrow(
          'firebase.analytics().logBeginCheckout(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logBeginCheckout({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logBeginCheckout(*):');
      });

      it('accepts arbitrary custom event parameters', function () {
        expect(() =>
          firebase.analytics().logBeginCheckout({
            value: 123,
            currency: 'EUR',
            foo: 'bar',
          }),
        ).not.toThrow();
      });
    });

    describe('logGenerateLead()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logGenerateLead(123)).toThrow(
          'firebase.analytics().logGenerateLead(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logGenerateLead({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logGenerateLead(*):');
      });
    });

    describe('logCampaignDetails()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logCampaignDetails(123)).toThrow(
          'firebase.analytics().logCampaignDetails(*):',
        );
      });
    });

    describe('logEarnVirtualCurrency()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logEarnVirtualCurrency(123)).toThrow(
          'firebase.analytics().logEarnVirtualCurrency(*):',
        );
      });
    });

    describe('logJoinGroup()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logJoinGroup(123)).toThrow(
          'firebase.analytics().logJoinGroup(*):',
        );
      });
    });

    describe('logLevelEnd()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logLevelEnd(123)).toThrow(
          'firebase.analytics().logLevelEnd(*):',
        );
      });
    });

    describe('logLevelStart()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logLevelStart(123)).toThrow(
          'firebase.analytics().logLevelStart(*):',
        );
      });
    });

    describe('logLevelUp()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logLevelUp(123)).toThrow(
          'firebase.analytics().logLevelUp(*):',
        );
      });
    });

    describe('logLogin()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logLogin(123)).toThrow(
          'firebase.analytics().logLogin(*):',
        );
      });
    });

    describe('logPostScore()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logPostScore(123)).toThrow(
          'firebase.analytics().logPostScore(*):',
        );
      });
    });

    describe('logSelectContent()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logSelectContent(123)).toThrow(
          'firebase.analytics().logSelectContent(*):',
        );
      });
    });

    describe('logSearch()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logSearch(123)).toThrow(
          'firebase.analytics().logSearch(*):',
        );
      });
    });

    describe('logSelectItem()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logSelectItem(123)).toThrow(
          'firebase.analytics().logSelectItem(*):',
        );
      });
    });

    describe('logSetCheckoutOption()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logSetCheckoutOption(123)).toThrow(
          'firebase.analytics().logSetCheckoutOption(*):',
        );
      });
    });

    describe('logShare()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logShare(123)).toThrow(
          'firebase.analytics().logShare(*):',
        );
      });
    });

    describe('logSignUp()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logSignUp(123)).toThrow(
          'firebase.analytics().logSignUp(*):',
        );
      });
    });

    describe('logSelectPromotion()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logSelectPromotion(123)).toThrow(
          'firebase.analytics().logSelectPromotion(*):',
        );
      });
    });

    describe('logSpendVirtualCurrency()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logSpendVirtualCurrency(123)).toThrow(
          'firebase.analytics().logSpendVirtualCurrency(*):',
        );
      });
    });

    describe('logUnlockAchievement()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logUnlockAchievement(123)).toThrow(
          'firebase.analytics().logUnlockAchievement(*):',
        );
      });
    });

    describe('logPurchase()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logPurchase(123)).toThrow(
          'firebase.analytics().logPurchase(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logPurchase({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logPurchase(*):');
      });

      it('accepts arbitrary custom event parameters', function () {
        expect(() =>
          firebase.analytics().logPurchase({
            value: 123,
            currency: 'EUR',
            foo: 'bar',
          }),
        ).not.toThrow();
      });
    });

    describe('logRefund()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logRefund(123)).toThrow(
          'firebase.analytics().logRefund(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logRefund({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logRefund(*):');
      });
    });

    describe('logViewCart()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logViewCart(123)).toThrow(
          'firebase.analytics().logViewCart(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logViewCart({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logViewCart(*):');
      });
    });

    describe('logViewItem()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logViewItem(123)).toThrow(
          'firebase.analytics().logViewItem(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logViewItem({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logViewItem(*):');
      });
    });

    describe('logViewItemList()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logViewItemList(123)).toThrow(
          'firebase.analytics().logViewItemList(*):',
        );
      });
    });

    describe('logRemoveFromCart()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logRemoveFromCart(123)).toThrow(
          'firebase.analytics().logRemoveFromCart(*):',
        );
      });

      it('errors when compound values are not set', function () {
        expect(() =>
          firebase.analytics().logRemoveFromCart({
            value: 123,
          }),
        ).toThrow('firebase.analytics().logRemoveFromCart(*):');
      });
    });

    describe('logViewPromotion()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logViewPromotion(123)).toThrow(
          'firebase.analytics().logViewPromotion(*):',
        );
      });
    });

    describe('logViewSearchResults()', function () {
      it('errors if param is not an object', function () {
        // @ts-ignore test
        expect(() => firebase.analytics().logViewSearchResults(123)).toThrow(
          'firebase.analytics().logViewSearchResults(*):',
        );
      });
    });

    describe('setAnalyticsCollectionEnabled()', function () {
      it('throws if not a boolean', function () {
        // @ts-ignore
        expect(() => firebase.analytics().setAnalyticsCollectionEnabled('foo')).toThrow(
          "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
        );
      });
    });

    describe('initiateOnDeviceConversionMeasurementWithEmailAddress()', function () {
      it('throws if not a string', function () {
        expect(() =>
          // @ts-ignore
          firebase.analytics().initiateOnDeviceConversionMeasurementWithEmailAddress(true),
        ).toThrow(
          "firebase.analytics().initiateOnDeviceConversionMeasurementWithEmailAddress(*) 'emailAddress' expected a string value.",
        );
      });
    });

    describe('initiateOnDeviceConversionMeasurementWithHashedEmailAddress()', function () {
      it('throws if not a string', function () {
        expect(() =>
          // @ts-ignore
          firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedEmailAddress(true),
        ).toThrow(
          "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedEmailAddress(*) 'hashedEmailAddress' expected a string value.",
        );
      });
    });

    describe('initiateOnDeviceConversionMeasurementWithHashedPhoneNumber()', function () {
      it('throws if not a string', function () {
        expect(() =>
          // @ts-ignore
          firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(1234),
        ).toThrow(
          "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(*) 'hashedPhoneNumber' expected a string value.",
        );
      });

      it('throws if hashed value is a phone number in E.164 format', function () {
        expect(() =>
          firebase
            .analytics()
            .initiateOnDeviceConversionMeasurementWithHashedPhoneNumber('+1234567890'),
        ).toThrow(
          "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(*) 'hashedPhoneNumber' expected a sha256-hashed value of a phone number in E.164 format.",
        );
      });
    });

    describe('TypeScript migration maintains existing `analytics()` exports', function () {
      it('`analytics()` is properly exposed to end user', function () {
        expect(analytics().logAddToCart).toBeDefined();
        expect(analytics().logAddPaymentInfo).toBeDefined();
        expect(analytics().logAddShippingInfo).toBeDefined();
        expect(analytics().logAddToWishlist).toBeDefined();
        expect(analytics().logAppOpen).toBeDefined();
        expect(analytics().logBeginCheckout).toBeDefined();
        expect(analytics().logCampaignDetails).toBeDefined();
        expect(analytics().logEarnVirtualCurrency).toBeDefined();
        expect(analytics().logEvent).toBeDefined();
        expect(analytics().logGenerateLead).toBeDefined();
        expect(analytics().logJoinGroup).toBeDefined();
        expect(analytics().logLevelEnd).toBeDefined();
        expect(analytics().logLevelStart).toBeDefined();
        expect(analytics().logLevelUp).toBeDefined();
        expect(analytics().logLogin).toBeDefined();
        expect(analytics().logPostScore).toBeDefined();
        expect(analytics().logSelectContent).toBeDefined();
        expect(analytics().logSetCheckoutOption).toBeDefined();
        expect(analytics().logShare).toBeDefined();
        expect(analytics().logSignUp).toBeDefined();
        expect(analytics().logSpendVirtualCurrency).toBeDefined();
        expect(analytics().logTutorialBegin).toBeDefined();
        expect(analytics().logTutorialComplete).toBeDefined();
        expect(analytics().logUnlockAchievement).toBeDefined();
        expect(analytics().logViewItem).toBeDefined();
        expect(analytics().logViewItemList).toBeDefined();
        expect(analytics().resetAnalyticsData).toBeDefined();
        expect(analytics().logViewCart).toBeDefined();
        expect(analytics().setAnalyticsCollectionEnabled).toBeDefined();
        expect(analytics().logSelectPromotion).toBeDefined();
        expect(analytics().logScreenView).toBeDefined();
        expect(analytics().logViewPromotion).toBeDefined();
        expect(analytics().setSessionTimeoutDuration).toBeDefined();
        expect(analytics().setUserId).toBeDefined();
        expect(analytics().setUserProperties).toBeDefined();
        expect(analytics().logViewSearchResults).toBeDefined();
        expect(analytics().setUserProperty).toBeDefined();
        expect(analytics().setConsent).toBeDefined();
      });
    });
  });

  describe('modular', function () {
    it('`getAnalytics` function is properly exposed to end user', function () {
      expect(getAnalytics).toBeDefined();
    });

    it('`initializeAnalytics` function is properly exposed to end user', function () {
      expect(initializeAnalytics).toBeDefined();
    });

    it('`getGoogleAnalyticsClientId` function is properly exposed to end user', function () {
      expect(getGoogleAnalyticsClientId).toBeDefined();
    });

    it('`logEvent` function is properly exposed to end user', function () {
      expect(logEvent).toBeDefined();
    });

    it('`setAnalyticsCollectionEnabled` function is properly exposed to end user', function () {
      expect(setAnalyticsCollectionEnabled).toBeDefined();
    });

    it('`setSessionTimeoutDuration` function is properly exposed to end user', function () {
      expect(setSessionTimeoutDuration).toBeDefined();
    });

    it('`getAppInstanceId` function is properly exposed to end user', function () {
      expect(getAppInstanceId).toBeDefined();
    });

    it('`getSessionId` function is properly exposed to end user', function () {
      expect(getSessionId).toBeDefined();
    });

    it('`setUserId` function is properly exposed to end user', function () {
      expect(setUserId).toBeDefined();
    });

    it('`setUserProperty` function is properly exposed to end user', function () {
      expect(setUserProperty).toBeDefined();
    });

    it('`setUserProperties` function is properly exposed to end user', function () {
      expect(setUserProperties).toBeDefined();
    });

    it('`resetAnalyticsData` function is properly exposed to end user', function () {
      expect(resetAnalyticsData).toBeDefined();
    });

    it('`logAddPaymentInfo` function is properly exposed to end user', function () {
      expect(logAddPaymentInfo).toBeDefined();
    });

    it('`logScreenView` function is properly exposed to end user', function () {
      expect(logScreenView).toBeDefined();
    });

    it('`logAddShippingInfo` function is properly exposed to end user', function () {
      expect(logAddShippingInfo).toBeDefined();
    });

    it('`logAddToCart` function is properly exposed to end user', function () {
      expect(logAddToCart).toBeDefined();
    });

    it('`logAddToWishlist` function is properly exposed to end user', function () {
      expect(logAddToWishlist).toBeDefined();
    });

    it('`logAppOpen` function is properly exposed to end user', function () {
      expect(logAppOpen).toBeDefined();
    });

    it('`logBeginCheckout` function is properly exposed to end user', function () {
      expect(logBeginCheckout).toBeDefined();
    });

    it('`logCampaignDetails` function is properly exposed to end user', function () {
      expect(logCampaignDetails).toBeDefined();
    });

    it('`logEarnVirtualCurrency` function is properly exposed to end user', function () {
      expect(logEarnVirtualCurrency).toBeDefined();
    });

    it('`logGenerateLead` function is properly exposed to end user', function () {
      expect(logGenerateLead).toBeDefined();
    });

    it('`logJoinGroup` function is properly exposed to end user', function () {
      expect(logJoinGroup).toBeDefined();
    });

    it('`logLevelEnd` function is properly exposed to end user', function () {
      expect(logLevelEnd).toBeDefined();
    });

    it('`logLevelStart` function is properly exposed to end user', function () {
      expect(logLevelStart).toBeDefined();
    });

    it('`logLevelUp` function is properly exposed to end user', function () {
      expect(logLevelUp).toBeDefined();
    });

    it('`logLogin` function is properly exposed to end user', function () {
      expect(logLogin).toBeDefined();
    });

    it('`logPostScore` function is properly exposed to end user', function () {
      expect(logPostScore).toBeDefined();
    });

    it('`logSelectContent` function is properly exposed to end user', function () {
      expect(logSelectContent).toBeDefined();
    });

    it('`logPurchase` function is properly exposed to end user', function () {
      expect(logPurchase).toBeDefined();
    });

    it('`logRefund` function is properly exposed to end user', function () {
      expect(logRefund).toBeDefined();
    });

    it('`logRemoveFromCart` function is properly exposed to end user', function () {
      expect(logRemoveFromCart).toBeDefined();
    });

    it('`logSearch` function is properly exposed to end user', function () {
      expect(logSearch).toBeDefined();
    });

    it('`logSelectItem` function is properly exposed to end user', function () {
      expect(logSelectItem).toBeDefined();
    });

    it('`logSetCheckoutOption` function is properly exposed to end user', function () {
      expect(logSetCheckoutOption).toBeDefined();
    });

    it('`logSelectPromotion` function is properly exposed to end user', function () {
      expect(logSelectPromotion).toBeDefined();
    });

    it('`logShare` function is properly exposed to end user', function () {
      expect(logShare).toBeDefined();
    });

    it('`logSignUp` function is properly exposed to end user', function () {
      expect(logSignUp).toBeDefined();
    });

    it('`logSpendVirtualCurrency` function is properly exposed to end user', function () {
      expect(logSpendVirtualCurrency).toBeDefined();
    });

    it('`logTutorialBegin` function is properly exposed to end user', function () {
      expect(logTutorialBegin).toBeDefined();
    });

    it('`logTutorialComplete` function is properly exposed to end user', function () {
      expect(logTutorialComplete).toBeDefined();
    });

    it('`logUnlockAchievement` function is properly exposed to end user', function () {
      expect(logUnlockAchievement).toBeDefined();
    });

    it('`logViewCart` function is properly exposed to end user', function () {
      expect(logViewCart).toBeDefined();
    });

    it('`logViewItem` function is properly exposed to end user', function () {
      expect(logViewItem).toBeDefined();
    });

    it('`logViewItemList` function is properly exposed to end user', function () {
      expect(logViewItemList).toBeDefined();
    });

    it('`logViewPromotion` function is properly exposed to end user', function () {
      expect(logViewPromotion).toBeDefined();
    });

    it('`logViewSearchResults` function is properly exposed to end user', function () {
      expect(logViewSearchResults).toBeDefined();
    });

    it('`setDefaultEventParameters` function is properly exposed to end user', function () {
      expect(setDefaultEventParameters).toBeDefined();
    });

    it('`initiateOnDeviceConversionMeasurementWithEmailAddress` function is properly exposed to end user', function () {
      expect(initiateOnDeviceConversionMeasurementWithEmailAddress).toBeDefined();
    });

    it('`initiateOnDeviceConversionMeasurementWithHashedEmailAddress` function is properly exposed to end user', function () {
      expect(initiateOnDeviceConversionMeasurementWithHashedEmailAddress).toBeDefined();
    });

    it('`initiateOnDeviceConversionMeasurementWithHashedEmailAddress` throws if not a string', function () {
      expect(() =>
        // @ts-ignore
        initiateOnDeviceConversionMeasurementWithHashedEmailAddress(getAnalytics(), true),
      ).toThrow(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedEmailAddress(*) 'hashedEmailAddress' expected a string value.",
      );
    });

    it('`initiateOnDeviceConversionMeasurementWithHashedPhoneNumber` should throw if the value is in E.164 format', function () {
      expect(() =>
        initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(getAnalytics(), '+1234567890'),
      ).toThrow(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(*) 'hashedPhoneNumber' expected a sha256-hashed value of a phone number in E.164 format.",
      );
    });

    it('`initiateOnDeviceConversionMeasurementWithPhoneNumber` function is properly exposed to end user', function () {
      expect(initiateOnDeviceConversionMeasurementWithPhoneNumber).toBeDefined();
    });

    it('`initiateOnDeviceConversionMeasurementWithHashedPhoneNumber` function is properly exposed to end user', function () {
      expect(initiateOnDeviceConversionMeasurementWithHashedPhoneNumber).toBeDefined();
    });

    it('`isSupported` function is properly exposed to end user', function () {
      expect(isSupported).toBeDefined();
    });

    it('`setConsent` function is properly exposed to end user', function () {
      expect(setConsent).toBeDefined();
    });

    it('`settings` function is properly exposed to end user', function () {
      expect(settings).toBeDefined();
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let analyticsRefV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      analyticsRefV9Deprecation = createCheckV9Deprecation(['analytics']);

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

    describe('Analytics', function () {
      it('analytics.logEvent()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => logEvent(analytics, 'invertase_event'),
          () => analytics.logEvent('invertase_event'),
          'logEvent',
        );
      });

      it('analytics.setAnalyticsCollectionEnabled()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => setAnalyticsCollectionEnabled(analytics, true),
          () => analytics.setAnalyticsCollectionEnabled(true),
          'setAnalyticsCollectionEnabled',
        );
      });

      it('analytics.setSessionTimeoutDuration()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => setSessionTimeoutDuration(analytics, 180000),
          () => analytics.setSessionTimeoutDuration(180000),
          'setSessionTimeoutDuration',
        );
      });

      it('analytics.getAppInstanceId()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => getAppInstanceId(analytics),
          () => analytics.getAppInstanceId(),
          'getAppInstanceId',
        );
      });

      it('analytics.getSessionId()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => getSessionId(analytics),
          () => analytics.getSessionId(),
          'getSessionId',
        );
      });

      it('analytics.setUserId()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => setUserId(analytics, 'id'),
          () => analytics.setUserId('id'),
          'setUserId',
        );
      });

      it('analytics.setUserProperty()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => setUserProperty(analytics, 'prop', 'value'),
          () => analytics.setUserProperty('prop', 'value'),
          'setUserProperty',
        );
      });

      it('analytics.setUserProperties()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => setUserProperties(analytics, { prop: 'value' }),
          () => analytics.setUserProperties({ prop: 'value' }),
          'setUserProperties',
        );
      });

      it('analytics.resetAnalyticsData()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => resetAnalyticsData(analytics),
          () => analytics.resetAnalyticsData(),
          'resetAnalyticsData',
        );
      });

      it('analytics.setConsent()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          () => setConsent(analytics, { ad_storage: true }),
          () => analytics.setConsent({ ad_storage: true }),
          'setConsent',
        );
      });

      it('analytics.logAddPaymentInfo()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => analytics.logAddPaymentInfo({ value: 1, currency: 'usd' }),
          'logAddPaymentInfo',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => logAddPaymentInfo(analytics, { value: 1, currency: 'usd' }),
          'logAddPaymentInfo',
        );
      });

      it('analytics.logScreenView()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logScreenView({
              screen_class: 'ProductScreen',
              screen_name: 'ProductScreen',
            }),
          'logScreenView',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logScreenView(analytics, {
              screen_class: 'ProductScreen',
              screen_name: 'ProductScreen',
            }),
          'logScreenView',
        );
      });

      it('analytics.logAddShippingInfo()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logAddShippingInfo({
              value: 100,
              currency: 'usd',
            }),
          'logAddShippingInfo',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logAddShippingInfo(analytics, {
              value: 100,
              currency: 'usd',
            }),
          'logAddShippingInfo',
        );
      });

      it('analytics.logAddToCart()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logAddToCart({
              value: 100,
              currency: 'usd',
            }),
          'logAddToCart',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logAddToCart(analytics, {
              value: 100,
              currency: 'usd',
            }),
          'logAddToCart',
        );
      });

      it('analytics.logAddToWishlist()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logAddToWishlist({
              value: 100,
              currency: 'usd',
            }),
          'logAddToWishlist',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logAddToWishlist(analytics, {
              value: 100,
              currency: 'usd',
            }),
          'logAddToWishlist',
        );
      });

      it('analytics.logAppOpen()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => analytics.logAppOpen(),
          'logAppOpen',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => logAppOpen(analytics),
          'logAppOpen',
        );
      });

      it('analytics.logBeginCheckout()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logBeginCheckout({
              value: 100,
              currency: 'usd',
            }),
          'logBeginCheckout',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logBeginCheckout(analytics, {
              value: 100,
              currency: 'usd',
            }),
          'logBeginCheckout',
        );
      });

      it('analytics.logCampaignDetails()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logCampaignDetails({
              source: 'email',
              medium: 'cta_button',
              campaign: 'newsletter',
            }),
          'logCampaignDetails',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logCampaignDetails(analytics, {
              source: 'email',
              medium: 'cta_button',
              campaign: 'newsletter',
            }),
          'logCampaignDetails',
        );
      });

      it('analytics.logEarnVirtualCurrency()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logEarnVirtualCurrency({
              virtual_currency_name: 'coins',
              value: 100,
            }),
          'logEarnVirtualCurrency',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logEarnVirtualCurrency(analytics, {
              virtual_currency_name: 'coins',
              value: 100,
            }),
          'logEarnVirtualCurrency',
        );
      });

      it('analytics.logGenerateLead()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logGenerateLead({
              currency: 'USD',
              value: 123,
            }),
          'logGenerateLead',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logGenerateLead(analytics, {
              currency: 'USD',
              value: 123,
            }),
          'logGenerateLead',
        );
      });

      it('analytics.logJoinGroup()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logJoinGroup({
              group_id: '12345',
            }),
          'logJoinGroup',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logJoinGroup(analytics, {
              group_id: '12345',
            }),
          'logJoinGroup',
        );
      });

      it('analytics.logLevelEnd()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logLevelEnd({
              level: 12,
              success: 'true',
            }),
          'logLevelEnd',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logLevelEnd(analytics, {
              level: 12,
              success: 'true',
            }),
          'logLevelEnd',
        );
      });

      it('analytics.logLevelStart()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logLevelStart({
              level: 12,
            }),
          'logLevelStart',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logLevelStart(analytics, {
              level: 12,
            }),
          'logLevelStart',
        );
      });

      it('analytics.logLevelUp()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logLevelUp({
              level: 12,
            }),
          'logLevelUp',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logLevelUp(analytics, {
              level: 12,
            }),
          'logLevelUp',
        );
      });

      it('analytics.logLogin()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logLogin({
              method: 'facebook.com',
            }),
          'logLogin',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logLogin(analytics, {
              method: 'facebook.com',
            }),
          'logLogin',
        );
      });

      it('analytics.logPostScore()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logPostScore({
              score: 567334,
              level: 3,
            }),
          'logPostScore',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logPostScore(analytics, {
              score: 567334,
              level: 3,
            }),
          'logPostScore',
        );
      });

      it('analytics.logSelectContent()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logSelectContent({
              content_type: 'clothing',
              item_id: 'abcd',
            }),
          'logSelectContent',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logSelectContent(analytics, {
              content_type: 'clothing',
              item_id: 'abcd',
            }),
          'logSelectContent',
        );
      });

      it('analytics.logPurchase()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logPurchase({
              value: 100,
              currency: 'usd',
            }),
          'logPurchase',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logPurchase(analytics, {
              value: 100,
              currency: 'usd',
            }),
          'logPurchase',
        );
      });

      it('analytics.logRefund()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logRefund({
              value: 100,
              currency: 'usd',
            }),
          'logRefund',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logRefund(analytics, {
              value: 100,
              currency: 'usd',
            }),
          'logRefund',
        );
      });

      it('analytics.logRemoveFromCart()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logRemoveFromCart({
              value: 100,
              currency: 'usd',
            }),
          'logRemoveFromCart',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logRemoveFromCart(analytics, {
              value: 100,
              currency: 'usd',
            }),
          'logRemoveFromCart',
        );
      });

      it('analytics.logSearch()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logSearch({
              search_term: 't-shirts',
            }),
          'logSearch',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logSearch(analytics, {
              search_term: 't-shirts',
            }),
          'logSearch',
        );
      });

      it('analytics.logSelectItem()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logSelectItem({
              item_list_id: '54690834',
              item_list_name: 't-shirts',
              content_type: 'clothing',
            }),
          'logSelectItem',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logSelectItem(analytics, {
              item_list_id: '54690834',
              item_list_name: 't-shirts',
              content_type: 'clothing',
            }),
          'logSelectItem',
        );
      });

      it('analytics.logSetCheckoutOption()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logSetCheckoutOption({
              checkout_step: 2,
              checkout_option: 'false',
            }),
          'logSetCheckoutOption',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logSetCheckoutOption(analytics, {
              checkout_step: 2,
              checkout_option: 'false',
            }),
          'logSetCheckoutOption',
        );
      });

      it('analytics.logSelectPromotion()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logSelectPromotion({
              creative_name: 'the promotion',
              creative_slot: 'evening',
              location_id: 'london',
              promotion_id: '230593',
              promotion_name: 'summer sale',
            }),
          'logSelectPromotion',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logSelectPromotion(analytics, {
              creative_name: 'the promotion',
              creative_slot: 'evening',
              location_id: 'london',
              promotion_id: '230593',
              promotion_name: 'summer sale',
            }),
          'logSelectPromotion',
        );
      });

      it('analytics.logShare()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logShare({
              content_type: 't-shirts',
              item_id: '12345',
              method: 'twitter.com',
            }),
          'logShare',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logShare(analytics, {
              content_type: 't-shirts',
              item_id: '12345',
              method: 'twitter.com',
            }),
          'logShare',
        );
      });

      it('analytics.logSignUp()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logSignUp({
              method: 'facebook.com',
            }),
          'logSignUp',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logSignUp(analytics, {
              method: 'facebook.com',
            }),
          'logSignUp',
        );
      });

      it('analytics.logSpendVirtualCurrency()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            analytics.logSpendVirtualCurrency({
              item_name: 'battle_pass',
              virtual_currency_name: 'coins',
              value: 100,
            }),
          'logSpendVirtualCurrency',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () =>
            logSpendVirtualCurrency(analytics, {
              item_name: 'battle_pass',
              virtual_currency_name: 'coins',
              value: 100,
            }),
          'logSpendVirtualCurrency',
        );
      });

      it('analytics.logTutorialBegin()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => analytics.logTutorialBegin(),
          'logTutorialBegin',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => logTutorialBegin(analytics),
          'logTutorialBegin',
        );
      });

      it('analytics.logTutorialComplete()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => analytics.logTutorialComplete(),
          'logTutorialComplete',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => logTutorialComplete(analytics),
          'logTutorialComplete',
        );
      });

      it('analytics.logUnlockAchievement()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => analytics.logUnlockAchievement({ achievement_id: '12345' }),
          'logUnlockAchievement',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => logUnlockAchievement(analytics, { achievement_id: '12345' }),
          'logUnlockAchievement',
        );
      });

      it('analytics.logViewCart()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => analytics.logViewCart({ value: 100, currency: 'usd' }),
          'logViewCart',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => logViewCart(analytics, { value: 100, currency: 'usd' }),
          'logViewCart',
        );
      });

      it('analytics.logViewItem()', function () {
        const analytics = getAnalytics();
        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => analytics.logViewItem({ value: 100, currency: 'usd' }),
          'logViewItem',
        );

        analyticsRefV9Deprecation(
          // This is deprecated for both namespaced and modular.
          () => {},
          () => logViewItem(analytics, { value: 100, currency: 'usd' }),
          'logViewItem',
        );
      });
    });

    it('analytics.logViewPromotion()', function () {
      const analytics = getAnalytics();
      analyticsRefV9Deprecation(
        // This is deprecated for both namespaced and modular.
        () => {},
        () =>
          analytics.logViewPromotion({
            creative_name: 'the promotion',
            creative_slot: 'evening',
            location_id: 'london',
            promotion_id: '230593',
          }),
        'logViewPromotion',
      );

      analyticsRefV9Deprecation(
        // This is deprecated for both namespaced and modular.
        () => {},
        () =>
          logViewPromotion(analytics, {
            creative_name: 'the promotion',
            creative_slot: 'evening',
            location_id: 'london',
            promotion_id: '230593',
          }),
        'logViewPromotion',
      );
    });

    it('analytics.logViewSearchResults()', function () {
      const analytics = getAnalytics();
      analyticsRefV9Deprecation(
        // This is deprecated for both namespaced and modular.
        () => {},
        () =>
          analytics.logViewSearchResults({
            search_term: 'clothing',
          }),
        'logViewSearchResults',
      );

      analyticsRefV9Deprecation(
        // This is deprecated for both namespaced and modular.
        () => {},
        () =>
          logViewSearchResults(analytics, {
            search_term: 'clothing',
          }),
        'logViewSearchResults',
      );
    });

    it('analytics.setDefaultEventParameters()', function () {
      const analytics = getAnalytics();
      analyticsRefV9Deprecation(
        () =>
          setDefaultEventParameters(analytics, {
            search_term: 'clothing',
          }),
        () =>
          analytics.setDefaultEventParameters({
            search_term: 'clothing',
          }),
        'setDefaultEventParameters',
      );
    });

    it('analytics.initiateOnDeviceConversionMeasurementWithEmailAddress()', function () {
      const analytics = getAnalytics();
      analyticsRefV9Deprecation(
        () => initiateOnDeviceConversionMeasurementWithEmailAddress(analytics, 'some@email.com'),
        () => analytics.initiateOnDeviceConversionMeasurementWithEmailAddress('some@email.com'),
        'initiateOnDeviceConversionMeasurementWithEmailAddress',
      );
    });

    it('analytics.initiateOnDeviceConversionMeasurementWithHashedEmailAddress()', function () {
      const analytics = getAnalytics();
      analyticsRefV9Deprecation(
        () =>
          initiateOnDeviceConversionMeasurementWithHashedEmailAddress(analytics, 'some@email.com'),
        () =>
          analytics.initiateOnDeviceConversionMeasurementWithHashedEmailAddress('some@email.com'),
        'initiateOnDeviceConversionMeasurementWithHashedEmailAddress',
      );
    });

    it('analytics.initiateOnDeviceConversionMeasurementWithPhoneNumber()', function () {
      const analytics = getAnalytics();
      analyticsRefV9Deprecation(
        () => initiateOnDeviceConversionMeasurementWithPhoneNumber(analytics, '+1555321'),
        () => analytics.initiateOnDeviceConversionMeasurementWithPhoneNumber('+1555321'),
        'initiateOnDeviceConversionMeasurementWithPhoneNumber',
      );
    });

    it('analytics.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber()', function () {
      const analytics = getAnalytics();
      analyticsRefV9Deprecation(
        () =>
          initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
            analytics,
            'b1b1b3b0b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1',
          ),
        () =>
          analytics.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
            'b1b1b3b0b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1',
          ),
        'initiateOnDeviceConversionMeasurementWithHashedPhoneNumber',
      );
    });
  });
});
