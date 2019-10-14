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

  export interface AddToCartEventParameters {
    /**
     * An item ID.
     */
    item_id: string;
    /**
     * An item name.
     */
    item_name: string;
    /**
     * An item category.
     */
    item_category: string;
    /**
     * Purchase quantity.
     */
    quantity: number;
    /**
     * Purchase price.
     */
    price?: number;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * Flight or Travel origin. E.g. `Mountain View, CA`.
     */
    origin?: string;
    /**
     * The Google [Place ID](https://developers.google.com/places/place-id) that corresponds to the associated item (String). Alternatively, you can supply your own custom Location ID.
     */
    item_location_id?: string;
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
  }

  export interface AddToWishlistEventParameters {
    /**
     * An item ID.
     */
    item_id: string;
    /**
     * An item name.
     */
    item_name: string;
    /**
     * An item category.
     */
    item_category: string;
    /**
     * Purchase quantity.
     */
    quantity: number;
    /**
     * Purchase price.
     */
    price?: number;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * The Google [Place ID](https://developers.google.com/places/place-id) that corresponds to the associated item (String). Alternatively, you can supply your own custom Location ID.
     */
    item_location_id?: string;
  }

  export interface BeginCheckoutEventParameters {
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * A single ID for a ecommerce group transaction.
     */
    transaction_id?: string;
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

  export interface EcommercePurchaseEventParameters {
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
     * A single ID for a ecommerce group transaction.
     */
    transaction_id?: string;
    /**
     * Tax amount.
     */
    tax?: number;
    /**
     * Shipping cost.
     */
    shipping?: number;
    /**
     * Coupon code for a purchasable item.
     */
    coupon?: string;
    /**
     * The Google [Place ID](https://developers.google.com/places/place-id) that corresponds to the associated event. Alternatively, you can supply your own custom Location ID.
     */
    location?: string;
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
    score: int;
    /**
     * Level in game.
     */
    level?: int;
    /**
     * Character used in game.
     */
    character?: string;
  }

  export interface PresentOfferEventParameters {
    /**
     * Score in game.
     */
    score: int;
    /**
     * Level in game.
     */
    level?: int;
    /**
     * Character used in game.
     */
    character?: string;
  }

  export interface PurchaseRefundEventParameters {
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
     * A single ID for a ecommerce group transaction.
     */
    transaction_id?: string;
  }

  export interface RemoveFromCartEventParameters {
    /**
     * An item ID.
     */
    item_id: string;
    /**
     * An item name.
     */
    item_name: string;
    /**
     * An item category.
     */
    item_category: string;
    /**
     * Purchase quantity.
     */
    quantity?: number;
    /**
     * A context-specific numeric value which is accumulated automatically for each event type. Values
     * can include revenue, distance, time and points. When a value is set, the accompanying `currency`
     * parameter should also be defined.
     */
    value?: number;
    /**
     * Purchase price.
     */
    price?: number;
    /**
     * Purchase currency in 3 letter [ISO_4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) format. E.g. `USD`.
     */
    currency?: string;
    /**
     * The Google [Place ID](https://developers.google.com/places/place-id) that corresponds to the associated item (String). Alternatively, you can supply your own custom Location ID.
     */
    item_location_id?: string;
    /**
     * The departure date, check-in date, or rental start date for the item (String). The parameter expects a date formatted as YYYY-MM-DD.
     */
    start_date?: string;
    /**
     * The arrival date, check-out date, or rental end date for the item (String). The parameter expects a date formatted as YYYY-MM-DD.
     */
    end_date?: string;
    /**
     * Flight or Travel origin. E.g. `Mountain View, CA`.
     */
    origin?: string;
    /**
     * Flight or Travel destination. E.g. `Mountain View, CA`.
     */
    destination?: string;
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

  export interface SetCheckoutOptionEventParameters {
    /**
     * The checkout step (1..N).
     */
    checkout_step: number;
    /**
     * Some option on a step in an ecommerce flow.
     */
    checkout_option: string;
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

  export interface ViewItemEventParameters {
    /**
     * An item ID.
     */
    item_id: string;
    /**
     * An item name.
     */
    item_name: string;
    /**
     * An item category.
     */
    item_category: string;
    /**
     * The Google [Place ID](https://developers.google.com/places/place-id) that corresponds to the associated item (String). Alternatively, you can supply your own custom Location ID.
     */
    item_location_id?: string;
    /**
     * Purchase price.
     */
    price?: number;
    /**
     * Purchase quantity.
     */
    quantity?: number;
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
     * Flight number for travel events.
     */
    flight_number?: string;
    /**
     * Number of passengers traveling.
     */
    number_of_passengers?: number;
    /**
     * Number of nights staying at hotel.
     */
    number_of_nights?: number;
    /**
     * Number of rooms for travel events.
     */
    number_of_rooms?: number;
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
     * The search string/keywords used.
     */
    search_term?: string;
    /**
     * Travel class. E.g. `business`.
     */
    travel_class?: string;
  }

  export interface ViewItemListEventParameters {
    /**
     * An item category.
     */
    item_category: string;
  }

  export interface ViewSearchResults {
    /**
     * The search string/keywords used.
     */
    search_term: string;
  }

  export interface Statics {}

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
     * Log a custom event with optional params.
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
     */
    logEvent(name: string, params: { [key: string]: string | number | boolean }): Promise<void>;

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
     * Sets the current screen name.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setCurrentScreen('ProductScreen', 'ProductScreen');
     * ```
     *
     * > Whilst screenClassOverride is optional, it is recommended it is
     * always sent as your current class name. For example on Android it will always
     * show as 'MainActivity' if you do not specify it.
     *
     * @param screenName A screen name, e.g. Product.
     * @param screenClassOverride On Android, React Native runs in a single activity called
     * 'MainActivity'. Setting this parameter overrides the default name shown on logs.
     */
    setCurrentScreen(screenName: string, screenClassOverride?: string): Promise<void>;

    /**
     * Sets the minimum engagement time required before starting a session.
     *
     * #### Example
     *
     * ```js
     * // 20 seconds
     * await firebase.analytics().setMinimumSessionDuration(20000);
     * ```
     *
     * @param milliseconds The default value is 10000 (10 seconds).
     */
    setMinimumSessionDuration(milliseconds?: number): Promise<void>;

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
     */
    setUserProperties(properties: { [key: string]: string | null }): Promise<void>;

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
     * Add Payment Info event. This event signifies that a user has submitted their payment information to your app.
     *
     * Logged event name: `add_payment_info`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logAddPaymentInfo();
     * ```
     */
    logAddPaymentInfo(): Promise<void>;

    /**
     * E-Commerce Add To Cart event. This event signifies that an item was added to a cart for purchase.
     * Add this event to a funnel with {@link analytics#logEcommercePurchase} to gauge the effectiveness of your checkout process.
     *
     * If you supply the VALUE parameter, you must also supply the CURRENCY parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `add_to_cart`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logAddToCart({
     *   item_id: 'abcd',
     *   item_name: 't-shirt 1',
     *   item_category: 'shirts',
     *   quantity: 2,
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
     *   item_id: 'abcd',
     *   item_name: 't-shirt 1',
     *   item_category: 'shirts',
     *   quantity: 2,
     * });
     * ```
     *
     * @param params See {@link analytics.AddToWishlistEventParameters}.
     */
    logAddToWishlist(params: AddToWishlistEventParameters): Promise<void>;

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
     * checking out. Add this event to a funnel with your {@link analytics#logEcommercePurchase} event to gauge the
     * effectiveness of your checkout process.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `begin_checkout`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logBeginCheckout({
     *  travel_class: 'business',
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
     * E-Commerce Purchase event. This event signifies that an item was purchased by a user. This is
     * different from the in-app purchase event, which is reported automatically for Google Play-based apps.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `ecommerce_purchase`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logEcommercePurchase({
     *   coupon: 'BOGOFF',
     * });
     * ```
     *
     * @param params See {@link analytics.EcommercePurchaseEventParameters}.
     */
    logEcommercePurchase(params?: EcommercePurchaseEventParameters): Promise<void>;

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
     * Present Offer event. This event signifies that the app has presented a purchase offer to a user.
     * Add this event to a funnel with the {@link analytics#logAddToCart} and {@link analytics#logEcommercePurchase}
     * to gauge your conversion process.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `present_offer`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logPresentOffer({
     *   item_id: 'abcd',
     *   item_name: 't-shirt',
     *   item_category: 'shirts',
     *   quantity: 1,
     *   price: 9.99,
     * });
     * ```
     *
     * @param params See {@link analytics.PresentOfferEventParameters}.
     */
    logPresentOffer(params: PresentOfferEventParameters): Promise<void>;

    /**
     * E-Commerce Purchase Refund event. This event signifies that an item purchase was refunded.
     *
     * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
     *
     * Logged event name: `purchase_refund`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logPurchaseRefund({
     *  transaction_id: 'abcd',
     * });
     * ```
     *
     * @param params See {@link analytics.PurchaseRefundEventParameters}.
     */
    logPurchaseRefund(params?: PurchaseRefundEventParameters): Promise<void>;

    /**
     * Remove from cart event.
     *
     * Logged event name: `remove_from_cart`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logRemoveFromCart({
     *   item_id: 'abcd',
     *   item_name: 't-shirt',
     *   item_category: 'shirts',
     * });
     * ```
     *
     * @param params See {@link analytics.RemoveFromCartEventParameters}.
     */
    logRemoveFromCart(params: RemoveFromCartEventParameters): Promise<void>;

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
    logSetCheckoutOption(params: SetCheckoutOptionEventParameters): Promise<void>;

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
     *  item_id: 'abcd',
     *  item_name: 't-shirt',
     *  item_category: 'shirts',
     * });
     * ```
     *
     * @param params See {@link analytics.ViewItemEventParameters}.
     */
    logViewItem(params: ViewItemEventParameters): Promise<void>;

    /**
     * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
     *
     * Logged event name: `view_item_list`
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logViewItemList({
     *   item_category: 't-shirts',
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
     * @param params See {@link analytics.ViewSearchResults}.
     */
    logViewSearchResults(params: ViewSearchResults): Promise<void>;
  }
}

declare module '@react-native-firebase/analytics' {
  // tslint:disable-next-line:no-duplicate-imports required otherwise doesn't work
  import { ReactNativeFirebase } from '@react-native-firebase/app';
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const defaultExport: FirebaseModuleWithStatics<
    FirebaseAnalyticsTypes.Module,
    FirebaseAnalyticsTypes.Statics
  >;
  export default defaultExport;
}

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

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    /**
     * Disable or enable auto collection of analytics data.
     *
     * This is useful for opt-in-first data flows, for example when dealing with GDPR compliance.
     * This can be overridden in JavaScript.
     *
     * #### Example
     *
     * ```json
     * // <project-root>/firebase.json
     * {
     *   "react-native": {
     *     "analytics_auto_collection_enabled": false
     *   }
     * }
     * ```
     *
     * ```js
     * // Re-enable analytics data collection, e.g. once user has granted permission:
     * await firebase.analytics().setAnalyticsCollectionEnabled(true);
     * ```
     */
    analytics_auto_collection_enabled: boolean;
  }
}
