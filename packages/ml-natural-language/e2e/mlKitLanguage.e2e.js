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

describe('mlKitLanguage()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.mlKitLanguage);
      app.mlKitLanguage().app.should.equal(app);
    });

    it('supports multiple apps', async () => {
      firebase.mlKitLanguage().app.name.should.equal('[DEFAULT]');
      firebase
        .mlKitLanguage(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .mlKitLanguage()
        .app.name.should.equal('secondaryFromNative');
    });

    it('throws an error if language id native module does not exist', async () => {
      const method = firebase.mlKitLanguage().native.identifyLanguage;
      firebase.mlKitLanguage()._nativeModule = Object.assign(
        {},
        firebase.mlKitLanguage()._nativeModule,
      );
      delete firebase.mlKitLanguage()._nativeModule.identifyLanguage;
      try {
        firebase.mlKitLanguage().identifyLanguage();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql(
          "You attempted to use an optional ML Kit API that's not enabled natively",
        );
        e.message.should.containEql('Language ID');
        firebase.mlKitLanguage()._nativeModule.identifyLanguage = method;
        Object.freeze(firebase.mlKitLanguage()._nativeModule);
        return Promise.resolve();
      }
    });

    it('throws an error if smart replies native module does not exist', async () => {
      const method = firebase.mlKitLanguage().native.getSuggestedReplies;
      firebase.mlKitLanguage()._nativeModule = Object.assign(
        {},
        firebase.mlKitLanguage()._nativeModule,
      );
      delete firebase.mlKitLanguage()._nativeModule.getSuggestedReplies;
      try {
        firebase.mlKitLanguage().newSmartReplyConversation();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql(
          "You attempted to use an optional ML Kit API that's not enabled natively",
        );
        e.message.should.containEql('Smart Replies');
        firebase.mlKitLanguage()._nativeModule.getSuggestedReplies = method;
        Object.freeze(firebase.mlKitLanguage()._nativeModule);
        return Promise.resolve();
      }
    });
  });
});
