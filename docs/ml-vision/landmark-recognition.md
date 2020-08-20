---
title: Landmark Recognition
description: Get started with ML Kit Vision Landmark Recognition.
next: /ml-vision/barcode-scanning
previous: /ml-vision/text-recognition
---

Landmark recognition can recognize well-known landmarks in an image. It returns the landmarks that were recognized, along
with each landmark's geographic coordinates and the region of the image the landmark was found.

The Machine Learning service is only offered as a cloud based one, and no on-device service exists.

Given an image file, the Landmark Recognition service will attempt to recognize one or more landmarks, offering information
such as:

- The 4-point coordinates of the landmarks on the image.
- Latitude & Longitude locations of the landmarks.
- The confidence the Machine Learning service has in it's own results.
- An entity ID for use on Google's [Knowledge Graph Search API](https://developers.google.com/knowledge-graph/).

# Cloud Landmark Recognition

The cloud based landmark recognition service uploads a given image document to the Firebase services, processes the results and returns them.
To get started, call the `cloudLandmarkRecognizerProcessImage` method with a path to a local image file on your device:

```js
import { utils } from '@react-native-firebase/app';
import vision from '@react-native-firebase/ml-vision';

async function processLandmarks(localPath) {
  const landmarks = await vision().cloudLandmarkRecognizerProcessImage(localPath);

  landmarks.forEach(visionLandmark => {
    console.log('Landmark name: ', visionLandmark.landmark);
    console.log('Landmark locations: ', block.locations);
    console.log('Confidence score: ', block.confidence);
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/image-file.jpg`;

processLandmarks(localFile).then(() => console.log('Finished processing file.'));
```

## Configuration

To help speed up requests and improve results, the `cloudLandmarkRecognizerProcessImage` method accepts an optional
configuration object.

```js
import vision, { VisionCloudLandmarkRecognizerModelType } from '@react-native-firebase/ml-vision';

const landmarks = await vision().cloudLandmarkRecognizerProcessImage(localPath, {
  // Limit the results
  maxResults: 2,
  // Set the model type
  modelType: VisionCloudLandmarkRecognizerModelType.LATEST_MODEL,
});
```

By default, the service will use a stable model to detect landmarks. However, if you feel results are not up-to-date, you
can optionally use the latest model available. Results however may change unexpectedly.

View the [`VisionCloudLandmarkRecognizerOptions`](http://localhost:8000/reference/ml-vision/visioncloudlandmarkrecognizeroptions) documentation for more information.
