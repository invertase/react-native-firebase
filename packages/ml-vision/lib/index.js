/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import {
  isString,
  isUndefined,
  toFilePath,
  validateOptionalNativeDependencyExists,
} from '@react-native-firebase/common';

import version from './version';
import VisionFaceDetectorOptions from './VisionFaceDetectorOptions';
import VisionImageLabelerOptions from './VisionImageLabelerOptions';
import VisionBarcodeDetectorOptions from './VisionBarcodeDetectorOptions';
import VisionCloudImageLabelerOptions from './VisionCloudImageLabelerOptions';
import VisionCloudTextRecognizerOptions from './VisionCloudTextRecognizerOptions';
import VisionCloudLandmarkRecognizerOptions from './VisionCloudLandmarkRecognizerOptions';
import VisionCloudDocumentTextRecognizerOptions from './VisionCloudDocumentTextRecognizerOptions';
import VisionCloudTextRecognizerModelType from './VisionCloudTextRecognizerModelType';
import VisionFaceDetectorClassificationMode from './VisionFaceDetectorClassificationMode';
import VisionFaceDetectorContourMode from './VisionFaceDetectorContourMode';
import VisionFaceDetectorLandmarkMode from './VisionFaceDetectorLandmarkMode';
import VisionFaceDetectorPerformanceMode from './VisionFaceDetectorPerformanceMode';
import VisionFaceLandmarkType from './VisionFaceLandmarkType';
import VisionFaceContourType from './VisionFaceContourType';
import VisionCloudLandmarkRecognizerModelType from './VisionCloudLandmarkRecognizerModelType';
import VisionDocumentTextRecognizedBreakType from './VisionDocumentTextRecognizedBreakType';
import VisionBarcodeFormat from './VisionBarcodeFormat';
import VisionBarcodeValueType from './VisionBarcodeValueType';
import VisionBarcodeAddressType from './VisionBarcodeAddressType';
import VisionBarcodeEmailType from './VisionBarcodeEmailType';
import VisionBarcodePhoneType from './VisionBarcodePhoneType';
import VisionBarcodeWifiEncryptionType from './VisionBarcodeWifiEncryptionType';

const statics = {
  VisionFaceDetectorOptions,
  VisionImageLabelerOptions,
  VisionBarcodeDetectorOptions,
  VisionCloudImageLabelerOptions,
  VisionCloudTextRecognizerOptions,
  VisionCloudLandmarkRecognizerOptions,
  VisionCloudDocumentTextRecognizerOptions,
  VisionCloudTextRecognizerModelType,
  VisionFaceDetectorClassificationMode,
  VisionFaceDetectorContourMode,
  VisionFaceDetectorLandmarkMode,
  VisionFaceDetectorPerformanceMode,
  VisionFaceLandmarkType,
  VisionFaceContourType,
  VisionCloudLandmarkRecognizerModelType,
  VisionDocumentTextRecognizedBreakType,
  VisionBarcodeFormat,
  VisionBarcodeValueType,
  VisionBarcodeAddressType,
  VisionBarcodeEmailType,
  VisionBarcodePhoneType,
  VisionBarcodeWifiEncryptionType,
};

const namespace = 'mlKitVision';
const nativeModuleName = [
  'RNFBMLVisionFaceDetectorModule',
  'RNFBMLVisionImageLabelerModule',
  'RNFBMLVisionTextRecognizerModule',
  'RNFBMLVisionBarcodeDetectorModule',
  'RNFBMLVisionLandmarkRecognizerModule',
  'RNFBMLVisionDocumentTextRecognizerModule',
];

