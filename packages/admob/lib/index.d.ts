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
 * Firebase Admob package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `admob` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/admob';
 *
 * // firebase.admob().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `admob` package:
 *
 * ```js
 * import admob from '@react-native-firebase/admob';
 *
 * // admob().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/admob';
 *
 * // firebase.admob().X
 * ```
 *
 * @firebase admob
 */
export namespace Admob {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * firebase.admob.X
   */
  export interface Statics {
    /**
     * AdsConsentStatus interface.
     */
    AdsConsentStatus: AdsConsentStatus;

    /**
     * AdsConsentDebugGeography interface.
     */
    AdsConsentDebugGeography: AdsConsentDebugGeography;

    /**
     * AdsConsentDebugGeography interface.
     */
    MaxAdContentRating: MaxAdContentRating;

    /**
     * AdEventType enum.
     */
    AdEventType: AdEventType;

    /**
     * TestIds interface
     */
    TestIds: TestIds;
  }

  export enum AdEventType {
    LOADED = 'loaded',

    ERROR = 'error',

    OPENED = 'opened',

    CLICKED = 'clicked',

    LEFT_APPLICATION = 'left_application',

    CLOSED = 'closed',
  }

  /**
   * Ad Unit IDs used for testing purposes. These should not be used in production apps.
   */
  export interface TestIds {
    BANNER: string;
    INTERSTITIAL: string;
    REWARDED: string;
  }

  /**
   * Under the Google [EU User Consent Policy](https://www.google.com/about/company/consentstaging.html), you must make certain disclosures to your users in the European Economic Area (EEA)
   * and obtain their consent to use cookies or other local storage, where legally required, and to use personal data
   * (such as AdID) to serve ads. This policy reflects the requirements of the EU ePrivacy Directive and the
   * General Data Protection Regulation (GDPR).
   *
   * It is recommended that you determine the status of a user's consent ay every app launch. The user consent status is held
   * on the device until a condition changes which requires the user to consent again, such as a change in publishers.
   *
   * For more information, see [here](https://developers.google.com/admob/android/eu-consent#delay_app_measurement_optional).
   */
  export interface AdsConsent {
    /**
     * Requests user consent for a given list of publisher IDs.
     *
     * The list of publisher IDs can be obtained from the settings panel on the Google AdMob console. If the list of
     * publisher IDs has changed since the last time a user provided consent, their consent status will be reset to
     * 'UNKNOWN' and they must provide consent again.
     *
     * If the request fails with the error "Could not parse Event FE preflight response", this means the state of your
     * Google AdMob account is not complete. Ensure you have validated your account and have setup valid payment
     * information. This error is also thrown when a Publisher ID is invalid.
     *
     * The response from this method provides request location and consent status properties.
     *
     * If request location is within the EEA or unknown, and the consent status is also unknown, you
     * must request consent via the `showForm()` method or your own means.
     *
     * If the consent status is not unknown, the user has already previously provided consent for the current publisher
     * scope.
     *
     * #### Example
     *
     * ```js
     * import { AdsConsent } from '@react-native-firebase/admob';
     *
     * const consent = await AdsConsent.requestInfoUpdate(['pub-6189033257628554']);
     * console.log('User location within EEA or Unknown:', consent.isRequestLocationInEeaOrUnknown);
     * console.log('User consent status:', consent.status);
     * ```
     *
     * @param publisherIds A list of publisher IDs found on your Google AdMob dashboard.
     */
    requestInfoUpdate(publisherIds: string[]): Promise<AdsConsentInfo>;

