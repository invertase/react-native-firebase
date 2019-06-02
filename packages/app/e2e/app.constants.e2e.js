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

describe('App -> NativeModules -> Constants', () => {
  describe('.apps', () => {
    it('should be an array', () => {
      const { NATIVE_FIREBASE_APPS } = NativeModules.RNFBAppModule;

      NATIVE_FIREBASE_APPS.should.be.an.Array();
      // secondaryFromNative + default
      NATIVE_FIREBASE_APPS.length.should.equal(2);
    });

    it('array items contain name, options & state properties', () => {
      const { NATIVE_FIREBASE_APPS } = NativeModules.RNFBAppModule;

      NATIVE_FIREBASE_APPS.should.be.an.Array();
      NATIVE_FIREBASE_APPS.length.should.equal(2);

      for (let i = 0; i < NATIVE_FIREBASE_APPS.length; i++) {
        const app = NATIVE_FIREBASE_APPS[i];
        app.appConfig.should.be.a.Object();
        app.appConfig.name.should.be.a.String();
        app.options.should.be.a.Object();
      }
    });
  });
});
