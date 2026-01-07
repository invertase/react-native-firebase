/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Analytics package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `analytics` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/analytics';
 *
 * // firebase.analytics().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `analytics` package:
 *
 * ```js
 * import analytics from '@react-native-firebase/analytics';
 *
 * // analytics().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/analytics';
 *
 * // firebase.analytics().X
 * ```
 *
 * @firebase analytics
 */
export namespace FirebaseAnalyticsTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Statics {
    // firebase.analytics.* static props go here
  }

  /**
   * Analytics instance initialization options. Web only.
   */
  export interface AnalyticsSettings {
    config?: GtagConfigParams | EventParams;
  }

  /**
   * Additional options that can be passed to Analytics method calls such as logEvent. Web only.
   */
  export interface AnalyticsCallOptions {
    global?: boolean;
  }

  /**
   * Consent status string values.
   */
  export type ConsentStatusString = 'granted' | 'denied';

  /**
   * Consent settings for GDPR compliance.
   */
  export interface ConsentSettings {
    ad_personalization?: ConsentStatusString;
    ad_storage?: ConsentStatusString;
    ad_user_data?: ConsentStatusString;
    analytics_storage?: ConsentStatusString;
  }

  /**
   * Settings options for configuring Firebase Analytics. Web only.
   */
  export interface SettingsOptions {
    dataLayerName?: string;
    gtagName?: string;
  }

  /**
   * Standard gtag.js event parameters.
   */
  export interface EventParams {
    checkout_option?: string;
    checkout_step?: number;
    item_id?: string;
    content_type?: string;
    coupon?: string;
    currency?: string;
    description?: string;
    fatal?: boolean;
    items?: Item[];
    method?: string;
    number?: string;
    promotions?: Promotion[];
    screen_name?: string;
    firebase_screen?: string;
    firebase_screen_class?: string;
    search_term?: string;
    shipping?: number;
    tax?: number;
    transaction_id?: string;
    value?: number;
    event_label?: string;
    event_category?: string;
    shipping_tier?: string;
    item_list_id?: string;
    item_list_name?: string;
    promotion_id?: string;
    promotion_name?: string;
    payment_type?: string;
    affiliation?: string;
    page_title?: string;
    page_location?: string;
    page_path?: string;
    [key: string]: unknown;
  }

  /**
   * Gtag config parameters. Web only.
   */
  export interface GtagConfigParams {
    [key: string]: any;
  }

  /**
   * Promotion object for analytics events.
   */
  export interface Promotion {
    creative_name?: string;
    creative_slot?: string;
    promotion_id?: string;
    promotion_name?: string;
    [key: string]: any;
  }

  /**
   * Item object for e-commerce events.
   */
  export interface Item {
    item_brand?: string;
    item_id?: string;
    item_name?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    location_id?: string;
    item_variant?: string;
    quantity?: number;
    price?: number;
    affiliation?: string;
    coupon?: string;
    creative_name?: string;
    creative_slot?: string;
    discount?: number;
    index?: number;
    promotion_id?: string;
    promotion_name?: string;
    [key: string]: string | number | undefined;
  }

  /**
   * Event parameter interfaces for specific event types
   */
  export interface AddPaymentInfoEventParameters {
    items?: Item[];
    currency?: string;
    value?: number;
    coupon?: string;
    payment_type?: string;
  }

  export interface AddShippingInfoParameters {
    items?: Item[];
    currency?: string;
    value?: number;
    coupon?: string;
    shipping_tier?: string;
  }

  export interface AddToCartEventParameters {
    items?: Item[];
    currency?: string;
    value?: number;
  }

  export interface AddToWishlistEventParameters {
    items?: Item[];
    currency?: string;
    value?: number;
  }

  export interface BeginCheckoutEventParameters {
    currency?: string;
    value?: number;
    coupon?: string;
    items?: Item[];
  }

  export interface CampaignDetailsEventParameters {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    [key: string]: any;
  }

  export interface EarnVirtualCurrencyEventParameters {
    virtual_currency_name: string;
    value: number;
  }

  export interface GenerateLeadEventParameters {
    value?: number;
    currency?: string;
    [key: string]: any;
  }

  export interface JoinGroupEventParameters {
    group_id: string;
    [key: string]: any;
  }

  export interface LevelEndEventParameters {
    level_name: string;
    success?: string;
    [key: string]: any;
  }

  export interface LevelStartEventParameters {
    level_name: string;
    [key: string]: any;
  }

  export interface LevelUpEventParameters {
    level?: number;
    character?: string;
    [key: string]: any;
  }

  export interface LoginEventParameters {
    method?: string;
    [key: string]: any;
  }

  export interface PostScoreEventParameters {
    score: number;
    level?: number;
    character?: string;
    [key: string]: any;
  }

  export interface SelectContentEventParameters {
    content_type?: string;
    item_id?: string;
    [key: string]: any;
  }

  export interface PurchaseEventParameters {
    value?: number;
    currency?: string;
    transaction_id: string;
    tax?: number;
    shipping?: number;
    items?: Item[];
    coupon?: string;
    affiliation?: string;
    [key: string]: any;
  }

  export interface RefundEventParameters {
    value?: number;
    currency?: string;
    transaction_id: string;
    tax?: number;
    shipping?: number;
    items?: Item[];
    coupon?: string;
    affiliation?: string;
    [key: string]: any;
  }

  export interface RemoveFromCartEventParameters {
    currency?: string;
    value?: number;
    items?: Item[];
    [key: string]: any;
  }

  export interface SearchEventParameters {
    search_term?: string;
    [key: string]: any;
  }

  export interface SelectItemEventParameters {
    items?: Item[];
    item_list_name?: string;
    item_list_id?: string;
    [key: string]: any;
  }

  export interface SetCheckoutOptionEventParameters {
    checkout_step?: number;
    checkout_option?: string;
    [key: string]: any;
  }

  export interface SelectPromotionEventParameters {
    items?: Item[];
    promotion_id?: string;
    promotion_name?: string;
    [key: string]: any;
  }

  export interface ShareEventParameters {
    method?: string;
    content_type?: string;
    item_id?: string;
    [key: string]: any;
  }

  export interface SignUpEventParameters {
    method?: string;
    [key: string]: any;
  }

  export interface SpendVirtualCurrencyEventParameters {
    item_name: string;
    virtual_currency_name: string;
    value: number;
    [key: string]: any;
  }

  export interface UnlockAchievementEventParameters {
    achievement_id: string;
    [key: string]: any;
  }

  export interface ViewCartEventParameters {
    currency?: string;
    value?: number;
    items?: Item[];
    [key: string]: any;
  }

  export interface ViewItemEventParameters {
    currency?: string;
    value?: number;
    items?: Item[];
    [key: string]: any;
  }

  export interface ViewItemListEventParameters {
    items?: Item[];
    item_list_id?: string;
    item_list_name?: string;
    [key: string]: any;
  }

  export interface ViewPromotionEventParameters {
    items?: Item[];
    location_id?: string;
    creative_name?: string;
    creative_slot?: string;
    promotion_id?: string;
    promotion_name?: string;
    [key: string]: any;
  }

  export interface ViewSearchResultsParameters {
    search_term: string;
    [key: string]: any;
  }

  export interface ScreenViewParameters {
    firebase_screen: string;
    firebase_screen_class?: string;
    [key: string]: any;
  }

  /**
   * Type for standard Google Analytics event names.
   */
  export type EventNameString =
    | 'add_payment_info'
    | 'add_shipping_info'
    | 'add_to_cart'
    | 'add_to_wishlist'
    | 'begin_checkout'
    | 'checkout_progress'
    | 'exception'
    | 'generate_lead'
    | 'login'
    | 'page_view'
    | 'purchase'
    | 'refund'
    | 'remove_from_cart'
    | 'screen_view'
    | 'search'
    | 'select_content'
    | 'select_item'
    | 'select_promotion'
    | 'set_checkout_option'
    | 'share'
    | 'sign_up'
    | 'timing_complete'
    | 'view_cart'
    | 'view_item'
    | 'view_item_list'
    | 'view_promotion'
    | 'view_search_results';

  /**
   * Any custom event name string not in the standard list of recommended event names.
   */
  export type CustomEventName<T> = T extends EventNameString ? never : T;

  /**
   * Analytics module instance - returned from firebase.analytics() or firebase.app().analytics()
   *
   * #### Example
   *
   * Get the Analytics service for the default app:
   *
   * ```js
   * const defaultAppAnalytics = firebase.analytics();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * Log a custom event with optional params. Note that there are various limits that applied
     * to event parameters (total parameter count, etc), but analytics applies the limits during
     * cloud processing, the errors will not be seen as Promise rejections when you call logEvent.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logEvent('product_view', {
     *   id: '1234',
     * });
     * ```
     *
     * @param name Event name must not conflict with any Reserved Events.
     * @param params Parameters to be sent and displayed with the event.
     * @param options Additional options that can be passed. Web only.
     */
    logEvent(
      name: string,
      params?: { [key: string]: any },
      options?: AnalyticsCallOptions,
    ): Promise<void>;

    /**
     * If true, allows the device to collect analytical data and send it to
     * Firebase. Useful for GDPR.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setAnalyticsCollectionEnabled(false);
     * ```
     *
     * @param enabled A boolean value to enable or disable analytics collection.
     */
    setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;

    /**
     * Sets the duration of inactivity that terminates the current session.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setSessionTimeoutDuration(1800000); // 30 minutes
     * ```
     *
     * @param milliseconds The default value is 1800000 (30 minutes).
     */
    setSessionTimeoutDuration(milliseconds?: number): Promise<void>;

    /**
     * Retrieve the app instance id of the application.
     *
     * #### Example
     *
     * ```js
     * const appInstanceId = await firebase.analytics().getAppInstanceId();
     * ```
     *
     * @returns Returns the app instance id or null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
     */
    getAppInstanceId(): Promise<string | null>;

    /**
     * Retrieves the session id from the client.
     *
     * #### Example
     *
     * ```js
     * const sessionId = await firebase.analytics().getSessionId();
     * ```
     *
     * Returns the session id or null if session is expired, null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
     */
    getSessionId(): Promise<number | null>;

    /**
     * Gives a user a unique identification.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setUserId('user123');
     * ```
     *
     * @param id Set to null to remove a previously assigned ID from analytics events
     * @param options Additional options that can be passed to Analytics method calls such as logEvent, etc.
     */
    setUserId(id: string | null, options?: AnalyticsCallOptions): Promise<void>;

    /**
     * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setUserProperty('favorite_food', 'pizza');
     * ```
     *
     * @param name A user property identifier.
     * @param value Set to null to remove a previously assigned ID from analytics events.
     */
    setUserProperty(name: string, value: string | null): Promise<void>;

    /**
     * Sets multiple key/value pairs of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setUserProperties({
     *   favorite_food: 'pizza',
     *   favorite_color: 'blue',
     * });
     * ```
     *
     * @param properties Set a property value to null to remove it.
     * @param options `AnalyticsCallOptions`. Additional options that can be passed. Web only.
     */
    setUserProperties(
      properties: { [key: string]: string | null },
      options?: AnalyticsCallOptions,
    ): Promise<void>;

    /**
     * Clears all analytics data for this instance from the device and resets the app instance ID.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().resetAnalyticsData();
     * ```
     */
    resetAnalyticsData(): Promise<void>;

    /**
     * Sets the applicable end user consent state (e.g., for device identifiers) for this app on this device.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setConsent({
     *   ad_personalization: false,
     *   analytics_storage: false,
     *   ad_storage: false,
     *   ad_user_data: false,
     * });
     * ```
     *
     * @param consentSettings Consent status settings for each consent type.
     */
    setConsent(consentSettings: ConsentSettings): Promise<void>;

    /**
     * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setDefaultEventParameters({
     *   app_version: '1.0.0',
     * });
     * ```
     *
     * @platform ios
     * @param params Parameters to be added to the map of parameters added to every event.
     */
    setDefaultEventParameters(params?: { [key: string]: any }): Promise<void>;

    // Event logging methods
    logAddPaymentInfo(object: AddPaymentInfoEventParameters): Promise<void>;
    logScreenView(object: ScreenViewParameters): Promise<void>;
    logAddShippingInfo(object?: AddShippingInfoParameters): Promise<void>;
    logAddToCart(object?: AddToCartEventParameters): Promise<void>;
    logAddToWishlist(object?: AddToWishlistEventParameters): Promise<void>;
    logAppOpen(): Promise<void>;
    logBeginCheckout(object?: BeginCheckoutEventParameters): Promise<void>;
    logCampaignDetails(object: CampaignDetailsEventParameters): Promise<void>;
    logEarnVirtualCurrency(object: EarnVirtualCurrencyEventParameters): Promise<void>;
    logGenerateLead(object?: GenerateLeadEventParameters): Promise<void>;
    logJoinGroup(object: JoinGroupEventParameters): Promise<void>;
    logLevelEnd(object: LevelEndEventParameters): Promise<void>;
    logLevelStart(object: LevelStartEventParameters): Promise<void>;
    logLevelUp(object: LevelUpEventParameters): Promise<void>;
    logLogin(object: LoginEventParameters): Promise<void>;
    logPostScore(object: PostScoreEventParameters): Promise<void>;
    logSelectContent(object: SelectContentEventParameters): Promise<void>;
    logPurchase(object?: PurchaseEventParameters): Promise<void>;
    logRefund(object?: RefundEventParameters): Promise<void>;
    logRemoveFromCart(object?: RemoveFromCartEventParameters): Promise<void>;
    logSearch(object: SearchEventParameters): Promise<void>;
    logSelectItem(object: SelectItemEventParameters): Promise<void>;
    logSetCheckoutOption(object: SetCheckoutOptionEventParameters): Promise<void>;
    logSelectPromotion(object: SelectPromotionEventParameters): Promise<void>;
    logShare(object: ShareEventParameters): Promise<void>;
    logSignUp(object: SignUpEventParameters): Promise<void>;
    logSpendVirtualCurrency(object: SpendVirtualCurrencyEventParameters): Promise<void>;
    logTutorialBegin(): Promise<void>;
    logTutorialComplete(): Promise<void>;
    logUnlockAchievement(object: UnlockAchievementEventParameters): Promise<void>;
    logViewCart(object?: ViewCartEventParameters): Promise<void>;
    logViewItem(object?: ViewItemEventParameters): Promise<void>;
    logViewItemList(object?: ViewItemListEventParameters): Promise<void>;
    logViewPromotion(object?: ViewPromotionEventParameters): Promise<void>;
    logViewSearchResults(object: ViewSearchResultsParameters): Promise<void>;

    // iOS-specific methods
    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     *
     * @platform ios
     * @param emailAddress email address, properly formatted complete with domain name e.g, 'user@example.com'
     */
    initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress: string): Promise<void>;

    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     *
     * @platform ios
     * @param hashedEmailAddress sha256-hashed of normalized email address
     */
    initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
      hashedEmailAddress: string,
    ): Promise<void>;

    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     *
     * @platform ios
     * @param phoneNumber phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
     */
    initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber: string): Promise<void>;

    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     *
     * @platform ios
     * @param hashedPhoneNumber sha256-hashed of normalized phone number in E.164 format
     */
    initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
      hashedPhoneNumber: string,
    ): Promise<void>;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStatics<
  FirebaseAnalyticsTypes.Module,
  FirebaseAnalyticsTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  analytics: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { analytics(): FirebaseAnalyticsTypes.Module };
};

// Note: export * from './modular' removed for TypeDoc compatibility
// The modular exports are available at runtime via the main index.ts file

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

    interface Module {
      analytics: FirebaseModuleWithStatics<
        FirebaseAnalyticsTypes.Module,
        FirebaseAnalyticsTypes.Statics
      >;
    }

    interface FirebaseApp {
      analytics(): FirebaseAnalyticsTypes.Module;
    }
  }
}
