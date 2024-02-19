import { firebase } from '..';

/**
 * @typedef {import("..").FirebaseApp} FirebaseApp
 * @typedef {import("..").FirebaseAnalyticsTypes.Module} FirebaseAnalytics
 */

/**
 * Returns a Analytics instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns {FirebaseAnalytics}
 */
export function getAnalytics(app) {
  if (app) {
    return firebase.app(app.name).analytics();
  }

  return firebase.app().analytics();
}

/**
 * Returns a Analytics instance for the given app.
 * @param app - FirebaseApp.
 * @param options - `AnalyticsSettings`. Web only.
 * @returns {FirebaseAnalytics}
 */
// eslint-disable-next-line
export function initializeAnalytics(app, options) {
  // options is specifically for web. Implement when it becomes available.
  return firebase.app(app.name).analytics();
}

/**
 * Log a custom event with optional params. Note that there are various limits that applied
 * to event parameters (total parameter count, etc), but analytics applies the limits during
 * cloud processing, the errors will not be seen as Promise rejections when you call logEvent.
 * While integrating this API in your app you are strongly encouraged to enable
 * [DebugView](https://firebase.google.com/docs/analytics/debugview) -
 * any errors in your events will show up in the firebase web console with links to relevant documentation
 *
 * @param analytics Analytics instance.
 * @param name Event name must not conflict with any Reserved Events.
 * @param params Parameters to be sent and displayed with the event.
 * @param options Additional options that can be passed. Web only.
 */
export function logEvent(analytics, name, eventParams = {}, options = {}) {
  return analytics.logEvent(name, eventParams, options);
}

/**
 * If true, allows the device to collect analytical data and send it to
 * Firebase. Useful for GDPR.
 *
 * @param analytics Analytics instance.
 * @param enabled A boolean value representing whether Analytics collection is enabled or disabled. Analytics collection is enabled by default.
 */
export function setAnalyticsCollectionEnabled(analytics, enabled) {
  return analytics.setAnalyticsCollectionEnabled(enabled);
}

/**
 * Sets the duration of inactivity that terminates the current session.
 *
 * @param analytics Analytics instance.
 * @param milliseconds The default value is 1800000 (30 minutes).
 */
export function setSessionTimeoutDuration(analytics, milliseconds = 1800000) {
  return analytics.setSessionTimeoutDuration(milliseconds);
}

/**
 * Retrieve the app instance id of the application.
 *
 * @param analytics Analytics instance.
 * @returns Returns the app instance id or null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 */
export function getAppInstanceId(analytics) {
  return analytics.getAppInstanceId();
}

/**
 * Retrieves the session id from the client.
 * On iOS, Firebase SDK may return an error that is handled internally and may take many minutes to return a valid value. Check native debug logs for more details.
 *
 * @param analytics Analytics instance.
 * @returns Returns the session id or null if session is expired, null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 */
export function getSessionId(analytics) {
  return analytics.getSessionId();
}
/**
 * Gives a user a unique identification.
 *
 * @param analytics Analytics instance.
 * @param id Set to null to remove a previously assigned ID from analytics
 * events
 */
export function setUserId(analytics, id) {
  return analytics.setUserId(id);
}

/**
 * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 *
 * @param analytics Analytics instance.
 * @param name A user property identifier.
 * @param value Set to null to remove a previously assigned ID from analytics events.
 */
export function setUserProperty(analytics, name, value) {
  return analytics.setUserProperty(name, value);
}

/**
 * Sets multiple key/value pairs of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 *
 * > When you set user properties, be sure to never include personally identifiable information such as names, social security numbers, or email addresses, even in hashed form.
 *
 * @param analytics Analytics instance.
 * @param properties Set a property value to null to remove it.
 * @param options `AnalyticsCallOptions`. Additional options that can be passed. Web only.
 */
export function setUserProperties(analytics, properties, options = {}) {
  return analytics.setUserProperties(properties, options);
}

/**
 * Clears all analytics data for this instance from the device and resets the app instance ID.
 *
 * @param analytics Analytics instance.
 */
export function resetAnalyticsData(analytics) {
  return analytics.resetAnalyticsData();
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported
 * automatically for Google Play-based apps.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `purchase`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.AddPaymentInfoEventParameters}.
 */
