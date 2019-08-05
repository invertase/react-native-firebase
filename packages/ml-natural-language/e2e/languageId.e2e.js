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

describe('naturalLanguage() -> Language ID', () => {
  describe('identifyLanguage()', () => {
    it('returns a string of the identified language', async () => {
      const languageDe = await firebase.naturalLanguage().identifyLanguage('Hallo welt');
      const languageEn = await firebase.naturalLanguage().identifyLanguage('Hello world');
      const languageFr = await firebase.naturalLanguage().identifyLanguage('Bonjour le monde');
      should.equal(languageDe, 'de');
      should.equal(languageEn, 'en');
      should.equal(languageFr, 'fr');
    });

    it('accepts a `confidenceThreshold` option', async () => {
      const languageDeDefault = await firebase.naturalLanguage().identifyLanguage('Hallo');
      const languageDeLowConfidence = await firebase.naturalLanguage().identifyLanguage('Hallo', {
        confidenceThreshold: 0.2,
      });
      should.equal(languageDeDefault, 'und');
      should.equal(languageDeLowConfidence, 'de');
    });

    it('throws an error if text is not a string', async () => {
      try {
        firebase.naturalLanguage().identifyLanguage(false);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a string value');
        return Promise.resolve();
      }
    });

    it('throws an error if options is not an object', async () => {
      try {
        firebase.naturalLanguage().identifyLanguage('hello', false);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be an object');
        return Promise.resolve();
      }
    });

    it('throws an error if options.confidenceThreshold is not a float value', async () => {
      try {
        firebase.naturalLanguage().identifyLanguage('hello', { confidenceThreshold: 'boop' });
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a float value between 0 and 1');
        return Promise.resolve();
      }
    });

    it('throws an error if options.confidenceThreshold is greater than 1', async () => {
      try {
        firebase.naturalLanguage().identifyLanguage('hello', { confidenceThreshold: 1.2 });
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a float value between 0 and 1');
        return Promise.resolve();
      }
    });

    it('throws an error if options.confidenceThreshold is less than 0', async () => {
      try {
        firebase.naturalLanguage().identifyLanguage('hello', { confidenceThreshold: -1.2 });
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a float value between 0 and 1');
        return Promise.resolve();
      }
    });
  });

  describe('identifyPossibleLanguages()', () => {
    it('returns an array of the identified languages and their confidence', async () => {
      const languages = await firebase.naturalLanguage().identifyPossibleLanguages('hello');
      languages.should.be.an.Array();
      languages.length.should.be.greaterThan(3);
      languages[0].language.should.equal('en');
      languages[0].confidence.should.be.a.Number();
      languages[0].confidence.should.be.greaterThan(0.7);
    });

    it('accepts a `confidenceThreshold` option', async () => {
      const languages = await firebase.naturalLanguage().identifyPossibleLanguages('hello', {
        confidenceThreshold: 0.7,
      });
      languages.should.be.an.Array();
      languages.length.should.equal(1);
      languages[0].language.should.equal('en');
      languages[0].confidence.should.be.a.Number();
      languages[0].confidence.should.be.greaterThan(0.7);
    });
    // arg validation not required, uses same validator as identifyLanguage
  });
});
