---
title: Quick Start
description: Getting started with Dynamic Links in React Native Firebase
---

# Dynamic Links Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/dynamic-links

# Using iOS
cd ios/ && pod install
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the Dynamic Links package into your project:

```js
import dynamicLinks from '@react-native-firebase/dynamic-links';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/dynamic-links';
```

## Using links

Links can be created with analytics attached to them.

```js
import dynamicLinks from '@react-native-firebase/dynamic-links';

const link = await dynamicLinks().buildLink({
  link: 'https://invertase.io',
  domainUriPrefix: 'https://xyz.page.link',
  analytics: {
    campaign: 'banner',
  },
});
```

And you can setup your app to handle dynamic links opened from anywhere.

```js
function App() {
  const handleDynamicLink = link => {
    // Handle dynamic link inside your own application
    if (link.url === 'https://invertase.io/offer') return navigateTo('/offers');
  };

  useEffect(() => {
    const unsubscribe = firebase.dynamicLinks().onLink(handleDynamicLink);
    // When the component unmounts, remove the listener
    return unsubscribe;
  }, []);

  return <YourApp />;
}
```

## Link persistence

When your app had to launched or even installed first, as a result of following a dynamic link, the information of the link is still available.

```js
import dynamicLinks from '@react-native-firebase/dynamic-links';

async function bootstrapApp() {
   await initialLink = await firebase.dynamicLinks().getInitialLink();

   if (initialLink) {
     if (initialLink.url === 'https://invertase.io/offer') return navigateTo('/offers')
   }
}
```
