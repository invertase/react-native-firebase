/**
 * A currency amount.
 */
export type Currency = number;

/**
 * Consent status string values.
 */
export type ConsentStatusString = 'granted' | 'denied';

/**
 * Promotion object for analytics events.
 */
export interface Promotion {
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
  [key: string]: any;
}

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
  [key: string]: string | number | undefined;
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
