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

describe('storage() -> StorageTask', () => {
  describe('downloadFile()', () => {
    it('errors if permission denied', async () => {
      try {
        await firebase
          .storage()
          .ref('/not.jpg')
          .downloadFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/not.jpg`);
        return Promise.reject(new Error('No permission denied error'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.includes('not authorized').should.be.true();
        return Promise.resolve();
      }
    });

    it('downloads a file', async () => {
      const meta = await firebase
        .storage()
        .ref('/ok.jpeg')
        .downloadFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`);

      meta.state.should.eql(firebase.storage.TaskState.SUCCESS);
      meta.bytesTransferred.should.eql(meta.totalBytes);
    });
  });

  describe('putString()', () => {
    it('uploads a raw string', async () => {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/putString.json')
        .putString(jsonDerulo, firebase.storage.StringFormat.RAW, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads a base64 string', async () => {
      const base64String = 'eyJmb28iOiJiYXNlNjQifQ==';

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/putStringBase64.json')
        .putString(base64String, firebase.storage.StringFormat.BASE64, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads a base64url string', async () => {
      const base64UrlString = 'eyJmb28iOiJiYXNlNjQifQ';

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/putStringBase64Url.json')
        .putString(base64UrlString, firebase.storage.StringFormat.BASE64, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });
  });

  describe('putFile()', () => {
    before(async () => {
      await firebase
        .storage()
        .ref('/ok.jpeg')
        .downloadFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`);
      await firebase
        .storage()
        .ref('/cat.gif')
        .downloadFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/cat.gif`);
      await firebase
        .storage()
        .ref('/hei.heic')
        .downloadFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/hei.heic`);
    });

    it('errors if permission denied', async () => {
      try {
        await firebase
          .storage()
          .ref('/uploadNope.jpeg')
          .putFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`);
        return Promise.reject(new Error('No permission denied error'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.includes('not authorized').should.be.true();
        return Promise.resolve();
      }
    });

    it('uploads a file', async () => {
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/uploadOk.jpeg')
        .putFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`);

      await firebase
        .storage()
        .ref('/uploadCat.gif')
        .putFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/cat.gif`);

      await firebase
        .storage()
        .ref('/uploadHei.heic')
        .putFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/hei.heic`);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads a file without read permission', async () => {
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/writeOnly.jpeg')
        .putFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });
  });

  describe('on()', () => {
    before(async () => {
      await firebase
        .storage()
        .ref('/ok.jpeg')
        .downloadFile(`${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`);
    });

    it('listens to upload state', () => {
      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`;
      const ref = firebase.storage().ref('/uploadOk.jpeg');

      const unsubscribe = ref.putFile(path).on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            resolve();
          }
        },
        error => {
          unsubscribe();
          reject(error);
        },
      );

      return promise;
    });
  });
});
