import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';
import type { FirebaseAnalyticsModule } from './namespaced';
import { getApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type {
  AnalyticsSettings,
  AnalyticsCallOptions,
  ConsentSettings,
  AddPaymentInfoEventParameters,
  ScreenViewParameters,
  AddShippingInfoParameters,
  AddToCartEventParameters,
  AddToWishlistEventParameters,
  BeginCheckoutEventParameters,
  CampaignDetailsEventParameters,
  EarnVirtualCurrencyEventParameters,
  GenerateLeadEventParameters,
  JoinGroupEventParameters,
  LevelEndEventParameters,
  LevelStartEventParameters,
  LevelUpEventParameters,
  LoginEventParameters,
  PostScoreEventParameters,
  SelectContentEventParameters,
  PurchaseEventParameters,
  RefundEventParameters,
  RemoveFromCartEventParameters,
  SearchEventParameters,
  SelectItemEventParameters,
  SetCheckoutOptionEventParameters,
  SelectPromotionEventParameters,
  ShareEventParameters,
  SignUpEventParameters,
  SpendVirtualCurrencyEventParameters,
  UnlockAchievementEventParameters,
  ViewCartEventParameters,
  ViewItemEventParameters,
  ViewItemListEventParameters,
  ViewPromotionEventParameters,
  ViewSearchResultsParameters,
  SettingsOptions,
} from '../types/analytics';

declare module '@react-native-firebase/app' {
  function getApp(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { analytics(): FirebaseAnalyticsModule };
}

/**
 * Returns an Analytics instance for the given app.
 */
export function getAnalytics(app?: ReactNativeFirebase.FirebaseApp): FirebaseAnalyticsModule {
  if (app) {
    return getApp(app.name).analytics();
  }
  return getApp().analytics();
}

/**
 * Returns an Analytics instance for the given app.
 */
export function initializeAnalytics(
  app: ReactNativeFirebase.FirebaseApp,
  _options?: AnalyticsSettings,
): FirebaseAnalyticsModule {
  return getApp(app.name).analytics();
}

/**
 * Retrieves a unique Google Analytics identifier for the web client.
 */
export async function getGoogleAnalyticsClientId(
  analytics: FirebaseAnalyticsModule,
): Promise<string> {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    throw new Error('getGoogleAnalyticsClientId is web-only.');
  } else {
    const instanceId = await getAppInstanceId(analytics);
    return instanceId || '';
  }
}

/**
 * Log a custom event with optional params.
 */
export function logEvent(
  analytics: FirebaseAnalyticsModule,
  name: string,
  params: { [key: string]: any } = {},
  options: AnalyticsCallOptions = { global: false },
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.logEvent.call(analytics, name, params, options, MODULAR_DEPRECATION_ARG);
}

/**
 * If true, allows the device to collect analytical data and send it to Firebase. Useful for GDPR.
 */
export function setAnalyticsCollectionEnabled(
  analytics: FirebaseAnalyticsModule,
  enabled: boolean,
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.setAnalyticsCollectionEnabled.call(analytics, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the duration of inactivity that terminates the current session.
 */
export function setSessionTimeoutDuration(
  analytics: FirebaseAnalyticsModule,
  milliseconds: number = 1800000,
): Promise<void> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.setSessionTimeoutDuration.call(analytics, milliseconds, MODULAR_DEPRECATION_ARG);
}

/**
 * Retrieve the app instance id of the application.
 */
export function getAppInstanceId(analytics: FirebaseAnalyticsModule): Promise<string | null> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.getAppInstanceId.call(analytics, MODULAR_DEPRECATION_ARG);
}

/**
 * Retrieves the session id from the client.
 * On iOS, Firebase SDK may return an error that is handled internally and may take many minutes to return a valid value. Check native debug logs for more details.
 */
export function getSessionId(analytics: FirebaseAnalyticsModule): Promise<number | null> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.getSessionId.call(analytics, MODULAR_DEPRECATION_ARG);
}

/**
 * Gives a user a unique identification.
 */
