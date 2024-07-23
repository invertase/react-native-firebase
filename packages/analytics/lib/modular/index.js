import { firebase } from '..';

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
    return firebase.app(app.name).analytics();
  }
  return firebase.app().analytics();
}

/**
 * Returns an Analytics instance for the given app.
 * @param {FirebaseApp} app - FirebaseApp.
 * @param {object} [options] - AnalyticsSettings. Web only.
 * @returns {FirebaseAnalytics}
 */
// eslint-disable-next-line
export function initializeAnalytics(app, options) {
  return firebase.app(app.name).analytics();
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
  return analytics.logEvent(name, params, options);
}

/**
 * If true, allows the device to collect analytical data and send it to Firebase. Useful for GDPR.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {boolean} enabled - A boolean value representing whether Analytics collection is enabled or disabled.
 * @returns {Promise<void>}
 */
export function setAnalyticsCollectionEnabled(analytics, enabled) {
  return analytics.setAnalyticsCollectionEnabled(enabled);
}

/**
 * Sets the duration of inactivity that terminates the current session.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {number} [milliseconds=1800000] - The default value is 1800000 (30 minutes).
 * @returns {Promise<void>}
 */
export function setSessionTimeoutDuration(analytics, milliseconds = 1800000) {
  return analytics.setSessionTimeoutDuration(milliseconds);
}

/**
 * Retrieve the app instance id of the application.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<string|null>} Returns the app instance id or null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 */
export function getAppInstanceId(analytics) {
  return analytics.getAppInstanceId();
}

/**
 * Retrieves the session id from the client.
 * On iOS, Firebase SDK may return an error that is handled internally and may take many minutes to return a valid value. Check native debug logs for more details.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<string|null>} Returns the session id or null if session is expired, null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 */
export function getSessionId(analytics) {
  return analytics.getSessionId();
}

/**
 * Gives a user a unique identification.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string|null} id - Set to null to remove a previously assigned ID from analytics events.
 * @returns {Promise<void>}
 */
export function setUserId(analytics, id) {
  return analytics.setUserId(id);
}

/**
 * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} name - A user property identifier.
 * @param {string|null} value - Set to null to remove a previously assigned ID from analytics events.
 * @returns {Promise<void>}
 */
export function setUserProperty(analytics, name, value) {
  return analytics.setUserProperty(name, value);
}

/**
 * Sets multiple key/value pairs of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {object} properties - Set a property value to null to remove it.
 * @param {AnalyticsCallOptions} [options={}] - Additional options that can be passed. Web only.
 * @returns {Promise<void>}
 */
export function setUserProperties(analytics, properties, options = {}) {
  return analytics.setUserProperties(properties, options);
}

