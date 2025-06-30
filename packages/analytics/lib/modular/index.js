import { MODULAR_DEPRECATION_ARG } from '../../../app/lib/common';
import { getApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';

/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import("..").FirebaseAnalyticsTypes.Module} FirebaseAnalytics
 * @typedef {import("..").FirebaseAnalyticsTypes.AnalyticsCallOptions} AnalyticsCallOptions
 * @typedef {import("..").FirebaseAnalyticsTypes.EventParams} EventParams
 * @typedef {import("..").FirebaseAnalyticsTypes.AddPaymentInfoEventParameters} AddPaymentInfoEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ScreenViewParameters} ScreenViewParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.AddShippingInfoParameters} AddShippingInfoParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.AddToCartEventParameters} AddToCartEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.AddToWishlistEventParameters} AddToWishlistEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.BeginCheckoutEventParameters} BeginCheckoutEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.CampaignDetailsEventParameters} CampaignDetailsEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.EarnVirtualCurrencyEventParameters} EarnVirtualCurrencyEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.GenerateLeadEventParameters} GenerateLeadEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.JoinGroupEventParameters} JoinGroupEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.LevelEndEventParameters} LevelEndEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.LevelStartEventParameters} LevelStartEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.LevelUpEventParameters} LevelUpEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.LoginEventParameters} LoginEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.PostScoreEventParameters} PostScoreEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.SelectContentEventParameters} SelectContentEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.PurchaseEventParameters} PurchaseEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.RefundEventParameters} RefundEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.RemoveFromCartEventParameters} RemoveFromCartEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.SearchEventParameters} SearchEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.SelectItemEventParameters} SelectItemEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.SetCheckoutOptionEventParameters} SetCheckoutOptionEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.SelectPromotionEventParameters} SelectPromotionEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ShareEventParameters} ShareEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.SignUpEventParameters} SignUpEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.SpendVirtualCurrencyEventParameters} SpendVirtualCurrencyEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.UnlockAchievementEventParameters} UnlockAchievementEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ViewCartEventParameters} ViewCartEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ViewItemEventParameters} ViewItemEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ViewItemListEventParameters} ViewItemListEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ViewPromotionEventParameters} ViewPromotionEventParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ViewSearchResultsParameters} ViewSearchResultsParameters
 * @typedef {import("..").FirebaseAnalyticsTypes.ConsentSettings} ConsentSettings
 * @typedef {import("..").FirebaseAnalyticsTypes.SettingsOptions} SettingsOptions
 */

/**
 * Returns an Analytics instance for the given app.
 * @param {FirebaseApp} [app] - FirebaseApp. Optional.
 * @returns {FirebaseAnalytics}
 */
export function getAnalytics(app) {
  if (app) {
    return getApp(app.name).analytics();
  }
  return getApp().analytics();
}

/**
 * Returns an Analytics instance for the given app.
 * @param {FirebaseApp} app - FirebaseApp.
 * @param {object} [options] - AnalyticsSettings. Web only.
 * @returns {FirebaseAnalytics}
 */
// eslint-disable-next-line
export function initializeAnalytics(app, options) {
  return getApp(app.name).analytics();
}

/**
 * Retrieves a unique Google Analytics identifier for the web client.
 *
 * @param {FirebaseAnalytics} analytics - Instance of analytics (web - only)
 * @returns {Promise<string>}
 */
export async function getGoogleAnalyticsClientId(analytics) {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    throw new Error('getGoogleAnalyticsClientId is web-only.');
  } else {
    return getAppInstanceId(analytics);
  }
}

/**
 * Log a custom event with optional params.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} name - Event name must not conflict with any Reserved Events.
 * @param {object} [params={}] - Parameters to be sent and displayed with the event.
 * @param {AnalyticsCallOptions} [options={}] - Additional options that can be passed. Web only.
 * @returns {Promise<void>}
 */
export function logEvent(analytics, name, params = {}, options = {}) {
  return analytics.logEvent.call(analytics, name, params, options, MODULAR_DEPRECATION_ARG);
}

/**
 * If true, allows the device to collect analytical data and send it to Firebase. Useful for GDPR.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {boolean} enabled - A boolean value representing whether Analytics collection is enabled or disabled.
 * @returns {Promise<void>}
 */
