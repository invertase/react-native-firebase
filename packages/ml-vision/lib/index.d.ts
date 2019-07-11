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
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Firebase ML Kit package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `ml-vision` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/ml-vision';
 *
 * // firebase.mlKitVision().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `ml-vision` package:
 *
 * ```js
 * import mlKitVision from '@react-native-firebase/ml-vision';
 *
 * // mlKitVision().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/ml-vision';
 *
 * // firebase.mlKitVision().X
 * ```
 *
 * @firebase ml-vision
 */
export namespace MLKitVision {
  export interface Statics {
    VisionPoint: VisionPoint;
    VisionRectangle: VisionRectangle;
    VisionFaceDetectorOptions: VisionFaceDetectorOptions;
    VisionImageLabelerOptions: VisionImageLabelerOptions;
    VisionBarcodeDetectorOptions: VisionBarcodeDetectorOptions;
    VisionCloudImageLabelerOptions: VisionCloudImageLabelerOptions;
    VisionCloudTextRecognizerOptions: VisionCloudTextRecognizerOptions;
    VisionCloudLandmarkRecognizerOptions: VisionCloudLandmarkRecognizerOptions;
    VisionCloudDocumentTextRecognizerOptions: VisionCloudDocumentTextRecognizerOptions;
  }

  export class VisionPoint {
    x: number;
    y: number;
    // todo
  }

  export class VisionRectangle {
    // todo
  }

  export class VisionFaceDetectorOptions {
    // todo
  }

  /**
   * Options for on device image labeler. Confidence threshold could be provided for the label detection.
   *
   * For example, if the confidence threshold is set to 0.7, only labels with confidence >= 0.7 would be returned.
   * The default threshold is 0.5.
   *
   * #### Example
   *
   * ```js
   * const labelerOptions = new VisionImageLabelerOptions();
   * labelerOptions.setConfidenceThreshold(0.8);
   *
   * await firebase.mlKitVision().imageLabelerProcessImage(filePath, labelerOptions);
   * ```
   */
  export class VisionImageLabelerOptions {
    /**
     * Sets confidence threshold of detected labels. Only labels detected with confidence higher than this threshold are returned.
     *
     * #### Example
     *
     * ```js
     * const labelerOptions = new VisionImageLabelerOptions();
     * labelerOptions.setConfidenceThreshold(0.8);
     * ```
     *
     * @param confidenceThreshold A confidence threshold in the range of [0.0 - 1.0]. Default is 0.5.
     */
    setConfidenceThreshold(confidenceThreshold: number): VisionImageLabelerOptions;
  }

  /**
   * Options for cloud image labeler. Confidence threshold could be provided for the label detection.
   *
   * For example, if the confidence threshold is set to 0.7, only labels with confidence >= 0.7 would be returned. The default threshold is 0.5.
   *
   * Note: at most 20 labels will be returned for cloud image labeler.
   *
   * #### Example
   *
   * ```js
   * const labelerOptions = new VisionCloudImageLabelerOptions();
   * labelerOptions.setConfidenceThreshold(0.8);
   *
   * await firebase.mlKitVision().cloudImageLabelerProcessImage(filePath, labelerOptions);
   * ```
   */
  export class VisionCloudImageLabelerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use Cloud Vision API.
     *
     * > Do not set this for debug build if you use simulators to test.
     *
     * #### Example
     *
     * ```js
     * const labelerOptions = new VisionCloudImageLabelerOptions();
     * labelerOptions.enforceCertFingerprintMatch();
     *
     * await firebase.mlKitVision().cloudImageLabelerProcessImage(filePath, labelerOptions);
     * ```
     */
    enforceCertFingerprintMatch(): VisionCloudImageLabelerOptions;