    /**
     * Shows a Google-rendered user consent form.
     *
     * The Google-rendered consent form is a full-screen configurable form that displays over your app content. The form
     * allows the following configuration options:
     *
     * 1. Consent to view personalized ads (via `withPersonalizedAds`).
     * 2. Consent to view non-personalized ads (via `withNonPersonalizedAds`).
     * 3. Use a paid version of the app instead of viewing ads (via `withAdFree`).
     *
     * Every consent form requires a privacy policy URL which outlines the usage of your application.
     *
     * You should review the consent text carefully: what appears by default is a message that might be appropriate if
     * you use Google to monetize your app.
     *
     * If providing an ad-free version of your app, ensure you handle this once the form has been handled by the user
     * via the `userPrefersAdFree` property. The users preference on consent is automatically forwarded onto the Google
     * Mobile SDKs and saved.
     *
     * If the user is outside of the EEA, the request form will error.
     *
     * #### Example
     *
     * ```js
     * import { AdsConsent, AdsConsentStatus } from '@react-native-firebase/admob';
     *
     * async function requestConsent() {
     *   const consent = await AdsConsent.requestInfoUpdate(['pub-6189033257628554']);
     *
     *   // Check if user requires consent
     *   if (consent.isRequestLocationInEeaOrUnknown && consent.status === AdsConsentStatus.UNKNOWN) {
     *     // Show a Google-rendered form
     *     const result = await AdsConsent.showForm({
     *       privacyPolicy: 'https://invertase.io/privacy-policy',
     *       withPersonalizedAds: true,
     *       withNonPersonalizedAds: true,
     *       withAdFree: true,
     *     });
     *
     *     console.log('User accepted personalized: ', result.status === AdsConsentStatus.PERSONALIZED);
     *     console.log('User accepted non-personalized: ', result.status === AdsConsentStatus.NONPERSONALIZED);
     *     console.log('User prefers Ad Free version of app: ', result.userPrefersAdFree);
     *   }
     * }
     *
     * ```
     *
     * @param options An AdsConsentFormOptions interface to control the Google-rendered form.
     */
    showForm(options?: AdsConsentFormOptions): Promise<AdsConsentFormResult>;

    /**
     * Returns a list of ad providers currently in use for the given AdMob App ID.
     *
     * If requesting consent from the user via your own method, this list of ad providers must be shown to the user
     * for them to accept consent.
     *
     * #### Example
     *
     * ```js
     * import { AdsConsent } from '@react-native-firebase/admob';
     *
     * const providers = await AdsConsent.getAdProviders();
     * ```
     */
    getAdProviders(): Promise<AdProvider[]>;

    /**
     * Sets the debug geography to locally test consent.
     *
     * If debugging on an emulator (where location cannot be determined) or outside of the EEA,
     * it is possible set your own location to test how your app handles different scenarios.
     *
     * If using a real device, ensure you have set it as a test device via `addTestDevice()` otherwise this method will have
     * no effect.
     *
     * #### Example
     *
     * ```js
     * import { AdsConsent, AdsConsentDebugGeography } from '@react-native-firebase/admob';
     *
     * // Set disabled
     * await AdsConsentDebugGeography.setDebugGeography(AdsConsentDebugGeography.DISABLED);
     *
     * // Set within EEA
     * await AdsConsentDebugGeography.setDebugGeography(AdsConsentDebugGeography.EEA);
     *
     * // Set outside EEA
     * await AdsConsentDebugGeography.setDebugGeography(AdsConsentDebugGeography.NOT_EEA);
     * ```
     *
     * @param geography The debug geography location.
     */
    setDebugGeography(
      geography:
        | AdsConsentDebugGeography.DISABLED
        | AdsConsentDebugGeography.EEA
        | AdsConsentDebugGeography.NOT_EEA,
    ): Promise<void>;

    /**
     * Manually update the consent status of the user.
     *
     * This method is used when providing your own means of user consent. If using the Google-rendered form via `showForm()`,
     * the consent status is automatically set and calling this method is not required.
     *
     * This method can also be used to reset the consent status (via UNKNOWN) which may be useful in certain circumstances.
     *
     * #### Example
     *
     * ```js
     * import { AdsConsent, AdsConsentStatus } from '@react-native-firebase/admob';
     *
     * // User accepted personalized ads
     * await AdsConsent.setStatus(AdsConsentStatus.PERSONALIZED);
     * ```
     *
     * @param status The user consent status.
     */
    setStatus(
      status:
        | AdsConsentStatus.UNKNOWN
        | AdsConsentStatus.PERSONALIZED
        | AdsConsentStatus.UNPERSONALIZED,
    ): Promise<void>;

    /**
     * If a publisher is aware that the user is under the age of consent, all ad requests must set TFUA (Tag For Users
     * under the Age of Consent in Europe). This setting takes effect for all future ad requests.
     *
     * Once the TFUA setting is enabled, the Google-rendered consent form will fail to load. All ad requests that include
     * TFUA will be made ineligible for personalized advertising and remarketing. TFUA disables requests to third-party
     * ad technology providers, such as ad measurement pixels and third-party ad servers.
     *
     * To remove TFUA from ad requests, set the value to `false`.
     *
     * #### Example
     *
     * ```js
     * import { AdsConsent } from '@react-native-firebase/admob';
     *
     * // User is under age of consent
     * await AdsConsent.setTagForUnderAgeOfConsent(true);
     * ```
     *
     * @param tag The boolean value to tag for under age consent.
     */
    setTagForUnderAgeOfConsent(tag: boolean): Promise<void>;