export function logAddPaymentInfo(analytics, object = {}) {
  return analytics.logAddPaymentInfo(object);
}

/**
 * Sets or clears the screen name and class the user is currently viewing
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ScreenViewParameters}.
 */
export function logScreenView(analytics, object = {}) {
  return analytics.logScreenView(object);
}

/**
 * Add Payment Info event. This event signifies that a user has submitted their payment information to your app.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `add_payment_info`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.AddShippingInfoParameters}.
 */
export function logAddShippingInfo(analytics, object = {}) {
  return analytics.logAddShippingInfo(object);
}

/**
 * E-Commerce Add To Cart event.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `add_to_cart`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.AddToCartEventParameters}.
 */
export function logAddToCart(analytics, object = {}) {
  return analytics.logAddToCart(object);
}

/**
 * E-Commerce Add To Wishlist event. This event signifies that an item was added to a wishlist.
 * Use this event to identify popular gift items in your app.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `add_to_wishlist
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.AddToWishlistEventParameters}.
 */
export function logAddToWishlist(analytics, object = {}) {
  return analytics.logAddToWishlist(object);
}

/**
 * App Open event. By logging this event when an App is moved to the foreground, developers can
 * understand how often users leave and return during the course of a Session. Although Sessions
 * are automatically reported, this event can provide further clarification around the continuous
 * engagement of app-users.
 *
 * @param analytics Analytics instance.
 */
export function logAppOpen(analytics) {
  return analytics.logAppOpen();
}

/**
 * E-Commerce Begin Checkout event. This event signifies that a user has begun the process of
 * checking out.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `begin_checkout`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.BeginCheckoutEventParameters}.
 */
export function logBeginCheckout(analytics, object = {}) {
  return analytics.logBeginCheckout(object);
}

/**
 * Log this event to supply the referral details of a re-engagement campaign.
 *
 * Logged event name: `campaign_details`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.CampaignDetailsEventParameters}.
 */
export function logCampaignDetails(analytics, object = {}) {
  return analytics.logCampaignDetails(object);
}

/**
 * Earn Virtual Currency event. This event tracks the awarding of virtual currency in your app. Log this along with
 * {@link analytics.logSpendVirtualCurrency} to better understand your virtual economy.
 *
 * Logged event name: `earn_virtual_currency`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.EarnVirtualCurrencyEventParameters}.
 */
export function logEarnVirtualCurrency(analytics, object = {}) {
  return analytics.logEarnVirtualCurrency(object);
}

/**
 * Generate Lead event. Log this event when a lead has been generated in the app to understand
 * the efficacy of your install and re-engagement campaigns.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `generate_lead`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.GenerateLeadEventParameters}.
 */
export function logGenerateLead(analytics, object = {}) {
  return analytics.logGenerateLead(object);
}

/**
 * Join Group event. Log this event when a user joins a group such as a guild, team or family.
 * Use this event to analyze how popular certain groups or social features are in your app
 *
 * Logged event name: `join_group`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.JoinGroupEventParameters}.
 */
export function logJoinGroup(analytics, object = {}) {
  return analytics.logJoinGroup(object);
}

/**
 * Level End event.
 *
 * Logged event name: `level_end`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LevelEndEventParameters}.
 */
export function logLevelEnd(analytics, object = {}) {
  return analytics.logLevelEnd(object);
}

/**
 * Level Start event.
 *
 * Logged event name: `level_start`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LevelStartEventParameters}.
 */
export function logLevelStart(analytics, object = {}) {
  return analytics.logLevelStart(object);
}

/**
 * Level Up event. This event signifies that a player has leveled up in your gaming app.
 * It can help you gauge the level distribution of your userbase and help you identify certain levels that are difficult to pass.
 *
 * Logged event name: `level_up`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LevelUpEventParameters}.
 */
export function logLevelUp(analytics, object = {}) {
  return analytics.logLevelUp(object);
}

/**
 * Login event. Apps with a login feature can report this event to signify that a user has logged in.
 *
 * Logged event name: `login`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LoginEventParameters}.
 */
