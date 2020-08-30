/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// TODO not available on iOS until SDK 6.0.0
// export default class TranslateModelManager {
//   constructor(ml) {
//     this.ml = ml;
//   }
//
//   downloadRemoteModelIfNeeded(language, downloadConditions = {}) {
//     // TODO(salakar) arg validation + tests
//     // downloadConditions:
//     //     requireCharging
//     //     requireDeviceIdle
//     //     requireDeviceIdle
//     const languageId = this.ml.native.TRANSLATE_LANGUAGES[language];
//     return this.ml.native.modelManagerDownloadRemoteModelIfNeeded(languageId, downloadConditions);
//   }
//
//   // TODO no ios support until SDK v6.0.0
//   deleteDownloadedModel(language) {
//     return this.ml.native.modelManagerDeleteDownloadedModel(language);
//   }
//
//   getAvailableModels() {
//     return this.ml.native.modelManagerGetAvailableModels();
//   }
// }
