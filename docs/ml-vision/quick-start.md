---
title: Quick Start
description: Getting started with ML Kit Vision in React Native Firebase
---

# ML Kit Vision Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/ml-vision

# Using iOS
cd ios/ && pod install
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the ML Kit Vision package into your project:

```js
import vision from '@react-native-firebase/ml-vision';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/ml-vision';
```

### Configuring Models

To be able to use the APIs you'll need to enable the models for the APIs you wish to use.

React Native Firebase allows you to configure these in via a `firebase.json` file in your project root.

Add any of the keys indicated below to your JSON file and set them to `true` to enable them. All models and APIs are disabled (`false`) by default.

```json
{
  "react-native": {
    // on device face detection
    "ml_vision_face_model": true,
    // on device text recognition
    "ml_vision_ocr_model": true,
    // on device barcode detection
    "ml_vision_barcode_model": true,

    // on device image labelling
    // TODO: merge these options into one
    "ml_vision_label_model": true,
    "ml_vision_image_label_model": true
  }
}
```

> If you are manually linking on iOS (e.g. not using CocoaPods) then it's up to you to manage these models and dependencies yourself - `firebase.json` support is only for Android and iOS (via Pods).

To learn more, view the <Anchor version group="app" href="/firebase-json">App documentation</Anchor>.

## Examples

### Landmark Recognition with Storage

The following example will take advantage of Cloud Storage to read a remote image and pass it to ML Kit for processing on the cloud. Once processed, the Vision API returns an array of different recognition responses containing data such as the landmark name and location. Each response also has a confidence threshold, which indicates how confident the model is about the response.

Assuming we have a landmark JPG image called `london-eye.jpg` in the projects Cloud Storage bucket, we can write the file to the local device which can then be passed to the processor:

```js
import vision, { firebase } from '@react-native-firebase/ml-vision';

async function processImage() {
  // Create a local file location in the documents directory of the device
  const localFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/landmark.jpg`;
  
  // Save the remote image to the device
  await firebase.storage().ref('london-eye.jpg').writeToFile(localFile);
  
  // Using the local file, process the image on the cloud image processor
  const processed = await vision().cloudLandmarkRecognizerProcessImage(localFile);
  
  processed.forEach((response) => {
    console.log('Landmark: ', response.landmark);
    console.log('Confidence: ', response.confidence);
  });
}
```

Each processed response is an instance of a `VisionLandmark`, which contains all of the information required about the particular image. If your processed response is an empty array, then ML Kit Vision has not been able to identify any landmark.
