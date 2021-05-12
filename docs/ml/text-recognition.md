---
title: Text Recognition
description: Get started with ML Kit Text Recognition.
next: /ml/landmark-recognition
previous: /ml/usage
---

Text recognition can automate tedious data entry for credit cards, receipts, and business cards. With the Cloud-based API,
you can also extract text from pictures of documents, which you can use to increase accessibility or translate documents.

Once an image file has been processed, the API returns a [`MLDocumentText`](/reference/ml/mldocumenttext), referencing
all found text along with each [`MLDocumentTextBlock`](/reference/ml/mldocumenttextblock). Each block contains
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
import ml from '@react-native-firebase/ml';

async function processDocument(localPath) {
  const processed = await ml().cloudDocumentTextRecognizerProcessImage(localPath);

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

To learn more about the available data on a processed document, view the [`MLDocumentText`](/reference/ml/mldocumenttext)
documentation.

## Configuration

To help improve the results when using the cloud service, you can optionally provide arguments to the `cloudDocumentTextRecognizerProcessImage`
method:

```js
const processed = await ml().cloudDocumentTextRecognizerProcessImage(documentPath, {
  // The document contains Kurdish
  languageHints: ['KU'],
});
```

In most scenarios, not providing any hints will yield better results. Use this configuration if the cloud service is struggling
to detect a language.

View the [`MLCloudDocumentTextRecognizerOptions`](/reference/ml/mlclouddocumenttextrecognizeroptions) documentation for more information.
