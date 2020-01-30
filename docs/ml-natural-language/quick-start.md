---
title: Quick Start
description: Getting started with ML Kit Natural Language APIs in React Native Firebase
---

# ML Kit Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/ml-natural-language

# Using iOS
cd ios/ && pod install
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the ML Kit Natural Language package into your project:

```js
import naturalLanguage from '@react-native-firebase/ml-natural-language';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/ml-natural-language';
```

### Configuring Models

To be able to use the APIs you'll need to enable the models for the APIs you wish to use.

React Native Firebase allows you to configure these in via a `firebase.json` file in your project root.

Add any of the keys indicated below to your JSON file and set them to `true` to enable them. All models and APIs are disabled (`false`) by default.

```json5
{
  'react-native': {
    // Language Identification
    ml_natural_language_language_id_model: false,
    // Smart Replies
    ml_natural_language_smart_reply_model: false,
  },
}
```

> If you are manually linking on iOS (e.g. not using CocoaPods) then it's up to you to manage these models and dependencies yourself - `firebase.json` support is only for Android and iOS (via Pods).

To learn more, view the <Anchor version group="app" href="/firebase-json">App documentation</Anchor>.
