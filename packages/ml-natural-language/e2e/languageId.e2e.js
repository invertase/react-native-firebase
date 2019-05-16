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

describe('mlKitLanguage() -> Language ID', () => {
  describe('identifyLanguage()', () => {
    it('returns a string of the identified language', async () => {
      const languageDe = await firebase.mlKitLanguage().identifyLanguage('Hallo welt');
      const languageEn = await firebase.mlKitLanguage().identifyLanguage('Hello world');
      const languageFr = await firebase.mlKitLanguage().identifyLanguage('Bonjour le monde');
      should.equal(languageDe, 'de');
      should.equal(languageEn, 'en');
      should.equal(languageFr, 'fr');
    });

    it('accepts a `confidenceThreshold` option', async () => {
      const languageDeDefault = await firebase.mlKitLanguage().identifyLanguage('Hallo');
      const languageDeLowConfidence = await firebase.mlKitLanguage().identifyLanguage('Hallo', {
        confidenceThreshold: 0.2,
      });
      should.equal(languageDeDefault, 'und');
      should.equal(languageDeLowConfidence, 'de');
    });

    // TODO(salakar) arg validation tests
  });

  describe('identifyPossibleLanguages()', () => {
    it('returns an array of the identified languages and their confidence', async () => {
      const languages = await firebase.mlKitLanguage().identifyPossibleLanguages('hello');
      languages.should.be.an.Array();
      languages.length.should.be.greaterThan(3);
      languages[0].language.should.equal('en');
      languages[0].confidence.should.be.a.Number();
      languages[0].confidence.should.be.greaterThan(0.7);
    });

    it('accepts a `confidenceThreshold` option', async () => {
      const languages = await firebase.mlKitLanguage().identifyPossibleLanguages('hello', {
        confidenceThreshold: 0.7,
      });
      languages.should.be.an.Array();
      languages.length.should.equal(1);
      languages[0].language.should.equal('en');
      languages[0].confidence.should.be.a.Number();
      languages[0].confidence.should.be.greaterThan(0.7);
    });
  });

  // TODO(salakar) arg validation tests
});
