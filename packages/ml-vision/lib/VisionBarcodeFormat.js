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

export default {
  /**
   * Barcode format constant representing the union of all supported formats.
   */
  ALL_FORMATS: 0,
  /**
   * Barcode format constant for AZTEC.
   */
  AZTEC: 4096,
  /**
   * Barcode format constant for Codabar.
   */
  CODABAR: 8,
  /**
   * Barcode format constant for Code 128.
   */
  CODE_128: 1,
  /**
   * Barcode format constant for Code 39.
   */
  CODE_39: 2,
  /**
   * Barcode format constant for Code 93.
   */
  CODE_93: 4,
  /**
   * Barcode format constant for Data Matrix.
   */
  DATA_MATRIX: 16,
  /**
   * Barcode format constant for EAN-13.
   */
  EAN_13: 32,
  /**
   * Barcode format constant for EAN-8.
   */
  EAN_8: 64,
  /**
   * Barcode format constant for ITF (Interleaved Two-of-Five).
   */
  ITF: 128,
  /**
   * Barcode format constant for PDF-417.
   */
  PDF417: 2048,
  /**
   * Barcode format constant for QR Code.
   */
  QR_CODE: 256,
  /**
   * Barcode format unknown to the current SDK, but understood by Google Play services.
   */
  UNKNOWN: -1,
  /**
   * Barcode format constant for UPC-A.
   */
  UPC_A: 512,
  /**
   * Barcode format constant for UPC-E.
   */
  UPC_E: 1024,
};
