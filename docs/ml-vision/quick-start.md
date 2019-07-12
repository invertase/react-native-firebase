---
title: Quick Start
description: Get to grips with the basics of ML Kit Vision in React Native Firebase
---

# ML Kit Vision Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/ml-vision
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the ML Kit package into your project:

```js
import mlKitVision from '@react-native-firebase/ml-vision';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/ml-vision';
```

### Configuring Models

To be able to use the APIs you'll need to enable the models for the APIs you wish to use.

React Native Firebase allows you to configure these in via a `firebase.json` file in your project root.

Add any of the keys indicated below to your JSON file and set them to `true` to enable them. All models and APIs are disabled (`false`) by default.

```json5
{
  "react-native": {
    // on device face detection
    "ml_vision_face_model" : true,
    // on device text recognition
    "ml_vision_ocr_model" : true,
    // on device barcode detection
    "ml_vision_barcode_model" : true,

    // on device image labelling
    // TODO: merge these options into one
    "ml_vision_label_model": true,
    "ml_vision_image_label_model": true,
  }
}
```

> If you are manually linking on iOS (e.g. not using CocoaPods) then it's up to you to manage these models and dependencies yourself - `firebase.json` support is only for Android and iOS (via Pods).

To learn more, view the <Anchor version group="app" href="/firebase-json">App documentation</Anchor>.