export function setAnalyticsCollectionEnabled(analytics, enabled) {
  return analytics.setAnalyticsCollectionEnabled.call(analytics, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the duration of inactivity that terminates the current session.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {number} [milliseconds=1800000] - The default value is 1800000 (30 minutes).
 * @returns {Promise<void>}
 */
export function setSessionTimeoutDuration(analytics, milliseconds = 1800000) {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.setSessionTimeoutDuration.call(analytics, milliseconds, MODULAR_DEPRECATION_ARG);
}

/**
 * Retrieve the app instance id of the application.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<string|null>} Returns the app instance id or null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 */
export function getAppInstanceId(analytics) {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.getAppInstanceId.call(analytics, MODULAR_DEPRECATION_ARG);
}

/**
 * Retrieves the session id from the client.
 * On iOS, Firebase SDK may return an error that is handled internally and may take many minutes to return a valid value. Check native debug logs for more details.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<string|null>} Returns the session id or null if session is expired, null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 */
export function getSessionId(analytics) {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.getSessionId.call(analytics, MODULAR_DEPRECATION_ARG);
}

/**
 * Gives a user a unique identification.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string|null} id - Set to null to remove a previously assigned ID from analytics events.
 * @returns {Promise<void>}
 */
export function setUserId(analytics, id) {
  return analytics.setUserId.call(analytics, id, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} name - A user property identifier.
 * @param {string|null} value - Set to null to remove a previously assigned ID from analytics events.
 * @returns {Promise<void>}
 */
export function setUserProperty(analytics, name, value) {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.setUserProperty.call(analytics, name, value, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets multiple key/value pairs of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {object} properties - Set a property value to null to remove it.
 * @param {AnalyticsCallOptions} [options={}] - Additional options that can be passed. Web only.
 * @returns {Promise<void>}
 */
export function setUserProperties(analytics, properties, options = {}) {
  return analytics.setUserProperties.call(analytics, properties, options, MODULAR_DEPRECATION_ARG);
}

/**
 * Clears all analytics data for this instance from the device and resets the app instance ID.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function resetAnalyticsData(analytics) {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.resetAnalyticsData.call(analytics, MODULAR_DEPRECATION_ARG);
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported automatically for Google Play-based apps.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddPaymentInfoEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddPaymentInfo(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddPaymentInfo(params);
}

/**
 * Sets or clears the screen name and class the user is currently viewing.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ScreenViewParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logScreenView(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logScreenView(params);
}

/**
 * Add Payment Info event. This event signifies that a user has submitted their payment information to your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddShippingInfoParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddShippingInfo(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddShippingInfo(params);
}

/**
 * E-Commerce Add To Cart event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddToCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddToCart(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddToCart(params);
}

/**
 * E-Commerce Add To Wishlist event. This event signifies that an item was added to a wishlist.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddToWishlistEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddToWishlist(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddToWishlist(params);
}

/**
 * App Open event. By logging this event when an App is moved to the foreground, developers can understand how often users leave and return during the course of a Session.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logAppOpen(analytics) {
  // This is deprecated for both namespaced and modular.
  return analytics.logAppOpen();
}

/**
 * E-Commerce Begin Checkout event. This event signifies that a user has begun the process of checking out.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {BeginCheckoutEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logBeginCheckout(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logBeginCheckout(params);
}

/**
 * Log this event to supply the referral details of a re-engagement campaign.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {CampaignDetailsEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logCampaignDetails(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logCampaignDetails(params);
}

/**
 * Earn Virtual Currency event. This event tracks the awarding of virtual currency in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {EarnVirtualCurrencyEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logEarnVirtualCurrency(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logEarnVirtualCurrency(params);
}

/**
 * Generate Lead event. Log this event when a lead has been generated in the app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {GenerateLeadEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logGenerateLead(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logGenerateLead(params);
}

/**
 * Join Group event. Log this event when a user joins a group such as a guild, team or family.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {JoinGroupEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logJoinGroup(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logJoinGroup(params);
}

/**
 * Level End event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LevelEndEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLevelEnd(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelEnd(params);
}

/**
 * Level Start event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LevelStartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLevelStart(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelStart(params);
}

/**
 * Level Up event. This event signifies that a player has leveled up in your gaming app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LevelUpEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLevelUp(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelUp(params);
}

/**
 * Login event. Apps with a login feature can report this event to signify that a user has logged in.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LoginEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLogin(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logLogin(params);
}

/**
 * Post Score event. Log this event when the user posts a score in your gaming app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {PostScoreEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logPostScore(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logPostScore(params);
}

/**
 * Select Content event. This general purpose event signifies that a user has selected some content of a certain type in an app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectContentEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectContent(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectContent(params);
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {PurchaseEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logPurchase(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logPurchase(params);
}

/**
 * E-Commerce Refund event. This event signifies that a refund was issued.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RefundEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRefund(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logRefund(params);
}

/**
 * Remove from cart event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RemoveFromCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRemoveFromCart(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logRemoveFromCart(params);
}

/**
 * Search event. Apps that support search features can use this event to contextualize search operations by supplying the appropriate, corresponding parameters.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SearchEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSearch(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logSearch(params);
}

/**
 * Select Item event. This event signifies that an item was selected by a user from a list.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectItem(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectItem(params);
}

/**
 * Set checkout option event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SetCheckoutOptionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSetCheckoutOption(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logSetCheckoutOption(params);
}

/**
 * Select promotion event. This event signifies that a user has selected a promotion offer.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectPromotion(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectPromotion(params);
}

/**
 * Share event. Apps with social features can log the Share event to identify the most viral content.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ShareEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logShare(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logShare(params);
}

/**
 * Sign Up event. This event indicates that a user has signed up for an account in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SignUpEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSignUp(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logSignUp(params);
}

/**
 * Spend Virtual Currency event. This event tracks the sale of virtual goods in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SpendVirtualCurrencyEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSpendVirtualCurrency(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logSpendVirtualCurrency(params);
}

/**
 * Tutorial Begin event. This event signifies the start of the on-boarding process in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialBegin(analytics) {
  // This is deprecated for both namespaced and modular.
  return analytics.logTutorialBegin();
}

/**
 * Tutorial End event. Use this event to signify the user's completion of your app's on-boarding process.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialComplete(analytics) {
  // This is deprecated for both namespaced and modular.
  return analytics.logTutorialComplete();
}

/**
 * Unlock Achievement event. Log this event when the user has unlocked an achievement in your game.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {UnlockAchievementEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logUnlockAchievement(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logUnlockAchievement(params);
}

/**
 * E-commerce View Cart event. This event signifies that a user has viewed their cart.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewCart(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewCart(params);
}

/**
 * View Item event. This event signifies that some content was shown to the user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItem(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewItem(params);
}

/**
 * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemListEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItemList(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewItemList(params);
}

/**
 * View Promotion event. This event signifies that a promotion was shown to a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewPromotion(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewPromotion(params);
}

/**
 * View Search Results event. Log this event when the user has been presented with the results of a search.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewSearchResultsParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewSearchResults(analytics, params) {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewSearchResults(params);
}

/**
 * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {object} [params={}] - Parameters to be added to the map of parameters added to every event.
 * @returns {Promise<void>}
 */
export function setDefaultEventParameters(analytics, params = {}) {
  return analytics.setDefaultEventParameters.call(analytics, params, MODULAR_DEPRECATION_ARG);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} emailAddress - Email address, properly formatted complete with domain name e.g, 'user@example.com'.
 * @returns {Promise<void>}
 */
export function initiateOnDeviceConversionMeasurementWithEmailAddress(analytics, emailAddress) {
  return analytics.initiateOnDeviceConversionMeasurementWithEmailAddress.call(
    analytics,
    emailAddress,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile
 *
 * @param analytics Analytics instance.
 * @param hashedEmailAddress sha256-hashed of normalized email address, properly formatted complete with domain name e.g, 'user@example.com'
 * @link https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials
 */
export function initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
  analytics,
  hashedEmailAddress,
) {
  return analytics.initiateOnDeviceConversionMeasurementWithHashedEmailAddress.call(
    analytics,
    hashedEmailAddress,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} phoneNumber - Phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
 * @returns {Promise<void>}
 */
export function initiateOnDeviceConversionMeasurementWithPhoneNumber(analytics, phoneNumber) {
  return analytics.initiateOnDeviceConversionMeasurementWithPhoneNumber.call(
    analytics,
    phoneNumber,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile
 *
 * @param analytics Analytics instance.
 * @param hashedPhoneNumber sha256-hashed of normalized phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
 * @link https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials
 */
export function initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
  analytics,
  hashedPhoneNumber,
) {
  return analytics.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber.call(
    analytics,
    hashedPhoneNumber,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Checks four different things.
 * 1. Checks if it's not a browser extension environment.
 * 2. Checks if cookies are enabled in current browser.
 * 3. Checks if IndexedDB is supported by the browser environment.
 * 4. Checks if the current browser context is valid for using IndexedDB.open().
 * @returns {Promise<boolean>}
 */
export function isSupported() {
  return Promise.resolve(true);
}

/**
 * Sets the applicable end user consent state for this app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ConsentSettings} consentSettings - See ConsentSettings.
 * @returns {Promise<void>}
 */
export function setConsent(analytics, consentSettings) {
  return analytics.setConsent.call(analytics, consentSettings, MODULAR_DEPRECATION_ARG);
}

/**
 * Configures Firebase Analytics to use custom gtag or dataLayer names.
 * Intended to be used if gtag.js script has been installed on this page independently of Firebase Analytics, and is using non-default names for either the gtag function or for dataLayer. Must be called before calling `getAnalytics()` or it won't have any effect. Web only.
 * @param {SettingsOptions} options - See SettingsOptions.
 * @returns {void}
 */
// eslint-disable-next-line
export function settings(options) {
  // Returns nothing until Web implemented.
}
