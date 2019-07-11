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

import { isArray, isString } from '@react-native-firebase/common';

import MutatableParams from '@react-native-firebase/common/lib/MutatableParams';
import VisionCloudTextRecognizerModelType from './VisionCloudTextRecognizerModelType';

export default class VisionCloudTextRecognizerOptions extends MutatableParams {
  constructor() {
    super();
    this.set('enforceCertFingerprintMatch', false);
    this.set('modelType', VisionCloudTextRecognizerModelType.SPARSE_MODEL);
  }

  enforceCertFingerprintMatch() {
    return this.set('enforceCertFingerprintMatch', true);
  }

  setLanguageHints(hintedLanguages) {
    // quick check the first entry is a string only
    if (!isArray(hintedLanguages) || !hintedLanguages.length || !isString(hintedLanguages[0])) {
      throw new Error(
        `firebase.mlKitVision() VisionCloudTextRecognizerOptions.setLanguageHints(*) 'hintedLanguages' must be an non empty array of strings.`,
      );
    }

    return this.set('hintedLanguages', hintedLanguages);
  }

  setModelType(modelType) {
    if (
      modelType !== VisionCloudTextRecognizerModelType.DENSE_MODEL &&
      modelType !== VisionCloudTextRecognizerModelType.SPARSE_MODEL
    ) {
      throw new Error(
        `firebase.mlKitVision() VisionCloudTextRecognizerOptions.setModelType(*) 'modelType' must be one of VisionCloudTextRecognizerModelType.DENSE_MODEL or .SPARSE_MODEL.`,
      );
    }

    return this.set('modelType', modelType);
  }
}
