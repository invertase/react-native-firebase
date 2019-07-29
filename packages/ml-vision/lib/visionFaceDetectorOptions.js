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

import { hasOwnProperty, isNumber, isObject, isUndefined } from '@react-native-firebase/common';

import VisionFaceDetectorClassificationMode from './VisionFaceDetectorClassificationMode';
import VisionFaceDetectorContourMode from './VisionFaceDetectorContourMode';
import VisionFaceDetectorLandmarkMode from './VisionFaceDetectorLandmarkMode';
import VisionFaceDetectorPerformanceMode from './VisionFaceDetectorPerformanceMode';

export default function visionFaceDetectorOptions(faceDetectorOptions) {
  const out = {
    classificationMode: VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS,
    contourMode: VisionFaceDetectorContourMode.NO_CONTOURS,
    landmarkMode: VisionFaceDetectorLandmarkMode.NO_LANDMARKS,
    minFaceSize: 0.1,
    performanceMode: VisionFaceDetectorPerformanceMode.FAST,
  };

  if (isUndefined(faceDetectorOptions)) {
    return out;
  }

  if (!isObject(faceDetectorOptions)) {
    throw new Error(`'faceDetectorOptions' expected an object value.`);
  }

  if (faceDetectorOptions.classificationMode) {
    if (
      faceDetectorOptions.classificationMode !==
        VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS &&
      faceDetectorOptions.classificationMode !==
        VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS
    ) {
      throw new Error(
        `'faceDetectorOptions.classificationMode' invalid classification mode. Expected VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS or VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS.`,
      );
    }

    out.classificationMode = faceDetectorOptions.classificationMode;
  }

  if (faceDetectorOptions.contourMode) {
    if (
      faceDetectorOptions.contourMode !== VisionFaceDetectorContourMode.NO_CONTOURS &&
      faceDetectorOptions.contourMode !== VisionFaceDetectorContourMode.ALL_CONTOURS
    ) {
      throw new Error(
        `'faceDetectorOptions.contourMode' invalid contour mode. Expected VisionFaceDetectorContourMode.NO_CONTOURS or VisionFaceDetectorContourMode.ALL_CONTOURS.`,
      );
    }

    out.contourMode = faceDetectorOptions.contourMode;
  }

  if (faceDetectorOptions.landmarkMode) {
    if (
      faceDetectorOptions.landmarkMode !== VisionFaceDetectorLandmarkMode.NO_LANDMARKS &&
      faceDetectorOptions.landmarkMode !== VisionFaceDetectorLandmarkMode.ALL_LANDMARKS
    ) {
      throw new Error(
        `'faceDetectorOptions.landmarkMode' invalid landmark mode. Expected VisionFaceDetectorLandmarkMode.NO_LANDMARKS or VisionFaceDetectorLandmarkMode.ALL_LANDMARKS.`,
      );
    }

    out.landmarkMode = faceDetectorOptions.landmarkMode;
  }

  if (hasOwnProperty(faceDetectorOptions, 'minFaceSize')) {
    if (!isNumber(faceDetectorOptions.minFaceSize)) {
      throw new Error(`'faceDetectorOptions.minFaceSize' expected a number value between 0 & 1.`);
    }

    if (faceDetectorOptions.minFaceSize < 0 || faceDetectorOptions.minFaceSize > 1) {
      throw new Error(`'faceDetectorOptions.minFaceSize' expected value to be between 0 & 1.`);
    }

    out.minFaceSize = faceDetectorOptions.minFaceSize;
  }

  if (faceDetectorOptions.performanceMode) {
    if (
      faceDetectorOptions.performanceMode !== VisionFaceDetectorPerformanceMode.FAST &&
      faceDetectorOptions.performanceMode !== VisionFaceDetectorPerformanceMode.ACCURATE
    ) {
      throw new Error(
        `'faceDetectorOptions.performanceMode' invalid performance mode. Expected VisionFaceDetectorPerformanceMode.FAST or VisionFaceDetectorPerformanceMode.ACCURATE.`,
      );
    }

    out.performanceMode = faceDetectorOptions.performanceMode;
  }

  return out;
}
