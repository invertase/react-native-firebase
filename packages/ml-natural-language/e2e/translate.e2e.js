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

// TODO not available on iOS until SDK 6.0.0
// xdescribe('naturalLanguage() -> Translate', () => {
//   before(async () => {
//     await firebase.naturalLanguage().translateModelManager.downloadRemoteModelIfNeeded('de');
//   });
//
//   describe('translate()', () => {
//     it('translates test from the specified sourceLanguage to targetLanguage', async () => {
//       const translatedText = await firebase
//         .naturalLanguage()
//         .translate('Hello world', { sourceLanguage: 'en', targetLanguage: 'de' });
//       translatedText.should.equal('Hallo Welt');
//     });
//   });
//
//   describe('translateModelManager()', () => {
//     it('returns a new instance of TranslateModelManager', async () => {
//       const { translateModelManager } = firebase.naturalLanguage();
//       translateModelManager.should.be.instanceOf(
//         jet.require('packages/ml-natural-language/lib/TranslateModelManager'),
//       );
//     });
//   });
//
//   describe('TranslateModelManager', () => {
//     describe('downloadRemoteModelIfNeeded()', () => {
//       it('downloads the specified language model', async () => {
//         const { translateModelManager } = firebase.naturalLanguage();
//         await translateModelManager.downloadRemoteModelIfNeeded('de');
//       });
//     });
//   });
// });
