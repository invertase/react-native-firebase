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

describe('naturalLanguage()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.naturalLanguage);
      app.naturalLanguage().app.should.equal(app);
    });

    it('supports multiple apps', async () => {
      firebase.naturalLanguage().app.name.should.equal('[DEFAULT]');
      firebase
        .naturalLanguage(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .naturalLanguage()
        .app.name.should.equal('secondaryFromNative');
    });

    it('throws an error if language id native module does not exist', async () => {
      const method = firebase.naturalLanguage().native.identifyLanguage;
      firebase.naturalLanguage()._nativeModule = Object.assign(
        {},
        firebase.naturalLanguage()._nativeModule,
      );
      delete firebase.naturalLanguage()._nativeModule.identifyLanguage;
      try {
        firebase.naturalLanguage().identifyLanguage();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql(
          "You attempted to use an optional API that's not enabled natively",
        );
        e.message.should.containEql('Language Identification');
        firebase.naturalLanguage()._nativeModule.identifyLanguage = method;
        Object.freeze(firebase.naturalLanguage()._nativeModule);
        return Promise.resolve();
      }
    });

    it('throws an error if smart replies native module does not exist', async () => {
      const method = firebase.naturalLanguage().native.getSuggestedReplies;
      firebase.naturalLanguage()._nativeModule = Object.assign(
        {},
        firebase.naturalLanguage()._nativeModule,
      );
      delete firebase.naturalLanguage()._nativeModule.getSuggestedReplies;
      try {
        firebase.naturalLanguage().newSmartReplyConversation();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql(
          "You attempted to use an optional API that's not enabled natively",
        );
        e.message.should.containEql('Smart Replies');
        firebase.naturalLanguage()._nativeModule.getSuggestedReplies = method;
        Object.freeze(firebase.naturalLanguage()._nativeModule);
        return Promise.resolve();
      }
    });
  });
});
