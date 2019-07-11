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
    VisionFaceDetectorClassificationMode: VisionFaceDetectorClassificationMode;
    VisionFaceDetectorContourMode: VisionFaceDetectorContourMode;
    VisionFaceDetectorLandmarkMode: VisionFaceDetectorLandmarkMode;
    VisionFaceDetectorPerformanceMode: VisionFaceDetectorPerformanceMode;
  }

  export class VisionPoint {
    x: number;
    y: number;
    // todo
  }

  export class VisionRectangle {
    // todo
  }

  /**
   * Options for vision face detector.
   *
   * #### Example
   *
   * ```js
   * const options = new VisionFaceDetectorOptions();
   *
   * options.setClassificationMode(
   *   VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS
   * );
   *
   * options.setPerformanceMode(
   *   VisionFaceDetectorPerformanceMode.ACCURATE
   * );
   * ```
   */
  export class VisionFaceDetectorOptions {
    /**
     * Indicates whether to run additional classifiers for characterizing attributes such as "smiling" and "eyes open".
     *
     * Defaults to `VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS`.
     *
     * #### Example
     *
     * ```js
     * const options = new VisionFaceDetectorOptions();
     *
     * options.setClassificationMode(
     *   VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS
     * );
     * ```
     *
     * @param classificationMode The classification mode used by the detector.
     */
    setClassificationMode(
      classificationMode:
        | VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS
        | VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS,
    ): VisionFaceDetectorOptions;

    /**
     * Sets whether to detect no contours or all contours. Processing time increases as the number of contours to search
     * for increases, so detecting all contours will increase the overall detection time. Note that it would return up
     * to 5 faces contours.
     *
     * Defaults to `VisionFaceDetectorContourMode.NO_CONTOURS`.
     *
     * @param contourMode The contour mode used by the detector.
     */
    setContourMode(
      contourMode:
        | VisionFaceDetectorContourMode.NO_CONTOURS
        | VisionFaceDetectorContourMode.ALL_CONTOURS,
    ): VisionFaceDetectorOptions;

    /**
     * Sets whether to detect no landmarks or all landmarks. Processing time increases as the number of landmarks to
     * search for increases, so detecting all landmarks will increase the overall detection time. Detecting landmarks
     * can improve pose estimation.
     *
     * Defaults to `VisionFaceDetectorLandmarkMode.NO_LANDMARKS`.
     *
     * @param landmarkMode The performance mode used by the detector.
     */
    setLandmarkMode(
      landmarkMode:
        | VisionFaceDetectorLandmarkMode.NO_LANDMARKS
        | VisionFaceDetectorLandmarkMode.ALL_LANDMARKS,
    ): VisionFaceDetectorOptions;

    /**
     * Sets the smallest desired face size, expressed as a proportion of the width of the head to the image width. For
     * example, if a value of 0.1 is specified then the smallest face to search for is roughly 10% of the width of the
     * image being searched.
     *
     * Setting the min face size is a performance vs. accuracy trade-off: setting the face size smaller will enable the
     * detector to find smaller faces but detection will take longer; setting the face size larger will exclude smaller
     * faces but will run faster.
     *
     * This is not a hard limit on face size; the detector may find faces slightly smaller than specified.
     *
     * Defaults to 0.1.
     *
     * @param minFaceSize The smallest head size to search for relative to the size of the image, in the range of 0.0 and 1.0. For example, a setting of 0.5 would indicate that detected faces need to fill at least half of the image width. The default size is 0.1.
     */
    setMinFaceSize(minFaceSize: number): VisionFaceDetectorLandmarkMode;

    /**
     * Extended option for controlling additional accuracy / speed trade-offs in performing face detection. In general,
     * choosing the more accurate mode will generally result in longer runtime, whereas choosing the faster mode will
     * generally result in detecting fewer faces.
     *
     * Defaults to `VisionFaceDetectorPerformanceMode.FAST`.
     *
     * @param performanceMode Fast/accurate trade-off mode.
     */
    setPerformanceMode(
      performanceMode:
        | VisionFaceDetectorPerformanceMode.FAST
        | VisionFaceDetectorPerformanceMode.ACCURATE,
    ): VisionFaceDetectorLandmarkMode;
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

  /**
   * Indicates whether to run additional classifiers for characterizing attributes such as "smiling" and "eyes open".
   */
  export interface VisionFaceDetectorClassificationMode {
    /**
     * Disables collection of classifier information.
     */
    NO_CLASSIFICATIONS: number;

    /**
     * Enables collection of classifier information.
     */
    ALL_CLASSIFICATIONS: number;
  }

  /**
   * Sets whether to detect contours or not. Processing time increases as the number of contours to search for increases,
   * so detecting all contours will increase the overall detection time.
   */
  export interface VisionFaceDetectorContourMode {
    /**
     * Disables collection of contour information.
     */
    NO_CONTOURS: number;

    /**
     * Enables collection of contour information.
     */
    ALL_CONTOURS: number;
  }

  /**
   * Sets whether to detect no landmarks or all landmarks. Processing time increases as the number of landmarks to
   * search for increases, so detecting all landmarks will increase the overall detection time. Detecting
   * landmarks can improve pose estimation.
   */
  export interface VisionFaceDetectorLandmarkMode {
    /**
     * Disables collection of landmark information.
     */
    NO_LANDMARKS: number;

    /**
     * Enables collection of landmark information.
     */
    ALL_LANDMARKS: number;
  }

  /**
   * Extended option for controlling additional accuracy / speed trade-offs in performing face detection. In general,
   * choosing the more accurate mode will generally result in longer runtime, whereas choosing the faster
   * mode will generally result in detecting fewer faces.
   */
  export interface VisionFaceDetectorPerformanceMode {
    /**
     * Indicates a preference for speed in extended settings that may make an accuracy vs. speed trade-off. This will
     * tend to detect fewer faces and may be less precise in determining values such as position, but will run faster.
     */
    FAST: number;

    /**
     * Indicates a preference for accuracy in extended settings that may make an accuracy vs. speed trade-off.
     * This will tend to detect more faces and may be more precise in determining values such as position, at the cost
     * of speed.
     */
    ACCURATE: number;
  }

  /**
   * Represents an image label return from `imageLabelerProcessImage()` and `cloudImageLabelerProcessImage()`.
   */
  export interface VisionImageLabel {
    /**
     * Returns a detected label from the given image. The label returned here is in English only.
     *
     * Use `entityId` to retrieve a unique id.
     */
    text: string;

    /**
     * Re turns a opaque entity ID. IDs are available in [Google Knowledge Graph Search API](https://developers.google.com/knowledge-graph/).
     */
    entityId: string;

    /**
     * Gets overall confidence of the result.
     *
     * Range between 0 (low confidence) and 1 (high confidence).
     */
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
     * Returns an array of labels (as `VisionImageLabel`) of a given local image file path. Label detection is done
     * on device, resulting in faster results but less descriptive.
     *
     * #### Example
     *
     * ```js
     * const options = new firebase.mlKitVision.VisionImageLabelerOptions();
     * options.setConfidenceThreshold(0.8);
     *
     * const labels = await firebase.mlKitVision().imageLabelerProcessImage(filePath, options);
     * ```
     *
     * @param imageFilePath A local image file path.
     * @param imageLabelerOptions An optional instance of `VisionImageLabelerOptions`.
     */
    imageLabelerProcessImage(
      imageFilePath: string,
      imageLabelerOptions?: VisionImageLabelerOptions,
    ): Promise<VisionImageLabel[]>;

    /**
     * Returns an array of labels (as `VisionImageLabel`) of a given local image file path. Label detection is done
     * on cloud (Firebase), resulting in slower results but more descriptive.
     *
     * #### Example
     *
     * ```js
     * const options = new firebase.mlKitVision.VisionCloudImageLabelerOptions();
     * options.setConfidenceThreshold(0.8);
     *
     * const labels = await firebase.mlKitVision().cloudImageLabelerProcessImage(filePath, options);
     * ```
     *
     * @param imageFilePath A local image file path.
     * @param cloudImageLabelerOptions An optional instance of `VisionCloudImageLabelerOptions`.
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