    /**
     * Sets confidence threshold of detected labels. Only labels detected with confidence higher than this threshold are returned.
     *
     * #### Example
     *
     * ```js
     * const labelerOptions = new VisionCloudImageLabelerOptions();
     * labelerOptions.setConfidenceThreshold(0.8);
     * ```
     *
     * @param confidenceThreshold A confidence threshold in the range of [0.0 - 1.0]. Default is 0.5.
     */
    setConfidenceThreshold(confidenceThreshold: number): VisionCloudImageLabelerOptions;
  }

  export class VisionBarcodeDetectorOptions {
    // todo
  }

  export class VisionCloudTextRecognizerOptions {
    // todo
  }

  export class VisionCloudLandmarkRecognizerOptions {
    // todo
  }

  export class VisionCloudDocumentTextRecognizerOptions {
    // todo
  }

  export interface VisionImageLabel {
    text: string;
    entityId: string;
    confidence: number;
  }

  export interface TODO {
    // todo placeholder
  }

  /**
   * The Firebase ML Kit service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the ML Kit service for the default app:
   *
   * ```js
   * const defaultAppMLKit = firebase.mlKitVision();
   * ```
   */
  export class Module extends ReactNativeFirebaseModule {
    faceDetectorProcessImage(
      imageFilePath: string,
      faceDetectorOptions: VisionFaceDetectorOptions,
    ): Promise<TODO>;

    textRecognizerProcessImage(imageFilePath: string): Promise<TODO>;

    cloudTextRecognizerProcessImage(
      imageFilePath: string,
      cloudTextRecognizerOptions: VisionCloudTextRecognizerOptions,
    ): Promise<TODO>;

    cloudDocumentTextRecognizerProcessImage(
      imageFilePath: string,
      cloudDocumentTextRecognizerOptions: VisionCloudDocumentTextRecognizerOptions,
    ): Promise<TODO>;

    cloudLandmarkRecognizerProcessImage(
      imageFilePath: string,
      cloudLandmarkRecognizerOptions: VisionCloudLandmarkRecognizerOptions,
    ): Promise<TODO>;

    /**
     *
     * @param imageFilePath
     * @param imageLabelerOptions
     */
    imageLabelerProcessImage(
      imageFilePath: string,
      imageLabelerOptions?: VisionImageLabelerOptions,
    ): Promise<VisionImageLabel[]>;

    /**
     *
     * @param imageFilePath
     * @param cloudImageLabelerOptions
     */
    cloudImageLabelerProcessImage(
      imageFilePath: string,
      cloudImageLabelerOptions?: VisionCloudImageLabelerOptions,
    ): Promise<VisionImageLabel[]>;

    barcodeDetectorProcessImage(
      imageFilePath: string,
      barcodeDetectorOptions: VisionBarcodeDetectorOptions,
    ): Promise<TODO>;
  }
}

export const VisionPoint = MLKitVision.VisionPoint;
export const VisionRectangle = MLKitVision.VisionRectangle;
export const VisionFaceDetectorOptions = MLKitVision.VisionFaceDetectorOptions;
export const VisionImageLabelerOptions = MLKitVision.VisionImageLabelerOptions;
export const VisionBarcodeDetectorOptions = MLKitVision.VisionBarcodeDetectorOptions;
export const VisionCloudImageLabelerOptions = MLKitVision.VisionCloudImageLabelerOptions;
export const VisionCloudTextRecognizerOptions = MLKitVision.VisionCloudTextRecognizerOptions;
export const VisionCloudLandmarkRecognizerOptions =
  MLKitVision.VisionCloudLandmarkRecognizerOptions;
export const VisionCloudDocumentTextRecognizerOptions =
  MLKitVision.VisionCloudDocumentTextRecognizerOptions;

declare module '@react-native-firebase/ml-vision' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/ml-vision';
   * firebase.mlKitVision().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const MLKitVisionDefaultExport: ReactNativeFirebaseModuleAndStatics<
    MLKitVision.Module,
    MLKitVision.Statics
  >;
  /**
   * @example
   * ```js
   * import mlKitVision from '@react-native-firebase/ml-vision';
   * mlKitVision().X(...);
   * ```
   */
  export default MLKitVisionDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * MLKitVision
     */
    mlKitVision: ReactNativeFirebaseModuleAndStatics<MLKitVision.Module, MLKitVision.Statics>;
  }

  interface FirebaseApp {
    /**
     * MLKitVision
     */
    mlKitVision(): MLKitVision.Module;
  }
}
