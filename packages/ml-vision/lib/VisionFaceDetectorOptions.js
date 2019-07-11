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

import MutatableParams from '@react-native-firebase/common/lib/MutatableParams';
import { isNumber } from '@react-native-firebase/common';

import VisionFaceDetectorClassificationMode from './VisionFaceDetectorClassificationMode';
import VisionFaceDetectorContourMode from './VisionFaceDetectorContourMode';
import VisionFaceDetectorLandmarkMode from './VisionFaceDetectorLandmarkMode';
import VisionFaceDetectorPerformanceMode from './VisionFaceDetectorPerformanceMode';

export default class VisionFaceDetectorOptions extends MutatableParams {
  constructor() {
    super();
    this.set('classificationMode', VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS);
    this.set('contourMode', VisionFaceDetectorContourMode.NO_CONTOURS);
    this.set('landmarkMode', VisionFaceDetectorLandmarkMode.NO_LANDMARKS);
    this.set('minFaceSize', 0.1);
    this.set('performanceMode', VisionFaceDetectorPerformanceMode.FAST);
  }

  setClassificationMode(classificationMode) {
    if (
      classificationMode !== VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS &&
      classificationMode !== VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS
    ) {
      throw new Error(
        `firebase.mlKitVision() VisionFaceDetectorOptions.setClassificationMode(*) 'classificationMode' invalid classification mode. Expected VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS or VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS.`,
      );
    }

    return this.set('classificationMode', classificationMode);
  }

  setContourMode(contourMode) {
    if (
      contourMode !== VisionFaceDetectorContourMode.NO_CONTOURS &&
      contourMode !== VisionFaceDetectorContourMode.ALL_CONTOURS
    ) {
      throw new Error(
        `firebase.mlKitVision() VisionFaceDetectorOptions.setContourMode(*) 'contourMode' invalid contour mode. Expected VisionFaceDetectorContourMode.NO_CONTOURS or VisionFaceDetectorContourMode.ALL_CONTOURS.`,
      );
    }

    return this.set('contourMode', contourMode);
  }

  setLandmarkMode(landmarkMode) {
    if (
      landmarkMode !== VisionFaceDetectorLandmarkMode.NO_LANDMARKS &&
      landmarkMode !== VisionFaceDetectorLandmarkMode.ALL_LANDMARKS
    ) {
      throw new Error(
        `firebase.mlKitVision() VisionFaceDetectorOptions.setLandmarkMode(*) 'landmarkMode' invalid landmark mode. Expected VisionFaceDetectorLandmarkMode.NO_LANDMARKS or VisionFaceDetectorLandmarkMode.ALL_LANDMARKS.`,
      );
    }

    return this.set('landmarkMode', landmarkMode);
  }

  setMinFaceSize(minFaceSize) {
    if (!isNumber(minFaceSize)) {
      throw new Error(
        `firebase.mlKitVision() VisionFaceDetectorOptions.setMinFaceSize(*) 'minFaceSize' expected a number value between 0 & 1.`,
      );
    }

    if (minFaceSize < 0 || minFaceSize > 1) {
      throw new Error(
        `firebase.mlKitVision() VisionFaceDetectorOptions.setMinFaceSize(*) 'minFaceSize' expected value to be between 0 & 1.`,
      );
    }

    return this.set('minFaceSize', minFaceSize);
  }

  setPerformanceMode(performanceMode) {
    if (
      performanceMode !== VisionFaceDetectorPerformanceMode.FAST &&
      performanceMode !== VisionFaceDetectorPerformanceMode.ACCURATE
    ) {
      throw new Error(
        `firebase.mlKitVision() VisionFaceDetectorOptions.setPerformanceMode(*) 'performanceMode' invalid performance mode. Expected VisionFaceDetectorPerformanceMode.FAST or VisionFaceDetectorPerformanceMode.ACCURATE.`,
      );
    }

    return this.set('performanceMode', performanceMode);
  }
}
