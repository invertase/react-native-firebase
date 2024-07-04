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
import { getAppModule } from '@react-native-firebase/app/lib/internal/registry/nativeModule';

describe('App -> NativeModules -> Constants', function () {
  describe('.apps', function () {
    it('should be an array', function () {
      const { NATIVE_FIREBASE_APPS } = getAppModule();

      NATIVE_FIREBASE_APPS.should.be.an.Array();

      // There is no native app initialization on non-native platforms.
      if (Platform.other) return;
      // secondaryFromNative + default
      NATIVE_FIREBASE_APPS.length.should.equal(2);
    });

    it('array items contain name, options & state properties', function () {
      const { NATIVE_FIREBASE_APPS } = getAppModule();

      NATIVE_FIREBASE_APPS.should.be.an.Array();

      // There is no native app initialization on non-native platforms.
      if (Platform.other) return;

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