export function logLogin(analytics, object = {}) {
  return analytics.logLogin(object);
}

/**
 * Post Score event. Log this event when the user posts a score in your gaming app. This event can
 * help you understand how users are actually performing in your game and it can help you correlate
 * high scores with certain audiences or behaviors.
 *
 * Logged event name: `post_score`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.PostScoreEventParameters}.
 */
export function logPostScore(analytics, object = {}) {
  return analytics.logPostScore(object);
}

/**
 * Select Content event. This general purpose event signifies that a user has selected some
 * content of a certain type in an app. The content can be any object in your app. This event
 * can help you identify popular content and categories of content in your app.
 *
 * Logged event name: `select_content`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SelectContentEventParameters}.
 */
export function logSelectContent(analytics, object = {}) {
  return analytics.logSelectContent(object);
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported
 * automatically for Google Play-based apps.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `purchase`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.PurchaseEventParameters}.
 */
export function logPurchase(analytics, object = {}) {
  return analytics.logPurchase(object);
}

/**
 * E-Commerce Refund event. This event signifies that a refund was issued.
 *
 * Logged event name: `remove_from_cart`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.RefundEventParameters}.
 */
export function logRefund(analytics, object = {}) {
  return analytics.logRefund(object);
}

/**
 * Remove from cart event.
 *
 * Logged event name: `remove_from_cart`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.RemoveFromCartEventParameters}.
 */
export function logRemoveFromCart(analytics, object = {}) {
  return analytics.logRemoveFromCart(object);
}

/**
 * Search event. Apps that support search features can use this event to contextualize search
 * operations by supplying the appropriate, corresponding parameters. This event can help you
 * identify the most popular content in your app.
 *
 * Logged event name: `search`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SearchEventParameters}.
 */
export function logSearch(analytics, object = {}) {
  return analytics.logSearch(object);
}

/**
 * Select Item event. This event signifies that an item was selected by a user from a list.
 * Use the appropriate parameters to contextualize the event.
 * Use this event to discover the most popular items selected.
 *
 * Logged event name: `select_item`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SelectItemEventParameters}.
 */
export function logSelectItem(analytics, object = {}) {
  return analytics.logSelectItem(object);
}

/**
 * Set checkout option event.
 *
 * Logged event name: `set_checkout_option`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SetCheckoutOptionEventParameters}.
 */
export function logSetCheckoutOption(analytics, object = {}) {
  return analytics.logSetCheckoutOption(object);
}

/**
 * Select promotion event. This event signifies that a user has selected a promotion offer. Use the
 * appropriate parameters to contextualize the event, such as the item(s) for which the promotion applies.
 *
 * Logged event name: `select_promotion`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SelectPromotionEventParameters}.
 */
export function logSelectPromotion(analytics, object = {}) {
  return analytics.logSelectPromotion(object);
}

/**
 * Share event. Apps with social features can log the Share event to identify the most viral content.
 *
 * Logged event name: `share`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ShareEventParameters}.
 */
export function logShare(analytics, object = {}) {
  return analytics.logShare(object);
}

/**
 * Sign Up event. This event indicates that a user has signed up for an account in your app.
 * The parameter signifies the method by which the user signed up. Use this event to understand
 * the different behaviors between logged in and logged out users.
 *
 * Logged event name: `sign_up`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SignUpEventParameters}.
 */
export function logSignUp(analytics, object = {}) {
  return analytics.logSignUp(object);
}

/**
 * Spend Virtual Currency event. This event tracks the sale of virtual goods in your app and can
 * help you identify which virtual goods are the most popular objects of purchase.
 *
 * Logged event name: `spend_virtual_currency`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SpendVirtualCurrencyEventParameters}.
 */
export function logSpendVirtualCurrency(analytics, object = {}) {
  return analytics.logSpendVirtualCurrency(object);
}

/**
 * Tutorial Begin event. This event signifies the start of the on-boarding process in your app.
 * Use this in a funnel with {@link analytics#logTutorialComplete} to understand how many users
 * complete this process and move on to the full app experience.
 *
 * Logged event name: `tutorial_begin`
 *
 * @param analytics Analytics instance.
 */
