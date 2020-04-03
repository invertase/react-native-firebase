---
title: Barcode Scanning
description: Get started with ML Kit Vision Barcode Scanning.
next: /ml-vision/image-labelling
previous: /ml-vision/landmark-recognition
---

Barcode scanning can read data encoded using most standard barcode formats. Barcode scanning happens on the device,
and doesn't require a network connection. It's a convenient way to pass information from the real world to your app.

The Machine Learning service is only offered on the device, and no cloud service exists.

Given an image file, the Barcode Scanning service will attempt to recognise one or more barcodes, offering information
such as:

- The 4-point coordinates of the barcodes on the image.
- The type of barcode (e.g. a phone number, contact information, calendar invite etc).

To view the full list of information available, view the [`VisionBarcode`](/reference/ml-vision/visionbarcode) documentation.

# On-device Barcode Scanning

## Enable the model

To enable the mode, set the `ml_vision_barcode_model` key to `true` in your `firebase.json` file:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "ml_vision_barcode_model": true
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

Once the model has been downloaded, call the `barcodeDetectorProcessImage` method with a path to a local file on your device:

```js
import { utils } from '@react-native-firebase/app';
import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';

async function processBarcodes(localPath) {
  const barcodes = await vision().barcodeDetectorProcessImage(localPath);

  barcodes.forEach(barcode => {
    if (barcode.valueType === VisionBarcodeValueType.CALENDAR_EVENT) {
      console.log('Barcode is a calendar event: ', barcode.calendarEvent);
    }

    if (barcode.valueType === VisionBarcodeValueType.CONTACT_INFO) {
      console.log('Barcode contains contact info: ', barcode.contactInfo);
    }

    if (barcode.valueType === VisionBarcodeValueType.DRIVER_LICENSE) {
      console.log('Barcode contains drivers license info: ', barcode.driverLicense);
    }

    if (barcode.valueType === VisionBarcodeValueType.EMAIL) {
      console.log('Barcode contains email address info: ', barcode.email);
    }

    if (barcode.valueType === VisionBarcodeValueType.GEO) {
      console.log('Barcode contains location info: ', barcode.geoPoint);
    }

    if (barcode.valueType === VisionBarcodeValueType.PHONE) {
      console.log('Barcode contains phone number info: ', barcode.phone);
    }

    if (barcode.valueType === VisionBarcodeValueType.SMS) {
      console.log('Barcode contains SMS info: ', barcode.sms);
    }

    if (barcode.valueType === VisionBarcodeValueType.URL) {
      console.log('Barcode contains URL info: ', barcode.url);
    }

    if (barcode.valueType === VisionBarcodeValueType.WIFI) {
      console.log('Barcode contains WIFI info: ', barcode.wifi);
    }
  });
}

// Local path to file on the device
const localFile = `${utils.FilePath.PICTURES_DIRECTORY}/barcode-document.jpg`;

processBarcodes(localFile).then(() => console.log('Finished processing file.'));
```

To learn about the types of information the barcode scanner can return, view the
[`VisionBarcode`](/reference/ml-vision/visionbarcode) documentation.
