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

import { isString, toFilePath } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import version from './version';
import MLCloudDocumentTextRecognizerOptions from './MLCloudDocumentTextRecognizerOptions';
import MLCloudImageLabelerOptions from './MLCloudImageLabelerOptions';
import MLCloudLandmarkRecognizerModelType from './MLCloudLandmarkRecognizerModelType';
import MLCloudLandmarkRecognizerOptions from './MLCloudLandmarkRecognizerOptions';
import MLCloudTextRecognizerModelType from './MLCloudTextRecognizerModelType';
import MLCloudTextRecognizerOptions from './MLCloudTextRecognizerOptions';
import MLDocumentTextRecognizedBreakType from './MLDocumentTextRecognizedBreakType';

const statics = {
  MLCloudTextRecognizerModelType,
  MLCloudLandmarkRecognizerModelType,
  MLDocumentTextRecognizedBreakType,
};

const namespace = 'ml';
const nativeModuleName = [
  'RNFBMLImageLabelerModule',
  'RNFBMLTextRecognizerModule',
  'RNFBMLLandmarkRecognizerModule',
  'RNFBMLDocumentTextRecognizerModule',
];

class FirebaseMLModule extends FirebaseModule {
  cloudTextRecognizerProcessImage(localImageFilePath, cloudTextRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.ml().cloudTextRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = MLCloudTextRecognizerOptions(cloudTextRecognizerOptions);
    } catch (e) {
      throw new Error(`firebase.ml().cloudTextRecognizerProcessImage(_, *) ${e.message}`);
    }

    return this.native.cloudTextRecognizerProcessImage(toFilePath(localImageFilePath), options);
  }

  cloudDocumentTextRecognizerProcessImage(localImageFilePath, cloudDocumentTextRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.ml().cloudDocumentTextRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = MLCloudDocumentTextRecognizerOptions(cloudDocumentTextRecognizerOptions);
    } catch (e) {
      throw new Error(`firebase.ml().cloudDocumentTextRecognizerProcessImage(_, *) ${e.message}.`);
    }

    return this.native.cloudDocumentTextRecognizerProcessImage(
      toFilePath(localImageFilePath),
      options,
    );
  }

  cloudLandmarkRecognizerProcessImage(localImageFilePath, cloudLandmarkRecognizerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.ml().cloudLandmarkRecognizerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = MLCloudLandmarkRecognizerOptions(cloudLandmarkRecognizerOptions);
    } catch (e) {
      throw new Error(`firebase.ml().cloudLandmarkRecognizerProcessImage(_, *) ${e.message}.`);
    }

    return this.native.cloudLandmarkRecognizerProcessImage(toFilePath(localImageFilePath), options);
  }

  cloudImageLabelerProcessImage(localImageFilePath, cloudImageLabelerOptions) {
    if (!isString(localImageFilePath)) {
      throw new Error(
        "firebase.ml().cloudImageLabelerProcessImage(*) 'localImageFilePath' expected a string local file path.",
      );
    }

    let options;
    try {
      options = MLCloudImageLabelerOptions(cloudImageLabelerOptions);
    } catch (e) {
      throw new Error(`firebase.ml().cloudImageLabelerProcessImage(_, *) ${e.message}.`);
    }

    return this.native.cloudImageLabelerProcessImage(toFilePath(localImageFilePath), options);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/ml';
export const SDK_VERSION = version;

// import ML from '@react-native-firebase/ml';
// ml().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMLModule,
});

// import ml, { firebase } from '@react-native-firebase/ml';
// ml().X(...);
// firebase.ml().X(...);
export const firebase = getFirebaseRoot();

// e.g.
// // import { MLCloudTextRecognizerModelType } from '@react-native-firebase/ml';
export { default as MLCloudTextRecognizerModelType } from './MLCloudTextRecognizerModelType';
export { default as MLDocumentTextRecognizedBreakType } from './MLDocumentTextRecognizedBreakType';
export { default as MLCloudLandmarkRecognizerModelType } from './MLCloudLandmarkRecognizerModelType';
