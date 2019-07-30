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

import { isArray, isObject, isUndefined } from '@react-native-firebase/common';
import VisionBarcodeFormat from './VisionBarcodeFormat';

export default function visionBarcodeDetectorOptions(barcodeDetectorOptions) {
  const out = {
    barcodeFormats: [VisionBarcodeFormat.ALL_FORMATS],
  };

  if (isUndefined(barcodeDetectorOptions)) {
    return out;
  }

  if (!isObject(barcodeDetectorOptions)) {
    throw new Error("'barcodeDetectorOptions' expected an object value.");
  }

  if (barcodeDetectorOptions.barcodeFormats) {
    if (!isArray(barcodeDetectorOptions.barcodeFormats)) {
      throw new Error(
        "'barcodeDetectorOptions.barcodeFormats' must be an array of VisionBarcodeFormat types.",
      );
    }

    const validFormats = Object.values(VisionBarcodeFormat);

    for (let i = 0; i < barcodeDetectorOptions.barcodeFormats.length; i++) {
      if (!validFormats.includes(barcodeDetectorOptions.barcodeFormats[i])) {
        throw new Error(
          `'barcodeDetectorOptions.barcodeFormats' type at index ${i} is invalid. Expected a VisionBarcodeFormat type.`,
        );
      }
    }

    out.barcodeFormats = barcodeDetectorOptions.barcodeFormats;
  }

  return out;
}