/**
 * Clears all analytics data for this instance from the device and resets the app instance ID.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function resetAnalyticsData(analytics) {
  return analytics.resetAnalyticsData();
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported automatically for Google Play-based apps.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddPaymentInfoEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddPaymentInfo(analytics, params) {
  return analytics.logAddPaymentInfo(params);
}

/**
 * Sets or clears the screen name and class the user is currently viewing.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ScreenViewParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logScreenView(analytics, params) {
  return analytics.logScreenView(params);
}

/**
 * Add Payment Info event. This event signifies that a user has submitted their payment information to your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddShippingInfoParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddShippingInfo(analytics, params) {
  return analytics.logAddShippingInfo(params);
}

/**
 * E-Commerce Add To Cart event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddToCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddToCart(analytics, params) {
  return analytics.logAddToCart(params);
}

/**
 * E-Commerce Add To Wishlist event. This event signifies that an item was added to a wishlist.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {AddToWishlistEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logAddToWishlist(analytics, params) {
  return analytics.logAddToWishlist(params);
}

/**
 * App Open event. By logging this event when an App is moved to the foreground, developers can understand how often users leave and return during the course of a Session.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logAppOpen(analytics) {
  return analytics.logAppOpen();
}

/**
 * E-Commerce Begin Checkout event. This event signifies that a user has begun the process of checking out.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {BeginCheckoutEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logBeginCheckout(analytics, params) {
  return analytics.logBeginCheckout(params);
}

/**
 * Log this event to supply the referral details of a re-engagement campaign.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {CampaignDetailsEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logCampaignDetails(analytics, params) {
  return analytics.logCampaignDetails(params);
}

/**
 * Earn Virtual Currency event. This event tracks the awarding of virtual currency in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {EarnVirtualCurrencyEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logEarnVirtualCurrency(analytics, params) {
  return analytics.logEarnVirtualCurrency(params);
}

/**
 * Generate Lead event. Log this event when a lead has been generated in the app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {GenerateLeadEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logGenerateLead(analytics, params) {
  return analytics.logGenerateLead(params);
}

/**
 * Join Group event. Log this event when a user joins a group such as a guild, team or family.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {JoinGroupEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logJoinGroup(analytics, params) {
  return analytics.logJoinGroup(params);
}

/**
 * Level End event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LevelEndEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLevelEnd(analytics, params) {
  return analytics.logLevelEnd(params);
}

/**
 * Level Start event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LevelStartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLevelStart(analytics, params) {
  return analytics.logLevelStart(params);
}

/**
 * Level Up event. This event signifies that a player has leveled up in your gaming app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LevelUpEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLevelUp(analytics, params) {
  return analytics.logLevelUp(params);
}

/**
 * Login event. Apps with a login feature can report this event to signify that a user has logged in.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {LoginEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logLogin(analytics, params) {
  return analytics.logLogin(params);
}

/**
 * Post Score event. Log this event when the user posts a score in your gaming app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {PostScoreEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logPostScore(analytics, params) {
  return analytics.logPostScore(params);
}

/**
 * Select Content event. This general purpose event signifies that a user has selected some content of a certain type in an app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectContentEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectContent(analytics, params) {
  return analytics.logSelectContent(params);
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {PurchaseEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logPurchase(analytics, params) {
  return analytics.logPurchase(params);
}

/**
 * E-Commerce Refund event. This event signifies that a refund was issued.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RefundEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRefund(analytics, params) {
  return analytics.logRefund(params);
}

/**
 * Remove from cart event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RemoveFromCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRemoveFromCart(analytics, params) {
  return analytics.logRemoveFromCart(params);
}

/**
 * Search event. Apps that support search features can use this event to contextualize search operations by supplying the appropriate, corresponding parameters.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SearchEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSearch(analytics, params) {
  return analytics.logSearch(params);
}

/**
 * Select Item event. This event signifies that an item was selected by a user from a list.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectItem(analytics, params) {
  return analytics.logSelectItem(params);
}

/**
 * Set checkout option event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SetCheckoutOptionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSetCheckoutOption(analytics, params) {
  return analytics.logSetCheckoutOption(params);
}

/**
 * Select promotion event. This event signifies that a user has selected a promotion offer.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectPromotion(analytics, params) {
  return analytics.logSelectPromotion(params);
}

/**
 * Share event. Apps with social features can log the Share event to identify the most viral content.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ShareEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logShare(analytics, params) {
  return analytics.logShare(params);
}

/**
 * Sign Up event. This event indicates that a user has signed up for an account in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SignUpEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSignUp(analytics, params) {
  return analytics.logSignUp(params);
}

/**
 * Spend Virtual Currency event. This event tracks the sale of virtual goods in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SpendVirtualCurrencyEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSpendVirtualCurrency(analytics, params) {
  return analytics.logSpendVirtualCurrency(params);
}

/**
 * Tutorial Begin event. This event signifies the start of the on-boarding process in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialBegin(analytics) {
  return analytics.logTutorialBegin();
}

/**
 * Tutorial End event. Use this event to signify the user's completion of your app's on-boarding process.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialComplete(analytics) {
  return analytics.logTutorialComplete();
}

/**
 * Unlock Achievement event. Log this event when the user has unlocked an achievement in your game.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {UnlockAchievementEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logUnlockAchievement(analytics, params) {
  return analytics.logUnlockAchievement(params);
}

/**
 * E-commerce View Cart event. This event signifies that a user has viewed their cart.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewCart(analytics, params) {
  return analytics.logViewCart(params);
}

/**
 * View Item event. This event signifies that some content was shown to the user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItem(analytics, params) {
  return analytics.logViewItem(params);
}

/**
 * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemListEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItemList(analytics, params) {
  return analytics.logViewItemList(params);
}

/**
 * View Promotion event. This event signifies that a promotion was shown to a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewPromotion(analytics, params) {
  return analytics.logViewPromotion(params);
}

/**
 * View Search Results event. Log this event when the user has been presented with the results of a search.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewSearchResultsParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewSearchResults(analytics, params) {
  return analytics.logViewSearchResults(params);
}

/**
 * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {object} [params={}] - Parameters to be added to the map of parameters added to every event.
 * @returns {Promise<void>}
 */
export function setDefaultEventParameters(analytics, params = {}) {
  return analytics.setDefaultEventParameters(params);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} emailAddress - Email address, properly formatted complete with domain name e.g, 'user@example.com'.
 * @returns {Promise<void>}
 */
export function initiateOnDeviceConversionMeasurementWithEmailAddress(analytics, emailAddress) {
  return analytics.initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} phoneNumber - Phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
 * @returns {Promise<void>}
 */
export function initiateOnDeviceConversionMeasurementWithPhoneNumber(analytics, phoneNumber) {
  return analytics.initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber);
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
  return analytics.setConsent(consentSettings);
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
