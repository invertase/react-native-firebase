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

import { ReactNativeFirebase } from '@react-native-firebase/app';

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
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {
    VisionCloudTextRecognizerModelType: VisionCloudTextRecognizerModelType;
    VisionFaceDetectorClassificationMode: VisionFaceDetectorClassificationMode;
    VisionFaceDetectorContourMode: VisionFaceDetectorContourMode;
    VisionFaceDetectorLandmarkMode: VisionFaceDetectorLandmarkMode;
    VisionFaceDetectorPerformanceMode: VisionFaceDetectorPerformanceMode;
    VisionFaceLandmarkType: VisionFaceLandmarkType;
    VisionFaceContourType: VisionFaceContourType;
    VisionCloudLandmarkRecognizerModelType: VisionCloudLandmarkRecognizerModelType;
    VisionDocumentTextRecognizedBreakType: VisionDocumentTextRecognizedBreakType;
    VisionBarcodeFormat: VisionBarcodeFormat;
    VisionBarcodeValueType: VisionBarcodeValueType;
    VisionBarcodeAddressType: VisionBarcodeAddressType;
    VisionBarcodeEmailType: VisionBarcodeEmailType;
    VisionBarcodePhoneType: VisionBarcodePhoneType;
    VisionBarcodeWifiEncryptionType: VisionBarcodeWifiEncryptionType;
  }

  /**
   * Options for vision face detector.
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
     * const faces = await firebase.mlKitVision().faceDetectorProcessImage(filePath, {
     *   classificationMode: VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS,
     * });
     * ```
     */
    classificationMode?:
      | VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS
      | VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS;

    /**
     * Sets whether to detect no contours or all contours. Processing time increases as the number of contours to search
     * for increases, so detecting all contours will increase the overall detection time. Note that it would return up
     * to 5 faces contours.
     *
     * Defaults to `VisionFaceDetectorContourMode.NO_CONTOURS`.
     *
     * #### Example
     *
     * ```js
     * const faces = await firebase.mlKitVision().faceDetectorProcessImage(filePath, {
     *   contourMode: VisionFaceDetectorContourMode.ALL_CONTOURS,
     * });
     * ```
     */
    contourMode?:
      | VisionFaceDetectorContourMode.NO_CONTOURS
      | VisionFaceDetectorContourMode.ALL_CONTOURS;

    /**
     * Sets whether to detect no landmarks or all landmarks. Processing time increases as the number of landmarks to
     * search for increases, so detecting all landmarks will increase the overall detection time. Detecting landmarks
     * can improve pose estimation.
     *
     * Defaults to `VisionFaceDetectorLandmarkMode.NO_LANDMARKS`.
     *
     * #### Example
     *
     * ```js
     * const faces = await firebase.mlKitVision().faceDetectorProcessImage(filePath, {
     *   landmarkMode: VisionFaceDetectorLandmarkMode.ALL_LANDMARKS,
     * });
     * ```
     */
    landmarkMode?:
      | VisionFaceDetectorLandmarkMode.NO_LANDMARKS
      | VisionFaceDetectorLandmarkMode.ALL_LANDMARKS;

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
     * #### Example
     *
     * ```js
     * const faces = await firebase.mlKitVision().faceDetectorProcessImage(filePath, {
     *   minFaceSize: 0.5,
     * });
     * ```
     */
    minFaceSize?: number;

    /**
     * Extended option for controlling additional accuracy / speed trade-offs in performing face detection. In general,
     * choosing the more accurate mode will generally result in longer runtime, whereas choosing the faster mode will
     * generally result in detecting fewer faces.
     *
     * Defaults to `VisionFaceDetectorPerformanceMode.FAST`.
     *
     * #### Example
     *
     * ```js
     * const faces = await firebase.mlKitVision().faceDetectorProcessImage(filePath, {
     *   performanceMode: VisionFaceDetectorPerformanceMode.ACCURATE,
     * });
     * ```
     */
    performanceMode?:
      | VisionFaceDetectorPerformanceMode.FAST
      | VisionFaceDetectorPerformanceMode.ACCURATE;
  }

  /**
   * Options for on device image labeler. Confidence threshold could be provided for the label detection.
   *

   */
  export interface VisionImageLabelerOptions {
    /**
     * Sets confidence threshold of detected labels. Only labels detected with confidence higher than this threshold are returned.
     *
     * For example, if the confidence threshold is set to 0.7, only labels with confidence >= 0.7 would be returned.
     *
     * Defaults to 0.5.
     *
     * #### Example
     *
     * ```js
     * const labels = await firebase.mlKitVision().imageLabelerProcessImage(filePath, {
     *   confidenceThreshold: 0.8,
     * });
     * ```
     */
    confidenceThreshold?: number;
  }

  /**
   * Options for cloud image labeler. Confidence threshold could be provided for the label detection.
   *
   * For example, if the confidence threshold is set to 0.7, only labels with confidence >= 0.7 would be returned. The default threshold is 0.5.
   *
   * Note: at most 20 labels will be returned for cloud image labeler.
   */
  export interface VisionCloudImageLabelerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use Cloud Vision API.
     *
     * > Do not set this for debug build if you use simulators to test.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudImageLabelerProcessImage(filePath, {
     *   enforceCertFingerprintMatch: true,
     * });
     * ```
     */
    enforceCertFingerprintMatch?: boolean;

    /**
     * Sets confidence threshold in the range of [0.0 - 1.0] of detected labels. Only labels detected with confidence higher than this threshold are returned.
     *
     * Defaults to 0.5.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudImageLabelerProcessImage(filePath, {
     *   confidenceThreshold: 0.8,
     * });
     * ```
     */
    confidenceThreshold?: number;

    /**
     * API key to use for Cloud Vision API. If not set, the default API key from `firebase.app()` will be used.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudImageLabelerProcessImage(filePath, {
     *   apiKeyOverride: 'xyz123',
     * });
     * ```
     *
     * @ios
     */
    apiKeyOverride?: string;
  }

  /**
   * Detector for finding popular natural and man-made structures within an image.
   */
  export interface VisionCloudLandmarkRecognizerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use Cloud Vision API.
     *
     * > Do not set this for debug build if you use simulators to test.
     */
    enforceCertFingerprintMatch?: boolean;

    /**
     * Sets the maximum number of results of this type.
     *
     * Defaults to 10.
     */
    maxResults?: number;

    /**
     * Sets model type for the detection.
     *
     * Defaults to `VisionCloudLandmarkRecognizerModelType.STABLE_MODEL`.
     */
    modelType?:
      | VisionCloudLandmarkRecognizerModelType.STABLE_MODEL
      | VisionCloudLandmarkRecognizerModelType.LATEST_MODEL;

    /**
     * API key to use for Cloud Vision API. If not set, the default API key from `firebase.app()` will be used.
     *
     * @ios
     */
    apiKeyOverride?: string;
  }

  /**
   * Model types for cloud landmark recognition.
   */
  export enum VisionCloudLandmarkRecognizerModelType {
    /**
     * Stable model would be used.
     */
    STABLE_MODEL = 1,

    /**
     * Latest model would be used.
     */
    LATEST_MODEL = 2,
  }

  /**
   * Options for cloud text recognizer.
   */
  export interface VisionCloudTextRecognizerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use Cloud Vision API.
     *
     * > Do not set this for debug build if you use simulators to test.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudTextRecognizerProcessImage(filePath, {
     *   enforceCertFingerprintMatch: true,
     * });
     * ```
     */
    enforceCertFingerprintMatch?: boolean;

    /**
     * Sets model type for cloud text recognition. The two models SPARSE_MODEL and DENSE_MODEL handle different text densities in an image.
     *
     * See `VisionCloudTextRecognizerModelType` for types.
     *
     * Defaults to `VisionCloudTextRecognizerModelType.SPARSE_MODEL`.
     *
     * #### Example
     *
     * ```js
     * import {
     *   firebase,
     *   VisionCloudTextRecognizerModelType,
     * } from '@react-native-firebase/ml-vision';
     *
     * await firebase.mlKitVision().cloudTextRecognizerProcessImage(filePath, {
     *   modelType: VisionCloudTextRecognizerModelType.DENSE_MODEL,
     * });
     * ```
     */
    modelType?:
      | VisionCloudTextRecognizerModelType.SPARSE_MODEL
      | VisionCloudTextRecognizerModelType.DENSE_MODEL;

    /**
     * Sets language hints. In most cases, not setting this yields the best results since it enables automatic language
     * detection. For languages based on the Latin alphabet, setting language hints is not needed. In rare cases, when
     * the language of the text in the image is known, setting a hint will help get better results (although it will be a
     * significant hindrance if the hint is wrong).
     *
     * Each language code must be a BCP-47 identifier. See [Google Cloud OCR Language Support](https://cloud.google.com/vision/docs/languages) for more information.
     *
     * #### Example
     *
     * ```js
     * const textRecognizerOptions = new VisionCloudTextRecognizerOptions();
     * textRecognizerOptions.setHintedLanguages(['fr', 'de']);
     *
     * await firebase.mlKitVision().cloudTextRecognizerProcessImage(filePath, {
     *   languageHints: ['fr', 'de'],
     * });
     * ```
     */
    languageHints?: string[];

    /**
     * API key to use for Cloud Vision API. If not set, the default API key from `firebase.app()` will be used.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudTextRecognizerProcessImage(filePath, {
     *   apiKeyOverride: 'xyz123',
     * });
     * ```
     *
     * @ios
     */
    apiKeyOverride?: string;
  }

  /**
   * Options for the cloud document text recognizer.
   */
  export interface VisionCloudDocumentTextRecognizerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use Cloud Vision API.
     *
     * > Do not set this for debug build if you use simulators to test.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudTextRecognizerProcessImage(filePath, {
     *   enforceCertFingerprintMatch: true,
     * });
     * ```
     */
    enforceCertFingerprintMatch?: boolean;

    /**
     * Sets language hints. In most cases, not setting this yields the best results since it enables automatic language
     * detection. For languages based on the Latin alphabet, setting language hints is not needed. In rare cases, when
     * the language of the text in the image is known, setting a hint will help get better results (although it will be a
     * significant hindrance if the hint is wrong).
     *
     * Each language code must be a BCP-47 identifier. See [Google Cloud OCR Language Support](https://cloud.google.com/vision/docs/languages) for more information.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudTextRecognizerProcessImage(filePath, {
     *   languageHints: ['fr', 'de'],
     * });
     * ```
     */
    languageHints?: string[];

    /**
     * API key to use for Cloud Vision API. If not set, the default API key from `firebase.app()` will be used.
     *
     * #### Example
     *
     * ```js
     * await firebase.mlKitVision().cloudTextRecognizerProcessImage(filePath, {
     *   apiKeyOverride: 'xyz123',
     * });
     * ```
     *
     * @ios
     */
    apiKeyOverride?: string;
  }

  /**
   * The cloud model type used for in VisionCloudTextRecognizerOptions & VisionCloudDocumentTextRecognizerOptions
   *
   * Defaults to `SPARSE_MODEL`
   */
  export enum VisionCloudTextRecognizerModelType {
    /**
     * Dense model type. It is more suitable for well-formatted dense text.
     */
    SPARSE_MODEL = 1,
    /**
     * Sparse model type. It is more suitable for sparse text.
     */
    DENSE_MODEL = 2,
  }

  /**
   * Indicates whether to run additional classifiers for characterizing attributes such as "smiling" and "eyes open".
   */
  export enum VisionFaceDetectorClassificationMode {
    /**
     * Disables collection of classifier information.
     */
    NO_CLASSIFICATIONS = 1,

    /**
     * Enables collection of classifier information.
     */
    ALL_CLASSIFICATIONS = 2,
  }

  /**
   * Sets whether to detect contours or not. Processing time increases as the number of contours to search for increases,
   * so detecting all contours will increase the overall detection time.
   */
  export enum VisionFaceDetectorContourMode {
    /**
     * Disables collection of contour information.
     */
    NO_CONTOURS = 1,

    /**
     * Enables collection of contour information.
     */
    ALL_CONTOURS = 2,
  }

  /**
   * Sets whether to detect no landmarks or all landmarks. Processing time increases as the number of landmarks to
   * search for increases, so detecting all landmarks will increase the overall detection time. Detecting
   * landmarks can improve pose estimation.
   */
  export enum VisionFaceDetectorLandmarkMode {
    /**
     * Disables collection of landmark information.
     */
    NO_LANDMARKS = 1,

    /**
     * Enables collection of landmark information.
     */
    ALL_LANDMARKS = 2,
  }

  /**
   * Extended option for controlling additional accuracy / speed trade-offs in performing face detection. In general,
   * choosing the more accurate mode will generally result in longer runtime, whereas choosing the faster
   * mode will generally result in detecting fewer faces.
   */
  export enum VisionFaceDetectorPerformanceMode {
    /**
     * Indicates a preference for speed in extended settings that may make an accuracy vs. speed trade-off. This will
     * tend to detect fewer faces and may be less precise in determining values such as position, but will run faster.
     */
    FAST = 1,

    /**
     * Indicates a preference for accuracy in extended settings that may make an accuracy vs. speed trade-off.
     * This will tend to detect more faces and may be more precise in determining values such as position, at the cost
     * of speed.
     */
    ACCURATE = 2,
  }

  /**
   * A Rectangle holds four number coordinates relative to the processed image.
   * Rectangle are represented as [left, top, right, bottom].
   *
   * Used by Vision Text Recognizer, Face Detector & Landmark Recognition APIs.
   */
  export type VisionRectangle = [number, number, number, number];

  /**
   * A point holds two number coordinates relative to the processed image.
   * Points are represented as [x, y].
   *
   * Used by Vision Text Recognizer, Face Detector & Landmark Recognition APIs.
   */
  export type VisionPoint = [number, number];

  /**
   * A hierarchical representation of texts recognized in an image.
   */
  export interface VisionText {
    /**
     * Retrieve the recognized text as a string.
     */
    text: string;

    /**
     * Gets an array `VisionTextBlock`, which is a block of text that can be further decomposed to an array of `VisionTextLine`.
     */
    blocks: VisionTextBlock[];
  }

  /**
   * Represents a block of text.
   */
  export interface VisionDocumentTextBlock extends VisionDocumentTextBase {
    /**
     * Gets an Array of `VisionDocumentTextParagraph`s that make up this block.
     */
    paragraphs: VisionDocumentTextParagraph[];
  }

  /**
   * A structural unit of text representing a number of words in certain order.
   */
  export interface VisionDocumentTextParagraph extends VisionDocumentTextBase {
    /**
     * Gets an Array of `VisionDocumentTextWord`s that make up this paragraph.
     *
     * Returns an empty list if no Word is found.
     */
    words: VisionDocumentTextWord[];
  }

  /**
   * A single word representation.
   */
  export interface VisionDocumentTextWord extends VisionDocumentTextBase {
    /**
     * Gets an Array of `VisionDocumentTextSymbol`s that make up this word.
     * The order of the symbols follows the natural reading order.
     */
    symbols: VisionDocumentTextSymbol[];
  }

  /**
   * A single symbol representation.
   */
  export interface VisionDocumentTextSymbol extends VisionDocumentTextBase {}

  /**
   * Enum representing the detected break type.
   */
  export enum VisionDocumentTextRecognizedBreakType {
    /**
     * Line-wrapping break.
     */
    EOL_SURE_SPACE = 3,

    /**
     * End-line hyphen that is not present in text; does not co-occur with `SPACE`, `LEADER_SPACE`, or `LINE_BREAK`.
     */
    HYPHEN = 4,

    /**
     * Line break that ends a paragraph.
     */
    LINE_BREAK = 5,

    /**
     * Regular space.
     */
    SPACE = 1,

    /**
     * Sure space (very wide).
     */
    SURE_SPACE = 2,

    /**
     * Unknown break label type.
     */
    UNKNOWN = 0,
  }

  /**
   * A recognized break is the detected start or end of a structural component.
   */
  export interface VisionDocumentTextRecognizedBreak {
    /**
     * Gets detected break type.
     */
    breakType: VisionDocumentTextRecognizedBreakType;

    /**
     * Returns true if break prepends an element.
     */
    isPrefix: boolean;
  }
  /**
   * A shared type that all VisionDocumentText components inherit from
   */
  export interface VisionDocumentTextBase {
    /**
     * Gets the recognized text as a string. Returned in reading order for the language. For Latin, this is top to bottom within a `VisionTextBlock`, and left-to-right within a `VisionTextLine`.
     */
    text: string;

    /**
     * The confidence of the recognized text. It only return valid result from cloud recognizers. For on-device text recognition, the confidence is always null.
     */
    confidence: null | number;

    /**
     * Gets a list of recognized languages. (Cloud API only. On-Device returns empty array)
     *
     * A language is the BCP-47 language code, such as "en-US" or "sr-Latn".
     */
    recognizedLanguages: String[];

    /**
     * Returns the bounding rectangle of the detected text.
     */
    boundingBox: VisionRectangle;

    /**
     * Gets the recognized break - the detected start or end of a structural component.
     */
    recognizedBreak: VisionDocumentTextRecognizedBreak;
  }

  /**
   * A hierarchical representation of document text recognized in an image.
   */
  export interface VisionDocumentText extends VisionText {
    /**
     * Gets an array `VisionTextBlock`, which is a block of text that can be further decomposed to an array of `VisionDocumentTextParagraph`.
     */
    blocks: VisionDocumentTextBlock[];
  }

  /**
   * A shared type that all Vision Text components inherit from
   */
  export interface VisionTextBase {
    /**
     * Gets the recognized text as a string. Returned in reading order for the language. For Latin, this is top to bottom within a `VisionTextBlock`, and left-to-right within a `VisionTextLine`.
     */
    text: string;

    /**
     * The confidence of the recognized text. It only return valid result from cloud recognizers. For on-device text recognition, the confidence is always null.
     */
    confidence: null | number;

    /**
     * Gets a list of recognized languages. (Cloud API only. On-Device returns empty array)
     *
     * A language is the BCP-47 language code, such as "en-US" or "sr-Latn".
     */
    recognizedLanguages: String[];

    /**
     * Returns the bounding rectangle of the detected text.
     */
    boundingBox: VisionRectangle;

    /**
     * Gets the four corner points in clockwise direction starting with top-left. Due to the possible perspective distortions, this is not necessarily a rectangle. Parts of the region could be outside of the image.
     */
    cornerPoints: VisionPoint[];
  }

  /**
   * Represents a block of text (similar to a paragraph).
   */
  export interface VisionTextBlock extends VisionTextBase {
    /**
     * Gets an Array of VisionTextLine's that make up this text block.
     */
    lines: VisionTextLine[];
  }

  /**
   * Represents a line of text.
   */
  export interface VisionTextLine extends VisionTextBase {
    /**
     * Gets an Array of VisionTextElement's that make up this text block.
     *
     * An element is roughly equivalent to a space-separated "word" in most Latin languages, or a character in others. For instance, if a word is split between two lines by a hyphen, each part is encoded as a separate Element.
     */
    elements: VisionTextElement[];
  }

  /**
   * Roughly equivalent to a space-separated "word" in most Latin languages, or a character in others. For instance, if a word is split between two lines by a hyphen, each part is encoded as a separate Element.
   */
  export interface VisionTextElement extends VisionTextBase {}

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
     * Returns an opaque entity ID. IDs are available in [Google Knowledge Graph Search API](https://developers.google.com/knowledge-graph/).
     */
    entityId: string;

    /**
     * Gets overall confidence of the result.
     *
     * Range between 0 (low confidence) and 1 (high confidence).
     */
    confidence: number;
  }

  /**
   * Represents a face returned from `faceDetectorProcessImage()`.
   */
  export interface VisionFace {
    /**
     * Returns the axis-aligned bounding rectangle of the detected face.
     */
    boundingBox: VisionRectangle;

    /**
     * Represent a face contour. A contour is a list of points on a detected face, such as the mouth.
     *
     * When 'left' and 'right' are used, they are relative to the subject in the image. For example, the `LEFT_EYE`
     * landmark is the subject's left eye, not the eye that is on the left when viewing the image.
     */
    faceContours: VisionFaceContour[];

    /**
     * Returns the rotation of the face about the vertical axis of the image. Positive euler y is when the face turns
     * toward the right side of the of the image that is being processed.
     */
    headEulerAngleY: number;

    /**
     * Returns the rotation of the face about the axis pointing out of the image. Positive euler z is a
     * counter-clockwise rotation within the image plane.
     */
    headEulerAngleZ: number;

    /**
     * Returns an array of `VisionFaceLandmark`.
     *
     * Returns an empty array if the landmark mode has not been enabled via `setLandmarkMode()`.
     */
    landmarks: VisionFaceLandmark[];

    /**
     * Returns a value between 0.0 and 1.0 giving a probability that the face's left eye is open.
     *
     * Returns -1 if the classification mode has not been enabled via `setClassificationMode()`.
     */
    leftEyeOpenProbability: number;

    /**
     * Returns a value between 0.0 and 1.0 giving a probability that the face's right eye is open.
     *
     * Returns -1 if the classification mode has not been enabled via `setClassificationMode()`.
     */
    rightEyeOpenProbability: number;

    /**
     * Returns a value between 0.0 and 1.0 giving a probability that the face is smiling.
     *
     * Returns -1 if the classification mode has not been enabled via `setClassificationMode()`.
     */
    smilingProbability: number;
  }

  /**
   * Represent a face landmark. A landmark is a point on a detected face, such as an eye, nose, or mouth.
   *
   * When 'left' and 'right' are used, they are relative to the subject in the image.  For example, the `LEFT_EYE` landmark
   * is the subject's left eye, not the eye that is on the left when viewing the image.
   */
  export interface VisionFaceLandmark {
    /**
     * Returns the landmark type.
     */
    type: VisionFaceLandmarkType;

    /**
     * Gets a 2D point for landmark position, where (0, 0) is the upper-left corner of the image.
     */
    position: VisionPoint[];
  }

  /**
   * Landmark types for a face.
   */
  export enum VisionFaceLandmarkType {
    /**
     * The midpoint between the subject's left mouth corner and the outer corner of the subject's left eye.
     */
    LEFT_CHEEK = 1,

    /**
     * The midpoint of the subject's left ear tip and left ear lobe.
     */
    LEFT_EAR = 3,

    /**
     * The center of the subject's left eye cavity.
     */
    LEFT_EYE = 4,

    /**
     * The center of the subject's bottom lip.
     */
    MOUTH_BOTTOM = 0,

    /**
     * The subject's left mouth corner where the lips meet.
     */
    MOUTH_LEFT = 5,

    /**
     * The subject's right mouth corner where the lips meet.
     */
    MOUTH_RIGHT = 11,

    /**
     * The midpoint between the subject's nostrils where the nose meets the face.
     */
    NOSE_BASE = 6,

    /**
     * The midpoint between the subject's right mouth corner and the outer corner of the subject's right eye.
     */
    RIGHT_CHEEK = 7,

    /**
     * The midpoint of the subject's right ear tip and right ear lobe.
     */
    RIGHT_EAR = 9,

    /**
     * The center of the subject's right eye cavity.
     */
    RIGHT_EYE = 10,
  }

  /**
   * Represent a face contour. A contour is a list of points on a detected face, such as the mouth.
   * When 'left' and 'right' are used, they are relative to the subject in the image. For example, the `LEFT_EYE` landmark
   * is the subject's left eye, not the eye that is on the left when viewing the image.
   */
  export interface VisionFaceContour {
    /**
     * Returns the contour type.
     */
    type: VisionFaceContourType;

    /**
     * Gets a list of 2D points for this face contour, where (0, 0) is the upper-left corner of the image. The point is
     * guaranteed to be within the bounds of the image.
     */
    points: VisionPoint[];
  }

  /**
   * Countour type for a face.
   */
  export enum VisionFaceContourType {
    /**
     * All points of a face contour.
     */
    ALL_POINTS = 1,

    /**
     * The outline of the subject's face.
     */
    FACE = 2,

    /**
     * The outline of the subject's left eye cavity.
     */
    LEFT_EYE = 7,

    /**
     * The bottom outline of the subject's left eyebrow.
     */
    LEFT_EYEBROW_BOTTOM = 4,

    /**
     * The top outline of the subject's left eyebrow.
     */
    LEFT_EYEBROW_TOP = 3,

    /**
     * The bottom outline of the subject's lower lip.
     */
    LOWER_LIP_BOTTOM = 12,

    /**
     * The top outline of the subject's lower lip.
     */
    LOWER_LIP_TOP = 11,

    /**
     * The outline of the subject's nose bridge.
     */
    NOSE_BOTTOM = 14,

    /**
     * The outline of the subject's nose bridge.
     */
    NOSE_BRIDGE = 13,

    /**
     * The outline of the subject's right eye cavity.
     */
    RIGHT_EYE = 8,

    /**
     * The bottom outline of the subject's right eyebrow.
     */
    RIGHT_EYEBROW_BOTTOM = 6,

    /**
     * The top outline of the subject's right eyebrow.
     */
    RIGHT_EYEBROW_TOP = 5,

    /**
     * The bottom outline of the subject's upper lip.
     */
    UPPER_LIP_BOTTOM = 10,

    /**
     * The top outline of the subject's upper lip.
     */
    UPPER_LIP_TOP = 9,
  }

  /**
   * Represents a detected landmark returned from `cloudLandmarkRecognizerProcessImage()`.
   */
  export interface VisionLandmark {
    /**
     * Gets image region of the detected landmark. Returns null if nothing was detected
     */
    boundingBox: VisionRectangle | null;

    /**
     * Gets overall confidence of the result. Ranging between 0 & 1.
     */
    confidence: number;

    /**
     * Gets opaque entity ID. Some IDs may be available in [Google Knowledge Graph Search API](https://developers.google.com/knowledge-graph/).
     */
    entityId: string;

    /**
     * Gets the detected landmark.
     */
    landmark: string;

    /**
     * Gets the location information for the detected entity.
     *
     * Multiple VisionGeoPoint elements can be present because one location may indicate the location of the scene
     * in the image, and another location may indicate the location of the place where the image was taken.
     * Location information is usually present for landmarks.
     */
    locations: VisionGeoPoint[];
  }

  /**
   * A representation of a latitude/longitude pair.
   *
   * This is expressed as an array of numbers representing degrees latitude and degrees longitude, in the form `[lat, lng]`.
   */
  export type VisionGeoPoint = [number, number];

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
  export class Module extends FirebaseModule {
    /**
     * Detects faces from a local image file.
     *
     * @param imageFilePath A local path to an image on the device.
     * @param faceDetectorOptions An optional instance of `VisionFaceDetectorOptions`.
     */
    faceDetectorProcessImage(
      imageFilePath: string,
      faceDetectorOptions?: VisionFaceDetectorOptions,
    ): Promise<VisionFace[]>;

    /**
     * Detect text from a local image file using the on-device model.
     *
     * @param imageFilePath A local path to an image on the device.
     */
    textRecognizerProcessImage(imageFilePath: string): Promise<VisionText>;

    /**
     * Detect text from a local image file using the cloud (Firebase) model.
     *
     * @param imageFilePath A local path to an image on the device.
     * @param cloudTextRecognizerOptions An instance of `VisionCloudTextRecognizerOptions`.
     */
    cloudTextRecognizerProcessImage(
      imageFilePath: string,
      cloudTextRecognizerOptions?: VisionCloudTextRecognizerOptions,
    ): Promise<VisionText>;

    /**
     * Detect text within a document using a local image file from the cloud (Firebase) model.
     *
     * @param imageFilePath A local path to an image on the device.
     * @param cloudDocumentTextRecognizerOptions An instance of `VisionCloudDocumentTextRecognizerOptions`.
     */
    cloudDocumentTextRecognizerProcessImage(
      imageFilePath: string,
      cloudDocumentTextRecognizerOptions?: VisionCloudDocumentTextRecognizerOptions,
    ): Promise<VisionDocumentText>;

    /**
     * Returns an array of landmarks (as `VisionLandmark`) of a given local image file path. Landmark detection
     * is done on cloud (Firebase).
     *
     * @param imageFilePath A local image file path.
     * @param cloudLandmarkRecognizerOptions An optional instance of `VisionCloudLandmarkRecognizerOptions`.
     */
    cloudLandmarkRecognizerProcessImage(
      imageFilePath: string,
      cloudLandmarkRecognizerOptions?: VisionCloudLandmarkRecognizerOptions,
    ): Promise<VisionLandmark[]>;

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
     * const labels = await firebase.mlKitVision().cloudImageLabelerProcessImage(filePath, {
     *   confidenceThreshold: 0.8,
     * });
     * ```
     *
     * @param imageFilePath A local image file path.
     * @param cloudImageLabelerOptions An optional instance of `VisionCloudImageLabelerOptions`.
     */
    cloudImageLabelerProcessImage(
      imageFilePath: string,
      cloudImageLabelerOptions?: VisionCloudImageLabelerOptions,
    ): Promise<VisionImageLabel[]>;

    /**
     * Returns an array of barcodes (as `VisionBarcode`) detected for a local image file path.
     *
     * Barcode detection is done locally on device.
     *
     * #### Example 1
     *
     * ```js
     * import vision, { VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
     *
     * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath);
     *
     * if (barcode && barcode.valueType === VisionBarcodeValueType.CONTACT_INFO) {
     *   console.log(barcode.contactInfo);
     * }
     * ```
     *
     * #### Example 2
     *
     * Process image with custom `VisionBarcodeDetectorOptions`.
     *
     * ```js
     * import vision, { VisionBarcodeFormat, VisionBarcodeValueType } from '@react-native-firebase/ml-vision';
     *
     * const [barcode, ...otherBarcodes] = await vision().barcodeDetectorProcessImage(filePath, {
     *   barcodeFormats: [VisionBarcodeFormat.QR_CODE]
     * });
     *
     * if (barcode && barcode.valueType === VisionBarcodeValueType.CONTACT_INFO) {
     *   console.log(barcode.contactInfo);
     * }
     * ```
     *
     * @param imageFilePath A local image file path.
     * @param barcodeDetectorOptions Optional instance of `VisionBarcodeDetectorOptions`.
     */
    barcodeDetectorProcessImage(
      imageFilePath: string,
      barcodeDetectorOptions?: VisionBarcodeDetectorOptions,
    ): Promise<VisionBarcode[]>;
  }
}

export const VisionPoint = MLKitVision.VisionPoint;
export const VisionRectangle = MLKitVision.VisionRectangle;
export const VisionFaceDetectorOptions = MLKitVision.VisionFaceDetectorOptions;
export const VisionFaceLandmarkType = MLKitVision.VisionFaceLandmarkType;
export const VisionFaceContourType = MLKitVision.VisionFaceContourType;

export const VisionImageLabelerOptions = MLKitVision.VisionImageLabelerOptions;
export const VisionBarcodeDetectorOptions = VisionBarcodeDetectorOptions;
export const VisionCloudImageLabelerOptions = MLKitVision.VisionCloudImageLabelerOptions;
export const VisionCloudTextRecognizerOptions = MLKitVision.VisionCloudTextRecognizerOptions;

export const VisionCloudTextRecognizerModelType = MLKitVision.VisionCloudTextRecognizerModelType;
export const VisionCloudLandmarkRecognizerOptions =
  MLKitVision.VisionCloudLandmarkRecognizerOptions;
export const VisionCloudDocumentTextRecognizerOptions =
  MLKitVision.VisionCloudDocumentTextRecognizerOptions;

export const VisionFaceDetectorClassificationMode =
  MLKitVision.VisionFaceDetectorClassificationMode;
export const VisionFaceDetectorContourMode = MLKitVision.VisionFaceDetectorContourMode;
export const VisionFaceDetectorLandmarkMode = MLKitVision.VisionFaceDetectorLandmarkMode;
export const VisionFaceDetectorPerformanceMode = MLKitVision.VisionFaceDetectorPerformanceMode;

export const VisionDocumentTextRecognizedBreakType =
  MLKitVision.VisionDocumentTextRecognizedBreakType;
export const VisionCloudLandmarkRecognizerModelType =
  MLKitVision.VisionCloudLandmarkRecognizerModelType;

export const VisionBarcodeFormat = MLKITVision.VisionBarcodeFormat;
export const VisionBarcodeValueType = MLKITVision.VisionBarcodeValueType;
export const VisionBarcodeAddressType = MLKITVision.VisionBarcodeAddressType;
export const VisionBarcodeEmailType = MLKITVision.VisionBarcodeEmailType;
export const VisionBarcodePhoneType = MLKITVision.VisionBarcodePhoneType;
export const VisionBarcodeWifiEncryptionType = MLKITVision.VisionBarcodeWifiEncryptionType;
export const VisionBarcodeDetectorOptions = MLKITVision.VisionBarcodeDetectorOptions;

declare module '@react-native-firebase/ml-vision' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStaticsAndApp<MLKitVision.Module, MLKitVision.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      mlKitVision: FirebaseModuleWithStaticsAndApp<MLKitVision.Module, MLKitVision.Statics>;
    }

    interface FirebaseApp {
      mlKitVision(): MLKitVision.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    ml_vision_face_model: boolean;
    ml_vision_ocr_model: boolean;
    ml_vision_barcode_model: boolean;
    ml_vision_label_model: boolean;
    ml_vision_image_label_model: boolean;
  }
}
