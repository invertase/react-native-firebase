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

describe('utils()', function () {
  if (Platform.other) return; // Not supported on non-native platforms.

  describe('modular', function () {
    it('provides native path strings via FilePath export', function () {
      const { FilePath } = modular;
      FilePath.should.be.an.Object();
      if (Platform.ios) {
        FilePath.MAIN_BUNDLE.should.be.a.String();
      } else {
        should.equal(FilePath.MAIN_BUNDLE, null);
      }

      FilePath.CACHES_DIRECTORY.should.be.a.String();
      FilePath.DOCUMENT_DIRECTORY.should.be.a.String();

      if (Platform.android && FilePath.EXTERNAL_DIRECTORY !== null) {
        FilePath.EXTERNAL_DIRECTORY.should.be.a.String();
      } else {
        should.equal(FilePath.EXTERNAL_DIRECTORY, null);
      }

      if (Platform.android && FilePath.EXTERNAL_STORAGE_DIRECTORY !== null) {
        FilePath.EXTERNAL_STORAGE_DIRECTORY.should.be.a.String();
      } else {
        should.equal(FilePath.EXTERNAL_STORAGE_DIRECTORY, null);
      }

      FilePath.TEMP_DIRECTORY.should.be.a.String();
      FilePath.LIBRARY_DIRECTORY.should.be.a.String();
      FilePath.PICTURES_DIRECTORY.should.be.a.String();
      FilePath.MOVIES_DIRECTORY.should.be.a.String();
    });
  });
});
