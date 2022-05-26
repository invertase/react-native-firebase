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
 * Firebase Dynamic Links package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `dynamicLinks` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/dynamic-links';
 *
 * // firebase.dynamicLinks().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `dynamic-links` package:
 *
 * ```js
 * import dynamicLinks from '@react-native-firebase/dynamic-links';
 *
 * // dynamicLinks().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/dynamic-links';
 *
 * // firebase.dynamicLinks().X
 * ```
 *
 * @firebase dynamic-links
 */
export namespace FirebaseDynamicLinksTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * The DynamicLinkAnalyticsParameters interface provides functionality to add Google Analytic
   * based parameters to a dynamic link.
   *
   * #### Example
   *
   * ```js
   *  const link = await firebase.dynamicLinks().buildLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *    analytics: {
   *      campaign: 'banner',
   *      content: 'Click Me',
   *    }
   *  });
   * ```
   */
  export interface DynamicLinkAnalyticsParameters {
    /**
     * The individual campaign name, slogan, promo code, etc. for a product.
     */
    campaign?: string;

    /**
     * The campaign content; used for A/B testing and content-targeted ads to differentiate ads or links that point to the same URL.
     */
    content?: string;

    /**
     * The campaign medium; used to identify a medium such as email or cost-per-click (cpc).
     */
    medium?: string;

    /**
     * The campaign source; used to identify a search engine, newsletter, or other source.
     */
    source?: string;

    /**
     * The campaign term; used with paid search to supply the keywords for ads.
     */
    term?: string;
  }

  /**
   * The DynamicLinkAndroidParameters interface provides functionality to configure the behaviour
   * of dynamic links for Android devices.
   *
   * If any parameter is declared then the Android package name must also be set via `setPackageName`
   *
   * #### Example
   *
   * ```js
   *  const link = await firebase.dynamicLinks().buildLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *    android: {
   *      packageName: 'io.invertase.testing',
   *      minimumVersion: '18',
   *    }
   *  });
   * ```
   */
  export interface DynamicLinkAndroidParameters {
    /**
     * Sets the link to open when the app isn't installed. Specify this to do something other than install your app from
     * the Play Store when the app isn't installed, such as open the mobile web version of the content, or display a
     * promotional page for your app.
     */
    fallbackUrl?: string;

    /**
     * Sets the version code of the minimum version of your app that can open the link.
     */
    minimumVersion?: string;

    /**
     * The package name of the Android app to use to open the link. The app must be connected to your project from the Overview page of the Firebase console.
     *
     * This option is required if passing android options to your dynamic link.
     */
    packageName: string;
  }

  /**
   * The DynamicLinkIOSParameters interface provides functionality to configure the behaviour
   * of dynamic links for iOS devices.
   *
   * If any parameter is declared then the iOS BundleId must also be set via `setBundleId`
   *
   * #### Example
   *
   * ```js
   * const linkParams = firebase.dynamicLinks().newDynamicLinkParameters('https://invertase.io', 'https://xyz.page.link');
   * linkParams
   *   .ios.setBundleId('io.invertase.testing')
   *   .ios.setAppStoreId('123456789')
   *   .ios.setMinimumVersion('18');
   *
   *  const link = await firebase.dynamicLinks().buildLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *    ios: {
   *      bundleId: 'io.invertase.testing',
   *      appStoreId: '123456789',
   *      minimumVersion: '18',
   *    }
   *  });
   * ```
   */
  export interface DynamicLinkIOSParameters {
    /**
     * Sets the App Store ID, used to send users to the App Store when the app isn't installed.
     */
    appStoreId?: string;

    /**
     * The bundle ID of the iOS app to use to open the link. The app must be connected to your project from the Overview page of the Firebase console.
     *
     * This option is required if passing ios options to your dynamic link.
     */
    bundleId: string;

    /**
     * Sets the app's custom URL scheme, if defined to be something other than your app's parameters ID.
     */
    customScheme?: string;

    /**
     * Sets the link to open when the app isn't installed. Specify this to do something other than install your app from
     * the App Store when the app isn't installed, such as open the mobile web version of the content, or display a
     * promotional page for your app.
     */
    fallbackUrl?: string;

    /**
     * Sets the bundle ID of the iOS app to use on iPads to open the link. The app must be connected to your project
     * from the Overview page of the Firebase console.
     */
    iPadBundleId?: string;

    /**
     * Sets the link to open on iPads when the app isn't installed. Specify this to do something other than install your
     * app from the App Store when the app isn't installed, such as open the web version of the content, or display a
     * promotional page for your app. Overrides the fallback link set by `setFallbackUrl` on iPad.
     */
    iPadFallbackUrl?: string;

    /**
     * Sets the minimum version of your app that can open the link.
     */
    minimumVersion?: string;
  }

  /**
   * The DynamicLinkITunesParameters interface provides functionality to add iTunes Connect Analytics
   * based parameters to the created dynamic link.
   *
   * #### Example
   *
   * ```js
   *  const link = await firebase.dynamicLinks().buildLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *    itunes: {
   *      affiliateToken: 'ABCDEFG',
   *    }
   *  });
   * ```
   */
  export interface DynamicLinkITunesParameters {
    /**
     * The affiliate token used to create affiliate-coded links.
     */
    affiliateToken?: string;

    /**
     * The campaign token that developers can add to any link in order to track sales from a specific marketing campaign.
     */
    campaignToken?: string;

    /**
     * The provider token that enables analytics for Dynamic DynamicLinks from within iTunes Connect.
     */
    providerToken?: string;
  }

  /**
   * The DynamicLinkNavigationParameters interface provides functionality to specify how the navigation
   * of the created link is handled.
   *
   * #### Example
   *
   * ```js
   *  const link = await firebase.dynamicLinks().buildLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *    navigation: {
   *      forcedRedirectEnabled: true,
   *    }
   *  });
   * ```
   */
  export interface DynamicLinkNavigationParameters {
    /**
     * Sets whether to enable force redirecting or going to the app preview page. Defaults to false.
     *
     * If true, app preview page will be disabled and there will be a redirect to the FDL. If false, go to the app preview page.
     */
    forcedRedirectEnabled?: boolean;
  }

  /**
   * The DynamicLinkSocialParameters interface provides functionality to add additional social
   * meta-data to the URL.
   *
   * #### Example
   *
   * ```js
   *  const link = await firebase.dynamicLinks().buildLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *    social: {
   *      title: 'Social Application',
   *      descriptionText: 'A Social Application',
   *    }
   *  });
   * ```
   */
  export interface DynamicLinkSocialParameters {
    /**
     * The description to use when the Dynamic Link is shared in a social post.
     */
    descriptionText?: string;

    /**
     * The URL to an image related to this link.
     */
    imageUrl?: string;

    /**
     * The title to use when the Dynamic Link is shared in a social post.
     */
    title?: string;
  }

  /**
   * The DynamicLinkParameters interface provides access to the Dynamic Link builder classes
   * used to configure a created link.
   *
   * #### Example
   *
   * ```js
   *  const link = await firebase.dynamicLinks().buildLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *  });
   * ```
   */
  export interface DynamicLinkParameters {
    /**
     * The link the target app will open. You can specify any URL the app can handle, such as a link to the app’s content,
     * or a URL that initiates some app-specific logic such as crediting the user with a coupon, or displaying a
     * specific welcome screen. This link must be a well-formatted URL, be properly URL-encoded, and use the HTTP or
     * HTTPS scheme.
     */
    link: string;

    /**
     * Domain URI Prefix of your App. This value must be your assigned domain from the Firebase console,
     * (e.g. https://xyz.page.link). The domain URI prefix must start with a valid HTTPS scheme (https://).
     */
    domainUriPrefix: string;

    /**
     * Access Google Analytics specific link parameters.
     */
    analytics?: DynamicLinkAnalyticsParameters;

    /**
     * Access Android specific link parameters.
     */
    android?: DynamicLinkAndroidParameters;

    /**
     * Access iOS specific link parameters.
     */
    ios?: DynamicLinkIOSParameters;

    /**
     * Access iTunes Connect specific link parameters.
     */
    itunes?: DynamicLinkITunesParameters;

    /**
     * Access navigation specific link parameters.
     */
    navigation?: DynamicLinkNavigationParameters;

    /**
     * Access social specific link parameters.
     */
    social?: DynamicLinkSocialParameters;
  }

  /**
   * ShortLinkType determines the type of dynamic short link which Firebase creates. Used when building
   * a new short link via `buildShortLink()`. These are exported through statics connected to the module.
   *
   * #### Example
   *
   * ```js
   *  const link = await firebase.dynamicLinks().buildShortLink({
   *    link: 'https://invertase.io',
   *    domainUriPrefix: 'https://xyz.page.link',
   *  }, firebase.dynamicLinks.ShortLinkType.UNGUESSABLE);
   * ```
   */
  export enum ShortLinkType {
    /**
     * Shorten the path to a string that is only as long as needed to be unique, with a minimum length
     * of 4 characters. Use this if sensitive information would not be exposed if a short
     * Dynamic Link URL were guessed.
     */
    SHORT = 'SHORT',
    /**
     * Shorten the path to an unguessable string. Such strings are created by base62-encoding randomly
     * generated 96-bit numbers, and consist of 17 alphanumeric characters. Use unguessable strings
     * to prevent your Dynamic DynamicLinks from being crawled, which can potentially expose sensitive information.
     */
    UNGUESSABLE = 'UNGUESSABLE',
    /**
     * By default, Firebase returns a standard formatted link.
     */
    DEFAULT = 'DEFAULT',
  }

  /**
   * A received Dynamic Link from either `onLink` or `getInitialLink`.
   */
  export interface DynamicLink {
    /**
     * The url of the dynamic link.
     */
    url: string;

    /**
     * The minimum app version (not system version) requested to process the dynamic link.
     * This is retrieved from the imv= parameter of the Dynamic Link URL.
     *
     * If the app version of the opening app is less than the value of this property,
     * then the app is expected to open AppStore to allow user to download most recent version.
     * App can notify or ask the user before opening AppStore.
     *
     * Returns `null` if not specified
     *
     * #### Android
     *
     * On Android this returns a number value representing the apps [versionCode](https://developer.android.com/reference/android/content/pm/PackageInfo.html#versionCode).
     *
     * #### iOS
     *
     * On iOS this returns a string value representing the minimum app version (not the iOS system version).
     */
    minimumAppVersion: number | string | null;

    /**
     * The potential UTM parameters linked to this dynamic link
     *
     * It will only work for short links, not long links
     */
    utmParameters: Record<string, string>;
  }

  /**
   * Firebase Dynamic DynamicLinks Statics
   *
   * ```js
   * firebase.dynamicLinks.X
   * ```
   */
  export interface Statics {
    /**
     * Returns the {@link links.ShortLinkType} enum.
     */
    ShortLinkType: typeof ShortLinkType;
  }

  /**
   *
   * The Firebase Dynamic DynamicLinks service is available for the default app only.
   *
   * #### Example 1
   *
   * Get the links instance for the **default app**:
   *
   * ```js
   * const links = firebase.dynamicLinks();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Builds a Dynamic Link from the provided DynamicLinkParameters instances.
     *
     * #### Example
     *
     * ```js
     * const link = await firebase.dynamicLinks().buildLink({
     *   link: 'https://invertase.io',
     *   domainUriPrefix: 'https://xyz.page.link',
     *   analytics: {
     *     campaign: 'banner',
     *   }
     * });
     * ```
     *
     * @param dynamicLinkParams An object interface of DynamicLinkParameters.
     */
    buildLink(dynamicLinkParams: DynamicLinkParameters): Promise<string>;
    /**
     * Builds a short Dynamic Link from the provided DynamicLinkParameters interface.
     *
     *  ```js
     * const link = await firebase.dynamicLinks().buildShortLink(
     *   {
     *     link: 'https://invertase.io',
     *     domainUriPrefix: 'https://xyz.page.link',
     *     analytics: {
     *       campaign: 'banner',
     *     }
     *   },
     *   firebase.dynamicLinks.ShortLinkType.UNGUESSABLE,
     * );
     * ```
     *
     * @param dynamicLinkParams An object interface of DynamicLinkParameters.
     * @param shortLinkType The short link type, one of `ShortLinkType` from `firebase.dynamicLinks.ShortLinkType`
     */
    buildShortLink(
      dynamicLinkParams: DynamicLinkParameters,
      shortLinkType?: ShortLinkType,
    ): Promise<string>;

    /**
     * Returns the Dynamic Link that the app has been launched from. If the app was not launched from a Dynamic Link the value will be null.
     *
     * > Use {@link auth#isSignInWithEmailLink} to check if an inbound dynamic link is an email sign-in link.
     *
     * #### Example
     *
     * ```js
     * async function bootstrapApp() {
     *    const initialLink = await firebase.dynamicLinks().getInitialLink();
     *
     *    if (initialLink) {
     *      // Handle dynamic link inside your own application
     *      if (initialLink.url === 'https://invertase.io/offer') return navigateTo('/offers')
     *    }
     * }
     * ```
     */
    getInitialLink(): Promise<DynamicLink | null>;

    /**
     * Subscribe to Dynamic Link open events while the app is still running.
     *
     * The listener is called from Dynamic Link open events whilst the app is still running, use
     * {@link dynamic-links#getInitialLink} for Dynamic Links which cause the app to open from a previously closed / not running state.
     *
     * #### Example
     *
     * ```jsx
     * function App() {
     *   const handleDynamicLink = (link) => {
     *     // Handle dynamic link inside your own application
     *     if (link.url === 'https://invertase.io/offer') return navigateTo('/offers')
     *   };
     *
     *   useEffect(() => {
     *     const unsubscribe = firebase.dynamicLinks().onLink(handleDynamicLink);
     *     // When the component unmounts, remove the listener
     *     return unsubscribe;
     *   }, []);
     *
     *   return <YourApp />;
     * }
     * ```
     *
     * @returns Unsubscribe function, call the returned function to unsubscribe from all future events.
     * @param listener The listener callback, called with Dynamic Link instances.
     */
    onLink(listener: (link: DynamicLink) => void): () => void;

    /**
     * Perform built-in diagnostics on iOS. This is best performed on a real device running
     * a build from Xcode so you may see the output easily. Alternatively it should be visible
     * in Console.app with an iPhone plugged into a macOS computer
     *
     * NOTE: iOS only
     */
    performDiagnostics(): void;

    /**
     * Resolve a given dynamic link (short or long) directly.
     *
     * This mimics the result of external link resolution, app open, and the DynamicLink you
     * would get from {@link dynamic-links#getInitialLink}
     *
     * #### Example
     *
     * ```js
     * const link = await firebase.dynamicLinks().resolveLink('https://reactnativefirebase.page.link/76adfasdf');
     * console.log('Received link with URL: ' + link.url);
     * ```
     *
     * Can throw error with message 'Invalid link parameter' if link parameter is null
     * Can throw error with code 'not-found' if the link does not resolve
     * Can throw error with code 'resolve-link-error' if there is a processing error

     * @returns the resolved Dynamic Link
     * @param link The Dynamic Link URL to resolve, either short or long
     */
    resolveLink(link: string): Promise<DynamicLink>;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStatics<
  FirebaseDynamicLinksTypes.Module,
  FirebaseDynamicLinksTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  dynamicLinks: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { dynamicLinks(): FirebaseDynamicLinksTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

    interface Module {
      dynamicLinks: FirebaseModuleWithStatics<
        FirebaseDynamicLinksTypes.Module,
        FirebaseDynamicLinksTypes.Statics
      >;
    }

    interface FirebaseApp {
      dynamicLinks(): FirebaseDynamicLinksTypes.Module;
    }
  }
}