class FirebaseMlKitVisionModule extends FirebaseModule {
  faceDetectorProcessImage(localImageFilePath, faceDetectorOptions) {
    validateOptionalNativeDependencyExists(
      'ml_vision_face_model',
      'ML Kit Vision Face Detector',
      !!this.native.imageLabelerProcessImage,
    );

    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().faceDetectorProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    if (
      !isUndefined(faceDetectorOptions) &&
      !(faceDetectorOptions instanceof VisionFaceDetectorOptions)
    ) {
      throw new Error(
        `firebase.mlKitVision().faceDetectorProcessImage(_, *) 'faceDetectorOptions' expected an instance of VisionFaceDetectorOptions.`,
      );
    }

    return this.native.faceDetectorProcessImage(
      toFilePath(localImageFilePath),
      faceDetectorOptions ? faceDetectorOptions.toJSON() : {},
    );
  }

  textRecognizerProcessImage(localImageFilePath) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().textRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    return this.native.textRecognizerProcessImage(localImageFilePath);
  }

  cloudTextRecognizerProcessImage(localImageFilePath, cloudTextRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().cloudTextRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    if (
      !isUndefined(cloudTextRecognizerOptions) &&
      !(cloudTextRecognizerOptions instanceof VisionCloudTextRecognizerOptions)
    ) {
      throw new Error(
        `firebase.mlKitVision().cloudTextRecognizerProcessImage(_, *) 'cloudTextRecognizerOptions' expected an instance of VisionCloudTextRecognizerOptions.`,
      );
    }

    return this.native.cloudTextRecognizerProcessImage(
      toFilePath(localImageFilePath),
      cloudTextRecognizerOptions ? cloudTextRecognizerOptions.toJSON() : {},
    );
  }

  cloudDocumentTextRecognizerProcessImage(localImageFilePath, cloudDocumentTextRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().cloudDocumentTextRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    if (
      !isUndefined(cloudDocumentTextRecognizerOptions) &&
      !(cloudDocumentTextRecognizerOptions instanceof VisionCloudDocumentTextRecognizerOptions)
    ) {
      throw new Error(
        `firebase.mlKitVision().cloudDocumentTextRecognizerProcessImage(_, *) 'cloudDocumentTextRecognizerOptions' expected an instance of VisionCloudDocumentTextRecognizerOptions.`,
      );
    }

    return this.native.cloudDocumentTextRecognizerProcessImage(
      toFilePath(localImageFilePath),
      cloudDocumentTextRecognizerOptions ? cloudDocumentTextRecognizerOptions.toJSON() : {},
    );
  }

  cloudLandmarkRecognizerProcessImage(localImageFilePath, cloudLandmarkRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().cloudLandmarkRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    if (
      !isUndefined(cloudLandmarkRecognizerOptions) &&
      !(cloudLandmarkRecognizerOptions instanceof VisionCloudLandmarkRecognizerOptions)
    ) {
      throw new Error(
        `firebase.mlKitVision().cloudLandmarkRecognizerProcessImage(_, *) 'cloudLandmarkRecognizerOptions' expected an instance of VisionCloudLandmarkRecognizerOptions.`,
      );
    }

    return this.native.cloudLandmarkRecognizerProcessImage(
      toFilePath(localImageFilePath),
      cloudLandmarkRecognizerOptions ? cloudLandmarkRecognizerOptions.toJSON() : {},
    );
  }

  // image labeler
  imageLabelerProcessImage(localImageFilePath, imageLabelerOptions) {
    validateOptionalNativeDependencyExists(
      'ml_vision_image_label_model',
      'ML Kit Vision Image Labeler',
      !!this.native.imageLabelerProcessImage,
    );

    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().imageLabelerProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    if (
      !isUndefined(imageLabelerOptions) &&
      !(imageLabelerOptions instanceof VisionImageLabelerOptions)
    ) {
      throw new Error(
        `firebase.mlKitVision().imageLabelerProcessImage(_, *) 'imageLabelerOptions' expected an instance of VisionImageLabelerOptions.`,
      );
    }

    return this.native.imageLabelerProcessImage(
      toFilePath(localImageFilePath),
      imageLabelerOptions ? imageLabelerOptions.toJSON() : {},
    );
  }

  cloudImageLabelerProcessImage(localImageFilePath, cloudImageLabelerOptions) {
    validateOptionalNativeDependencyExists(
      'ml_vision_image_label_model',
      'ML Kit Vision Image Labeler',
      !!this.native.imageLabelerProcessImage,
    );

    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().cloudImageLabelerProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    if (
      !isUndefined(cloudImageLabelerOptions) &&
      !(cloudImageLabelerOptions instanceof VisionCloudImageLabelerOptions)
    ) {
      throw new Error(
        `firebase.mlKitVision().cloudImageLabelerProcessImage(_, *) 'cloudImageLabelerOptions' expected an instance of VisionCloudImageLabelerOptions.`,
      );
    }

    return this.native.cloudImageLabelerProcessImage(
      toFilePath(localImageFilePath),
      cloudImageLabelerOptions ? cloudImageLabelerOptions.toJSON() : {},
    );
  }

  barcodeDetectorProcessImage(localImageFilePath, barcodeDetectorOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        `firebase.mlKitVision().barcodeDetectorProcessImage(*) 'localImageFilePath' expected a string local file path.`,
      );
    }

    if (
      !isUndefined(barcodeDetectorOptions) &&
      !(barcodeDetectorOptions instanceof VisionBarcodeDetectorOptions)
    ) {
      throw new Error(
        `firebase.mlKitVision().barcodeDetectorProcessImage(_, *) 'barcodeDetectorOptions' expected an instance of VisionBarcodeDetectorOptions.`,
      );
    }

    return this.native.barcodeDetectorProcessImage(
      toFilePath(localImageFilePath),
      barcodeDetectorOptions ? barcodeDetectorOptions.toJSON() : {},
    );
  }
}

