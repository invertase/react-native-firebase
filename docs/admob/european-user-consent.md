---
title: European User Consent
description: Understand how the EU User Consent Policy can be managed within AdMob and how it affects your application.
---

# European User Consent

Under the Google [EU User Consent Policy](https://www.google.com/about/company/consentstaging.html), you must make
 certain disclosures to your users in the European Economic Area (EEA) and obtain their consent to use cookies or
 other local storage, where legally required, and to use personal data (such as AdID) to serve ads. This policy
 reflects the requirements of the EU ePrivacy Directive and the General Data Protection Regulation (GDPR).

The React Native Firebase AdMob module provides out of the box support for helping to manage your users consent
within your application. The `AdsConsent` helper which comes with the module wraps the Google Consent SDK for both
Android & iOS, and provides a single JavaScript interface for both platforms.

The `AdsConsent` helper & AdMob module provides out of the box support for:
- Requesting consent for multiple publisher IDs.
- Showing a Google-rendered consent form, listing all providers on your enabled mediation networks.
- Manually handling user consent if you prefer not to use the Google-rendered consent form.
- Forwarding your user consent status onto AdMob ad requests.

## Understanding AdMob Ads

Ads served by Google can be categorized as personalized or non-personalized, both requiring consent from users in the EEA. By default,
ad requests to Google serve personalized ads, with ad selection based on the user's previously collected data. Users outside of the EEA do not require consent.

> The `AdsConsent` helper only provides you with the tools for requesting consent, it is up to the developer to ensure the consent status is reflected throughout the app.

## Handling consent

The following steps show the various methods and ways of handling consent within your app.

### Delaying app measurement

By default, the Google Mobile Ads SDK initializes app measurement and begins sending user-level event data to Google immediately when the app starts.
If your app will be used by users within the EEA, it is important you prevent app measurement until your first ad has been requested (after consent).

Within your projects `firebase.json` file, set the `admob_delay_app_measurement_init` to `true` to delay app measurement:

```json
{
  "react-native": {
    "admob_app_id": "YOUR_APP_ID",
    "admob_delay_app_measurement_init": true
  }
}
```

Once set, rebuild your application.

### Requesting consent information

It is recommended you request consent information each time your application starts. The Consent SDK stores the users consent status
based on the state of your AdMob network. If the state changes (e.g. a new mediation provider is added) the SDK automatically
invalidates the consent status (setting is to "UNKNOWN").

The `AdsConsent` helper provides a promised based method to return the users consent status called `requestInfoUpdate`. This method
accepts an array of publisher IDs, which are used by the Consent SDK to determine the users consent status.

Your own publisher ID can be found on the [Google AdMob dashboard](https://apps.admob.com/v2/settings) under "Settings > Account Information":

![Publisher ID](https://prismic-io.s3.amazonaws.com/invertase%2Fbcb7e7d6-2bb3-4e8c-8e6e-be99d6bc4f56_new+project+%2816%29.jpg)

To request consent, call the method as early as possible within your app before presenting any ads:

```js
import { AdsConsent } from '@react-native-firebase/admob';

const consentInfo = await AdsConsent.requestInfoUpdate(['pub-6189033257628123']);
```

The result of the method returns an `AdsConsentInfo` interface, which provides information about the users status and location:

- **status**: The status can be one of 3 outcomes:
  - `UNKNOWN`: The user has not yet given consent, or has been invalidated since the last time they gave consent.
  - `NON_PERSONALIZED`: The user gave consent to see non-personalized ads only.
  - `PERSONALIZED`: The user gave consent to see personalized ads.
- **isRequestLocationInEeaOrUnknown**: A boolean value. If `true` the users location is within the EEA or is unknown.

The combination of status and location allows you to handle the next steps for requesting consent, if required:

1. If the users location is within the EEA or unknown, and their status is unknown, you must request consent before showing any ads.
2. If the users location is within the EEA or unknown, and their status is **not** unknown, you can show only the ad personalization they have requested.
3. If the users location is outside of the EEA, you do not have to give consent.

### Gathering user consent

Now we understand the consent status of the user, we can gather their consent (if required). This can be done in two ways:

1. Using a Google-rendered consent form.
2. Using a custom method.

If you are aware that users are under the age of consent in Europe, it is possible to set this using the `setTagForUnderAgeOfConsent`
method (TFUA). Once the setting is enabled, the Google-rendered consent form will fail to load. All ad requests that include
TFUA will be made ineligible for personalized advertising and remarketing. TFUA disables requests to third-party ad technology
providers, such as ad measurement pixels and third-party ad servers.

To remove this setting, pass `false` to the method.

#### 1. Google-rendered consent form

The Google-rendered consent form is a full-screen configurable form that displays over your app content.
You can configure the form to present the user with combinations of the following options:

- Consent to view personalized ads
- Consent to view non-personalized ads
- Use a paid version of the app instead of viewing ads

You should review the consent text carefully: what appears by default is a message that might be appropriate if you use
Google to monetize your app; but Google cannot provide legal advice on the consent text that is appropriate for you.
To update consent text of the Google-rendered consent form, modify the `consentform.htm`l file included in the Consent SDK as required.

> An [example of a Google-rendered](https://developers.google.com/admob/images/android_eu_consent_form.png) consent form.

To show the consent form, the `AdsConsent` helper provides a `showForm` method, which takes options to configure the form.
You must provide a privacy policy URL.

```js
import { AdsConsent, AdsConsentStatus } from '@react-native-firebase/admob';

const consentInfo = await AdsConsent.requestInfoUpdate(['pub-6189033257628123']);

if (
  consentInfo.isRequestLocationInEeaOrUnknown &&
  consentInfo.status === AdsConsentStatus.UNKNOWN
) {
  const formResult = await AdsConsent.showForm({
    privacyPolicy: 'https://invertase.io/privacy-policy',
    withPersonalizedAds: true,
    withNonPersonalizedAds: true,
    withAdFree: true,
  });
}
```

Once the user has selected their preference, the `formResult` contains their status and whether or not they prefer an
ad-free option of your application (if enabled):

```js
const formResult = await AdsConsent.showForm({
  privacyPolicy: 'https://invertase.io/privacy-policy',
  withPersonalizedAds: true,
  withNonPersonalizedAds: true,
  withAdFree: true,
});

if (formResult.userPrefersAdFree) {
  // Handle the users request, e.g. redirect to a paid for version of the app
}

// The user requested non-personalized or personalized ads
const status = formResult.status;
```

The `formResult.status` provides feedback on whether the user consented to personalized ads, or non-personalized ads.
It is important that you forward this status onto all ad requests (see below).

> Do not persist the status. You could however store this locally in application state (e.g. React Context) and update the status on every app launch as it may change.

#### 2. Custom consent method

If you wish to implement your own consent flow, the `AdsConsent` helper provides the tools needed to accomplish this.
Depending on your requirements, a list of the enabled network mediation providers for the AdMob App ID can be returned and shown
to the user via the `getAdProviders` method:

```js
import { AdsConsent } from '@react-native-firebase/admob';

const providers = await AdsConsent.getAdProviders();
```

Each provider is an interface of `AdProvider`, containing information such as their company ID, company name and privacy policy URL.
Using this information you can request consent from your users.

Once consent has been returned, the Consent SDK needs to be aware of the custom user consent status. This can be forwarded on using the
`setStatus` method, for example:

```js
import { AdsConsent, AdsConsentStatus } from '@react-native-firebase/admob';

// After getting user consent...
await AdsConsent.setStatus(AdsConsentStatus.PERSONALIZED);
```

To invalidate the users consent status (e.g. if the providers list changes since their last consent), set the status back to
`UNKNOWN`. When your application next boots, you can get the users previous consent status using the `getStatus` method.

### Testing

When developing the consent flow, the behaviour of the `AdsConsent` responses may not be reliable due to the environment
(e.g. using an emulator vs real device). It is possible to set a debug location to test the various responses from the
Consent SDK.

If using a real device, ensure you whitelist it using the device ID, which can be obtained from native logs or using a library
such as [react-native-device-info](https://github.com/react-native-community/react-native-device-info). Once found,
call the `addTestDevice(deviceId)` method.

> Emulators are automatically whitelisted.

To set a debug location, use the `setDebugGeography` method. It accepts 3 values:
- **DISABLED**: Removes any previous debug locations.
- **EEA**: Set the test device to be within the EEA.
- **NOT_EEA**: Set the test device to be outside of the EEA.

For example:

```js
import { AdsConsent, AdsConsentDebugGeography } from '@react-native-firebase/admob';

await AdsConsent.setDebugGeography(AdsConsentDebugGeography.EEA);
```

> Always ensure debug information is removed for production apps!

### Forwarding the consent status to ads

Assuming the user is within the EEA and has provided consent, their status needs to be forwarded to every ad request we
make in our application.

> If the user is within the EEA and has not given consent, do not display AdMob ads (even non-personalized).

Taking a Rewarded Video as an example, we can apply the users consent when our ad is loaded via the `RequestOptions`. For example:

```js
import { AdsConsent, RewardedAd } from '@react-native-firebase/admob';

const status = await AdsConsent.getStatus();

const rewardedAd = RewardedAd.createForAdRequest('AD_UNIT_ID', {
  requestNonPersonalizedAdsOnly: status === AdsConsentStatus.NON_PERSONALIZED,
});
```

The requested ad URL via the SDK will send a request with an additional parameter `&npa=1`, which will return a
non-personalized ad.

>  The requestNonPersonalizedAdsOnly option can be applied to every supported ad format.

### Troubleshooting

#### "Could not parse Event FE preflight response."

This is a common error which occurs on both Android & iOS when making a request to display a Google-rendered consent form. Unfortunately the reasoning for this error is generic, making it hard to debug. There are a number of steps to check which are usually the cause for this error:

- The AdMob App ID is incorrect: Ensure you have entered the correct ID into the `firebase.json` file under the `admob_app_id` key in the `react-native` config.
- A publisher ID is incorrect: Ensure your entered publisher IDs are correct.
  - The publisher ID needs to be available on the same account as your AdMob App ID.
- The user is outside of the EEA: If a user does not need to provide consent, the form request will error. Ensure you have checked the users status via `requestInfoUpdate`. If using an emulator, ensure you set a debug location via `setDebugGeography`.
- Your AdMob account is not valid:
  - Your account is disabled: This can occur if Google notices you have duplicate accounts. They will email you about this, and block you from entering the dashboard.
  - You have provided invalid payment information: If your account has no payment information set up, this seems to cause this error to trigger.

If you are still struggling to present the consent form, reach out to AdMob support to investigate your account status.
