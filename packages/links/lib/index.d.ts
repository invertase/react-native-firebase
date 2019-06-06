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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Links
 *
 * @firebase links
 */
export namespace Links {
  export interface DynamicLinkAnalyticsParameters {
    /**
     * Sets the campaign name.
     *
     * @param campaign The campaign name; The individual campaign name, slogan, promo code, etc. for a product.
     */
    setCampaign(campaign?: string): DynamicLinkParameters;

    /**
     * Sets the campaign content.
     *
     * @param content The campaign content; used for A/B testing and content-targeted ads to differentiate ads or links that point to the same URL.
     */
    setContent(content?: string): DynamicLinkParameters;

    /**
     * Sets the campaign medium.
     *
     * @param medium The campaign medium; used to identify a medium such as email or cost-per-click (cpc).
     */
    setMedium(medium?: string): DynamicLinkParameters;

    /**
     * Sets the campaign source.
     *
     * @param source The campaign source; used to identify a search engine, newsletter, or other source.
     */
    setSource(source?: string): DynamicLinkParameters;

    /**
     * Sets the campaign term.
     *
     * @param term The campaign term; used with paid search to supply the keywords for ads.

     */
    setTerm(term?: string): DynamicLinkParameters;

    /**
     * Returns the current DynamicLinkAnalyticsParameters object.
     */
    build(): Object;
  }

  export interface DynamicLinkAndroidParameters {
    /**
     * Sets the link to open when the app isn't installed. Specify this to do something other than install your app from
     * the Play Store when the app isn't installed, such as open the mobile web version of the content, or display a
     * promotional page for your app.
     *
     * @param fallbackUrl The link to open on Android if the app is not installed.
     */
    setFallbackUrl(fallbackUrl?: string): DynamicLinkParameters;

    /**
     * Sets the versionCode of the minimum version of your app that can open the link.
     *
     * @param minimumVersion The minimum version.
     */
    setMinimumVersion(minimumVersion?: string): DynamicLinkParameters;

    /**
     * Sets the Android package name.
     *
     * @param packageName The package name of the Android app to use to open the link. The app must be connected to your project from the Overview page of the Firebase console.
     */
    setPackageName(packageName?: string): DynamicLinkParameters;

    /**
     * Returns the current DynamicLinkAndroidParameters object.
     */
    build(): Object;
  }

  export interface DynamicLinkIOSParameters {
    /**
     * Sets the App Store ID, used to send users to the App Store when the app isn't installed.
     *
     * @param appStoreId The App Store ID.
     */
    setAppStoreId(appStoreId?: string): DynamicLinkParameters;

    /**
     * Sets the iOS bundle ID.
     *
     * @param bundleId The parameters ID of the iOS app to use to open the link. The app must be connected to your project from the Overview page of the Firebase console.
     */
    setBundleId(bundleId?: string): DynamicLinkParameters;

    /**
     * Sets the app's custom URL scheme, if defined to be something other than your app's parameters ID.
     *
     * @param customScheme The app's custom URL scheme.
     */
    setCustomScheme(customScheme?: string): DynamicLinkParameters;

    /**
     * Sets the link to open when the app isn't installed. Specify this to do something other than install your app from
     * the App Store when the app isn't installed, such as open the mobile web version of the content, or display a
     * promotional page for your app.
     *
     * @param fallbackUrl The link to open on iOS if the app is not installed.
     */
    setFallbackUrl(fallbackUrl?: string): DynamicLinkParameters;

    /**
     * Sets the parameters ID of the iOS app to use on iPads to open the link. The app must be connected to your project
     * from the Overview page of the Firebase console.
     *
     * @param iPadBundleId The iPad parameters ID of the app.
     */
    setIPadBundleId(iPadBundleId?: string): DynamicLinkParameters;

