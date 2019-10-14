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
  isString,
  toFilePath,
  validateOptionalNativeDependencyExists,
} from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import version from './version';
import VisionBarcodeAddressType from './VisionBarcodeAddressType';
import visionBarcodeDetectorOptions from './visionBarcodeDetectorOptions';
import VisionBarcodeEmailType from './VisionBarcodeEmailType';
import VisionBarcodeFormat from './VisionBarcodeFormat';
import VisionBarcodePhoneType from './VisionBarcodePhoneType';
import VisionBarcodeValueType from './VisionBarcodeValueType';
import VisionBarcodeWifiEncryptionType from './VisionBarcodeWifiEncryptionType';
import visionCloudDocumentTextRecognizerOptions from './visionCloudDocumentTextRecognizerOptions';
import visionCloudImageLabelerOptions from './visionCloudImageLabelerOptions';
import VisionCloudLandmarkRecognizerModelType from './VisionCloudLandmarkRecognizerModelType';
import visionCloudLandmarkRecognizerOptions from './visionCloudLandmarkRecognizerOptions';
import VisionCloudTextRecognizerModelType from './VisionCloudTextRecognizerModelType';
import visionCloudTextRecognizerOptions from './visionCloudTextRecognizerOptions';
import VisionDocumentTextRecognizedBreakType from './VisionDocumentTextRecognizedBreakType';
import VisionFaceContourType from './VisionFaceContourType';
import VisionFaceDetectorClassificationMode from './VisionFaceDetectorClassificationMode';
import VisionFaceDetectorContourMode from './VisionFaceDetectorContourMode';
import VisionFaceDetectorLandmarkMode from './VisionFaceDetectorLandmarkMode';
import visionFaceDetectorOptions from './visionFaceDetectorOptions';
import VisionFaceDetectorPerformanceMode from './VisionFaceDetectorPerformanceMode';
import VisionFaceLandmarkType from './VisionFaceLandmarkType';
import visionImageLabelerOptions from './visionImageLabelerOptions';

const statics = {
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

const namespace = 'vision';
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
      !!this.native.faceDetectorProcessImage,
    );

    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().faceDetectorProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = visionFaceDetectorOptions(faceDetectorOptions);
    } catch (e) {
      throw new Error(
        `firebase.vision().faceDetectorProcessImage(_, *) 'faceDetectorOptions' ${e.message}.`,
      );
    }

    return this.native.faceDetectorProcessImage(toFilePath(localImageFilePath), options);
  }

  textRecognizerProcessImage(localImageFilePath) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().textRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    return this.native.textRecognizerProcessImage(toFilePath(localImageFilePath));
  }

  cloudTextRecognizerProcessImage(localImageFilePath, cloudTextRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().cloudTextRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = visionCloudTextRecognizerOptions(cloudTextRecognizerOptions);
    } catch (e) {
      throw new Error(`firebase.vision().cloudTextRecognizerProcessImage(_, *) ${e.message}`);
    }

    return this.native.cloudTextRecognizerProcessImage(toFilePath(localImageFilePath), options);
  }

  cloudDocumentTextRecognizerProcessImage(localImageFilePath, cloudDocumentTextRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().cloudDocumentTextRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = visionCloudDocumentTextRecognizerOptions(cloudDocumentTextRecognizerOptions);
    } catch (e) {
      throw new Error(
        `firebase.vision().cloudDocumentTextRecognizerProcessImage(_, *) ${e.message}.`,
      );
    }

    return this.native.cloudDocumentTextRecognizerProcessImage(
      toFilePath(localImageFilePath),
      options,
    );
  }

  cloudLandmarkRecognizerProcessImage(localImageFilePath, cloudLandmarkRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().cloudLandmarkRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = visionCloudLandmarkRecognizerOptions(cloudLandmarkRecognizerOptions);
    } catch (e) {
      throw new Error(`firebase.vision().cloudLandmarkRecognizerProcessImage(_, *) ${e.message}.`);
    }

    return this.native.cloudLandmarkRecognizerProcessImage(toFilePath(localImageFilePath), options);
  }

  imageLabelerProcessImage(localImageFilePath, imageLabelerOptions) {
    validateOptionalNativeDependencyExists(
      'ml_vision_image_label_model',
      'ML Kit Vision Image Labeler',
      !!this.native.imageLabelerProcessImage,
    );

    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().imageLabelerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = visionImageLabelerOptions(imageLabelerOptions);
    } catch (e) {
      throw new Error(`firebase.vision().imageLabelerProcessImage(_, *) ${e.message}.`);
    }

    return this.native.imageLabelerProcessImage(toFilePath(localImageFilePath), options);
  }

  cloudImageLabelerProcessImage(localImageFilePath, cloudImageLabelerOptions) {
    validateOptionalNativeDependencyExists(
      'ml_vision_image_label_model',
      'ML Kit Vision Image Labeler',
      !!this.native.imageLabelerProcessImage,
    );

    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().cloudImageLabelerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = visionCloudImageLabelerOptions(cloudImageLabelerOptions);
    } catch (e) {
      throw new Error(`firebase.vision().cloudImageLabelerProcessImage(_, *) ${e.message}.`);
    }

    return this.native.cloudImageLabelerProcessImage(toFilePath(localImageFilePath), options);
  }

  barcodeDetectorProcessImage(localImageFilePath, barcodeDetectorOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.vision().barcodeDetectorProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = visionBarcodeDetectorOptions(barcodeDetectorOptions);
    } catch (e) {
      throw new Error(`firebase.vision().barcodeDetectorProcessImage(_, *) ${e.message}`);
    }

    return this.native.barcodeDetectorProcessImage(toFilePath(localImageFilePath), options);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/ml-vision';
export const SDK_VERSION = version;

// import vision from '@react-native-firebase/ml-vision';
// vision().X(...);
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

// import vision, { firebase } from '@react-native-firebase/ml-vision';
// vision().X(...);
// firebase.vision().X(...);
export const firebase = getFirebaseRoot();

// e.g.
// // import { VisionCloudTextRecognizerModelType } from '@react-native-firebase/ml-vision';
export VisionBarcodeFormat from './VisionBarcodeFormat';
export VisionFaceContourType from './VisionFaceContourType';
export VisionFaceLandmarkType from './VisionFaceLandmarkType';
export VisionBarcodeValueType from './VisionBarcodeValueType';
export VisionBarcodeEmailType from './VisionBarcodeEmailType';
export VisionBarcodePhoneType from './VisionBarcodePhoneType';
export VisionBarcodeAddressType from './VisionBarcodeAddressType';
export VisionFaceDetectorContourMode from './VisionFaceDetectorContourMode';
export VisionFaceDetectorLandmarkMode from './VisionFaceDetectorLandmarkMode';
export VisionBarcodeWifiEncryptionType from './VisionBarcodeWifiEncryptionType';
export VisionFaceDetectorPerformanceMode from './VisionFaceDetectorPerformanceMode';
export VisionCloudTextRecognizerModelType from './VisionCloudTextRecognizerModelType';
export VisionFaceDetectorClassificationMode from './VisionFaceDetectorClassificationMode';
export VisionDocumentTextRecognizedBreakType from './VisionDocumentTextRecognizedBreakType';
export VisionCloudLandmarkRecognizerModelType from './VisionCloudLandmarkRecognizerModelType';
