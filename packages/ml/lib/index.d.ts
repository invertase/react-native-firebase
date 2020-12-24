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
 * Firebase ML package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `ml` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/ml';
 *
 * // firebase.ml().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `ml` package:
 *
 * ```js
 * import ml from '@react-native-firebase/ml';
 *
 * // ml().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/ml';
 *
 * // firebase.ml().X
 * ```
 *
 * @firebase ml
 */
export namespace FirebaseMLTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {
    MLCloudTextRecognizerModelType: typeof MLCloudTextRecognizerModelType;
    MLCloudLandmarkRecognizerModelType: typeof MLCloudLandmarkRecognizerModelType;
    MLDocumentTextRecognizedBreakType: typeof MLDocumentTextRecognizedBreakType;
  }

  /**
   * Options for cloud image labeler. Confidence threshold could be provided for the label detection.
   *
   * For example, if the confidence threshold is set to 0.7, only labels with confidence >= 0.7 would be returned. The default threshold is 0.5.
   *
   * Note: at most 20 labels will be returned for cloud image labeler.
   */
  export interface MLCloudImageLabelerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use ML API.
     *
     * > Do not set this for debug build if you use simulators to test.
     *
     * #### Example
     *
     * ```js
     * await firebase.ml().cloudImageLabelerProcessImage(filePath, {
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
     * await firebase.ml().cloudImageLabelerProcessImage(filePath, {
     *   confidenceThreshold: 0.8,
     * });
     * ```
     */
    confidenceThreshold?: number;

    /**
     * API key to use for ML API. If not set, the default API key from `firebase.app()` will be used.
     *
     * #### Example
     *
     * ```js
     * await firebase.ml().cloudImageLabelerProcessImage(filePath, {
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
  export interface MLCloudLandmarkRecognizerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use ML API.
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
     * Defaults to `MLCloudLandmarkRecognizerModelType.STABLE_MODEL`.
     */
    modelType?:
      | MLCloudLandmarkRecognizerModelType.STABLE_MODEL
      | MLCloudLandmarkRecognizerModelType.LATEST_MODEL;

    /**
     * API key to use for ML API. If not set, the default API key from `firebase.app()` will be used.
     *
     * @ios
     */
    apiKeyOverride?: string;
  }

  /**
   * Model types for cloud landmark recognition.
   */
  export enum MLCloudLandmarkRecognizerModelType {
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
  export interface MLCloudTextRecognizerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use ML API.
     *
     * > Do not set this for debug build if you use simulators to test.
     *
     * #### Example
     *
     * ```js
     * await firebase.ml().cloudTextRecognizerProcessImage(filePath, {
     *   enforceCertFingerprintMatch: true,
     * });
     * ```
     */
    enforceCertFingerprintMatch?: boolean;

    /**
     * Sets model type for cloud text recognition. The two models SPARSE_MODEL and DENSE_MODEL handle different text densities in an image.
     *
     * See `MLCloudTextRecognizerModelType` for types.
     *
     * Defaults to `MLCloudTextRecognizerModelType.SPARSE_MODEL`.
     *
     * #### Example
     *
     * ```js
     * import {
     *   firebase,
     *   MLCloudTextRecognizerModelType,
     * } from '@react-native-firebase/ml';
     *
     * await firebase.ml().cloudTextRecognizerProcessImage(filePath, {
     *   modelType: MLCloudTextRecognizerModelType.DENSE_MODEL,
     * });
     * ```
     */
    modelType?:
      | MLCloudTextRecognizerModelType.SPARSE_MODEL
      | MLCloudTextRecognizerModelType.DENSE_MODEL;

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
     * await firebase.ml().cloudTextRecognizerProcessImage(filePath, {
     *   languageHints: ['fr', 'de'],
     * });
     * ```
     */
    languageHints?: string[];

    /**
     * API key to use for Cloud ML API. If not set, the default API key from `firebase.app()` will be used.
     *
     * #### Example
     *
     * ```js
     * await firebase.ml().cloudTextRecognizerProcessImage(filePath, {
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
  export interface MLCloudDocumentTextRecognizerOptions {
    /**
     * Only allow registered application instances with matching certificate fingerprint to use ML API.
     *
     * > Do not set this for debug build if you use simulators to test.
     *
     * #### Example
     *
     * ```js
     * await firebase.ml().cloudTextRecognizerProcessImage(filePath, {
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
     * await firebase.ml().cloudTextRecognizerProcessImage(filePath, {
     *   languageHints: ['fr', 'de'],
     * });
     * ```
     */
    languageHints?: string[];

    /**
     * API key to use for ML API. If not set, the default API key from `firebase.app()` will be used.
     *
     * #### Example
     *
     * ```js
     * await firebase.ml().cloudTextRecognizerProcessImage(filePath, {
     *   apiKeyOverride: 'xyz123',
     * });
     * ```
     *
     * @ios
     */
    apiKeyOverride?: string;
  }

  /**
   * The cloud model type used for in MLCloudTextRecognizerOptions & MLCloudDocumentTextRecognizerOptions
   *
   * Defaults to `SPARSE_MODEL`
   */
  export enum MLCloudTextRecognizerModelType {
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
   * A Rectangle holds four number coordinates relative to the processed image.
   * Rectangle are represented as [left, top, right, bottom].
   *
   * Used by ML Text Recognizer & Landmark Recognition APIs.
   */
  export type MLRectangle = [number, number, number, number];

  /**
   * A point holds two number coordinates relative to the processed image.
   * Points are represented as [x, y].
   *
   * Used by ML Text Recognizer & Landmark Recognition APIs.
   */
  export type MLPoint = [number, number];

  /**
   * A hierarchical representation of texts recognized in an image.
   */
  export interface MLText {
    /**
     * Retrieve the recognized text as a string.
     */
    text: string;

    /**
     * Gets an array `MLTextBlock`, which is a block of text that can be further decomposed to an array of `MLTextLine`.
     */
    blocks: MLTextBlock[];
  }

  /**
   * Represents a block of text.
   */
  export interface MLDocumentTextBlock extends MLDocumentTextBase {
    /**
     * Gets an Array of `MLDocumentTextParagraph`s that make up this block.
     */
    paragraphs: MLDocumentTextParagraph[];
  }

  /**
   * A structural unit of text representing a number of words in certain order.
   */
  export interface MLDocumentTextParagraph extends MLDocumentTextBase {
    /**
     * Gets an Array of `MLDocumentTextWord`s that make up this paragraph.
     *
     * Returns an empty list if no Word is found.
     */
    words: MLDocumentTextWord[];
  }

  /**
   * A single word representation.
   */
  export interface MLDocumentTextWord extends MLDocumentTextBase {
    /**
     * Gets an Array of `MLDocumentTextSymbol`s that make up this word.
     * The order of the symbols follows the natural reading order.
     */
    symbols: MLDocumentTextSymbol[];
  }

  /**
   * A single symbol representation.
   */
  export type MLDocumentTextSymbol = MLDocumentTextBase;

  /**
   * Enum representing the detected break type.
   */
  export enum MLDocumentTextRecognizedBreakType {
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
  export interface MLDocumentTextRecognizedBreak {
    /**
     * Gets detected break type.
     */
    breakType: MLDocumentTextRecognizedBreakType;

    /**
     * Returns true if break prepends an element.
     */
    isPrefix: boolean;
  }
  /**
   * A shared type that all MLDocumentText components inherit from
   */
  export interface MLDocumentTextBase {
    /**
     * Gets the recognized text as a string. Returned in reading order for the language. For Latin, this is top to bottom within a `MLTextBlock`, and left-to-right within a `MLTextLine`.
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
    recognizedLanguages: string[];

    /**
     * Returns the bounding rectangle of the detected text.
     */
    boundingBox: MLRectangle;

    /**
     * Gets the recognized break - the detected start or end of a structural component.
     */
    recognizedBreak: MLDocumentTextRecognizedBreak;
  }

  /**
   * A hierarchical representation of document text recognized in an image.
   */
  export interface MLDocumentText {
    /**
     * Retrieve the recognized text as a string.
     */
    text: string;

    /**
     * Gets an array `MLTextBlock`, which is a block of text that can be further decomposed to an array of `MLDocumentTextParagraph`.
     */
    blocks: MLDocumentTextBlock[];
  }

  /**
   * A shared type that all ML Text components inherit from
   */
  export interface MLTextBase {
    /**
     * Gets the recognized text as a string. Returned in reading order for the language. For Latin, this is top to bottom within a `MLTextBlock`, and left-to-right within a `MLTextLine`.
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
    recognizedLanguages: string[];

    /**
     * Returns the bounding rectangle of the detected text.
     */
    boundingBox: MLRectangle;

    /**
     * Gets the four corner points in clockwise direction starting with top-left. Due to the possible perspective distortions, this is not necessarily a rectangle. Parts of the region could be outside of the image.
     */
    cornerPoints: MLPoint[];
  }

  /**
   * Represents a block of text (similar to a paragraph).
   */
  export interface MLTextBlock extends MLTextBase {
    /**
     * Gets an Array of MLTextLine's that make up this text block.
     */
    lines: MLTextLine[];
  }

  /**
   * Represents a line of text.
   */
  export interface MLTextLine extends MLTextBase {
    /**
     * Gets an Array of MLTextElement's that make up this text block.
     *
     * An element is roughly equivalent to a space-separated "word" in most Latin languages, or a character in others. For instance, if a word is split between two lines by a hyphen, each part is encoded as a separate Element.
     */
    elements: MLTextElement[];
  }

  /**
   * Roughly equivalent to a space-separated "word" in most Latin languages, or a character in others. For instance, if a word is split between two lines by a hyphen, each part is encoded as a separate Element.
   */
  export type MLTextElement = MLTextBase;

  /**
   * Represents an image label return from `imageLabelerProcessImage()` and `cloudImageLabelerProcessImage()`.
   */
  export interface MLImageLabel {
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
   * Represents a detected landmark returned from `cloudLandmarkRecognizerProcessImage()`.
   */
  export interface MLLandmark {
    /**
     * Gets image region of the detected landmark. Returns null if nothing was detected
     */
    boundingBox: MLRectangle | null;

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
     * Multiple MLGeoPoint elements can be present because one location may indicate the location of the scene
     * in the image, and another location may indicate the location of the place where the image was taken.
     * Location information is usually present for landmarks.
     */
    locations: MLGeoPoint[];
  }

  /**
   * A representation of a latitude/longitude pair.
   *
   * This is expressed as an array of numbers representing degrees latitude and degrees longitude, in the form `[lat, lng]`.
   */
  export type MLGeoPoint = [number, number];

  /**
   * The Firebase ML service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the ML service for the default app:
   *
   * ```js
   * const defaultAppML = firebase.ml();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Detect text from a local image file.
     *
     * @param imageFilePath A local path to an image on the device.
     * @param cloudTextRecognizerOptions An instance of `MLCloudTextRecognizerOptions`.
     */
    cloudTextRecognizerProcessImage(
      imageFilePath: string,
      cloudTextRecognizerOptions?: MLCloudTextRecognizerOptions,
    ): Promise<MLText>;

    /**
     * Detect text within a document using a local image file.
     *
     * @param imageFilePath A local path to an image on the device.
     * @param cloudDocumentTextRecognizerOptions An instance of `MLCloudDocumentTextRecognizerOptions`.
     */
    cloudDocumentTextRecognizerProcessImage(
      imageFilePath: string,
      cloudDocumentTextRecognizerOptions?: MLCloudDocumentTextRecognizerOptions,
    ): Promise<MLDocumentText>;

    /**
     * Returns an array of landmarks (as `MLLandmark`) of a given local image file path
     *
     * @param imageFilePath A local image file path.
     * @param cloudLandmarkRecognizerOptions An optional instance of `MLCloudLandmarkRecognizerOptions`.
     */
    cloudLandmarkRecognizerProcessImage(
      imageFilePath: string,
      cloudLandmarkRecognizerOptions?: MLCloudLandmarkRecognizerOptions,
    ): Promise<MLLandmark[]>;

    /**
     * Returns an array of labels (as `MLImageLabel`) of a given local image file path.
     *
     * #### Example
     *
     * ```js
     * const labels = await firebase.ml().cloudImageLabelerProcessImage(filePath, {
     *   confidenceThreshold: 0.8,
     * });
     * ```
     *
     * @param imageFilePath A local image file path.
     * @param cloudImageLabelerOptions An optional instance of `MLCloudImageLabelerOptions`.
     */
    cloudImageLabelerProcessImage(
      imageFilePath: string,
      cloudImageLabelerOptions?: MLCloudImageLabelerOptions,
    ): Promise<MLImageLabel[]>;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseMLTypes.Module,
  FirebaseMLTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  analytics: typeof defaultExport;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { ml(): FirebaseMLTypes.Module };
};

export const MLCloudTextRecognizerModelType: FirebaseMLTypes.Statics['MLCloudTextRecognizerModelType'];
export const MLDocumentTextRecognizedBreakType: FirebaseMLTypes.Statics['MLDocumentTextRecognizedBreakType'];
export const MLCloudLandmarkRecognizerModelType: FirebaseMLTypes.Statics['MLCloudLandmarkRecognizerModelType'];

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      ml: FirebaseModuleWithStaticsAndApp<FirebaseMLTypes.Module, FirebaseMLTypes.Statics>;
    }

    interface FirebaseApp {
      ml(): FirebaseMLTypes.Module;
    }
  }
}
