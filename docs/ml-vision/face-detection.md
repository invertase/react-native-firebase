---
title: Face Detection
description: Get started with ML Kit Vision Face Detection.
next: /remote-config/usage
previous: /ml-vision/face-detection
---

Face detection can detect faces in an image, identify key facial features, and get the contours of detected faces.
This provides information needed to perform tasks like embellishing selfies and portraits, or generating avatars
from a user's photo.

The Machine Learning service is only offered on the device, and no cloud service exists.

Given an image file, the Face Detection service will attempt to recognize one or more faces, offering information
such as:

- Face contour coordinates.
- The rotation of the head/face along the Y & Z axis.
- The probability that the face has it's left/right eyes open.
- The probability that the face is smiling.
- A list of face features (e.g. eyes, nose, mouth etc) and their positions on the face.

# On-device Barcode Scanning

## Enable the model

To enable the mode, set the `ml_vision_face_model` key to `true` in your `firebase.json` file:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "ml_vision_face_model": true
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

Once the model has been downloaded, call the `faceDetectorProcessImage` method with a path to a local file on your device:

```js
import { utils } from '@react-native-firebase/app';
import vision, { VisionFaceContourType } from '@react-native-firebase/ml-vision';

async function processFaces(localPath) {
  const faces = await vision().faceDetectorProcessImage(localPath);

  faces.forEach(face => {
    console.log('Head rotation on Y axis: ', face.headEulerAngleY);
    console.log('Head rotation on Z axis: ', face.headEulerAngleZ);

    console.log('Left eye open probability: ', face.leftEyeOpenProbability);
    console.log('Right eye open probability: ', face.rightEyeOpenProbability);
    console.log('Smiling probability: ', face.smilingProbability);

    face.faceContours.forEach(contour => {
      if (contour.type === VisionFaceContourType.FACE) {
        console.log('Face outline points: ', contour.points);
      }
    });
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/barcode-document.jpg`;

processBarcodes(localFile).then(() => console.log('Finished processing file.'));
```

To learn about the types of information the face detector can return, view the
[`VisionFace`](/reference/ml-vision/visionface) documentation.
