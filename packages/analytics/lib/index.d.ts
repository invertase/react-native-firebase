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
 * #### Example: Access the firebase export from the `analytics` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/analytics';
 *
 * // firebase.analytics().X
 * ```
 *
 * #### Example: Using the default export from the `analytics` package:
 *
 * ```js
 * import analytics from '@react-native-firebase/analytics';
 *
 * // analytics().X
 * ```
 *
 * #### Example: Using the default export from the `app` package:
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

  export interface Item {
    /**
     * The item's brand.
     */
    item_brand?: string;
    /**
     * An item ID.
     */
    item_id?: string;
    /**
     * An item name.
     */
    item_name?: string;
    /**
     * First class item category.
     */
    item_category?: string;
    /**
     * Second class item category.
     */
    item_category2?: string;
    /**
     * Third class item category.
     */
    item_category3?: string;
    /**
     * Fourth class item category.
     */
    item_category4?: string;
    /**
     * Fifth class item category.
     */
    item_category5?: string;
    /**
     * The ID of the list in which the item was presented to the user.
     */
    item_list_id?: string;
    /**
     * The name of the list in which the item was presented to the user.
     */
    item_list_name?: string;
    /**
     * The Google [Place ID](https://developers.google.com/places/place-id) that corresponds to the associated item (String). Alternatively, you can supply your own custom Location ID.
     */
    location_id?: string;
    /**
     * The Item variant.
     */
    item_variant?: string;
    /**
     * The Item quantity.
     */
    quantity?: number;
    /**
     * The Item price.
     * Note that firebase analytics will display this as an integer with trailing zeros, due to some firebase-internal conversion.
     * See https://github.com/invertase/react-native-firebase/issues/4578#issuecomment-771703420 for more information
     */
    price?: number;
    /**
     * The affiliation of the item.
     */
    affiliation?: string;
    /**
     * The coupon associated with the item.
     */
    coupon?: string;
    /**
     * The creative name associated with the item.
     */
    creative_name?: string;
    /**
     * The creative slot associated with the item.
     */
    creative_slot?: string;
    /**
     * The discount applied to the item.
     */
    discount?: Currency;
    /**
     * The index of the item.
     */
    index?: number;
    /**
     * The promotion ID associated with the item.
     */
    promotion_id?: string;
    /**
     * The promotion name associated with the item.
     */
    promotion_name?: string;
    /**
     * Custom event parameters. The parameter names can be up to 40 characters long and must start with an alphabetic character and contain only alphanumeric characters and underscores. String parameter values can be up to 100 characters long.
     * The "firebase_", "google_" and "ga_" prefixes are reserved and should not be used for parameter names.
     */
    [key: string]: string | number;
  }

  export interface AddPaymentInfoEventParameters {
    items?: Item[];
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    value?: number;
    /**
     * Coupon code for a purchasable item.
     */
    coupon?: string;
    /**
     * The chosen method of payment
     */
    payment_type?: string;
  }

  export interface AddShippingInfoEventParameters {
    items?: Item[];
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    value?: number;
    /**
     * Coupon code for a purchasable item.
     */
    coupon?: string;
    /**
     * The shipping tier (e.g. Ground, Air, Next-day) selected for delivery of the purchased item
     */
    shipping_tier?: string;
  }

  export interface AddToCartEventParameters {
    items?: Item[];
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * value of item
     */
    value?: number;
  }

  export interface AddToWishlistEventParameters {
    items?: Item[];
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    value?: number;
  }

  export interface BeginCheckoutEventParameters {
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    //TODO if value is a param, so must currency: https://firebase.google.com/docs/reference/android/com/google/firebase/analytics/FirebaseAnalytics.Event#public-static-final-string-add_to_wishlist
    currency?: string;
    value?: number;
    /**
     * Coupon code for a purchasable item.
     */
    coupon?: string;

    items?: Item[];
    /**
     * Custom event parameters.
     */
    [key: string]: any;
  }

  export interface CampaignDetailsEventParameters {
    /**
     * Used to identify a search engine, newsletter, or other source.
     */
    source: string;
    /**
     * Used to identify a medium such as email or cost-per-click (cpc).
     */
    medium: string;
    /**
     *  Used for keyword analysis to identify a specific product promotion or strategic campaign.
     */
    campaign: string;
    /**
     * Used with paid search to supply the keywords for ads.
     */
    term?: string;
    /**
     * Used for A/B testing and content-targeted ads to differentiate ads or links that point to the same URL.
     */
    content?: string;
    /**
     * A campaign detail click ID.
     */
    aclid?: string;
    cp1?: string;
  }

  //
  // Unsupported in "Enhanced Ecommerce reports":
  // https://firebase.google.com/docs/reference/android/com/google/firebase/analytics/FirebaseAnalytics.Event#public-static-final-string-checkout_progress
  //
  // export interface CheckoutProgressEventParameters {
  //   checkout_step: string;
  //   checkout_options: string;
  // }

  export interface EarnVirtualCurrencyEventParameters {
    /**
     * Name of virtual currency type. E.g. `gems`.
     */
    virtual_currency_name: string;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points.
     */
    value: number;
  }

  export interface GenerateLeadEventParameters {
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
  }

  export interface JoinGroupEventParameters {
    /**
     * Group/clan/guild id.
     */
    group_id: string;
  }

  export interface LevelEndEventParameters {
    /**
     * Level in game.
     */
    level: number;
    /**
     * The result of an operation.
     */
    success?: string;
  }

  export interface LevelStartEventParameters {
    /**
     * Level in game.
     */
    level: number;
  }

  export interface LevelUpEventParameters {
    /**
     * Level in game.
     */
    level: number;
    /**
     * Character used in game.
     */
    character?: string;
  }

  export interface LoginEventParameters {
    /**
     * The login method. E.g. `facebook.com`.
     */
    method: string;
  }

  export interface PostScoreEventParameters {
    /**
     * Score in game.
     */
    score: number;
    /**
     * Level in game.
     */
    level?: number;
    /**
     * Character used in game.
     */
    character?: string;
  }

  export interface PurchaseEventParameters {
    /**
     * A product affiliation to designate a supplying company or brick and mortar store location
     */
    affiliation?: string;
    /**
     * Coupon code for a purchasable item.
     */
    coupon?: string;
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;

    items?: Item[];
    /**
     * Shipping cost.
     */
    shipping?: number;
    /**
     * Tax amount.
     */
    tax?: number;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * A single ID for a ecommerce group transaction.
     */
    transaction_id?: string;
    /**
     * Custom event parameters.
     */
    [key: string]: any;
  }

  export interface ScreenViewParameters {
    /**
     * Screen name the user is currently viewing.
     */
    screen_name?: string;
    /**
     * Current class associated with the view the user is currently viewing.
     */
    screen_class?: string;

    /**
     * Custom event parameters.
     */
    [key: string]: any;
  }

  export interface RefundEventParameters {
    /**
     * A product affiliation to designate a supplying company or brick and mortar store location
     */
    affiliation?: string;
    /**
     * Coupon code for a purchasable item.
     */
    coupon?: string;
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;

    items?: Item[];
    /**
     * Shipping cost.
     */
    shipping?: number;
    /**
     * Tax amount.
     */
    tax?: number;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * A single ID for a ecommerce group transaction.
     */
    transaction_id?: string;
  }

  export interface RemoveFromCartEventParameters {
    items?: Item[];
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     x */
    currency?: string;
  }

  export interface SearchEventParameters {
    search_term: string;
    /**
     * Number of nights staying at hotel.
     */
    number_of_nights?: number;
    /**
     * Number of rooms for travel events.
     */
    number_of_rooms?: number;
    /**
     * Number of passengers traveling.
     */
    number_of_passengers?: number;
    /**
     * Flight or Travel origin. E.g. `Mountain View, CA`.
     */
    origin?: string;
    /**
     * Flight or Travel destination. E.g. `Mountain View, CA`.
     */
    destination?: string;
    /**
     * The departure date, check-in date, or rental start date for the item (String). The parameter expects a date formatted as YYYY-MM-DD.
     */
    start_date?: string;
    /**
     * The arrival date, check-out date, or rental end date for the item (String). The parameter expects a date formatted as YYYY-MM-DD.
     */
    end_date?: string;
    /**
     * Travel class. E.g. `business`.
     */
    travel_class?: string;
  }

  export interface SelectContentEventParameters {
    content_type: string;
    /**
     * An item ID.
     */
    item_id: string;
  }

  export interface SelectItemEventParameters {
    items?: Item[];
    content_type: string;
    /**
     * The ID of the list in which the item was presented to the user
     */
    item_list_id: string;
    /**
     * The name of the list in which the item was presented to the user
     */
    item_list_name: string;
  }

  export interface SetCheckoutOptionEventParameters {
    checkout_step?: EventParams['checkout_step'];
    checkout_option?: EventParams['checkout_option'];

    [key: string]: any;
  }

  export interface SelectPromotionEventParameters {
    /**
     * The name of a creative used in a promotional spot
     */
    creative_name: string;
    /**
     * The name of a creative slot
     */
    creative_slot: string;
    items?: Item[];
    /**
     * The location associated with the event. Preferred to be the Google Place ID that corresponds to the associated item but could be overridden to a custom location ID string
     */
    location_id: string;
    /**
     * The ID of a product promotion
     */
    promotion_id: string;
    /**
     * The name of a product promotion
     */
    promotion_name: string;
  }

  export interface ShareEventParameters {
    /**
     * Type of content selected.
     */
    content_type: string;
    /**
     * An item ID.
     */
    item_id: string;
    /**
     * A particular approach used in an operation; for example, "facebook" or "email" in the context of a sign_up or login event.
     */
    method: string;
  }

  export interface SignUpEventParameters {
    /**
     * A particular approach used in an operation; for example, "facebook" or "email" in the context of a sign_up or login event.
     */
    method: string;
  }

  export interface SpendVirtualCurrencyEventParameters {
    /**
     * An item name.
     */
    item_name: string;
    /**
     * Name of virtual currency type. E.g. `gems`.
     */
    virtual_currency_name: string;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value: number;
  }

  export interface UnlockAchievementEventParameters {
    /**
     * Game achievement ID (String).
     */
    achievement_id: string;
  }

  export interface ViewCartEventParameters {
    items?: Item[];
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
  }

  export interface ViewItemEventParameters {
    items?: Item[];
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
  }

  export interface ViewSearchResultsParameters {
    /**
     * The search string/keywords used.
     */
    search_term: string;
  }

  export interface ViewItemListEventParameters {
    items?: Item[];
    /**
     * The ID of the list in which the item was presented to the user
     */
    item_list_id?: string;
    /**
     * The name of the list in which the item was presented to the user
     */
    item_list_name?: string;
  }

  export interface ViewPromotionEventParameters {
    items?: Item[];
    /**
     * The location associated with the event. Preferred to be the Google Place ID that corresponds to the associated item but could be overridden to a custom location ID string
     */
    location_id?: string;
    /**
     * The name of a creative used in a promotional spot
     */
    creative_name?: string;
    /**
     * The name of a creative slot
     */
    creative_slot?: string;
    /**
     * The ID of a product promotion
     */
    promotion_id?: string;
    /**
     * The name of a product promotion
     */
    promotion_name?: string;
  }

  export interface AddShippingInfoParameters {
    items?: Item[];
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * Coupon code for a purchasable item.
     */
    coupon?: string;
    /**
     * The shipping tier (e.g. Ground, Air, Next-day) selected for delivery of the purchased item
     */
    shipping_tier?: string;
  }

  /**
   * Unsupported in "Enhanced Ecommerce reports":
   * https://firebase.google.com/docs/reference/android/com/google/firebase/analytics/FirebaseAnalytics.Event#public-static-final-string-view_search_results
   */
  // export interface ViewSearchResults {
  //   /**
  //    * The search string/keywords used.
  //    */
  //   search_term: string;
  // }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Statics {}

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
    /**
     * If true, this config or event call applies globally to all Google Analytics properties on the page. Web only.
     */
    global: boolean;
  }

  /**
   * A set of common Google Analytics config settings recognized by gtag.js. Web only.
   */
  export interface GtagConfigParams {
    /**
     * Whether or not a page view should be sent.
     * If set to true (default), a page view is automatically sent upon initialization
     * of analytics.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/page-view | Page views }
     */
    send_page_view?: boolean;
    /**
     * The title of the page.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/page-view | Page views }
     */
    page_title?: string;
    /**
     * The URL of the page.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/page-view | Page views }
     */
    page_location?: string;
    /**
     * Defaults to `auto`.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/cookies-user-id | Cookies and user identification }
     */
    cookie_domain?: string;
    /**
     * Defaults to 63072000 (two years, in seconds).
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/cookies-user-id | Cookies and user identification }
     */
    cookie_expires?: number;
    /**
     * Defaults to `_ga`.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/cookies-user-id | Cookies and user identification }
     */
    cookie_prefix?: string;
    /**
     * If set to true, will update cookies on each page load.
     * Defaults to true.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/cookies-user-id | Cookies and user identification }
     */
    cookie_update?: boolean;
    /**
     * Appends additional flags to the cookie when set.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/cookies-user-id | Cookies and user identification }
     */
    cookie_flags?: string;
    /**
     * If set to false, disables all advertising features with `gtag.js`.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/display-features | Disable advertising features }
     */
    allow_google_signals?: boolean;
    /**
     * If set to false, disables all advertising personalization with `gtag.js`.
     * See {@link https://developers.google.com/analytics/devguides/collection/ga4/display-features | Disable advertising features }
     */
    allow_ad_personalization_signals?: boolean;

    [key: string]: unknown;
  }

  /**
   * Standard gtag.js event parameters. For more information, see the GA4 reference documentation. Web only.
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
    /**
     * Firebase-specific. Use to log a `screen_name` to Firebase Analytics.
     */
    firebase_screen?: string;
    /**
     * Firebase-specific. Use to log a `screen_class` to Firebase Analytics.
     */
    firebase_screen_class?: string;
    search_term?: string;
    shipping?: Currency;
    tax?: Currency;
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
   * Consent status settings for each consent type.
   * For more information, see
   * {@link https://developers.google.com/tag-platform/tag-manager/templates/consent-apis
   * | the GA4 reference documentation for consent state and consent types}.
   */
  export interface ConsentSettings {
    /** Enables storage, such as cookies, related to advertising */
    ad_storage?: boolean;
    /** Sets consent for sending user data to Google for online advertising purposes */
    ad_user_data?: boolean;
    /** Sets consent for personalized advertising */
    ad_personalization?: boolean;
    /** Enables storage, such as cookies, related to analytics (for example, visit duration) */
    analytics_storage?: boolean;
    /**
     * Enables storage that supports the functionality of the website or app such as language settings
     */
    functionality_storage?: boolean;
    /** Enables storage related to personalization such as video recommendations */
    personalization_storage?: boolean;
    /**
     * Enables storage related to security such as authentication functionality, fraud prevention,
     * and other user protection.
     */
    security_storage?: ConsentStatusString;

    [key: string]: unknown;
  }

  /**
   * Specifies custom options for your Firebase Analytics instance.
   * You must set these before initializing `firebase.analytics()`.
   */
  export interface SettingsOptions {
    /** Sets custom name for `gtag` function. */
    gtagName?: string;
    /** Sets custom name for `dataLayer` array used by `gtag.js`. */
    dataLayerName?: string;
  }

  /**
   * The Firebase Analytics service interface.
   *
   * > This module is available for the default app only.
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
     * Log a custom event with optional params. Note that there are various limits that applied
     * to event parameters (total parameter count, etc), but analytics applies the limits during
     * cloud processing, the errors will not be seen as Promise rejections when you call logEvent.
     * While integrating this API in your app you are strongly encouraged to enable
     * [DebugView](https://firebase.google.com/docs/analytics/debugview) -
     * any errors in your events will show up in the firebase web console with links to relevant documentation
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logEvent('product_view', {
     *   id: '1234',
     * });
     * ```
     *
     * > 100 characters is the maximum length for param key names.
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
     * // Disable collection
     * await firebase.analytics().setAnalyticsCollectionEnabled(false);
     * ```
     *
     * @param enabled A boolean value representing whether Analytics collection is enabled or disabled. Analytics collection is enabled by default.
     */
    setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;

    /**
     * Sets the duration of inactivity that terminates the current session.
     *
     * #### Example
     *
     * ```js
     * // 20 minutes
     * await firebase.analytics().setMinimumSessionDuration(900000);
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
     * On iOS, Firebase SDK may return an error that is handled internally and may take many minutes to return a valid value. Check native debug logs for more details.
     *
     * #### Example
     *
     * ```js
     * const sessionId = await firebase.analytics().getSessionId();
     * ```
     *
     * @returns Returns the session id or null if session is expired, null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
     */
    getSessionId(): Promise<number | null>;

    /**
     * Gives a user a unique identification.
     *
     * #### Example
     *
     * ```js
     * // Set User
     * await firebase.analytics().setUserId('123456789');
     * // Remove User
     * await firebase.analytics().setUserId(null);
     * ```
     *
     * @param id Set to null to remove a previously assigned ID from analytics
     * events
     */
    setUserId(id: string | null): Promise<void>;

    /**
     * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setUserProperty('account_type', 'gold');
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
     *   account_type: 'gold',
     *   account_name: 'Gold Badge',
     * });
     * ```
     *
     * > When you set user properties, be sure to never include personally identifiable information such as names, social security numbers, or email addresses, even in hashed form.
     *
     * @react-native-firebase
     * @param properties Set a property value to null to remove it.
     * @param options Additional options that can be passed. Web only.
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
     * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported
     * automatically for Google Play-based apps.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `purchase`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logPurchase({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     */
    logPurchase(params: PurchaseEventParameters): Promise<void>;

    /**
     * Sets or clears the screen name and class the user is currently viewing
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logScreenView({
     *   screen_class: 'ProductScreen',
     *   screen_name: 'ProductScreen',
     * });
     * ```
     *
     */
    logScreenView(params: ScreenViewParameters): Promise<void>;

    /**
     * Add Payment Info event. This event signifies that a user has submitted their payment information to your app.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `add_payment_info`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logAddPaymentInfo({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     */
    logAddPaymentInfo(params: AddPaymentInfoEventParameters): Promise<void>;

    /**
     * E-Commerce Add To Cart event.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `add_to_cart`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logAddToCart({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.AddToCartEventParameters}.
     */
    logAddToCart(params: AddToCartEventParameters): Promise<void>;

    /**
     * E-Commerce Add To Wishlist event. This event signifies that an item was added to a wishlist.
     * Use this event to identify popular gift items in your app.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `add_to_wishlist`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logAddToWishlist({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.AddToWishlistEventParameters}.
     */
    logAddToWishlist(params: AddToWishlistEventParameters): Promise<void>;

    /**
     * E-Commerce Add Shipping Info event. This event signifies that a user has submitted their shipping information.
     * Use this event to identify popular gift items in your app.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `add_shipping_info`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logAddShippingInfo({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.AddShippingInfoParameters}.
     */
    logAddShippingInfo(params: AddShippingInfoParameters): Promise<void>;

    /**
     * App Open event. By logging this event when an App is moved to the foreground, developers can
     * understand how often users leave and return during the course of a Session. Although Sessions
     * are automatically reported, this event can provide further clarification around the continuous
     * engagement of app-users.
     *
     * Logged event name: `app_open`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logAppOpen();
     * ```
     */
    logAppOpen(): Promise<void>;

    /**
     * E-Commerce Begin Checkout event. This event signifies that a user has begun the process of
     * checking out.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `begin_checkout`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logBeginCheckout({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.BeginCheckoutEventParameters}.
     */
    logBeginCheckout(params?: BeginCheckoutEventParameters): Promise<void>;

    /**
     * Log this event to supply the referral details of a re-engagement campaign.
     *
     * Logged event name: `campaign_details`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logCampaignDetails({
     *   source: 'email',
     *   medium: 'cta_button',
     *   campaign: 'newsletter',
     * });
     * ```
     *
     * @param params See {@link analytics.CampaignDetailsEventParameters}.
     */
    logCampaignDetails(params: CampaignDetailsEventParameters): Promise<void>;

    /**
     * View Promotion event. This event signifies that a promotion was shown to a user.
     *
     * Logged event name: `view_promotion`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logViewPromotion({
     *   creative_name: 'the promotion',
     *   creative_slot: 'evening',
     *   location_id: 'london',
     *   promotion_id: '230593',
     *   promotion_name: 'london evening event',
     * });
     * ```
     *
     * @param params See {@link analytics.ViewPromotionEventParameters}.
     */
    logViewPromotion(params: ViewPromotionEventParameters): Promise<void>;

    /**
     * Earn Virtual Currency event. This event tracks the awarding of virtual currency in your app. Log this along with
     * {@link analytics.logSpendVirtualCurrency} to better understand your virtual economy.
     *
     * Logged event name: `earn_virtual_currency`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logEarnVirtualCurrency({
     *   virtual_currency_name: 'coins',
     *   value: 100,
     * });
     * ```
     *
     * @param params See {@link analytics.EarnVirtualCurrencyEventParameters}.
     */
    logEarnVirtualCurrency(params: EarnVirtualCurrencyEventParameters): Promise<void>;

    /**
     * Generate Lead event. Log this event when a lead has been generated in the app to understand
     * the efficacy of your install and re-engagement campaigns.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `generate_lead`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logGenerateLead({
     *   currency: 'USD',
     *   value: 123,
     * });
     * ```
     *
     * @param params See {@link analytics.GenerateLeadEventParameters}.
     */
    logGenerateLead(params?: GenerateLeadEventParameters): Promise<void>;

    /**
     * Join Group event. Log this event when a user joins a group such as a guild, team or family.
     * Use this event to analyze how popular certain groups or social features are in your app
     *
     * Logged event name: `join_group`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logJoinGroup({
     *   group_id: '12345',
     * });
     * ```
     *
     * @param params See {@link analytics.JoinGroupEventParameters}.
     */
    logJoinGroup(params: JoinGroupEventParameters): Promise<void>;

    /**
     * Level End event.
     *
     * Logged event name: `level_end`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logLevelEnd({
     *   level: 12,
     *   success: 'true'
     * });
     * ```
     *
     * @param params See {@link analytics.LevelEndEventParameters}.
     */
    logLevelEnd(params: LevelEndEventParameters): Promise<void>;

    /**
     * Level Start event.
     *
     * Logged event name: `level_start`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logLevelStart({
     *   level: 12,
     * });
     * ```
     *
     * @param params See {@link analytics.LevelStartEventParameters}.
     */
    logLevelStart(params: LevelStartEventParameters): Promise<void>;

    /**
     * Level Up event. This event signifies that a player has leveled up in your gaming app.
     * It can help you gauge the level distribution of your userbase and help you identify certain levels that are difficult to pass.
     *
     * Logged event name: `level_up`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logLevelUp({
     *   level: 12,
     *   character: 'Snake',
     * });
     * ```
     *
     * @param params See {@link analytics.LevelUpEventParameters}.
     */
    logLevelUp(params: LevelUpEventParameters): Promise<void>;

    /**
     * Login event. Apps with a login feature can report this event to signify that a user has logged in.
     *
     * Logged event name: `login`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logLogin({
     *   method: 'facebook.com',
     * });
     * ```
     *
     * @param params See {@link analytics.LoginEventParameters}.
     */
    logLogin(params: LoginEventParameters): Promise<void>;

    /**
     * Post Score event. Log this event when the user posts a score in your gaming app. This event can
     * help you understand how users are actually performing in your game and it can help you correlate
     * high scores with certain audiences or behaviors.
     *
     * Logged event name: `post_score`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logPostScore({
     *   score: 567334,
     *   level: 3,
     *   character: 'Pete',
     * });
     * ```
     *
     * @param params See {@link analytics.PostScoreEventParameters}.
     */
    logPostScore(params: PostScoreEventParameters): Promise<void>;

    /**
     * Remove from cart event.
     *
     * Logged event name: `remove_from_cart`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logRemoveFromCart({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.RemoveFromCartEventParameters}.
     */
    logRemoveFromCart(params: RemoveFromCartEventParameters): Promise<void>;

    /**
     * E-Commerce Refund event. This event signifies that a refund was issued.
     *
     * Logged event name: `remove_from_cart`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logRefund({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.RefundEventParameters}.
     */
    logRefund(params: RefundEventParameters): Promise<void>;

    /**
     * Search event. Apps that support search features can use this event to contextualize search
     * operations by supplying the appropriate, corresponding parameters. This event can help you
     * identify the most popular content in your app.
     *
     * Logged event name: `search`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logSearch({
     *  search_term: 't-shirts',
     * });
     * ```
     *
     * @param params See {@link analytics.SearchEventParameters}.
     */
    logSearch(params: SearchEventParameters): Promise<void>;

    /**
     * Select Content event. This general purpose event signifies that a user has selected some
     * content of a certain type in an app. The content can be any object in your app. This event
     * can help you identify popular content and categories of content in your app.
     *
     * Logged event name: `select_content`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logSelectContent({
     *  content_type: 'clothing',
     *  item_id: 'abcd',
     * });
     * ```
     *
     * @param params See {@link analytics.SelectContentEventParameters}.
     */
    logSelectContent(params: SelectContentEventParameters): Promise<void>;

    /**
     * Select Item event. This event signifies that an item was selected by a user from a list.
     * Use the appropriate parameters to contextualize the event.
     * Use this event to discover the most popular items selected.
     *
     * Logged event name: `select_item`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logSelectItem({
     *  item_list_id: '54690834',
     *  item_list_name: 't-shirts',
     *  items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.SelectItemEventParameters}.
     */
    logSelectItem(params: SelectItemEventParameters): Promise<void>;

    /**
     * Set checkout option event.
     *
     * Logged event name: `set_checkout_option`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logSetCheckoutOption({
     *   checkout_step: 2,
     *   checkout_option: 'false',
     * });
     * ```
     *
     * @param params See {@link analytics.SetCheckoutOptionEventParameters}.
     */
    logSetCheckoutOption(params: any): Promise<void>;

    /**
     * Share event. Apps with social features can log the Share event to identify the most viral content.
     *
     * Logged event name: `share`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logShare({
     *   content_type: 't-shirts',
     *   item_id: '12345',
     *   method: 'twitter.com',
     * });
     * ```
     *
     * @param params See {@link analytics.ShareEventParameters}.
     */
    logShare(params: ShareEventParameters): Promise<void>;

    /**
     * Sign Up event. This event indicates that a user has signed up for an account in your app.
     * The parameter signifies the method by which the user signed up. Use this event to understand
     * the different behaviors between logged in and logged out users.
     *
     * Logged event name: `sign_up`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logSignUp({
     *   method: 'facebook.com',
     * });
     * ```
     *
     * @param params See {@link analytics.SignUpEventParameters}.
     */
    logSignUp(params: SignUpEventParameters): Promise<void>;

    /**
     * Spend Virtual Currency event. This event tracks the sale of virtual goods in your app and can
     * help you identify which virtual goods are the most popular objects of purchase.
     *
     * Logged event name: `spend_virtual_currency`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logSpendVirtualCurrency({
     *   item_name: 'battle_pass',
     *   virtual_currency_name: 'coins',
     *   value: 100,
     * });
     * ```
     *
     * @param params See {@link analytics.SpendVirtualCurrencyEventParameters}.
     */
    logSpendVirtualCurrency(params: SpendVirtualCurrencyEventParameters): Promise<void>;

    /**
     * Tutorial Begin event. This event signifies the start of the on-boarding process in your app.
     * Use this in a funnel with {@link analytics#logTutorialComplete} to understand how many users
     * complete this process and move on to the full app experience.
     *
     * Logged event name: `tutorial_begin`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logTutorialBegin();
     * ```
     */
    logTutorialBegin(): Promise<void>;

    /**
     * Tutorial End event. Use this event to signify the user's completion of your app's on-boarding process.
     * Add this to a funnel with {@link analytics#logTutorialBegin} to understand how many users
     * complete this process and move on to the full app experience.
     *
     * Logged event name: `tutorial_complete`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logTutorialComplete();
     * ```
     */
    logTutorialComplete(): Promise<void>;

    /**
     * Select promotion event. This event signifies that a user has selected a promotion offer. Use the
     * appropriate parameters to contextualize the event, such as the item(s) for which the promotion applies.
     *
     * Logged event name: `select_promotion`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logSelectPromotion({
     *   creative_name: 'the promotion',
     *   creative_slot: 'evening',
     *   location_id: 'london',
     *   promotion_id: '230593',
     *   promotion_name: 'london evening event',
     * });
     * ```
     * @param params See {@link analytics.SelectPromotionEventParameters}.
     */
    logSelectPromotion(params: SelectPromotionEventParameters): Promise<void>;

    /**
     * Unlock Achievement event. Log this event when the user has unlocked an achievement in your game.
     * Since achievements generally represent the breadth of a gaming experience, this event can help
     * you understand how many users are experiencing all that your game has to offer.
     *
     * Logged event name: `unlock_achievement`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logUnlockAchievement({
     *   achievement_id: '12345',
     * });
     * ```
     *
     * @param params See {@link analytics.UnlockAchievementEventParameters}.
     */
    logUnlockAchievement(params: UnlockAchievementEventParameters): Promise<void>;

    /**
     * View Item event. This event signifies that some content was shown to the user. This content
     * may be a product, a screen or just a simple image or text. Use the appropriate parameters
     * to contextualize the event. Use this event to discover the most popular items viewed in your app.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `view_item`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logViewItem({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.ViewItemEventParameters}.
     */
    logViewItem(params: ViewItemEventParameters): Promise<void>;

    /**
     * E-commerce View Cart event. This event signifies that a user has viewed their cart. Use this to analyze your purchase funnel.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `view_cart`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logViewCart({
     *   value: 100,
     *   currency: 'usd',
     *   items: [{
     *     item_brand: 'cool-shirt-brand',
     *     item_id: '23456',
     *     item_name: 'orange t-shirt',
     *     item_category: 'round necked t-shirts',
     *   }]
     * });
     * ```
     *
     * @param params See {@link analytics.ViewCartEventParameters}.
     */
    logViewCart(params: ViewCartEventParameters): Promise<void>;

    /**
     * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
     *
     * Logged event name: `view_item_list`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logViewItemList({
     *   item_list_name: 't-shirts',
     * });
     * ```
     *
     * @param params See {@link analytics.ViewItemListEventParameters}.
     */
    logViewItemList(params: ViewItemListEventParameters): Promise<void>;

    /**
     * View Search Results event. Log this event when the user has been presented with the results of a search.
     *
     * Logged event name: `view_search_results`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logViewSearchResults({
     *   search_term: 'clothing',
     * });
     * ```
     *
     * @param params See {@link analytics.ViewSearchResultsParameters}.
     */
    logViewSearchResults(params: ViewSearchResultsParameters): Promise<void>;

    /**
     * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setDefaultEventParameters({
     *   userId: '1234',
     * });
     * ```
     *
     *
     * @param params Parameters to be added to the map of parameters added to every event.
     * They will be added to the map of default event parameters, replacing any existing
     * parameter with the same name. Valid parameter values are String, long, and double.
     * Setting a key's value to null will clear that parameter. Passing in a null bundle
     * will clear all parameters.
     */
    setDefaultEventParameters(params?: { [key: string]: any }): Promise<void>;

    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
     *
     * @platform ios
     * @param emailAddress email address, properly formatted complete with domain name e.g, 'user@example.com'
     */
    initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress: string): Promise<void>;

    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
     * You need to pass the sha256-hashed of normalized email address to this function. See [this link](https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials) for more information.
     *
     * @platform ios
     * @param hashedEmailAddress sha256-hashed of normalized email address, properly formatted complete with domain name e.g, 'user@example.com'
     */
    initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
      hashedEmailAddress: string,
    ): Promise<void>;

    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
     *
     * @platform ios
     * @param phoneNumber phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
     */
    initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber: string): Promise<void>;

    /**
     * Start privacy-sensitive on-device conversion management.
     * This is iOS-only.
     * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
     * You need to pass the sha256-hashed of phone number in E.164 format. See [this link](https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials) for more information.
     *
     * @platform ios
     * @param hashedPhoneNumber sha256-hashed of normalized phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
     */
    initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
      hashedPhoneNumber: string,
    ): Promise<void>;

    /**
     * For Consent Mode!
     *
     * #### Example
     *
     * ```js
     * // Disable consent
     * await firebase.analytics().setConsent({
     *  ad_personalization: false,
     *  analytics_storage: false,
     *  ad_storage: false,
     *  ad_user_data: false,
     * });
     * ```
     *
     * Sets the applicable end user consent state (e.g., for device identifiers) for this app on this device.
     * Use the consent map to specify individual consent type values.
     * Settings are persisted across app sessions.
     * @param consentSettings Consent status settings for each consent type.
     */
    setConsent(consentSettings: ConsentSettings): Promise<void>;
  }

  /**
   * Any custom event name string not in the standard list of recommended event names.
   */
  export declare type CustomEventName<T> = T extends EventNameString ? never : T;
  /**
   * Type for standard Google Analytics event names. logEvent also accepts any custom string and interprets it as a custom event name.
   * See https://firebase.google.com/docs/reference/js/analytics.md#eventnamestring
   */
  export declare type EventNameString =
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

export * from './modular';

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
