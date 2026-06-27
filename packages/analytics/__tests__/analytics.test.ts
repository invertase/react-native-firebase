import { describe, expect, it } from '@jest/globals';

import {
  getAnalytics,
  initializeAnalytics,
  getGoogleAnalyticsClientId,
  logEvent,
  logTransaction,
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

describe('Analytics', function () {
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

    it('`logTransaction` function is properly exposed to end user', function () {
      expect(logTransaction).toBeDefined();
    });
  });
});