    /**
     * If using a real device to test, ensure the device ID is provided to the Google AdMob SDK so any mock debug locations
     * can take effect.
     *
     * Emulators are automatically whitelisted and require no action.
     *
     * If you are unsure of how to obtain your device ID, see [react-native-device-info](https://github.com/react-native-community/react-native-device-info).
     *
     * @param deviceId The testing device ID.
     */
    addTestDevice(deviceId: string): Promise<void>;
  }

  /**
   * The options used to show on the Google-rendered consent form.
   */
  export interface AdsConsentFormOptions {
    /**
     * A fully formed HTTP or HTTPS privacy policy URL for your application.
     *
     * Users will have the option to visit this webpage before consenting to ads.
     */
    privacyPolicy: string;

    /**
     * Set to `true` to provide the option for the user to accept being shown personalized ads.
     */
    withPersonalizedAds?: boolean;

    /**
     * Set to `true` to provide the option for the user to accept being shown non-personalized ads.
     */
    withNonPersonalizedAds?: boolean;

    /**
     * Set to `true` to provide the option for the user to choose an ad-free version of your app.
     *
     * If the user chooses this option, you must handle it as required (e.g. navigating to a paid version of the app,
     * or registering).
     */
    withAdFree?: boolean;
  }

  /**
   * The result of a Google-rendered consent form.
   */
  export interface AdsConsentFormResult {
    /**
     * The consent status of the user after closing the consent form.
     *
     * - UNKNOWN: The form was unable to determine the users consent status.
     * - PERSONALIZED: The user has accepted personalized ads.
     * - UNPERSONALIZED: The user has accepted unpersonalized ads.
     */
    status:
      | AdsConsentStatus.UNKNOWN
      | AdsConsentStatus.PERSONALIZED
      | AdsConsentStatus.UNPERSONALIZED;

    /**
     * If `true`, the user requested an ad-free version of your application.
     */
    userPrefersAdFree: boolean;
  }

  /**
   * The result of requesting info about a users consent status.
   */
  export interface AdsConsentInfo {
    /**
     * The consent status of the user.
     *
     * - UNKNOWN: The consent status is unknown and the user must provide consent to show ads if they are within the EEA or location is also unknown.
     * - PERSONALIZED: The user has accepted personalized ads.
     * - UNPERSONALIZED: The user has accepted unpersonalized ads.
     */
    status:
      | AdsConsentStatus.UNKNOWN
      | AdsConsentStatus.PERSONALIZED
      | AdsConsentStatus.UNPERSONALIZED;

    /**
     * If `true` the user is within the EEA or their location could not be determined.
     */
    isRequestLocationInEeaOrUnknown: boolean;
  }

  /**
   * A AdProvider interface.
   */
  export interface AdProvider {
    /**
     * A provider company ID.
     */
    companyId: string;

    /**
     * A provider company name.
     */
    companyName: string;

    /**
     * A fully formed URL for the privacy policy of the provider.
     */
    privacyPolicyUrl: string;
  }

  /**
   * AdsConsentDebugGeography interface.
   */
  export interface AdsConsentDebugGeography {
    /**
     * Disable any debug geography.
     */
    DISABLED: 0;

    /**
     * Sets the location to within the EEA.
     */
    EEA: 1;

    /**
     * Sets the location to outside of the EEA.
     */
    NOT_EEA: 2;
  }

  /**
   * AdsConsentStatus interface.
   */
  export interface AdsConsentStatus {
    /**
     * The consent status is unknown and the user must provide consent to show ads if they are within the EEA or location is also unknown.
     */
    UNKNOWN: 0;

    /**
     * The user has accepted personalized ads.
     */
    PERSONALIZED: 1;

    /**
     * The user has accepted unpersonalized ads.
     */
    UNPERSONALIZED: 2;
  }

  /**
   *
   */
  export interface RequestConfiguration {
    /**
     * The maximum ad content rating for all ads.  AdMob ads returns ads at or below the specified level.
     *
     * Ratings are based on the [digital content label classifications](https://support.google.com/admob/answer/7562142).
     */
    maxAdContentRating?:
      | MaxAdContentRating.G
      | MaxAdContentRating.PG
      | MaxAdContentRating.T
      | MaxAdContentRating.MA;

