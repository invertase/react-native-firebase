---
title: Image Labeling
description: Get started with ML Kit Vision Image Labeling.
next: /ml-vision/face-detection
previous: /ml-vision/barcode-scanning
---

Image labeling can recognize entities in an image without having to provide any additional contextual metadata, using
either an on-device API or a cloud-based API. It gets a list of the entities that were recognized: people, things, places,
activities, and so on.

# Cloud Image Labeling

The cloud based image labeling service uploads a given image to the Firebase services, processes the results and returns them.
To get started, call the `cloudImageLabelerProcessImage` method with a path to a local file on your device:

```js
import { utils } from '@react-native-firebase/app';
import vision from '@react-native-firebase/ml-vision';

async function processImage(localPath) {
  const labels = await vision().cloudImageLabelerProcessImage(localPath);

  labels.forEach(label => {
    console.log('Service labelled the image: ', label.text);
    console.log('Confidence in the label: ', label.confidence);
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/image-document.jpg`;

processImage(localFile).then(() => console.log('Finished processing file.'));
```

To learn more about the available data on a processed document, view the [`VisionImageLabel`](/reference/ml-vision/visionimagelabel)
documentation.

## Configuration

By default, the service will return labels with any confidence level, which may include labels you do not care about or
are too obvious. Set the `confidenceThreshold` key to a value between 0 & 1, where 1 represents 100% confidence. The
cloud service will only return labels with a confidence greater than what you specified:

```js
const processed = await vision().cloudDocumentTextRecognizerProcessImage(localPath, {
  // 80% or higher confidence labels only
  confidenceThreshold: 0.8,
});
```

View the [`VisionCloudImageLabelerOptions`](/reference/ml-vision/visioncloudimagelabeleroptions) documentation for more information.

# On-device Image Labeling

Running the ML Kit service on a device requires the `ml_vision_image_label_model` and `ml_vision_label_model` to be download to the device. Although the results
of on-device processing will be faster and more accurate, including the model in your application will increase the size
of the application.

## Enable the model

To enable the mode, set the `ml_vision_image_label_model` & `ml_vision_label_model` key to `true` in your `firebase.json` file:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "ml_vision_image_label_model": true,
    "ml_vision_label_model": true
  }
}
```

Once complete, rebuild your application:

```bash
# For Android
npx react-native run-android

# For iOS
cd ios/ && pod install --repo-update
npx react-native run-ios
```

## Process

Once the models have been downloaded, call the `imageLabelerProcessImage` method with a path to a local file on your device:

```js
import { utils } from '@react-native-firebase/app';
import vision from '@react-native-firebase/ml-vision';

async function processImage(localPath) {
  const labels = await vision().imageLabelerProcessImage(localPath);

  labels.forEach(label => {
    console.log('Service labelled the image: ', label.text);
    console.log('Confidence in the label: ', label.confidence);
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/image-document.jpg`;

processImage(localFile).then(() => console.log('Finished processing file.'));
```
