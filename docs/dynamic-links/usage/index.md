---
title: Dynamic Links
description: Installation and getting started with Dynamic Links.
icon: //static.invertase.io/assets/firebase/dynamic-links.svg
next: /iid/usage
previous: /database/presence-detection
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

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

1. Open the Dynamic Links tab and configure a new domain for your app. In this test example, I've created one for `https://rnfbtestapplication.page.link`.

![firebase console dynamic link first step](https://images.prismic.io/invertase/4152f98c-b4e9-4561-a790-a0750a0392bb_Screenshot+2020-05-07+at+09.26.47.png?auto=compress,format)

2. Create a dynamic link with your domain in the Firebase console. The freshly created dynamic link URL will appear in the table.

![firebase console dynamic link second step](https://images.prismic.io/invertase/7e5c7a61-899f-45e5-ab4e-ddf3cfee636a_Screenshot+2020-05-07+at+10.26.22.png?auto=compress,format)

## iOS Setup

To setup Dynamic Links on iOS, it is a **prerequisite** that you have an Apple developer account [setup](https://developer.apple.com/programs/enroll/).

1. Add an `App Store ID` & `Team ID` to your app in your Firebase console. If you do not have an `App Store ID` yet, you can put any number in here for now. Your `Team ID` can be found in your Apple developer console.

![ios dynamic link first step](https://images.prismic.io/invertase/30e302f6-a7bb-4e37-98fd-7115dac4c1f1_Screenshot+2020-05-07+at+09.10.02.png?auto=compress,format)

2. Test the domain you created in your Firebase console (first step in `Firebase Setup`). Go to the following location in your browser `[your domain]/apple-app-site-association`. The response will have a `details` array property containing an object that has the property `appID`. That will be your app's app ID (It may take some
   time for your domain to register). Please ensure it is registered before proceeding.

3. Once you're sure your domain is registered, you need to head over to your Apple developer console and create a provisioning profile for your app. Please ensure you've enabled the `Associated Domain` capability which you should check before proceeding.

![ios dynamic link third step](https://images.prismic.io/invertase/12d6e692-c2b1-47f5-98aa-f364c928114a_Screenshot+2020-05-07+at+10.03.45.png?auto=compress,format)

4. Open your project in Xcode and open your app under the `TARGETS` header. Click the `Signing & Capabilities` tab. You will need to ensure your `Team` is registered, and your `Provisioning Profile` field is completed. Please add the domain you created in your
   Firebase console to the `Associated Domains` and prefix with `applinks:`

![ios dynamic link fourth step](https://images.prismic.io/invertase/d7a8696f-bef1-44a4-b048-aab7bb534f71_Screenshot+2020-05-07+at+09.55.53.png?auto=compress,format)

5. Click the `Info` tab, and add a `URL Type` to your project. The `Identifier` can be called `Bundle Id` or whatever you wish. Add your bundle identifier to the `URL Schemes` property.

![ios dynamic link fifth step](https://images.prismic.io/invertase/cb029ba6-ad40-494e-a3f6-2aacaff494d1_Screenshot+2020-05-07+at+10.16.16.png?auto=compress,format)

6. To test the dynamic link works, you will need to use a real device as it will not work on a simulator. The notes app is a good place to paste you link and test it opens your app (ensure the app is installed on the device).

## Android Setup

1. Create a SHA-256 fingerprint using these [instructions](https://developers.google.com/android/guides/client-auth) for your app, and add to your app in your Firebase console.

![android dynamic link first step](https://images.prismic.io/invertase/ac7615cb-ea4f-49d8-ba2e-5d6d4d209520_Screenshot+2020-05-07+at+10.47.48.png?auto=compress,format)

2. Test the domain you created in your Firebase console (first step in `Firebase Setup`). Go to the following location in your browser `[your-domain]/.well-known/assetlinks.json`. The response will have a `target` object containing a `package_name` which ought to have your app's package name. Please
   do not proceed until you see this, it may take a while to register.

3. Test the dynamic link works via your emulator by pasting it into in a text message, notepad or email, and checking that it does open your application (ensure the app is installed on the emualator).

## Create a Link

You can create dynamic links via the Firebase console, your app or even your custom API. Please refer to [Firebase create dynamic link documentation](https://firebase.google.com/docs/dynamic-links/create-links) for further details. Below, we will show how to build links as part of your application code:

```jsx
import dynamicLinks from '@react-native-firebase/dynamic-links';

async function buildLink() {
  const link = await dynamicLinks().buildLink({
    link: 'https://invertase.io',
    // domainUriPrefix is created in your firebase console
    domainUriPrefix: 'https://xyz.page.link',
    // optional set up which updates firebase analytics campaign
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

When the app is in the foreground (visible on the device), you can use the `onLink` method to subscribe to events as and
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
    // When the is component unmounted, remove the listener
    return () => unsubscribe();
  }, []);

  return null;
}
```

### Background/Quit events

If the application is in a background state / has fully quit then the `getInitialLink` method can be used to detect whether
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
