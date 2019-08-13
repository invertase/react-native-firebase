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

describe('admob()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.admob);
      app.admob().app.should.equal(app);
    });
  });

  describe('setRequestConfiguration()', () => {
    it('throws if config is not an object', () => {
      try {
        firebase.admob().setRequestConfiguration('123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'requestConfiguration' expected an object value");
        return Promise.resolve();
      }
    });

    describe('maxAdContentRating', () => {
      it('throws if maxAdContentRating is invalid', () => {
        try {
          firebase.admob().setRequestConfiguration({
            maxAdContentRating: 'Y',
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'requestConfiguration.maxAdContentRating' expected on of");
          return Promise.resolve();
        }
      });

      it('accepts a age rating', async () => {
        await firebase.admob().setRequestConfiguration({
          maxAdContentRating: firebase.admob.MaxAdContentRating.G,
        });
      });
    });

    describe('tagForChildDirectedTreatment', () => {
      it('throws if tagForChildDirectedTreatment not a boolean', () => {
        try {
          firebase.admob().setRequestConfiguration({
            tagForChildDirectedTreatment: 'true',
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'requestConfiguration.tagForChildDirectedTreatment' expected a boolean value");
          return Promise.resolve();
        }
      });

      it('sets the value', async () => {
        await firebase.admob().setRequestConfiguration({
          tagForChildDirectedTreatment: false,
        });
      });
    });

    describe('tagForUnderAgeOfConsent', () => {
      it('throws if tagForUnderAgeOfConsent not a boolean', () => {
        try {
          firebase.admob().setRequestConfiguration({
            tagForUnderAgeOfConsent: 'false',
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'requestConfiguration.tagForUnderAgeOfConsent' expected a boolean value");
          return Promise.resolve();
        }
      });

      it('sets the value', async () => {
        await firebase.admob().setRequestConfiguration({
          tagForUnderAgeOfConsent: false,
        });
      });
    });
  });
});
