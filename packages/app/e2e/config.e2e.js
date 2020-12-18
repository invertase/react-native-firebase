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

describe('config', function() {
  describe('meta', function() {
    it('should read Info.plist/AndroidManifest.xml meta data', async function() {
      const metaData = await NativeModules.RNFBAppModule.metaGetAll();
      metaData.rnfirebase_meta_testing_string.should.equal('abc');
      metaData.rnfirebase_meta_testing_boolean_false.should.equal(false);
      metaData.rnfirebase_meta_testing_boolean_true.should.equal(true);
    });
  });

  describe('json', function() {
    xit('should read firebase.json data', async function() {
      const jsonData = await NativeModules.RNFBAppModule.jsonGetAll();
      jsonData.rnfirebase_json_testing_string.should.equal('abc');
      jsonData.rnfirebase_json_testing_boolean_false.should.equal(false);
      jsonData.rnfirebase_json_testing_boolean_true.should.equal(true);
    });
  });

  describe('prefs', function() {
    beforeEach(async function() {
      await NativeModules.RNFBAppModule.preferencesClearAll();
    });

    // NOTE: "preferencesClearAll" clears Firestore settings. Set DB as emulator again.
    after(async function() {
      await firebase
        .firestore()
        .settings({ host: 'localhost:8080', ssl: false, persistence: true });
    });

    it('should set bool values', async function() {
      const prefsBefore = await NativeModules.RNFBAppModule.preferencesGetAll();
      should.equal(prefsBefore.invertase_oss, undefined);
      await NativeModules.RNFBAppModule.preferencesSetBool('invertase_oss', true);
      const prefsAfter = await NativeModules.RNFBAppModule.preferencesGetAll();
      prefsAfter.invertase_oss.should.equal(true);
    });

    it('should set string values', async function() {
      const prefsBefore = await NativeModules.RNFBAppModule.preferencesGetAll();
      should.equal(prefsBefore.invertase_oss, undefined);
      await NativeModules.RNFBAppModule.preferencesSetString('invertase_oss', 'invertase.io');
      const prefsAfter = await NativeModules.RNFBAppModule.preferencesGetAll();
      prefsAfter.invertase_oss.should.equal('invertase.io');
    });

    it('should clear all values', async function() {
      await NativeModules.RNFBAppModule.preferencesSetString('invertase_oss', 'invertase.io');
      const prefsBefore = await NativeModules.RNFBAppModule.preferencesGetAll();
      prefsBefore.invertase_oss.should.equal('invertase.io');

      await NativeModules.RNFBAppModule.preferencesClearAll();
      const prefsAfter = await NativeModules.RNFBAppModule.preferencesGetAll();
      should.equal(prefsAfter.invertase_oss, undefined);
    });
  });
});
