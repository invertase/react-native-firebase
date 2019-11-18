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
 * #### Example: access the Firebase export from the `admob` package:
 *
 * ```jS
 * import { firebase } from '@react-native-firebase/admob';
 *
 * // firebase.admob().X
 * ```
 *
 * #### Example: Using the default export from the `admob` package:
 *
 * ```js
 * import admob from '@react-native-firebase/admob';
 *
 * // admob().X
 * ```
 *
 * #### Example: Using the default export from the `app` package:
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
export namespace FirebaseAdMobTypes {
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
     * RewardedAdEventType enum.
     */
    RewardedAdEventType: RewardedAdEventType;

    /**
     * TestIds interface
     */
    TestIds: TestIds;

    /**
     * Used to sets the size of an Advert.
     */
    BannerAdSize: BannerAdSize;
  }

  /**
   * Common event types for ads.
   */
  export interface AdEventType {
    /**
     * When an ad has loaded. At this point, the ad is ready to be shown to the user.
     *
     * #### Example
     *
     * ```js
     * import { AdEventType } from '@react-native-firebase/admob';
     *
     * advert.onAdEvent((type,error,data) => {
     *   if (type === AdEventType.LOADED) {
     *     advert.show();
     *   }
     * });
     * ```
     */
    LOADED: 'loaded';

    /**
     * The ad has thrown an error. See the error parameter the listener callback for more information.
     *
     * #### Example
     *
     * ```js
     * import { AdEventType } from '@react-native-firebase/admob';
     *
     * advert.onAdEvent((type, error, data) => {
     *   if (type === AdEventType.ERROR) {
     *     console.log('Ad error:', error);
     *   }
     * });
     * ```
     */
    ERROR: 'error';

    /**
     * The ad opened and is currently visible to the user. This event is fired after the `show()`
     * method has been called.
     */
    OPENED: 'opened';

    /**
     * The user clicked the advert.
     */
    CLICKED: 'clicked';

    /**
     * The user has left your application (e.g. following the ad).
     *
     * Be sure to pause any tasks on this event (such as music or memory intensive tasks).
     */
    LEFT_APPLICATION: 'left_application';

    /**
     * The user closed the ad and has returned back to your application.
     */
    CLOSED: 'closed';
  }

  /**
   * Ad event types specially for `RewardedAd`.
   */
  export interface RewardedAdEventType {
    /**
     * An event fired when a rewarded ad has loaded.
     *
     * This type differs from `AdEventType.LOADED` as when a rewarded ad is loaded,
     * an additional data payload is provided to the event handler containing the ad reward
     * (assuming the user earns the reward).
     *
     * The reward contains a `type` and `amount`.
     *
     * #### Example
     *
     * ```js
     * import { RewardedAdEventType } from '@react-native-firebase/admob';
     *
     * rewardedAd.onAdEvent((type, error, data) => {
     *   if (type === RewardedAdEventType.LOADED) {
     *     console.log(`Rewarded Ad loaded with ${data.amount} ${data.type} as reward`);
     *     // E.g. "Rewarded Ad loaded with 50 coins as reward"
     *     rewardedAd.show();
     *   }
     * });
     * ```
     */
    LOADED: 'rewarded_loaded';

    /**
     * An event fired when the user earned the reward for the video. If the user does not earn a reward,
     * the `AdEventType.CLOSED` event will be fired with no rewarded event.
     *
     * The reward contains a `type` and `amount`.
     *
     * #### Example
     *
     * ```js
     * import { RewardedAdEventType } from '@react-native-firebase/admob';
     *
     * rewardedAd.onAdEvent((type, error, data) => {
     *   if (type === RewardedAdEventType.EARNED_REWARD) {
     *     console.log(`User earned ${data.amount} ${data.type}`);
     *     // E.g. "User earned 50 coins"
     *   }
     * });
     * ```
     */
    EARNED_REWARD: 'rewarded_earned_reward';
  }

  /**
   * Used to sets the size of an Advert.
   */
  export interface BannerAdSize {
    /**
     * Mobile Marketing Association (MMA) banner ad size (320x50 density-independent pixels).
     */
    BANNER: 'BANNER';

    /**
     * Interactive Advertising Bureau (IAB) full banner ad size (468x60 density-independent pixels).
     */
    FULL_BANNER: 'FULL_BANNER';

    /**
     * Large banner ad size (320x100 density-independent pixels).
     */
    LARGE_BANNER: 'LARGE_BANNER';

    /**
     * Interactive Advertising Bureau (IAB) leaderboard ad size (728x90 density-independent pixels).
     */
    LEADERBOARD: 'LEADERBOARD';

    /**
     * Interactive Advertising Bureau (IAB) medium rectangle ad size (300x250 density-independent pixels).
     */
    MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE';

    /**
     * A dynamically sized banner that is full-width and auto-height.
     */
    SMART_BANNER: 'SMART_BANNER';

    /**
     * A dynamically sized banner that matches its parent's width and expands/contracts its height to match the ad's content after loading completes.
     */
    FLUID: 'FLUID';

    /**
     * IAB wide skyscraper ad size (160x600 density-independent pixels). This size is currently not supported by the Google Mobile Ads network; this is intended for mediation ad networks only.
     */
    WIDE_SKYSCRAPER: 'WIDE_SKYSCRAPER';
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
   * It is recommended that you determine the status of a user's consent at every app launch. The user consent status is held
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
     *     console.log('User accepted non-personalized: ', result.status === AdsConsentStatus.NON_PERSONALIZED);
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
     * This method can also be used to reset the consent status, by setting it to `AdsConsentStatus.UNKNOWN`, which may be useful in certain circumstances.
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
        | AdsConsentStatus.NON_PERSONALIZED
        | AdsConsentStatus.PERSONALIZED,
    ): Promise<void>;

    /**
     * Returns the current consent status of the user.
     *
     * > The user consent status may change at any time, therefore don't reuse old values locally and always request the current value at any time consent is required.
     *
     * #### Example
     *
     * ```js
     * import { AdsConsent } from '@react-native-firebase/admob';
     *
     * const status = await AdsConsent.getStatus();
     * ```
     */
    getStatus(): Promise<
      AdsConsentStatus.UNKNOWN | AdsConsentStatus.NON_PERSONALIZED | AdsConsentStatus.PERSONALIZED
    >;

    /**
     * If a publisher is aware that the user is under the age of consent, all ad requests must set TFUA (Tag For Users
     * Under the Age of consent in Europe). This setting takes effect for all future ad requests.
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
     * If you are unsure of how to obtain a device ID, see [react-native-device-info](https://github.com/react-native-community/react-native-device-info).
     *
     * @param deviceIds An array of testing device ID.
     */
    addTestDevices(deviceIds: string[]): Promise<void>;
  }

  /**
   * The options used to show on the Google-rendered consent form. At least one of `withAdFree`, `withPersonalizedAds` and `WithNonPersonalizedAds` needs to be set to `true`.
   */
  export interface AdsConsentFormOptions {
    /**
     * A fully formed HTTP or HTTPS privacy policy URL for your application.
     *
     * Users will have the option to visit this web page before consenting to ads.
     */
    privacyPolicy: string;

    /**
     * Set to `true` to provide the option for the user to accept being shown personalized ads, defaults to `false`.
     */
    withPersonalizedAds?: boolean;

    /**
     * Set to `true` to provide the option for the user to accept being shown non-personalized ads, defaults to `false`.
     */
    withNonPersonalizedAds?: boolean;

    /**
     * Set to `true` to provide the option for the user to choose an ad-free version of your app, defaults to `false`.
     *
     * If the user chooses this option, you must handle it as required (e.g. navigating to a paid version of the app,
     * or a subscribe view).
     */
    withAdFree?: boolean;
  }

  /**
   * A `AdShowOptions` interface used when showing an ad.
   */
  export interface AdShowOptions {
    /**
     * - On Android, enables [immersive mode](https://developer.android.com/training/system-ui/immersive).
     * - On iOS, this has no effect on how the ad is shown.
     *
     * @android
     */
    immersiveModeEnabled?: boolean;
  }

  /**
   * The result of a Google-rendered consent form.
   */
  export interface AdsConsentFormResult {
    /**
     * The consent status of the user after closing the consent form.
     *
     * - UNKNOWN: The form was unable to determine the users consent status.
     * - NON_PERSONALIZED: The user has accepted non-personalized ads.
     * - PERSONALIZED: The user has accepted personalized ads.
     */
    status:
      | AdsConsentStatus.UNKNOWN
      | AdsConsentStatus.NON_PERSONALIZED
      | AdsConsentStatus.PERSONALIZED;

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
     * - NON_PERSONALIZED: The user has accepted non-personalized ads.
     * - PERSONALIZED: The user has accepted personalized ads.
     */
    status:
      | AdsConsentStatus.UNKNOWN
      | AdsConsentStatus.NON_PERSONALIZED
      | AdsConsentStatus.PERSONALIZED;

    /**
     * If `true` the user is within the EEA or their location could not be determined.
     */
    isRequestLocationInEeaOrUnknown: boolean;
  }

  /**
   * A AdProvider interface returned from `AdsConsent.getProviders`.
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
   *
   * Used to set a mock location when testing the `AdsConsent` helper.
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
     * The user has accepted non-personalized ads.
     */
    NON_PERSONALIZED: 1;

    /**
     * The user has accepted personalized ads.
     */
    PERSONALIZED: 2;
  }

  /**
   * The `RequestOptions` interface. Used when passing additional request options before an advert is loaded.
   */
  export interface RequestOptions {
    /**
     * If `true` only non-personalized ads will be loaded.
     *
     * Google serves personalized ads by default. This option must be `true` if users who are within the EEA have only
     * given consent to non-personalized ads.
     */
    requestNonPersonalizedAdsOnly?: boolean;

    /**
     * Attaches additional properties to an ad request for direct campaign delivery.
     *
     * Takes an array of string key/value pairs.
     *
     * #### Example
     *
     * Attaches `?campaign=abc&user=123` to the ad request:
     *
     * ```js
     * await Interstitial.request('ca-app-pub-3940256099942544/1033173712', {
     *   networkExtras: {
     *     campaign: 'abc',
     *     user: '123',
     *   },
     * });
     */
    networkExtras?: { [key: string]: string };

    /**
     * An array of keywords to be sent when loading the ad.
     *
     * Setting keywords helps deliver more specific ads to a user based on the keywords.
     *
     * #### Example
     *
     * ```js
     * await Interstitial.request('ca-app-pub-3940256099942544/1033173712', {
     *   keywords: ['fashion', 'clothing'],
     * });
     * ```
     */
    keywords?: string[];

    /**
     * An array of test device IDs to whitelist.
     *
     * If using an emulator, set the device ID to `EMULATOR`.
     *
     * ```js
     * await Interstitial.request('ca-app-pub-3940256099942544/1033173712', {
     *   testDevices: ['EMULATOR'],
     * });
     * ```
     */
    testDevices?: string[];

    /**
     * Sets a content URL for targeting purposes.
     *
     * Max length of 512.
     */
    contentUrl?: string;

    /**
     * The latitude and longitude location of the user.
     *
     * Ensure your app requests location permissions from the user.
     *
     * #### Example
     *
     * ```js
     * await Interstitial.request('ca-app-pub-3940256099942544/1033173712', {
     *   location: [53.481073, -2.237074],
     * });
     * ```
     */
    location?: string[];

    /**
     * Sets the location accuracy if the location is set, in meters.
     *
     * This option is only applied to iOS devices. On Android, this option has no effect.
     *
     * @ios
     */
    locationAccuracy?: number;

    /**
     * Sets the request agent string to identify the ad request's origin. Third party libraries that reference the Mobile
     * Ads SDK should call this method to denote the platform from which the ad request originated. For example, if a
     * third party ad network called "CoolAds network" mediates requests to the Mobile Ads SDK, it should call this
     * method with "CoolAds".
     *
     * #### Example
     *
     * ```js
     * await Interstitial.request('ca-app-pub-3940256099942544/1033173712', {
     *   requestAgent: 'CoolAds',
     * });
     * ```
     */
    requestAgent?: string;
  }

  /**
   * The `RequestConfiguration` used when setting global ad settings via `setRequestConfiguration`.
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
   * A `RewardedAdReward` returned from rewarded ads.
   */
  export interface RewardedAdReward {
    /**
     * The reward name, e.g. 'coins', 'diamonds'.
     */
    type: string;

    /**
     * The number value of the reward, e.g. 10
     */
    amount: number;
  }

  /**
   * A callback interface for all ad events.
   *
   * @param type The event type, e.g. `AdEventType.LOADED`.
   * @param error An optional JavaScript Error containing the error code and message.
   * @param data Optional data for the event, e.g. reward type and amount
   */
  export type AdEventListener = (
    type:
      | AdEventType.LOADED
      | AdEventType.ERROR
      | AdEventType.OPENED
      | AdEventType.CLICKED
      | AdEventType.LEFT_APPLICATION
      | AdEventType.CLOSED
      | RewardedAdEventType.LOADED
      | RewardedAdEventType.EARNED_REWARD,
    error?: Error,
    data?: any | RewardedAdReward,
  ) => void;

  /**
   * Base class for InterstitialAd, RewardedAd, NativeAd and BannerAd.
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
     */
    load(): void;

    /**
     * Listen to ad events. See AdEventTypes for more information.
     *
     * Returns an unsubscriber function to stop listening to further events.
     *
     * #### Example
     *
     * ```js
     * // Create InterstitialAd/RewardedAd
     * const advert = InterstitialAd.createForAdRequest('...');
     *
     * const unsubscribe = advert.onAdEvent((type) => {
     *
     * });
     *
     * // Sometime later...
     * unsubscribe();
     * ```
     *
     * @param listener A listener callback containing a event type, error and data.
     */
    onAdEvent(listener: AdEventListener): Function;

    /**
     * Show the loaded advert to the user.
     *
     * #### Example
     *
     * ```js
     * // Create InterstitialAd/RewardedAd
     * const advert = InterstitialAd.createForAdRequest('...');
     *
     * advert.onAdEvent((type) => {
     *   if (type === AdEventType.LOADED) {
     *     advert.show({
     *       immersiveModeEnabled: true,
     *     });
     *   }
     * });
     * ```
     *
     * @param showOptions An optional `AdShowOptions` interface.
     */
    show(showOptions?: AdShowOptions): Promise<void>;
  }

  /**
   * A class for interacting and showing Interstitial Ads.
   *
   * An Interstitial advert can be pre-loaded and shown at a suitable point in your apps flow, such as at the end of a level
   * in a game. An Interstitial is a full screen advert, laid on-top of your entire application which the user can interact with.
   * Interactions are passed back via events which should be handled accordingly inside of your app.
   *
   * #### Example
   *
   * First create a new Interstitial instance, passing in your Ad Unit ID from the Firebase console, and any additional
   * request options. The example below will present a test advert, and only request a non-personalized ad.
   *
   * ```js
   * import { InterstitialAd, TestIds } from '@react-native-firebase/admob';
   *
   * const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
   *     requestNonPersonalizedAdsOnly: true,
   * });
   *  ```
   *
   * Each advert needs to be loaded from AdMob before being shown. It is recommended this is performed before the user
   * reaches the checkpoint to show the advert, so it's ready to go. Before loading the advert, we need to setup
   * event listeners to listen for updates from AdMob, such as advert loaded or failed to load.
   *
   * Event types match the `AdEventType` interface. Once the advert has loaded, we can trigger it to show:
   *
   * ```js
   * import { AdEventType } from '@react-native-firebase/admob';
   *
   * interstitial.onAdEvent((type) => {
   *   if (type === AdEventType.LOADED) {
   *     interstitial.show();
   *   }
   * });
   *
   * interstitial.load();
   *  ```
   *
   * The advert will be presented to the user, and several more events can be triggered such as the user clicking the
   * advert or closing it.
   */
  export class InterstitialAd extends MobileAd {
    /**
     * Creates a new InterstitialAd instance.
     *
     * #### Example
     *
     * ```js
     * import { InterstitialAd, AdEventType, TestIds } from '@react-native-firebase/admob';
     *
     * const interstitialAd = await InterstitialAd.request(TestIds.INTERSTITIAL, {
     *   requestAgent: 'CoolAds',
     * });
     *
     * interstitialAd.onAdEvent((type, error) => {
     *   console.log('New event: ', type, error);
     *
     *   if (type === AdEventType.LOADED) {
     *     interstitialAd.show();
     *   }
     * });
     *
     * interstitialAd.load();
     * ```
     *
     * @param adUnitId The Ad Unit ID for the Interstitial. You can find this on your Google AdMob dashboard.
     * @param requestOptions Optional RequestOptions used to load the ad.
     */
    static createForAdRequest(adUnitId: string, requestOptions?: RequestOptions): InterstitialAd;
  }

  /**
   * A class for interacting and showing Rewarded Ads.
   *
   * An Rewarded advert can be pre-loaded and shown at a suitable point in your apps flow, such as at the end of a level
   * in a game. The content of a rewarded advert can be controlled via your AdMob dashboard. Typically users are rewarded
   * after completing a specific advert action (e.g. watching a video or submitting an option via an interactive form).
   * Events (such as the user earning a reward or closing a rewarded advert early) are sent back for you to handle accordingly
   * within your application.
   *
   * #### Example
   *
   * First create a new Rewarded instance, passing in your Ad Unit ID from the Firebase console, and any additional
   * request options. The example below will present a test advert, and only request a non-personalized ad.
   *
   * ```js
   * import { RewardedAd, TestIds } from '@react-native-firebase/admob';
   *
   * const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
   *     requestNonPersonalizedAdsOnly: true,
   * });
   *  ```
   *
   * Each advert needs to be loaded from AdMob before being shown. It is recommended this is performed before the user
   * reaches the checkpoint to show the advert, so it's ready to go. Before loading the advert, we need to setup
   * event listeners to listen for updates from AdMob, such as advert loaded or failed to load.
   *
   * Event types match the `AdEventType` or `RewardedAdEventType` interface. The potential user reward for rewarded
   * adverts are passed back to the event handler on advert load and when the user earns the reward.
   *
   * ```js
   * import { RewardedAdEventType } from '@react-native-firebase/admob';
   *
   * rewarded.onAdEvent((type, error, reward) => {
   *   if (type === RewardedAdEventType.LOADED) {
   *     rewarded.show();
   *   }
   *   if (type === RewardedAdEventType.EARNED_REWARD) {
   *     console.log('User earned reward of ', reward);
   *   }
   * });
   *
   * rewarded.load();
   *  ```
   *
   * The rewarded advert will be presented to the user, and several more events can be triggered such as the user clicking the
   * advert, closing it or completing the action.
   */
  export class RewardedAd extends MobileAd {
    /**
     * Creates a new RewardedAd instance.
     *
     * #### Example
     *
     * ```js
     * import { RewardedAd, RewardedAdEventType, TestIds } from '@react-native-firebase/admob';
     *
     * const rewardedAd = await RewardedAd.request(TestIds.REWARDED, {
     *   requestAgent: 'CoolAds',
     * });
     *
     * rewardedAd.onAdEvent((type, error, data) => {
     *   console.log('New event: ', type, error);
     *
     *   if (type === RewardedAdEventType.LOADED) {
     *     rewardedAd.show();
     *   }
     * });
     *
     * rewardedAd.load();
     * ```
     *
     * @param adUnitId The Ad Unit ID for the Rewarded Ad. You can find this on your Google AdMob dashboard.
     * @param requestOptions Optional RequestOptions used to load the ad.
     */
    static createForAdRequest(adUnitId: string, requestOptions?: RequestOptions): RewardedAd;
  }

  /**
   * An interface for a Banner advert component.
   *
   * #### Example
   *
   * The `BannerAd` interface is exposed as a React component, allowing you to integrate ads within your existing React
   * Native code base. The component itself is isolated, meaning any standard `View` props (e.g. `style`) are not
   * forwarded on. It is recommended you wrap the `BannerAd` within your own `View` if you wish to apply custom props for use-cases
   * such as positioning.
   *
   * ```js
   * import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';
   *
   * function HomeScreen() {
   *   return (
   *     <BannerAd
   *       unitId={TestIds.BANNER}
   *       size={BannerAdSize.FULL_BANNER}
   *       requestOptions={{
   *         requestNonPersonalizedAdsOnly: true,
   *       }}
   *       onAdLoaded={() => {
   *         console.log('Advert loaded');
   *       }}
   *       onAdFailedToLoad={(error) => {
   *         console.error('Advert failed to load: ', error);
   *       }}
   *     />
   *   );
   * }
   * ```
   */
  export interface BannerAd {
    /**
     * The AdMob unit ID for the banner.
     */
    unitId: string;

    /**
     * The size of the banner. Can be a predefined size via `BannerAdSize` or custom dimensions, e.g. `300x200`.
     *
     * Inventory must be available for the banner size specified, otherwise a no-fill error will be sent to `onAdFailedToLoad`.
     */
    size: BannerAdSize | string;

    /**
     * The request options for this banner.
     */
    requestOptions?: RequestOptions;

    /**
     * When an ad has finished loading.
     */
    onAdLoaded: Function;

    /**
     * When an ad has failed to load. Callback contains an Error.
     */
    onAdFailedToLoad: Function;

    /**
     * The ad is now visible to the user.
     */
    onAdOpened: Function;

    /**
     * Called when the user is about to return to the app after tapping on an ad.
     */
    onAdClosed: Function;

    /**
     * Called when the user has left the application (e.g. clicking an advert).
     */
    onAdLeftApplication: Function;
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
     * await admob().setRequestConfiguration({
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
  // tslint:disable-next-line:no-duplicate-imports required otherwise doesn't work
  import { ReactNativeFirebase } from '@react-native-firebase/app';
  import React from 'react';
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
  import BannerAd = FirebaseAdMobTypes.BannerAd;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  export const AdsConsentDebugGeography: {} & FirebaseAdMobTypes.AdsConsentDebugGeography;
  export const AdsConsentStatus: {} & FirebaseAdMobTypes.AdsConsentStatus;
  export const MaxAdContentRating: {} & FirebaseAdMobTypes.MaxAdContentRating;
  export const TestIds: {} & FirebaseAdMobTypes.TestIds;
  export const AdEventType: {} & FirebaseAdMobTypes.AdEventType;
  export const BannerAdSize: {} & FirebaseAdMobTypes.BannerAdSize;
  export const RewardedAdEventType: {} & FirebaseAdMobTypes.RewardedAdEventType;
  export const AdsConsent: {} & FirebaseAdMobTypes.AdsConsent;
  export const InterstitialAd: typeof FirebaseAdMobTypes.InterstitialAd;
  export const RewardedAd: typeof FirebaseAdMobTypes.RewardedAd;
  export const BannerAd: React.SFC<BannerAd>;

  const defaultExport: FirebaseModuleWithStaticsAndApp<
    FirebaseAdMobTypes.Module,
    FirebaseAdMobTypes.Statics
  >;
  export default defaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

    interface Module {
      admob: FirebaseModuleWithStaticsAndApp<FirebaseAdMobTypes.Module, FirebaseAdMobTypes.Statics>;
    }

    interface FirebaseApp {
      admob(): FirebaseAdMobTypes.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    /**
     * The Google AdMob application App ID for Android.
     *
     * This can be found under: Apps > App settings > App ID on the Google AdMob dashboard.
     *
     * For testing purposes, use the App ID: `ca-app-pub-3940256099942544~3347511713`.
     *
     * @android
     */
    admob_android_app_id: string;

    /**
     * The Google AdMob application App ID for iOS.
     *
     * This can be found under: Apps > App settings > App ID on the Google AdMob dashboard.
     *
     * For testing purposes, use the App ID: `ca-app-pub-3940256099942544~1458002511`.
     *
     * @ios
     */
    admob_ios_app_id: string;

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
