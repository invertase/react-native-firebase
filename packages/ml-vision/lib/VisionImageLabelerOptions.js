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

export default class VisionImageLabelerOptions extends MutatableParams {
  constructor() {
    super();
    this.set('confidenceThreshold', 0.5);
  }

  setConfidenceThreshold(confidenceThreshold) {
    if (!isNumber(confidenceThreshold)) {
      throw new Error(
        `firebase.mlKitVision() VisionImageLabelerOptions.setConfidenceThreshold(*) 'confidenceThreshold' expected a number value between 0 & 1.`,
      );
    }

    if (confidenceThreshold < 0 || confidenceThreshold > 1) {
      throw new Error(
        `firebase.mlKitVision() VisionImageLabelerOptions.setConfidenceThreshold(*) 'confidenceThreshold' expected value to be between 0 & 1.`,
      );
    }

    return this.set('confidenceThreshold', confidenceThreshold);
  }
}
