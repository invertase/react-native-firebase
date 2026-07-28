/**
 * Known differences between the firebase-js-sdk public API and
 * the @react-native-firebase/analytics modular API.
 *
 * Each entry must have a `name` and a `reason`. Undocumented drift fails CI.
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},

  missingInRN: [
    { name: 'setCurrentScreen', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/analytics.' },
    { name: 'ControlParams', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/analytics.' },
    { name: 'CustomParams', reason: 'Export from the firebase-js-sdk modular API that is intentionally absent from @react-native-firebase/analytics.' },
  ],

  extraInRN: [
    { name: 'logTransaction', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'setSessionTimeoutDuration', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for analytics.' },
    { name: 'getAppInstanceId', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for analytics.' },
    { name: 'getSessionId', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for analytics.' },
    { name: 'setUserProperty', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for analytics.' },
    { name: 'resetAnalyticsData', reason: 'RN Firebase-specific export with no equivalent on the firebase-js-sdk modular public API for analytics.' },
    { name: 'logAddPaymentInfo', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logScreenView', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logAddShippingInfo', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logAddToCart', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logAddToWishlist', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logAppOpen', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logBeginCheckout', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logCampaignDetails', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logEarnVirtualCurrency', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logGenerateLead', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logJoinGroup', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logLevelEnd', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logLevelStart', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logLevelUp', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logLogin', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logPostScore', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logSelectContent', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logPurchase', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logRefund', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logRemoveFromCart', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logSearch', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logSelectItem', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logSetCheckoutOption', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logSelectPromotion', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logShare', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logSignUp', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logSpendVirtualCurrency', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logTutorialBegin', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logTutorialComplete', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logUnlockAchievement', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logViewCart', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logViewItem', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logViewItemList', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logViewPromotion', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'logViewSearchResults', reason: 'RN Firebase convenience method for a predefined Analytics event. The firebase-js-sdk modular API uses the generic `logEvent()` overloads instead.' },
    { name: 'initiateOnDeviceConversionMeasurementWithEmailAddress', reason: 'iOS-only on-device conversion measurement helper exposed by RN Firebase Analytics. No equivalent modular export exists in the firebase-js-sdk.' },
    { name: 'initiateOnDeviceConversionMeasurementWithHashedEmailAddress', reason: 'iOS-only on-device conversion measurement helper exposed by RN Firebase Analytics. No equivalent modular export exists in the firebase-js-sdk.' },
    { name: 'initiateOnDeviceConversionMeasurementWithPhoneNumber', reason: 'iOS-only on-device conversion measurement helper exposed by RN Firebase Analytics. No equivalent modular export exists in the firebase-js-sdk.' },
    { name: 'initiateOnDeviceConversionMeasurementWithHashedPhoneNumber', reason: 'iOS-only on-device conversion measurement helper exposed by RN Firebase Analytics. No equivalent modular export exists in the firebase-js-sdk.' },
    { name: 'AddPaymentInfoEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'AddShippingInfoParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'AddToCartEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'AddToWishlistEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'BeginCheckoutEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'CampaignDetailsEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'EarnVirtualCurrencyEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'GenerateLeadEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'JoinGroupEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'LevelEndEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'LevelStartEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'LevelUpEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'LoginEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'PostScoreEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SelectContentEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'PurchaseEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'RefundEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'RemoveFromCartEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SearchEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SelectItemEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SetCheckoutOptionEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SelectPromotionEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'ShareEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SignUpEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SpendVirtualCurrencyEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'UnlockAchievementEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'ViewCartEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'ViewItemEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'ViewItemListEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'ViewPromotionEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'ViewSearchResultsParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'ScreenViewParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'SDK_VERSION', reason: 'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/analytics.' },
    { name: 'AddShippingInfoEventParameters', reason: 'RN Firebase re-exports this Analytics event parameter interface for convenience methods and typed `logEvent` overloads.' },
    { name: 'Statics', reason: 'RN Firebase statics namespace type used by the legacy namespaced API surface. Not part of the firebase-js-sdk modular public API.' },
  ],

  differentShape: [
    {
      name: 'logEvent',
      reason:
        'Return type aligned to firebase-js-sdk sync `void` (Phase B). Remaining drift is ' +
        'cosmetic: firebase-js-sdk overloads include `[key: string]: any` index signatures and ' +
        'slightly different property ordering on typed event params; behaviour is equivalent.',
    },
    {
      name: 'setAnalyticsCollectionEnabled',
      reason:
        'RN Firebase returns `Promise<void>` whereas the firebase-js-sdk web modular API is synchronous. ' +
        'Phase S hint: **Promise that could maybe sync-void+queue** (see PS-S2-gap).',
    },
    {
      name: 'setConsent',
      reason:
        'RN Firebase returns `Promise<void>` whereas the firebase-js-sdk web modular API is synchronous. ' +
        'Phase S hint: **Promise that could maybe sync-void+queue** (see PS-S2-gap).',
    },
    {
      name: 'setDefaultEventParameters',
      reason:
        'RN Firebase returns `Promise<void>` whereas the firebase-js-sdk web modular API is synchronous. ' +
        'Phase S hint: **Promise that could maybe sync-void+queue** (see PS-S2-gap).',
    },
    {
      name: 'setUserId',
      reason:
        'RN Firebase returns `Promise<void>` whereas the firebase-js-sdk web modular API is synchronous. ' +
        'Phase S hint: **Promise that could maybe sync-void+queue** (see PS-S2-gap).',
    },
    {
      name: 'setUserProperties',
      reason:
        'RN Firebase returns `Promise<void>` whereas the firebase-js-sdk web modular API is synchronous. ' +
        'Phase S hint: **Promise that could maybe sync-void+queue** (see PS-S2-gap).',
    },
    { name: 'Analytics', reason: 'RN Firebase extends the Analytics service interface with native bridge methods (collection toggles, predefined event helpers, and iOS on-device conversion measurement) that are not on the firebase-js-sdk web service type.' },
    { name: 'ConsentSettings', reason: 'RN Firebase maps most consent flags to native boolean toggles, while the firebase-js-sdk uses `ConsentStatusString` for web gtag consent modes.' },
    { name: 'Currency', reason: 'RN Firebase narrows Analytics currency values to `number` for native event payloads, while the firebase-js-sdk also allows string currency codes for web gtag events.' },
    { name: 'GtagConfigParams', reason: 'RN Firebase uses camelCase property names aligned with native Analytics settings instead of the quoted gtag config keys used by the web SDK.' },
    { name: 'Item', reason: 'RN Firebase event item/promotion shapes follow native Analytics parameter names and omit legacy web-only alias fields present in the firebase-js-sdk types.' },
    { name: 'Promotion', reason: 'RN Firebase event item/promotion shapes follow native Analytics parameter names and omit legacy web-only alias fields present in the firebase-js-sdk types.' },
  ],
};

export default config;
