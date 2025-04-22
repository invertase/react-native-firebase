import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseAnalyticsTypes } from '..';
import Analytics = FirebaseAnalyticsTypes.Module;
import AnalyticsCallOptions = FirebaseAnalyticsTypes.AnalyticsCallOptions;
import EventParams = FirebaseAnalyticsTypes.EventParams;
import FirebaseApp = ReactNativeFirebase.FirebaseApp;

/**
 * Returns an Analytics instance for the given app.
 *
 * @param app - FirebaseApp. Optional.
 */
export declare function getAnalytics(app?: FirebaseApp): Analytics;

/**
 * Returns an Analytics instance for the given app.
 *
 * @param app - FirebaseApp.
 * @param options - `AnalyticsSettings`. Web only.
 */
export declare function initializeAnalytics(
  app: FirebaseApp,
  options?: FirebaseAnalyticsTypes.AnalyticsSettings,
): Analytics;

/**
 * Retrieves a unique Google Analytics identifier for the web client.
 *
 * @param analyticsInstance - Instance of analytics (web - only)
 *
 */
export declare function getGoogleAnalyticsClientId(analyticsInstance: Analytics): Promise<string>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'add_payment_info',
  params?: {
    coupon?: EventParams['coupon'];
    currency?: EventParams['currency'];
    items?: EventParams['items'];
    payment_type?: EventParams['payment_type'];
    value?: EventParams['value'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'purchase' | 'refund',
  params?: {
    value?: EventParams['value'];
    currency?: EventParams['currency'];
    transaction_id: EventParams['transaction_id'];
    tax?: EventParams['tax'];
    shipping?: EventParams['shipping'];
    items?: EventParams['items'];
    coupon?: EventParams['coupon'];
    affiliation?: EventParams['affiliation'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'screen_view',
  params?: {
    firebase_screen: EventParams['firebase_screen'];
    firebase_screen_class: EventParams['firebase_screen_class'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'search' | 'view_search_results',
  params?: {
    search_term?: EventParams['search_term'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'select_content',
  params?: {
    content_type?: EventParams['content_type'];
    item_id?: EventParams['item_id'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'select_item',
  params?: {
    items?: EventParams['items'];
    item_list_name?: EventParams['item_list_name'];
    item_list_id?: EventParams['item_list_id'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'select_promotion' | 'view_promotion',
  params?: {
    items?: EventParams['items'];
    promotion_id?: EventParams['promotion_id'];
    promotion_name?: EventParams['promotion_name'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'set_checkout_option',
  params?: {
    checkout_step?: EventParams['checkout_step'];
    checkout_option?: EventParams['checkout_option'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'share',
  params?: {
    method?: EventParams['method'];
    content_type?: EventParams['content_type'];
    item_id?: EventParams['item_id'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'sign_up',
  params?: {
    method?: EventParams['method'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'timing_complete',
  params?: {
    name: string;
    value: number;
    event_category?: string;
    event_label?: string;
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'add_shipping_info',
  params?: {
    coupon?: EventParams['coupon'];
    currency?: EventParams['currency'];
    items?: EventParams['items'];
    shipping_tier?: EventParams['shipping_tier'];
    value?: EventParams['value'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'view_cart' | 'view_item',
  params?: {
    currency?: EventParams['currency'];
    items?: EventParams['items'];
    value?: EventParams['value'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'view_item_list',
  params?: {
    items?: EventParams['items'];
    item_list_name?: EventParams['item_list_name'];
    item_list_id?: EventParams['item_list_id'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent<T extends string>(
  analytics: Analytics,
  name: FirebaseAnalyticsTypes.CustomEventName<T>,
  params?: {
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'add_to_cart' | 'add_to_wishlist' | 'remove_from_cart',
  params?: {
    currency?: EventParams['currency'];
    value?: EventParams['value'];
    items?: EventParams['items'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'begin_checkout',
  params?: {
    currency?: EventParams['currency'];
    coupon?: EventParams['coupon'];
    value?: EventParams['value'];
    items?: EventParams['items'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'checkout_progress',
  params?: {
    currency?: EventParams['currency'];
    coupon?: EventParams['coupon'];
    value?: EventParams['value'];
    items?: EventParams['items'];
    checkout_step?: EventParams['checkout_step'];
    checkout_option?: EventParams['checkout_option'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'exception',
  params?: {
    description?: EventParams['description'];
    fatal?: EventParams['fatal'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'generate_lead',
  params?: {
    value?: EventParams['value'];
    currency?: EventParams['currency'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'login',
  params?: {
    method?: EventParams['method'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

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
export declare function logEvent(
  analytics: Analytics,
  name: 'page_view',
  params?: {
    page_title?: string;
    page_location?: string;
    page_path?: string;
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

/**
 * If true, allows the device to collect analytical data and send it to
 * Firebase. Useful for GDPR.
 */
export declare function setAnalyticsCollectionEnabled(
  analyticsInstance: Analytics,
  enabled: boolean,
): Promise<void>;

/**
 * Sets the duration of inactivity that terminates the current session.
 *
 * @param analytics Analytics instance.
 * @param milliseconds The default value is 1800000 (30 minutes).
 */
export declare function setSessionTimeoutDuration(
  analytics: Analytics,
  milliseconds: number,
): Promise<void>;

/**
 * Retrieve the app instance id of the application.
 *
 * @param analytics Analytics instance.
 * @returns Returns the app instance id or null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 */
export function getAppInstanceId(analytics: Analytics): Promise<string | null>;

/**
 * Gives a user a unique identification.
 *
 * @param analytics Analytics instance.
 * @param id Set to null to remove a previously assigned ID from analytics events
 * @param options Additional options that can be passed to Analytics method calls such as logEvent, etc.
 */
export function setUserId(
  analytics: Analytics,
  id: string | null,
  options?: AnalyticsCallOptions,
): Promise<void>;

/**
 * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 *
 * @param analytics Analytics instance.
 * @param name A user property identifier.
 * @param value Set to null to remove a previously assigned ID from analytics events.
 */
export function setUserProperty(
  analytics: Analytics,
  name: string,
  value: string | null,
): Promise<void>;

/**
 * Sets multiple key/value pairs of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 *
 * > When you set user properties, be sure to never include personally identifiable information such as names, social security numbers, or email addresses, even in hashed form.
 *
 * @param analytics Analytics instance.
 * @param properties Set a property value to null to remove it.
 * @param options `AnalyticsCallOptions`. Additional options that can be passed. Web only.
 */
export function setUserProperties(
  analytics: Analytics,
  properties: { [key: string]: any },
  options?: AnalyticsCallOptions,
): Promise<void>;

/**
 * Clears all analytics data for this instance from the device and resets the app instance ID.
 *
 * @param analytics Analytics instance.
 */
export function resetAnalyticsData(analytics: Analytics): Promise<void>;

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported
 * automatically for Google Play-based apps.
 *
 * If you supply the `value` parameter, you must also supply the `currency` parameter so that revenue metrics can be computed accurately.
 *
 * Logged event name: `purchase`
 *
 * @param analytics Analytics instance.
 * @param object See {@link analytics.AddPaymentInfoEventParameters}.
 */
export function logAddPaymentInfo(
  analytics: Analytics,
  object: FirebaseAnalyticsTypes.AddPaymentInfoEventParameters,
): Promise<void>;

/**
 * Sets or clears the screen name and class the user is currently viewing
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ScreenViewParameters}.
 */
export function logScreenView(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.ScreenViewParameters,
): Promise<void>;

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
export function logAddShippingInfo(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.AddShippingInfoParameters,
): Promise<void>;

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
export function logAddToCart(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.AddToCartEventParameters,
): Promise<void>;

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
export function logAddToWishlist(
  analytics,
  params: FirebaseAnalyticsTypes.AddToWishlistEventParameters,
): Promise<void>;

/**
 * App Open event. By logging this event when an App is moved to the foreground, developers can
 * understand how often users leave and return during the course of a Session. Although Sessions
 * are automatically reported, this event can provide further clarification around the continuous
 * engagement of app-users.
 *
 * @param analytics Analytics instance.
 */
export function logAppOpen(analytics: Analytics): Promise<void>;

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
export function logBeginCheckout(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.BeginCheckoutEventParameters,
): Promise<void>;

/**
 * Log this event to supply the referral details of a re-engagement campaign.
 *
 * Logged event name: `campaign_details`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.CampaignDetailsEventParameters}.
 */
export function logCampaignDetails(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.CampaignDetailsEventParameters,
): Promise<void>;

/**
 * Earn Virtual Currency event. This event tracks the awarding of virtual currency in your app. Log this along with
 * {@link analytics.logSpendVirtualCurrency} to better understand your virtual economy.
 *
 * Logged event name: `earn_virtual_currency`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.EarnVirtualCurrencyEventParameters}.
 */
export function logEarnVirtualCurrency(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.EarnVirtualCurrencyEventParameters,
): Promise<void>;

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
export function logGenerateLead(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.GenerateLeadEventParameters,
): Promise<void>;

/**
 * Join Group event. Log this event when a user joins a group such as a guild, team or family.
 * Use this event to analyze how popular certain groups or social features are in your app
 *
 * Logged event name: `join_group`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.JoinGroupEventParameters}.
 */
export function logJoinGroup(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.JoinGroupEventParameters,
): Promise<void>;

/**
 * Level End event.
 *
 * Logged event name: `level_end`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LevelEndEventParameters}.
 */
export function logLevelEnd(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.LevelEndEventParameters,
): Promise<void>;

/**
 * Level Start event.
 *
 * Logged event name: `level_start`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LevelStartEventParameters}.
 */
export function logLevelStart(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.LevelStartEventParameters,
): Promise<void>;

/**
 * Level Up event. This event signifies that a player has leveled up in your gaming app.
 * It can help you gauge the level distribution of your userbase and help you identify certain levels that are difficult to pass.
 *
 * Logged event name: `level_up`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LevelUpEventParameters}.
 */
export function logLevelUp(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.LevelUpEventParameters,
): Promise<void>;

/**
 * Login event. Apps with a login feature can report this event to signify that a user has logged in.
 *
 * Logged event name: `login`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.LoginEventParameters}.
 */
export function logLogin(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.LoginEventParameters,
): Promise<void>;

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
export function logPostScore(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.PostScoreEventParameters,
): Promise<void>;

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
export function logSelectContent(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.SelectContentEventParameters,
): Promise<void>;

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
export function logPurchase(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.PurchaseEventParameters,
): Promise<void>;

/**
 * E-Commerce Refund event. This event signifies that a refund was issued.
 *
 * Logged event name: `remove_from_cart`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.RefundEventParameters}.
 */
export function logRefund(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.RefundEventParameters,
): Promise<void>;

/**
 * Remove from cart event.
 *
 * Logged event name: `remove_from_cart`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.RemoveFromCartEventParameters}.
 */
export function logRemoveFromCart(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.RemoveFromCartEventParameters,
): Promise<void>;

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
export function logSearch(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.SearchEventParameters,
): Promise<void>;

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
export function logSelectItem(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.SelectItemEventParameters,
): Promise<void>;

/**
 * Set checkout option event.
 *
 * Logged event name: `set_checkout_option`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SetCheckoutOptionEventParameters}.
 */
export function logSetCheckoutOption(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.SetCheckoutOptionEventParameters,
): Promise<void>;

/**
 * Select promotion event. This event signifies that a user has selected a promotion offer. Use the
 * appropriate parameters to contextualize the event, such as the item(s) for which the promotion applies.
 *
 * Logged event name: `select_promotion`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SelectPromotionEventParameters}.
 */
export function logSelectPromotion(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.SelectPromotionEventParameters,
): Promise<void>;

/**
 * Share event. Apps with social features can log the Share event to identify the most viral content.
 *
 * Logged event name: `share`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ShareEventParameters}.
 */
export function logShare(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.ShareEventParameters,
): Promise<void>;

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
export function logSignUp(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.SignUpEventParameters,
): Promise<void>;

/**
 * Spend Virtual Currency event. This event tracks the sale of virtual goods in your app and can
 * help you identify which virtual goods are the most popular objects of purchase.
 *
 * Logged event name: `spend_virtual_currency`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.SpendVirtualCurrencyEventParameters}.
 */
export function logSpendVirtualCurrency(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.SpendVirtualCurrencyEventParameters,
): Promise<void>;

/**
 * Tutorial Begin event. This event signifies the start of the on-boarding process in your app.
 * Use this in a funnel with {@link analytics#logTutorialComplete} to understand how many users
 * complete this process and move on to the full app experience.
 *
 * Logged event name: `tutorial_begin`
 *
 * @param analytics Analytics instance.
 */
export function logTutorialBegin(analytics: Analytics): Promise<void>;

/**
 * Tutorial End event. Use this event to signify the user's completion of your app's on-boarding process.
 * Add this to a funnel with {@link analytics#logTutorialBegin} to understand how many users
 * complete this process and move on to the full app experience.
 *
 * Logged event name: `tutorial_complete`
 *
 * @param analytics Analytics instance.
 */
export function logTutorialComplete(analytics: Analytics): Promise<void>;

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
export function logUnlockAchievement(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.UnlockAchievementEventParameters,
): Promise<void>;

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
export function logViewCart(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.ViewCartEventParameters,
): Promise<void>;

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
export function logViewItem(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.ViewItemEventParameters,
): Promise<void>;

/**
 * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
 *
 * Logged event name: `view_item_list`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewItemListEventParameters}.
 */
export function logViewItemList(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.ViewItemListEventParameters,
): Promise<void>;

/**
 * View Promotion event. This event signifies that a promotion was shown to a user.
 *
 * Logged event name: `view_promotion`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewPromotionEventParameters}.
 */
export function logViewPromotion(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.ViewPromotionEventParameters,
): Promise<void>;

/**
 * View Search Results event. Log this event when the user has been presented with the results of a search.
 *
 * Logged event name: `view_search_results`
 *
 * @param analytics Analytics instance.
 * @param params See {@link analytics.ViewSearchResultsParameters}.
 */
export function logViewSearchResults(
  analytics: Analytics,
  params: FirebaseAnalyticsTypes.ViewSearchResultsParameters,
): Promise<void>;

/**
 * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
 *
 * They will be added to the map of default event parameters, replacing any existing
 * parameter with the same name. Valid parameter values are String, long, and double.
 * Setting a key's value to null will clear that parameter. Passing in a null bundle
 * will clear all parameters.
 * For Web, the values passed persist on the current page and are passed with all
 * subsequent events.
 *
 * @platform ios
 * @param analytics Analytics instance.
 * @param params Parameters to be added to the map of parameters added to every event.
 */
export function setDefaultEventParameters(
  analytics: Analytics,
  params: { [p: string]: any },
): Promise<void>;

/**
 * Start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
 *
 * @platform ios
 * @param analytics Analytics instance.
 * @param emailAddress email address, properly formatted complete with domain name e.g, 'user@example.com'
 */
export function initiateOnDeviceConversionMeasurementWithEmailAddress(
  analytics: Analytics,
  emailAddress: string,
): Promise<void>;

/**
 * Start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
 * You need to pass the sha256-hashed of normalized email address to this function. See [this link](https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials) for more information.
 *
 * @platform ios
 * @param analytics Analytics instance.
 * @param hashedEmailAddress sha256-hashed of normalized email address, properly formatted complete with domain name e.g, 'user@example.com'
 */
export function initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
  analytics: Analytics,
  hashedEmailAddress: string,
): Promise<void>;

/**
 * Start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
 *
 * @platform ios
 * @param analytics Analytics instance.
 * @param phoneNumber phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
 */
export function initiateOnDeviceConversionMeasurementWithPhoneNumber(
  analytics: Analytics,
  phoneNumber: string,
): Promise<void>;

/**
 * Start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile.
 * You need to pass the sha256-hashed of phone number in E.164 format. See [this link](https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials) for more information.
 *
 * @platform ios
 * @param analytics Analytics instance.
 * @param hashedPhoneNumber sha256-hashed of normalized phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
 */
export function initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
  analytics: Analytics,
  hashedPhoneNumber: string,
): Promise<void>;

/**
 * Checks four different things.
 * 1. Checks if it's not a browser extension environment.
 * 2. Checks if cookies are enabled in current browser.
 * 3. Checks if IndexedDB is supported by the browser environment.
 * 4. Checks if the current browser context is valid for using IndexedDB.open().
 *
 * @returns {Promise<boolean>}
 */
export function isSupported(): Promise<boolean>;

/**
 * Sets the applicable end user consent state for this app.
 * references once Firebase Analytics is initialized.
 * @param analytics Analytics instance.
 * @param consentSettings See {@link analytics.ConsentSettings}.
 * @returns {Promise<void>}
 */
export function setConsent(
  analytics: Analytics,
  consentSettings: FirebaseAnalyticsTypes.ConsentSettings,
): Promise<void>;

/**
 * Configures Firebase Analytics to use custom gtag or dataLayer names.
 * Intended to be used if gtag.js script has been installed on this page
 * independently of Firebase Analytics, and is using non-default names for
 * either the gtag function or for dataLayer. Must be called before calling
 * `getAnalytics()` or it won't have any effect. Web only.
 * @param options See {@link analytics.SettingsOptions}.
 * @returns {void}
 */
export function settings(options: FirebaseAnalyticsTypes.SettingsOptions): void;

/**
 * Retrieves the session id from the client.
 * On iOS, Firebase SDK may return an error that is handled internally and may take many minutes to return a valid value. Check native debug logs for more details.
 *
 * Returns the session id or null if session is expired, null on android if FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE has been set to FirebaseAnalytics.ConsentStatus.DENIED and null on iOS if ConsentType.analyticsStorage has been set to ConsentStatus.denied.
 * @param {Analytics} instance.
 * @returns {Promise<number | null>}
 */
export function getSessionId(analytics: Analytics): Promise<number | null>;
