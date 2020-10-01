---
title: Text Recognition
description: Get started with ML Kit Vision Text Recognition.
next: /ml-vision/landmark-recognition
previous: /ml-vision/usage
---

Text recognition can automate tedious data entry for credit cards, receipts, and business cards. With the Cloud-based API,
you can also extract text from pictures of documents, which you can use to increase accessibility or translate documents.

Once an image file has been processed, the API returns a [`VisionDocumentText`](/reference/ml-vision/visiondocumenttext), referencing
all found text along with each [`VisionDocumentTextBlock`](/reference/ml-vision/visiondocumenttextblock). Each block contains
meta-data such as:

- The 4-point coordinates of the box on the document.
- Paragraphs within the block.
- Recognized languages within the block/document.
- The confidence the Machine Learning service has in it's own results.

# Cloud Text Recognition

The cloud based text recognition service uploads a given image of a document to the remote Firebase service which processes the results and returns them. Only image file types are allowed.
To get started, call the `cloudDocumentTextRecognizerProcessImage` method with a path to a local file on your device:

```js
import { utils } from '@react-native-firebase/app';
import vision from '@react-native-firebase/ml-vision';

async function processDocument(localPath) {
  const processed = await vision().cloudDocumentTextRecognizerProcessImage(localPath);

  console.log('Found text in document: ', processed.text);

  processed.blocks.forEach(block => {
    console.log('Found block with text: ', block.text);
    console.log('Confidence in block: ', block.confidence);
    console.log('Languages found in block: ', block.recognizedLanguages);
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/text-document.jpg`;

processDocument(localFile).then(() => console.log('Finished processing file.'));
```

To learn more about the available data on a processed document, view the [`VisionDocumentText`](/reference/ml-vision/visiondocumenttext)
documentation.

## Configuration

To help improve the results when using the cloud service, you can optionally provide arguments to the `cloudDocumentTextRecognizerProcessImage`
method:

```js
const processed = await vision().cloudDocumentTextRecognizerProcessImage(documentPath, {
  // The document contains Kurdish
  languageHints: ['KU'],
});
```

In most scenarios, not providing any hints will yield better results. Use this configuration if the cloud service is struggling
to detect a language.

View the [`VisionCloudDocumentTextRecognizerOptions`](/reference/ml-vision/visionclouddocumenttextrecognizeroptions) documentation for more information.

# On-device Text Recognition

Running the ML Kit service on a device requires the `ml_vision_ocr_model` to be download to the device. Although the results
of on-device processing will be faster and more accurate, including the model in your application will increase the size
of the application.

## Enable the model

To enable the mode, set the `ml_vision_ocr_model` key to `true` in your `firebase.json` file:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "ml_vision_ocr_model": true
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

Once the model has been downloaded, call the `textRecognizerProcessImage` method with a path to a local file on your device:

```js
import { utils } from '@react-native-firebase/app';
import vision from '@react-native-firebase/ml-vision';

async function processDocument(localPath) {
  const processed = await vision().textRecognizerProcessImage(localPath);

  console.log('Found text in document: ', processed.text);

  processed.blocks.forEach(block => {
    console.log('Found block with text: ', block.text);
    console.log('Confidence in block: ', block.confidence);
    console.log('Languages found in block: ', block.recognizedLanguages);
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/text-document.jpg`;

processDocument(localFile).then(() => console.log('Finished processing file.'));
```