    /**
     * Sets the link to open on iPads when the app isn't installed. Specify this to do something other than install your
     * app from the App Store when the app isn't installed, such as open the web version of the content, or display a
     * promotional page for your app. Overrides the fallback link set by `setFallbackUrl` on iPad.
     *
     * @param iPadFallbackUrl The link to open on iPad if the app is not installed.
     */
    setIPadFallbackUrl(iPadFallbackUrl?: string): DynamicLinkParameters;

    /**
     * Sets the minimum version of your app that can open the link.
     *
     * @param minimumVersion The minimum version.
     */
    setMinimumVersion(minimumVersion?: string): DynamicLinkParameters;

    /**
     * Returns the current DynamicLinkIOSParameters object.
     */
    build(): Object;
  }

  export interface DynamicLinkITunesParameters {
    /**
     * Sets the affiliate token.
     *
     * @param affiliateToken The affiliate token used to create affiliate-coded links.
     */
    setAffiliateToken(affiliateToken?: string): DynamicLinkParameters;

    /**
     * Sets the campaign token.
     *
     * @param campaignToken The campaign token that developers can add to any link in order to track sales from a specific marketing campaign.
     */
    setCampaignToken(campaignToken?: string): DynamicLinkParameters;

    /**
     * Sets the provider token.
     *
     * @param providerToken The provider token that enables analytics for Dynamic Links from within iTunes Connect.
     */
    setProviderToken(providerToken?: string): DynamicLinkParameters;

    /**
     * Returns the current DynamicLinkIOSParameters object.
     */
    build(): Object;
  }

  export interface DynamicLinkNavigationParameters {
    /**
     * Sets whether to enable force redirecting or going to the app preview page. Defaults to false.
     *
     * @param forcedRedirectEnabled If true, app preview page will be disabled and there will be a redirect to the FDL. If false, go to the app preview page.
     */
    setForcedRedirectEnabled(forcedRedirectEnabled?: boolean): DynamicLinkParameters;

    /**
     * Returns the current DynamicLinkIOSParameters object.
     */
    build(): Object;
  }

  export interface DynamicLinkSocialParameters {
    /**
     * Sets the meta-tag description.
     *
     * @param descriptionText The description to use when the Dynamic Link is shared in a social post.
     */
    setDescriptionText(descriptionText?: string): DynamicLinkParameters;

    /**
     * Sets the meta-tag image link.
     *
     * @param imageUrl The URL to an image related to this link.
     */
    setImageUrl(imageUrl?: string): DynamicLinkParameters;

    /**
     * Sets the meta-tag title.
     *
     * @param title The title to use when the Dynamic Link is shared in a social post.
     */
    setTitle(title?: string): DynamicLinkParameters;

    /**
     * Returns the current DynamicLinkSocialParameters object.
     */
    build(): Object;
  }

  export interface DynamicLinkParameters {
    /**
     * Access Google Analytics specific link properties.
     */
    analytics: DynamicLinkAnalyticsParameters;

    /**
     * Access Android specific link properties.
     */
    android: DynamicLinkAndroidParameters;

    /**
     * Access iOS specific link properties.
     */
    ios: DynamicLinkIOSParameters;

    /**
     * Access iTunes Connect specific link properties.
     */
    itunes: DynamicLinkITunesParameters;

    /**
     * Access navigation specific link properties.
     */
    navigation: DynamicLinkNavigationParameters;

    /**
     * Access social specific link properties.
     */
    social: DynamicLinkSocialParameters;

    /**
     * Returns the current DynamicLinkParameters object.
     */
    build(): DynamicLinkParameters;
  }

  export interface ShortLinkType {
    SHORT: 'SHORT';
    UNGUESSABLE: 'UNGUESSABLE';
    DEFAULT: 'DEFAULT';
  }

  export interface Statics {
    ShortLinkType: ShortLinkType;
    // TODO deprecate DynamicLink
  }