    /**
     * If `true`, indicates that you want your content treated as child-directed for purposes of COPPA.
     *
     * For purposes of the [Children's Online Privacy Protection Act (COPPA)](http://business.ftc.gov/privacy-and-security/children%27s-privacy),
     * there is a setting called "tag for child-directed treatment". By setting this tag, you certify that this notification
     * is accurate and you are authorized to act on behalf of the owner of the app. You understand that abuse of this
     * setting may result in termination of your Google account.
     */
    tagForChildDirectedTreatment?: boolean;

    /**
     * If `true`, indicates that you want the ad request to be handled in a manner suitable for users under the age of consent.
     *
     * You can mark your ad requests to receive treatment for users in the European Economic Area (EEA) under the age of consent.
     * This feature is designed to help facilitate compliance with the [General Data Protection Regulation (GDPR)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679).
     *
     * See the [Google Mobile SDK docs](https://developers.google.com/admob/android/targeting#ad_content_filtering) for more information.
     */
    tagForUnderAgeOfConsent?: boolean;
  }

  /**
   * The MaxAdContentRating interface used when setting global advert request options.
   */
  export interface MaxAdContentRating {
    /**
     * "General audiences." Content suitable for all audiences, including families and children.
     */
    G: 'G';

    /**
     * "Parental guidance." Content suitable for most audiences with parental guidance, including topics like non-realistic, cartoonish violence.
     */
    PG: 'PG';

    /**
     * T: "Teen." Content suitable for teen and older audiences, including topics such as general health, social networks, scary imagery, and fight sports.
     */
    T: 'T';

    /**
     * "Mature audiences." Content suitable only for mature audiences; includes topics such as alcohol, gambling, sexual content, and weapons.
     */
    MA: 'MA';
  }

  /**
   * Base call for InterstitialAd, RewardedAd and NativeAd.
   */
  export class MobileAd {
    /**
     * The Ad Unit ID for this AdMob ad.
     */
    adUnitId: string;

    /**
     * Whether the advert is loaded and can be shown.
     */
    loaded: boolean;

    /**
     * Start loading the advert with the provided RequestOptions.
     *
     * It is recommended you setup ad event handlers before calling this method.
     *
     * #### Example
     *
     * ```js
     *
     * ```
     */
    load(): void;

    /**
     * Listen to ad events. See AdEventTypes for more information.
     *
     * @param listener
     */
    onAdEvent(listener: AdEventListener): Function;
  }

  /**
   *
   */
  export class InterstitialAd extends MobileAd {
    /**
     * Creates a new InterstitialAd instance.
     *
     * @param adUnitId The Ad Unit ID for the Interstitial. You can find this on your Google AdMob dashboard.
     * @param requestOptions Optional RequestOptions used to load the ad.
     */
    static createForAdRequest(adUnitId: string, requestOptions?: RequestOptions): InterstitialAd;

    /**
     * Once loaded, call this method to show the advert on your app.
     *
     * #### Example
     *
     * ```js
     *
     * ```
     */
    show(): Promise<void>;
  }

  /**
   * The Firebase Admob service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Admob service for the default app:
   *
   * ```js
   * const defaultAppAdmob = firebase.admob();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Sets request options for all future ad requests.
     *
     * #### Example
     *
     * ```js
     * import admob, { MaxAdContentRating } from '@react-native-firebase/admob';
     *
     * await admob.setRequestConfiguration({
     *   // Update all future requests suitable for parental guidance
     *   maxAdContentRating: MaxAdContentRating.PG,
     * });
     * ```
     *
     * @param requestConfiguration An RequestConfiguration interface used on all future AdMob ad requests.
     */
    setRequestConfiguration(requestConfiguration: RequestConfiguration): Promise<void>;
  }
}

declare module '@react-native-firebase/admob' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStaticsAndApp<Admob.Module, Admob.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

    interface Module {
      admob: FirebaseModuleWithStaticsAndApp<Admob.Module, Admob.Statics>;
    }

    interface FirebaseApp {
      admob(): Admob.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    /**
     * The Google AdMob application App ID.
     *
     * This can be found under: Apps > App settings > App ID on the Google AdMob dashboard.
     *
     * For testing purposes, use the App ID: `ca-app-pub-3940256099942544~3347511713`.
     */
    admob_app_id: string;

    /**
     * By default, the Google Mobile Ads SDK initializes app measurement and begins sending user-level event data to
     * Google immediately when the app starts. This initialization behavior ensures you can enable AdMob user metrics
     * without making additional code changes.
     *
     * If you require your app users to provide consent before collecting data, setting the value to `true` will prevent
     * data being sent until the `firebase.admob().initialize()` method has been called.
     */
    admob_delay_app_measurement_init: boolean;
  }
}
