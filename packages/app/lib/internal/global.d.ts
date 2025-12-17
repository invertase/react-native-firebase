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

/**
 * Global RNFB properties for debugging and testing
 */
declare global {
  // Debug and testing flags
  var RNFBDebug: boolean | undefined;
  var RNFBTest: boolean | undefined;
  var RNFBDebugInTestLeakDetection: boolean | undefined;
  var RNFBDebugLastTest: string | undefined;

  // Modular API deprecation flags
  var RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS: boolean | undefined;
  var RNFB_MODULAR_DEPRECATION_STRICT_MODE: boolean | undefined;
}

export {};