export function logTutorialBegin(analytics) {
  return analytics.logTutorialBegin();
}

/**
 * Tutorial End event. Use this event to signify the user's completion of your app's on-boarding process.
 * Add this to a funnel with {@link analytics#logTutorialBegin} to understand how many users
 * complete this process and move on to the full app experience.
 *
 * Logged event name: `tutorial_complete`
 *
 * @param analytics Analytics instance.
 */
export function logTutorialComplete(analytics) {
  return analytics.logTutorialComplete();
}

/**
 * Unlock Achievement event. Log this event when the user has unlocked an achievement in your game.
 * Since achievements generally represent the breadth of a gaming experience, this event can help
 * you understand how many users are experiencing all that your game has to offer.
 *
 * Logged event name: `unlock_achievement`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.UnlockAchievementEventParameters}.
 */
export function logUnlockAchievement(analytics, object = {}) {
  return analytics.logUnlockAchievement(object);
}

/**
 * E-commerce View Cart event. This event signifies that a user has viewed their cart. Use this to analyze your purchase funnel.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `view_cart`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewCartEventParameters}.
 */
export function logViewCart(analytics, object = {}) {
  return analytics.logViewCart(object);
}

/**
 * View Item event. This event signifies that some content was shown to the user. This content
 * may be a product, a screen or just a simple image or text. Use the appropriate parameters
 * to contextualize the event. Use this event to discover the most popular items viewed in your app.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `view_item`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewItemEventParameters}.
 */
export function logViewItem(analytics, object = {}) {
  return analytics.logViewItem(object);
}

/**
 * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
 *
 * Logged event name: `view_item_list`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewItemListEventParameters}.
 */
export function logViewItemList(analytics, object = {}) {
  return analytics.logViewItemList(object);
}

/**
 * View Promotion event. This event signifies that a promotion was shown to a user.
 *
 * Logged event name: `view_promotion`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewPromotionEventParameters}.
 */
export function logViewPromotion(analytics, object = {}) {
  return analytics.logViewPromotion(object);
}

/**
 * View Search Results event. Log this event when the user has been presented with the results of a search.
 *
 * Logged event name: `view_search_results`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewSearchResultsParameters}.
 */
export function logViewSearchResults(analytics, object = {}) {
  return analytics.logViewSearchResults(object);
}

/**
 * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
 *
 * @param analytics Analytics instance.
 * @param params Parameters to be added to the map of parameters added to every event.
 * They will be added to the map of default event parameters, replacing any existing
 * parameter with the same name. Valid parameter values are String, long, and double.
 * Setting a key's value to null will clear that parameter. Passing in a null bundle
 * will clear all parameters.
 * For Web, the values passed persist on the current page and are passed with all
 * subsequent events.
 */
export function setDefaultEventParameters(analytics, params = {}) {
  return analytics.setDefaultEventParameters(params);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile
 *
 * @param analytics Analytics instance.
 * @param emailAddress email address, properly formatted complete with domain name e.g, 'user@example.com'
 */
export function initiateOnDeviceConversionMeasurementWithEmailAddress(analytics, emailAddress) {
  return analytics.initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile
 *
 * @param analytics Analytics instance.
 * @param phoneNumber phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
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
  // always return "true" for now until Web implementation. Web only.
  return Promise.resolve(true);
}

/**
 * Sets the applicable end user consent state for this app.
 * references once Firebase Analytics is initialized.
 * @param analytics Analytics instance.
 * @param consentSettings See {@link analytics.ConsentSettings}.
 * @returns {Promise<void>}
 */
// eslint-disable-next-line
export function setConsent(analytics, consentSettings) {
  return analytics.setConsent(consentSettings);
}

/**
 * Configures Firebase Analytics to use custom gtag or dataLayer names.
 * Intended to be used if gtag.js script has been installed on this page
 * independently of Firebase Analytics, and is using non-default names for
 * either the gtag function or for dataLayer. Must be called before calling
 * `getAnalytics()` or it won't have any effect. Web only.
 * @param options See {@link analytics.SettingsOptions}.
 * @returns {void}
 */
// eslint-disable-next-line
export function settings(options) {
  // Returns nothing until Web implemented.
}