// import { SDK_VERSION } from '@react-native-firebase/ml-vision';
export const SDK_VERSION = version;

// import mlKitVision from '@react-native-firebase/ml-vision';
// mlKitVision().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMlKitVisionModule,
});

// import mlKitVision, { firebase } from '@react-native-firebase/ml-vision';
// mlKitVision().X(...);
// firebase.mlKitVision().X(...);
export const firebase = getFirebaseRoot();

// e.g.
// // import { VisionFaceDetectorOptions } from '@react-native-firebase/ml-vision';
export VisionFaceDetectorOptions from './VisionFaceDetectorOptions';
export VisionImageLabelerOptions from './VisionImageLabelerOptions';
export VisionBarcodeDetectorOptions from './VisionBarcodeDetectorOptions';
export VisionCloudImageLabelerOptions from './VisionCloudImageLabelerOptions';
export VisionCloudTextRecognizerOptions from './VisionCloudTextRecognizerOptions';
export VisionCloudLandmarkRecognizerOptions from './VisionCloudLandmarkRecognizerOptions';
export VisionCloudDocumentTextRecognizerOptions from './VisionCloudDocumentTextRecognizerOptions';
export VisionCloudTextRecognizerModelType from './VisionCloudTextRecognizerModelType';
export VisionFaceDetectorClassificationMode from './VisionFaceDetectorClassificationMode';
export VisionFaceDetectorContourMode from './VisionFaceDetectorContourMode';
export VisionFaceDetectorLandmarkMode from './VisionFaceDetectorLandmarkMode';
export VisionFaceDetectorPerformanceMode from './VisionFaceDetectorPerformanceMode';
export VisionFaceLandmarkType from './VisionFaceLandmarkType';
export VisionFaceContourType from './VisionFaceContourType';
export VisionCloudLandmarkRecognizerModelType from './VisionCloudLandmarkRecognizerModelType';
export VisionDocumentTextRecognizedBreakType from './VisionDocumentTextRecognizedBreakType';
export VisionBarcodeFormat from './VisionBarcodeFormat';
export VisionBarcodeValueType from './VisionBarcodeValueType';
export VisionBarcodeAddressType from './VisionBarcodeAddressType';
export VisionBarcodeEmailType from './VisionBarcodeEmailType';
export VisionBarcodePhoneType from './VisionBarcodePhoneType';
export VisionBarcodeWifiEncryptionType from './VisionBarcodeWifiEncryptionType';