  export class Module extends ReactNativeFirebaseModule {
    /**
     * Builds a dynamic link.
     *
     * To create a DynamicLinkParameters, first populate it by using the setX methods available on the `DynamicLinkParameters` builder classes,
     * then pass it to `firebase.links().buildLink(link)` or `firebase.links().buildLink(link)`.
     *
     * @param link The link the target app will open. You can specify any URL the app can handle, such as a link to the app’s content, or a URL that initiates some app-specific logic such as crediting the user with a coupon, or displaying a specific welcome screen. This link must be a well-formatted URL, be properly URL-encoded, and use the HTTP or HTTPS scheme.
     * @param domainURIPrefix Domain URI Prefix of your App. This value must be your assigned domain from the Firebase console. (e.g. https://xyz.page.link) The domain URI prefix must start with a valid HTTPS scheme (https://).
     */
    newDynamicLinkParameters(link: string, domainURIPrefix: string): DynamicLinkParameters;

    /**
     * Builds a Dynamic Link from the provided DynamicLinkParameters instances.
     *
     * @param dynamicLinkParams An instance of DynamicLinkParameters created via `newDynamicLinkParameters`
     */
    buildLink(dynamicLinkParams: DynamicLinkParameters): Promise<string>;

    /**
     * Creates a link from the provided DynamicLinkParameters instances.
     *
     * @deprecated Use `buildLink` with the same args instead.
     * @param dynamicLinkParams An instance of DynamicLinkParameters created via `newDynamicLinkParameters`
     */
    createDynamicLink(dynamicLinkParams: DynamicLinkParameters): Promise<string>;

    /**
     * Builds a short Dynamic Link from the provided DynamicLinkParameters instances.
     *
     * @param dynamicLinkParams An instance of DynamicLinkParameters created via `newDynamicLinkParameters`
     * @param shortLinkType The short link type, one of `ShortLinkType` from `firebase.links.ShortLinkType`
     */
    buildShortLink(
      dynamicLinkParams: DynamicLinkParameters,
      shortLinkType?: 'SHORT' | 'UNGUESSABLE' | 'DEFAULT',
    ): Promise<string>;

    /**
     * Creates a short Dynamic Link from the provided DynamicLinkParameters instances.
     *
     * @deprecated Use `buildShortLink` with the same args instead.
     * @param dynamicLinkParams An instance of DynamicLinkParameters created via `newDynamicLinkParameters`
     * @param shortLinkType The short link type, one of `ShortLinkType` from `firebase.links.ShortLinkType`
     */
    createShortDynamicLink(
      dynamicLinkParams: DynamicLinkParameters,
      shortLinkType?: 'SHORT' | 'UNGUESSABLE' | 'DEFAULT',
    ): Promise<string>;

    /**
     * Returns the URL that the app has been launched from. If the app was not launched from a URL the return value will be null.
     *
     * > Use {@link auth#isSignInWithEmailLink} to check if an inbound dynamic link is an email sign-in link.
     */
    getInitialLink(): Promise<string | null>;

    /**
     * Subscribe to URL open events while the app is still running.
     *
     * The listener is called from URL open events whilst the app is still running, use
     * {@link links#getInitialLink} for URLs which cause the app to open from a previously closed / not running state.
     *
     * @returns Unsubscribe function, call the returned function to unsubscribe from all future events.
     * @param listener The listener callback, called URL open events.
     */
    onLink(listener: Function<string>): Function;
  }
}

declare module '@react-native-firebase/links' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/links';
   * firebase.links().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const LinksDefaultExport: ReactNativeFirebaseModuleAndStatics<Links.Module, Links.Statics>;
  /**
   * @example
   * ```js
   * import links from '@react-native-firebase/links';
   * links().X(...);
   * ```
   */
  export default LinksDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Links
     */
    links: ReactNativeFirebaseModuleAndStatics<Links.Module, Links.Statics>;
  }

  interface FirebaseApp {
    /**
     * Links
     */
    links(): Links.Module;
  }
}
