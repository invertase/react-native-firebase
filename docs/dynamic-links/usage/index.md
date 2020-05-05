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
