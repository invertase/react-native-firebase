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

import VisionCloudLandmarkRecognizerModelType from './VisionCloudLandmarkRecognizerModelType';

export default class VisionCloudLandmarkRecognizerOptions extends MutatableParams {
  constructor() {
    super();
    this.set('enforceCertFingerprintMatch', false);
    this.set('maxResults', 10);
    this.set('model', VisionCloudLandmarkRecognizerModelType.STABLE_MODEL);
  }

  enforceCertFingerprintMatch() {
    return this.set('enforceCertFingerprintMatch', true);
  }

  setMaxResults(maxResults) {
    if (!isNumber(maxResults)) {
      throw new Error(
        `firebase.mlKitVision() VisionCloudLandmarkRecognizerOptions.setMaxResults(*) 'maxResults' expected a number value.`,
      );
    }

    return this.set('maxResults', maxResults);
  }

  setModelType(model) {
    if (
      model !== VisionCloudLandmarkRecognizerModelType.STABLE_MODEL &&
      model !== VisionCloudLandmarkRecognizerModelType.LATEST_MODEL
    ) {
      throw new Error(
        `firebase.mlKitVision() VisionCloudLandmarkRecognizerOptions.setModelType(*) 'model' invalid model. Expected VisionCloudLandmarkRecognizerModelType.STABLE_MODEL or VisionCloudLandmarkRecognizerModelType.LATEST_MODEL.`,
      );
    }

    return this.set('model', model);
  }
}
