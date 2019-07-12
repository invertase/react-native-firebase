---
title: App Indexing Quick Start
description: Get to grips with the basics of App Indexing in React Native Firebase
---

# App Indexing Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/indexing
```

Setup your application by following the platform specific instructions:

<Grid>
	<Block
		icon="phone_android"
		color="#4CAF50"
		title="Android Setup"
		to="/android"
	>
    Setup your Android application to handle app indexed URLs.
	</Block>
	<Block
		icon="phone_iphone"
		color="#2196F3"
		title="iOS Setup"
		to="/ios"
	>
    Setup your iOS application to handle app indexed URLs.
	</Block>
</Grid>

## Module usage

The app indexing module provides functionality to hook onto a user opening your application via an app indexed URL.

Import the module:

```js
import indexing from '@react-native-firebase/indexing';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/indexing';
```

### Detecting app opens from a URL

If a has your application installed, but in a closed state, opening an app indexed URL will cause the app to
open. Once the app has loaded, the `getInitialURL()` method can be called to detected whether the app was opened
by an app indexed URL. If your application was not opened via an app indexed URL, the value will be `null`.

Note: All URLs which trigger the app to open will be passed to this method, therefore it is important to check
the domain of the URL to check it has come from an indexed source.

```js
import indexing from '@react-native-firebase/indexing';

async function bootstrapApp() {
  const url = await indexing.getInitialURL();

  if (url && url.startsWith('https://invertase.io')) {
    if (url === 'https://invertase.io/offers') {
      // Handle the URL, e.g. using a react-navigation custom service:
      NavigationService.navigate('OffersScreen', { from: 'indexing' });
    }
  }
}
```

### Subscribe to URL events

If a user has opened your app and it is open or in a background state, you must subscribe and handle the URL open
event directly within your application life cycle using the `onOpenURL()` method.

Note: All URLs which trigger the app to handle it are passed to this method, therefore it is important to check
the domain of the URL to check it has come from an indexed source.

```jsx
import React, { useEffect } from 'react';
import indexing from '@react-native-firebase/indexing';

function App({ navigation }) {
  // Listen to open URL events once ready
  useEffect(() => {
    const unsubscribe = indexing().onOpenURL(url => {
      if (url.startsWith('https://invertase.io')) {
        if (url === 'https://invertase.io/offers') {
          // Handle the URL, e.g. using the react-navigation navigation prop:
          navigation.navigate('OffersScreen', { from: 'indexing' });
        }
      }
    });

    // Return the function to unsubscribe from
    return unsubscribe;
  }, []);

  return <NavigationStack />;
}
```
