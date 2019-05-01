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

describe('storage()', () => {
  describe('statics', () => {
    it('provides native path strings', () => {
      firebase.storage.Path.should.be.an.Object();
      firebase.storage.Path.MainBundle.should.be.a.String();
      firebase.storage.Path.CachesDirectory.should.be.a.String();
      firebase.storage.Path.DocumentDirectory.should.be.a.String();
      firebase.storage.Path.ExternalDirectory.should.be.a.String();
      firebase.storage.Path.ExternalStorageDirectory.should.be.a.String();
      firebase.storage.Path.TempDirectory.should.be.a.String();
      firebase.storage.Path.LibraryDirectory.should.be.a.String();
      firebase.storage.Path.PicturesDirectory.should.be.a.String();
      firebase.storage.Path.MoviesDirectory.should.be.a.String();
    });

    // TODO(salakar) remove in 6.1.0
    it('provides deprecated Native path strings', () => {
      firebase.storage.Native.should.be.an.Object();
      firebase.storage.Native.MAIN_BUNDLE_PATH.should.be.a.String();
      firebase.storage.Native.CACHES_DIRECTORY_PATH.should.be.a.String();
      firebase.storage.Native.DOCUMENT_DIRECTORY_PATH.should.be.a.String();
      firebase.storage.Native.EXTERNAL_DIRECTORY_PATH.should.be.a.String();
      firebase.storage.Native.EXTERNAL_STORAGE_DIRECTORY_PATH.should.be.a.String();
      firebase.storage.Native.TEMP_DIRECTORY_PATH.should.be.a.String();
      firebase.storage.Native.LIBRARY_DIRECTORY_PATH.should.be.a.String();
    });
  });
});
