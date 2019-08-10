---
title: Quick Start
description: Getting started with AdMob in React Native Firebase
---

# AdMob Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/admob
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

The AdMob package provides a JavaScript API for integrating event based adverts such as Interstitial Ads and
React component view adverts such as Banner Ads. It also provides functionality for requesting consent from those users within the EEA, specified by EU ePrivacy Directive & GDPR. 

Import the Cloud Functions package into your project:

```js
import admob from '@react-native-firebase/admob';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/admob';
```

### Important: Adding your AdMob App ID

The AdMob module needs hooking up to your own Google AdMob account. On [the dashboard](https://apps.admob.com/v2/home), you can add an application via the "Apps" menu item. Once created, under the "App settings" section you will find a custom "App ID". This ID is needed in order for the module to be used.

![App ID](https://prismic-io.s3.amazonaws.com/invertase%2F52dd6900-108c-47a6-accb-699fde963b99_new+project+%2813%29.jpg)

> Not adding your App ID will result in a crash on app boot.

Add the ID to your root level `firebase.json` file under the `react-native` object:

```json
{
  "react-native": {
    "admob_app_id": "YOUR_ADMOB_APP_ID",
  }
}
```

Ensure you **rebuild** your application for the changes to take effect.

### European User Consent

Out of the box, AdMob does not handle any related regulations which you may need to enforce on your application. It is up to the developer to implement and handle this on a user-by-user basis. For example, you must consent to EEA users being served both personalized and non-personalized adverts before showing them. For more information, see [Requesting Consent from European Users](https://developers.google.com/admob/android/eu-consent).

The AdMob module provides a `AdConsent` helper to help developers quickly implement consent flows within their application. See the `European User Consent` page for more information. TODO Link

### Example: Displaying an Interstitial

An interstitial is a full screen advert which is overlayed on-top of your currently application. They are perfect for showing periodically between game levels or after the user completes an action.

#### Testing

For testing purposes, a test ad unit is provided to always show an example advert. Lets go ahead and setup a new Interstitial using the testing ID, uing the `InterstitialAd` class:

```js
import { InterstitialAd, TestIds } from '@react-native-firebase/admob';

// Create a new instance
const interstitialAd = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL);

// Add event handlers
interstitialAd.onAdEvent((type, error) => {
  console.log('New advert event: ', type);
});

// Load a new advert
interstitialAd.load();
```

Once our interstitial has been loaded from the Google AdMob servers, we will start to receieve events within our handler (e.g. ad loaded). These events also include user based events such as notifying us when the user has closed the ad, or clicked the ad and left the application. For a full list of events, see the `AdEventType` class.

Once the advert has been loaded, we can show it to the user. Listen out for the loaded event, and once ready, show it to the user:

```js
import { AdEventType } from '@react-native-firebase/admob';

interstitialAd.onAdEvent((type, error) => {
  if (type === AdEventType.LOADED) {
    interstitialAd.show();
  }
});
```

Both the `createForAdRequest` and `show` methods take additional configuration options to tailor the ad experience. See the reference documentation for more information.

#### Production Ad Units

On your Google AdMob dashboard, create a new "Ad Unit" for your application. Select the Interstitial type:

![Interstitial](https://prismic-io.s3.amazonaws.com/invertase%2F24d396b7-d825-407c-a1cd-977042965584_new+project+%2814%29.jpg)

Once created, you will be provided with a new Ad Unit ID which can be passed over to the AdMob module to show content specificly for this ad unit. You can customise the type of content shown from the dashboard.

![Ad Unit ID](https://prismic-io.s3.amazonaws.com/invertase%2F56cdd8b2-6a6e-4e9b-aa1a-30e826b078e6_new+project+%2815%29.jpg)


### Configuring Ad Requests

The AdMob module provides two ways of filtering and handling ad content within your app. 

### Global Configuration

To comply with various online acts, such as [Children's Online Privacy Protection Act (COPPA)](http://business.ftc.gov/privacy-and-security/children%27s-privacy) and [General Data Protection Regulation (GDPR)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679), it is possible to set targetting preferences across every ad request in your aplication.

Using the `setRequestConfiguration` method, all future ad requests will comply with the `RequestConfiguration` set:

```js
import admob, { MaxAdContentRating } from '@react-native-firebase/admob';

await admob().setRequestConfiguration({
  setRequestConfiguration: MaxAdContentRating.PG,
  tagForChildDirectedTreatment: true,
  tagForUnderAgeOfConsent: true,
});
```

For more information on the options available, see the `RequestConfiguration` documentation. 

### Ad Specific Configuration

It is also possible to set ad specific configuration before the advert is loaded from the server, to help tailor ads to specific situations within your application using `RequestOptions`. For example, to request non-personalized ads only, with specific targetting keywords with an Interstitial, pass the config to the `createForAdRequest` method:

```js
import { InterstitialAd, TestIds } from '@react-native-firebase/admob';

// Create a new instance
const interstitialAd = InterstitialAd.createForAdRequest('AD_UNIT_ID', {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing']
});
```
