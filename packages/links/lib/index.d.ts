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
  export interface AnalyticsParameters {
    /**
     * Sets the campaign name.
     *
     * @param campaign The campaign name; The individual campaign name, slogan, promo code, etc. for a product.
     */
    setCampaign(campaign?: string): DynamicLink;

    /**
     * Sets the campaign content.
     *
     * @param content The campaign content; used for A/B testing and content-targeted ads to differentiate ads or links that point to the same URL.
     */
    setContent(content?: string): DynamicLink;

    /**
     * Sets the campaign medium.
     *
     * @param medium The campaign medium; used to identify a medium such as email or cost-per-click (cpc).
     */
    setMedium(medium?: string): DynamicLink;

    /**
     * Sets the campaign source.
     *
     * @param source The campaign source; used to identify a search engine, newsletter, or other source.
     */
    setSource(source?: string): DynamicLink;

    /**
     * Sets the campaign term.
     *
     * @param term The campaign term; used with paid search to supply the keywords for ads.

     */
    setTerm(term?: string): DynamicLink;

    /**
     * Returns the current DynamicLinkAnalyticsParameters object.
     */
    build(): Object;
  }

  export interface AndroidParameters {
    /**
     * Sets the link to open when the app isn't installed. Specify this to do something other than install your app from
     * the Play Store when the app isn't installed, such as open the mobile web version of the content, or display a
     * promotional page for your app.
     *
     * @param fallbackUrl The link to open on Android if the app is not installed.
     */
    setFallbackUrl(fallbackUrl?: string): DynamicLink;

    /**
     * Sets the versionCode of the minimum version of your app that can open the link.
     *
     * @param minimumVersion The minimum version.
     */
    setMinimumVersion(minimumVersion?: string): DynamicLink;

    /**
     * Sets the Android package name.
     *
     * @param packageName The package name of the Android app to use to open the link. The app must be connected to your project from the Overview page of the Firebase console.
     */
    setPackageName(packageName?: string): DynamicLink;

    /**
     * Returns the current DynamicLinkAndroidParameters object.
     */
    build(): Object;
  }

  export interface IOSParameters {
    /**
     * Sets the App Store ID, used to send users to the App Store when the app isn't installed.
     *
     * @param appStoreId The App Store ID.
     */
    setAppStoreId(appStoreId?: string): DynamicLink;

    /**
     * Sets the iOS bundle ID.
     *
     * @param bundleId The parameters ID of the iOS app to use to open the link. The app must be connected to your project from the Overview page of the Firebase console.
     */
    setBundleId(bundleId?: string): DynamicLink;

    /**
     * Sets the app's custom URL scheme, if defined to be something other than your app's parameters ID.
     *
     * @param customScheme The app's custom URL scheme.
     */
    setCustomScheme(customScheme?: string): DynamicLink;

    /**
     * Sets the link to open when the app isn't installed. Specify this to do something other than install your app from
     * the App Store when the app isn't installed, such as open the mobile web version of the content, or display a
     * promotional page for your app.
     *
     * @param fallbackUrl The link to open on iOS if the app is not installed.
     */
    setFallbackUrl(fallbackUrl?: string): DynamicLink;

    /**
     * Sets the parameters ID of the iOS app to use on iPads to open the link. The app must be connected to your project
     * from the Overview page of the Firebase console.
     *
     * @param iPadBundleId The iPad parameters ID of the app.
     */
    setIPadBundleId(iPadBundleId?: string): DynamicLink;

    /**
     * Sets the link to open on iPads when the app isn't installed. Specify this to do something other than install your
     * app from the App Store when the app isn't installed, such as open the web version of the content, or display a
     * promotional page for your app. Overrides the fallback link set by `setFallbackUrl` on iPad.
     *
     * @param iPadFallbackUrl The link to open on iPad if the app is not installed.
     */
    setIPadFallbackUrl(iPadFallbackUrl?: string): DynamicLink;

    /**
     * Sets the minimum version of your app that can open the link.
     *
     * @param minimumVersion The minimum version.
     */
    setMinimumVersion(minimumVersion?: string): DynamicLink;

    /**
     * Returns the current DynamicLinkIOSParameters object.
     */
    build(): Object;
  }

  export interface ITunesParameters {
    /**
     * Sets the affiliate token.
     *
     * @param affiliateToken The affiliate token used to create affiliate-coded links.
     */
    setAffiliateToken(affiliateToken?: string): DynamicLink;

    /**
     * Sets the campaign token.
     *
     * @param campaignToken The campaign token that developers can add to any link in order to track sales from a specific marketing campaign.
     */
    setCampaignToken(campaignToken?: string): DynamicLink;

    /**
     * Sets the provider token.
     *
     * @param providerToken The provider token that enables analytics for Dynamic Links from within iTunes Connect.
     */
    setProviderToken(providerToken?: string): DynamicLink;

    /**
     * Returns the current DynamicLinkIOSParameters object.
     */
    build(): Object;
  }

  export interface NavigationParameters {
    /**
     * Sets whether to enable force redirecting or going to the app preview page. Defaults to false.
     *
     * @param forcedRedirectEnabled If true, app preview page will be disabled and there will be a redirect to the FDL. If false, go to the app preview page.
     */
    setForcedRedirectEnabled(forcedRedirectEnabled?: boolean): DynamicLink;

    /**
     * Returns the current DynamicLinkIOSParameters object.
     */
    build(): Object;
  }

  export interface SocialParameters {
    /**
     * Sets the meta-tag description.
     *
     * @param descriptionText The description to use when the Dynamic Link is shared in a social post.
     */
    setDescriptionText(descriptionText?: string): DynamicLink;

    /**
     * Sets the meta-tag image link.
     *
     * @param imageUrl The URL to an image related to this link.
     */
    setImageUrl(imageUrl?: string): DynamicLink;

    /**
     * Sets the meta-tag title.
     *
     * @param title The title to use when the Dynamic Link is shared in a social post.
     */
    setTitle(title?: string): DynamicLink;

    /**
     * Returns the current DynamicLinkSocialParameters object.
     */
    build(): Object;
  }

  export interface DynamicLink {
    /**
     * Access Google Analytics specific link properties.
     */
    analytics: AnalyticsParameters;

    /**
     * Access Android specific link properties.
     */
    android: AndroidParameters;

    /**
     * Access iOS specific link properties.
     */
    ios: IOSParameters;

    /**
     * Access iTunes Connect specific link properties.
     */
    itunes: ITunesParameters;

    /**
     * Access navigation specific link properties.
     */
    navigation: NavigationParameters;

    /**
     * Access social specific link properties.
     */
    social: SocialParameters;

    /**
     * Returns the current DynamicLink object.
     */
    build(): DynamicLink;
  }

  export interface Statics {
    // TODO deprecate
    // DynamicLink: DynamicLink;
  }

  export interface Module extends ReactNativeFirebaseModule {
    /**
     * Builds a dynamic link.
     *
     * To create a DynamicLink, first populate it by using the setX methods available on the `DynamicLink` builder classes,
     * then pass it to `firebase.links().buildLink(link)` or `firebase.links().buildLink(link)`.
     *
     * @param link The link the target app will open. You can specify any URL the app can handle, such as a link to the app’s content, or a URL that initiates some app-specific logic such as crediting the user with a coupon, or displaying a specific welcome screen. This link must be a well-formatted URL, be properly URL-encoded, and use the HTTP or HTTPS scheme.
     * @param domainURIPrefix Domain URI Prefix of your App. This value must be your assigned domain from the Firebase console. (e.g. https://xyz.page.link) The domain URI prefix must start with a valid HTTPS scheme (https://).
     */
    newDynamicLink(link, domainURIPrefix): DynamicLink;
    /**
     * Creates a standard dynamic link.
     *
     * @param link A {@link links.DynamicLink} instance.
     */
    createDynamicLink(link: DynamicLink): Promise<string>;

    /**
     * Creates a shorter version of a dynamic link.
     *
     * @param link A {@link links.DynamicLink} instance.
     * @param type The link type returned from Firebase.
     */
    createShortDynamicLink(link: DynamicLink, type: 'SHORT' | 'UNGUESSABLE'): Promise<string>;

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