export function setUserId(analytics: FirebaseAnalyticsModule, id: string | null): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.setUserId.call(analytics, id, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 */
export function setUserProperty(
  analytics: FirebaseAnalyticsModule,
  name: string,
  value: string | null,
): Promise<void> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.setUserProperty.call(analytics, name, value, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets multiple key/value pairs of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 */
export function setUserProperties(
  analytics: FirebaseAnalyticsModule,
  properties: { [key: string]: string | null },
  options: AnalyticsCallOptions = { global: false },
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.setUserProperties.call(analytics, properties, options, MODULAR_DEPRECATION_ARG);
}

/**
 * Clears all analytics data for this instance from the device and resets the app instance ID.
 */
export function resetAnalyticsData(analytics: FirebaseAnalyticsModule): Promise<void> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.resetAnalyticsData.call(analytics, MODULAR_DEPRECATION_ARG);
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported automatically for Google Play-based apps.
 */
export function logAddPaymentInfo(
  analytics: FirebaseAnalyticsModule,
  params: AddPaymentInfoEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddPaymentInfo(params);
}

/**
 * Sets or clears the screen name and class the user is currently viewing.
 */
export function logScreenView(
  analytics: FirebaseAnalyticsModule,
  params: ScreenViewParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logScreenView(params);
}

/**
 * Add Payment Info event. This event signifies that a user has submitted their payment information to your app.
 */
export function logAddShippingInfo(
  analytics: FirebaseAnalyticsModule,
  params: AddShippingInfoParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddShippingInfo(params);
}

/**
 * E-Commerce Add To Cart event.
 */
export function logAddToCart(
  analytics: FirebaseAnalyticsModule,
  params: AddToCartEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddToCart(params);
}

/**
 * E-Commerce Add To Wishlist event. This event signifies that an item was added to a wishlist.
 */
export function logAddToWishlist(
  analytics: FirebaseAnalyticsModule,
  params: AddToWishlistEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddToWishlist(params);
}

/**
 * App Open event. By logging this event when an App is moved to the foreground, developers can understand how often users leave and return during the course of a Session.
 */
export function logAppOpen(analytics: FirebaseAnalyticsModule): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAppOpen();
}

/**
 * E-Commerce Begin Checkout event. This event signifies that a user has begun the process of checking out.
 */
export function logBeginCheckout(
  analytics: FirebaseAnalyticsModule,
  params: BeginCheckoutEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logBeginCheckout(params);
}

/**
 * Log this event to supply the referral details of a re-engagement campaign.
 */
export function logCampaignDetails(
  analytics: FirebaseAnalyticsModule,
  params: CampaignDetailsEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logCampaignDetails(params);
}

/**
 * Earn Virtual Currency event. This event tracks the awarding of virtual currency in your app.
 */
export function logEarnVirtualCurrency(
  analytics: FirebaseAnalyticsModule,
  params: EarnVirtualCurrencyEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logEarnVirtualCurrency(params);
}

/**
 * Generate Lead event. Log this event when a lead has been generated in the app.
 */
export function logGenerateLead(
  analytics: FirebaseAnalyticsModule,
  params: GenerateLeadEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logGenerateLead(params);
}

/**
 * Join Group event. Log this event when a user joins a group such as a guild, team or family.
 */
export function logJoinGroup(
  analytics: FirebaseAnalyticsModule,
  params: JoinGroupEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logJoinGroup(params);
}

/**
 * Level End event.
 */
export function logLevelEnd(
  analytics: FirebaseAnalyticsModule,
  params: LevelEndEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelEnd(params);
}

/**
 * Level Start event.
 */
export function logLevelStart(
  analytics: FirebaseAnalyticsModule,
  params: LevelStartEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelStart(params);
}

/**
 * Level Up event. This event signifies that a player has leveled up in your gaming app.
 */
export function logLevelUp(
  analytics: FirebaseAnalyticsModule,
  params: LevelUpEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelUp(params);
}

/**
 * Login event. Apps with a login feature can report this event to signify that a user has logged in.
 */
export function logLogin(
  analytics: FirebaseAnalyticsModule,
  params: LoginEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLogin(params);
}

/**
 * Post Score event. Log this event when the user posts a score in your gaming app.
 */
export function logPostScore(
  analytics: FirebaseAnalyticsModule,
  params: PostScoreEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logPostScore(params);
}

/**
 * Select Content event. This general purpose event signifies that a user has selected some content of a certain type in an app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectContentEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectContent(
  analytics: FirebaseAnalyticsModule,
  params: SelectContentEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectContent(params);
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {PurchaseEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logPurchase(
  analytics: FirebaseAnalyticsModule,
  params: PurchaseEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logPurchase(params);
}

/**
 * E-Commerce Refund event. This event signifies that a refund was issued.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RefundEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRefund(
  analytics: FirebaseAnalyticsModule,
  params: RefundEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logRefund(params);
}

/**
 * Remove from cart event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RemoveFromCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRemoveFromCart(
  analytics: FirebaseAnalyticsModule,
  params: RemoveFromCartEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logRemoveFromCart(params);
}

/**
 * Search event. Apps that support search features can use this event to contextualize search operations by supplying the appropriate, corresponding parameters.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SearchEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSearch(
  analytics: FirebaseAnalyticsModule,
  params: SearchEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSearch(params);
}

/**
 * Select Item event. This event signifies that an item was selected by a user from a list.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectItem(
  analytics: FirebaseAnalyticsModule,
  params: SelectItemEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectItem(params);
}

/**
 * Set checkout option event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SetCheckoutOptionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSetCheckoutOption(
  analytics: FirebaseAnalyticsModule,
  params: SetCheckoutOptionEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSetCheckoutOption(params);
}

/**
 * Select promotion event. This event signifies that a user has selected a promotion offer.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectPromotion(
  analytics: FirebaseAnalyticsModule,
  params: SelectPromotionEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectPromotion(params);
}

/**
 * Share event. Apps with social features can log the Share event to identify the most viral content.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ShareEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logShare(
  analytics: FirebaseAnalyticsModule,
  params: ShareEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logShare(params);
}

/**
 * Sign Up event. This event indicates that a user has signed up for an account in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SignUpEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSignUp(
  analytics: FirebaseAnalyticsModule,
  params: SignUpEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSignUp(params);
}

/**
 * Spend Virtual Currency event. This event tracks the sale of virtual goods in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SpendVirtualCurrencyEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSpendVirtualCurrency(
  analytics: FirebaseAnalyticsModule,
  params: SpendVirtualCurrencyEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSpendVirtualCurrency(params);
}

/**
 * Tutorial Begin event. This event signifies the start of the on-boarding process in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialBegin(analytics: FirebaseAnalyticsModule): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logTutorialBegin();
}

/**
 * Tutorial End event. Use this event to signify the user's completion of your app's on-boarding process.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialComplete(analytics: FirebaseAnalyticsModule): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logTutorialComplete();
}

/**
 * Unlock Achievement event. Log this event when the user has unlocked an achievement in your game.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {UnlockAchievementEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logUnlockAchievement(
  analytics: FirebaseAnalyticsModule,
  params: UnlockAchievementEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logUnlockAchievement(params);
}

/**
 * E-commerce View Cart event. This event signifies that a user has viewed their cart.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewCart(
  analytics: FirebaseAnalyticsModule,
  params: ViewCartEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewCart(params);
}

/**
 * View Item event. This event signifies that some content was shown to the user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItem(
  analytics: FirebaseAnalyticsModule,
  params: ViewItemEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewItem(params);
}

/**
 * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemListEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItemList(
  analytics: FirebaseAnalyticsModule,
  params: ViewItemListEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewItemList(params);
}

/**
 * View Promotion event. This event signifies that a promotion was shown to a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewPromotion(
  analytics: FirebaseAnalyticsModule,
  params: ViewPromotionEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewPromotion(params);
}

/**
 * View Search Results event. Log this event when the user has been presented with the results of a search.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewSearchResultsParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewSearchResults(
  analytics: FirebaseAnalyticsModule,
  params: ViewSearchResultsParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewSearchResults(params);
}

/**
 * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {object} [params={}] - Parameters to be added to the map of parameters added to every event.
 * @returns {Promise<void>}
 */
export function setDefaultEventParameters(
  analytics: FirebaseAnalyticsModule,
  params: { [key: string]: any } = {},
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.setDefaultEventParameters.call(analytics, params, MODULAR_DEPRECATION_ARG);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} emailAddress - Email address, properly formatted complete with domain name e.g, 'user@example.com'.
 * @returns {Promise<void>}
 */
export function initiateOnDeviceConversionMeasurementWithEmailAddress(
  analytics: FirebaseAnalyticsModule,
  emailAddress: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithEmailAddress.call(
    analytics,
    emailAddress,
    // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
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
  analytics: FirebaseAnalyticsModule,
  hashedEmailAddress: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithHashedEmailAddress.call(
    analytics,
    hashedEmailAddress,
    // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
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
export function initiateOnDeviceConversionMeasurementWithPhoneNumber(
  analytics: FirebaseAnalyticsModule,
  phoneNumber: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithPhoneNumber.call(
    analytics,
    phoneNumber,
    // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
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
  analytics: FirebaseAnalyticsModule,
  hashedPhoneNumber: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber.call(
    analytics,
    hashedPhoneNumber,
    // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
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
export function isSupported(): Promise<boolean> {
  return Promise.resolve(true);
}

/**
 * Sets the applicable end user consent state for this app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ConsentSettings} consentSettings - See ConsentSettings.
 * @returns {Promise<void>}
 */
export function setConsent(
  analytics: FirebaseAnalyticsModule,
  consentSettings: ConsentSettings,
): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return analytics.setConsent.call(analytics, consentSettings, MODULAR_DEPRECATION_ARG);
}

/**
 * Configures Firebase Analytics to use custom gtag or dataLayer names.
 * Intended to be used if gtag.js script has been installed on this page independently of Firebase Analytics, and is using non-default names for either the gtag function or for dataLayer. Must be called before calling `getAnalytics()` or it won't have any effect. Web only.
 * @param {SettingsOptions} options - See SettingsOptions.
 * @returns {void}
 */
export function settings(_options: SettingsOptions): void {
  // Returns nothing until Web implemented.
}

export * from './namespaced';
