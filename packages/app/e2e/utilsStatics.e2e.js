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

describe('utils()', () => {
  describe('statics', () => {
    it('provides native path strings', () => {
      firebase.utils.FilePath.should.be.an.Object();
      if (device.getPlatform() === 'ios') {
        firebase.utils.FilePath.MAIN_BUNDLE.should.be.a.String();
      } else {
        should.equal(firebase.utils.FilePath.MAIN_BUNDLE, null);
      }

      firebase.utils.FilePath.CACHES_DIRECTORY.should.be.a.String();
      firebase.utils.FilePath.DOCUMENT_DIRECTORY.should.be.a.String();

      if (device.getPlatform() === 'android') {
        firebase.utils.FilePath.EXTERNAL_DIRECTORY.should.be.a.String();
        firebase.utils.FilePath.EXTERNAL_STORAGE_DIRECTORY.should.be.a.String();
      } else {
        should.equal(firebase.utils.FilePath.EXTERNAL_DIRECTORY, null);
        should.equal(firebase.utils.FilePath.EXTERNAL_STORAGE_DIRECTORY, null);
      }

      firebase.utils.FilePath.TEMP_DIRECTORY.should.be.a.String();
      firebase.utils.FilePath.LIBRARY_DIRECTORY.should.be.a.String();
      firebase.utils.FilePath.PICTURES_DIRECTORY.should.be.a.String();
      firebase.utils.FilePath.MOVIES_DIRECTORY.should.be.a.String();
    });
  });
});
