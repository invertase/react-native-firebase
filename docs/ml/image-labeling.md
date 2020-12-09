---
title: Image Labeling
description: Get started with ML Image Labeling.
next: /remote-config/usage
previous: /ml/landmark-recognition
---

Image labeling can recognize entities in an image without having to provide any additional contextual metadata, using
either a cloud-based API. It gets a list of the entities that were recognized: people, things, places,
activities, and so on.

# Cloud Image Labeling

The cloud based image labeling service uploads a given image to the Firebase services, processes the results and returns them.
To get started, call the `cloudImageLabelerProcessImage` method with a path to a local file on your device:

```js
import { utils } from '@react-native-firebase/app';
import ml from '@react-native-firebase/ml';

async function processImage(localPath) {
  const labels = await ml().cloudImageLabelerProcessImage(localPath);

  labels.forEach(label => {
    console.log('Service labelled the image: ', label.text);
    console.log('Confidence in the label: ', label.confidence);
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/image-document.jpg`;

processImage(localFile).then(() => console.log('Finished processing file.'));
```

To learn more about the available data on a processed document, view the [`MLImageLabel`](/reference/ml/mlimagelabel)
documentation.

## Configuration

By default, the service will return labels with any confidence level, which may include labels you do not care about or
are too obvious. Set the `confidenceThreshold` key to a value between 0 & 1, where 1 represents 100% confidence. The
cloud service will only return labels with a confidence greater than what you specified:

```js
const processed = await ml().cloudDocumentTextRecognizerProcessImage(localPath, {
  // 80% or higher confidence labels only
  confidenceThreshold: 0.8,
});
```

View the [`MLCloudImageLabelerOptions`](/reference/ml/mlcloudimagelabeleroptions) documentation for more information.
