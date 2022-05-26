---
title: Dynamic Links
description: Installation and getting started with Dynamic Links.
icon: //static.invertase.io/assets/firebase/dynamic-links.svg
next: /in-app-messaging/usage
previous: /database/presence-detection
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

This module also requires that the `@react-native-firebase/analytics` module is already setup and installed. To install the "analytics" module, view it's [Getting Started](/analytics/usage) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the dynamic-links module
yarn add @react-native-firebase/dynamic-links

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/dynamic-links/usage/installation/ios) and [Android](/dynamic-links/usage/installation/android).

# What does it do

Dynamic Links are links that work the way you want, on either iOS or Android and whether or not your app is already installed.

<Youtube id="LvY1JMcrPF8" />

With Dynamic Links, your users get the best available experience for the platform they open your link on. If a user opens
a Dynamic Link on iOS or Android, they can be taken directly to the linked content in your app.

# Usage

## Firebase Setup

1. Open the Dynamic Links tab and configure a new domain for your app. In this test example, we've created one for `https://rnfbtestapplication.page.link`.

![Firebase console dynamic link first step](https://images.prismic.io/invertase/4152f98c-b4e9-4561-a790-a0750a0392bb_Screenshot+2020-05-07+at+09.26.47.png?auto=compress,format)

2. Create a dynamic link with your domain in the Firebase console. The freshly created dynamic link URL will appear in the table.

![Firebase console dynamic link second step](https://images.prismic.io/invertase/7e5c7a61-899f-45e5-ab4e-ddf3cfee636a_Screenshot+2020-05-07+at+10.26.22.png?auto=compress,format)

## iOS Setup

To setup Dynamic Links on iOS, it is a **prerequisite** that you have an Apple developer account [setup](https://developer.apple.com/programs/enroll/).

1. Add an `App Store ID` & `Team ID` to your app in your Firebase console. If you do not have an `App Store ID` yet, you can put any number in here for now. Your `Team ID` can be found in your Apple developer console.

![iOS dynamic link first step](https://images.prismic.io/invertase/30e302f6-a7bb-4e37-98fd-7115dac4c1f1_Screenshot+2020-05-07+at+09.10.02.png?auto=compress,format)

2. Test the domain you created in your Firebase console (first step in `Firebase Setup`). Go to the following location in your browser `[your domain]/apple-app-site-association`. The response will have a `details` array property containing an object that has the property `appID`. That will be your app's app ID (It may take some
   time for your domain to register). Please ensure it is registered before proceeding.

3. Once you're sure your domain is registered, you need to head over to your Apple developer console and create a provisioning profile for your app. Please ensure you've enabled the `Associated Domain` capability which you should check before proceeding.

![iOS dynamic link third step](https://images.prismic.io/invertase/12d6e692-c2b1-47f5-98aa-f364c928114a_Screenshot+2020-05-07+at+10.03.45.png?auto=compress,format)

4. Open your project in Xcode and open your app under the `TARGETS` header. Click the `Signing & Capabilities` tab. You will need to ensure your `Team` is registered, and your `Provisioning Profile` field is completed. Please add the domain you created in your
   Firebase console to the `Associated Domains` and prefix with `applinks:`

![iOS dynamic link fourth step](https://images.prismic.io/invertase/d7a8696f-bef1-44a4-b048-aab7bb534f71_Screenshot+2020-05-07+at+09.55.53.png?auto=compress,format)

5. Click the `Info` tab, and add a `URL Type` to your project. The `Identifier` can be called `Bundle Id` or whatever you wish. Add your bundle identifier to the `URL Schemes` property.

![iOS dynamic link fifth step](https://images.prismic.io/invertase/cb029ba6-ad40-494e-a3f6-2aacaff494d1_Screenshot+2020-05-07+at+10.16.16.png?auto=compress,format)

### Dynamic Links With Custom Domains

If you have set up a [custom domain](https://firebase.google.com/docs/dynamic-links/custom-domains) for your Firebase project, you must add the dynamic link URL prefix into your iOS project's `info.plist` file by using the `FirebaseDynamicLinksCustomDomains` key. You can add multiple URLs as well.

Example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>FirebaseDynamicLinksCustomDomains</key>
  <array>
    <string>https://custom.domain.io/bla</string>
    <string>https://custom.domain.io/bla2</string>
  </array>

  ...other settings

</dict>
</plist>
```

If you don't add this, the dynamic link will invoke your app, but you cannot retrieve any deep link data you may need within your app, as the deep link will be completely ignored.

## iOS Testing Your Dynamic Link

To test your dynamic link, you will need to use a real device as it will not work on a simulator.

### Application Is Installed On Device

The iOS Notes app is a good place to paste your dynamic link and test it opens your app. It should work even if it is not a published app.

### Application Is Not Installed On Device

1. Switch the `App Store ID` in your Firebase Console project settings to a valid App Store ID e.g. iOS Notes App Store ID.

2. Generate a new dynamic link and associate with your app.

3. Paste the link in iOS Notes app. When you press, it should take you to the App Store for the ID you listed in your project settings. Just by making it to the App Store is good enough to indicate your dynamic link is working.

## iOS Troubleshooting

1. Ensure you have the right URL in the Associated Domains in Xcode.

![iOS troubleshooting first step](https://images.prismic.io/invertase/35c09a84-8a84-4a12-8352-0364a6a784bf_Screenshot+2020-05-22+at+09.28.53.png?auto=compress,format)

2. Ensure you have input the correct Team ID in the Firebase console.

![iOS troubleshooting second step](https://images.prismic.io/invertase/4af777b7-7a2e-48a8-a0dc-23cea50e1a4b_Screenshot+2020-05-22+at+09.40.18.png?auto=compress,format)

3. Paste your link into the iOS Notes app. Long press the link which will open the menu and ensure you click "Open in [YOUR APP NAME]". Be sure _not_ to press "Open in Safari" as that will disable that dynamic link domain for your device.

![iOS troubleshooting third step](https://images.prismic.io/invertase/1f8b049d-e54c-4901-a369-e7f6a19a444c_FA031D26-E14F-4A92-87F2-442191455537.png?auto=compress,format)

4. Ensure your dynamic link domain has an Apple app site association file for your app. Check in the browser by going to the following address: `[your domain]/apple-app-site-association`

![iOS troubleshooting fourth step](https://images.prismic.io/invertase/10f825ac-6cd1-487d-9195-a1d86c7511f7_Screenshot+2020-05-22+at+10.00.57.png?auto=compress,format)

5. There is a known bug that you can follow [here](http://bit.ly/2y8gey4) that stops Apple from downloading the app site association file. The work around is to uninstall your app, restart your device and reinstall your app.

6. Make sure your [deep link parameter](https://firebase.google.com/docs/dynamic-links/create-manually?authuser=0#parameters) is properly URL-encoded, especially if it contains a query string.

7. Try the `performDiagnostics` API on the Dynamic Links module, while running the app on a real device and watching output from either Xcode or Console app. You may search for "Links" and you will see the diagnostic output.

## Android Setup

1. Create a SHA-256 fingerprint using these [instructions](https://developers.google.com/android/guides/client-auth) for your app, and add to your app in your Firebase console.

![android dynamic link first step](https://images.prismic.io/invertase/ac7615cb-ea4f-49d8-ba2e-5d6d4d209520_Screenshot+2020-05-07+at+10.47.48.png?auto=compress,format)

2. Test the domain you created in your Firebase console (first step in `Firebase Setup`). Go to the following location in your browser `[your-domain]/.well-known/assetlinks.json`. The response will have a `target` object containing a `package_name` which ought to have your app's package name. Please
   do not proceed until you see this, it may take a while to register.
3. Add your domains to the android/app/src/main/AndroidManifest.xml so that your app knows what links to open in the app. Refer to [the official docs](https://firebase.google.com/docs/dynamic-links/android/receive#add-an-intent-filter-for-deep-links) for example code.

4. Test the dynamic link works via your emulator by pasting it into in a text message, notepad or email, and checking that it does open your application (ensure the app is installed on the emulator).

## Create a Link

You can create dynamic links via the Firebase console, your app or even your custom API. Please refer to [Firebase create dynamic link documentation](https://firebase.google.com/docs/dynamic-links/create-links) for further details. Below, we will show how to build links as part of your application code:

```jsx
import dynamicLinks from '@react-native-firebase/dynamic-links';

async function buildLink() {
  const link = await dynamicLinks().buildLink({
    link: 'https://invertase.io',
    // domainUriPrefix is created in your Firebase console
    domainUriPrefix: 'https://xyz.page.link',
    // optional setup which updates Firebase analytics campaign
    // "banner". This also needs setting up before hand
    analytics: {
      campaign: 'banner',
    },
  });

  return link;
}
```

## Listening for Dynamic Links

The module provides two methods for reacting to events related to the application in the foreground & background/quit.

### Foreground events

When the app is in the foreground state (visible on the device), you can use the `onLink` method to subscribe to events as and
when they happen:

```jsx
import dynamicLinks from '@react-native-firebase/dynamic-links';

function App() {
  const handleDynamicLink = link => {
    // Handle dynamic link inside your own application
    if (link.url === 'https://invertase.io/offer') {
      // ...navigate to your offers screen
    }
  };

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    // When the component is unmounted, remove the listener
    return () => unsubscribe();
  }, []);

  return null;
}
```

### Background/Quit events

If the application is in a background state or has fully quit then the `getInitialLink` method can be used to detect whether
the application was opened via a link:

```jsx
import dynamicLinks from '@react-native-firebase/dynamic-links';

function App() {
  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then(link => {
        if (link.url === 'https://invertase.io/offer') {
          // ...set initial route as offers screen
        }
      });
  }, []);

  return null;
}
```
