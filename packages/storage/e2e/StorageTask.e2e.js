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
  describe('writeToFile()', () => {
    it('errors if permission denied', async () => {
      try {
        await firebase
          .storage()
          .ref('/not.jpg')
          .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/not.jpg`);
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
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);

      meta.state.should.eql(firebase.storage.TaskState.SUCCESS);
      meta.bytesTransferred.should.eql(meta.totalBytes);
    });

    it('downloads a file using deprecated downloadFile method', async () => {
      const meta = await firebase
        .storage()
        .ref('/ok.jpeg')
        .downloadFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);

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

    it('uploads a data_url formatted string', async () => {
      const dataUrl = `data:application/json;base64,eyJmb28iOiJiYXNlNjQifQ==`;
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/putStringDataURL.json')
        .putString(dataUrl, firebase.storage.StringFormat.DATA_URL);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads a url encoded data_url formatted string', async () => {
      const dataUrl = `data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E`;
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/helloWorld.html')
        .putString(dataUrl, firebase.storage.StringFormat.DATA_URL);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('when using data_url it still sets the content type if metadata is provided', async () => {
      const dataUrl = `data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E`;

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/helloWorld.html')
        .putString(dataUrl, firebase.storage.StringFormat.DATA_URL, {
          // TODO(salakar) automate test metadata is preserved when auto setting mediatype
          customMetadata: {
            hello: 'world',
          },
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
        .putString(base64UrlString, firebase.storage.StringFormat.BASE64URL, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('throws an error on invalid data_url', async () => {
      const dataUrl = ``;
      try {
        await firebase
          .storage()
          .ref('/a.b')
          .putString(dataUrl, firebase.storage.StringFormat.DATA_URL);
        return Promise.reject(new Error('Did not throw!'));
      } catch (error) {
        error.message.should.containEql('invalid data_url string provided');
        return Promise.resolve();
      }
    });

    it('throws if string arg is not a valid string', async () => {
      try {
        await firebase
          .storage()
          .ref('/a.b')
          .putString(1, 'base64');
        return Promise.reject(new Error('Did not throw!'));
      } catch (error) {
        error.message.should.containEql(`'string' expects a string value`);
        return Promise.resolve();
      }
    });

    it('throws an error on invalid string format', async () => {
      try {
        await firebase
          .storage()
          .ref('/a.b')
          .putString('fooby', 'abc');
        return Promise.reject(new Error('Did not throw!'));
      } catch (error) {
        error.message.should.containEql(`'format' provided is invalid, must be one of`);
        return Promise.resolve();
      }
    });

    it('throws an error if metadata is not an object', async () => {
      try {
        await firebase
          .storage()
          .ref('/a.b')
          .putString('fooby', 'raw', 1234);
        return Promise.reject(new Error('Did not throw!'));
      } catch (error) {
        error.message.should.containEql(`must be an object value if provided`);
        return Promise.resolve();
      }
    });
  });

  describe('put()', () => {
    it('uploads a Blob', async () => {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const bob = new jet.context.Blob([jsonDerulo], {
        type: 'application/json',
      });

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/putStringBlob.json')
        .put(bob);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads an ArrayBuffer', async () => {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const arrayBuffer = new jet.context.window.ArrayBuffer(jsonDerulo.length);
      const arrayBufferView = new jet.context.window.Uint8Array(arrayBuffer);

      for (let i = 0, strLen = jsonDerulo.length; i < strLen; i++) {
        arrayBufferView[i] = jsonDerulo.charCodeAt(i);
      }

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/putStringArrayBuffer.json')
        .put(arrayBuffer, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads an Uint8Array', async () => {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const arrayBuffer = new jet.context.window.ArrayBuffer(jsonDerulo.length);
      const unit8Array = new jet.context.window.Uint8Array(arrayBuffer);

      for (let i = 0, strLen = jsonDerulo.length; i < strLen; i++) {
        unit8Array[i] = jsonDerulo.charCodeAt(i);
      }

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/putStringUint8Array.json')
        .put(unit8Array, {
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
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);
      await firebase
        .storage()
        .ref('/cat.gif')
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/cat.gif`);
      await firebase
        .storage()
        .ref('/hei.heic')
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/hei.heic`);
    });

    it('errors if permission denied', async () => {
      try {
        await firebase
          .storage()
          .ref('/uploadNope.jpeg')
          .putFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);
        return Promise.reject(new Error('No permission denied error'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.includes('not authorized').should.be.true();
        return Promise.resolve();
      }
    });

    it('supports thenable .catch()', async () => {
      const out = await firebase
        .storage()
        .ref('/uploadNope.jpeg')
        .putFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`)
        .catch(error => {
          error.code.should.equal('storage/unauthorized');
          error.message.includes('not authorized').should.be.true();
          return 1;
        });
      should.equal(out, 1);
    });

    it('uploads a file', async () => {
      let uploadTaskSnapshot = await firebase
        .storage()
        .ref('/uploadOk.jpeg')
        .putFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
      uploadTaskSnapshot.metadata.contentType.should.equal('image/jpeg');

      uploadTaskSnapshot = await firebase
        .storage()
        .ref('/uploadCat.gif')
        // uri decode test
        .putFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}%2Fcat.gif`);

      uploadTaskSnapshot.metadata.should.be.an.Object();
      uploadTaskSnapshot.metadata.contentType.should.equal('image/gif');

      if (device.getPlatform() === 'ios') {
        uploadTaskSnapshot = await firebase
          .storage()
          .ref('/uploadHei.heic')
          .putFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/hei.heic`);

        uploadTaskSnapshot.metadata.should.be.an.Object();
        uploadTaskSnapshot.metadata.contentType.should.equal('image/heic');
      }
    });

    it('uploads a file without read permission', async () => {
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref('/writeOnly.jpeg')
        .putFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);

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
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);
    });

    it('throws an Error if event is invalid', async () => {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        const task = storageReference.putFile('abc');
        task.on('foo');
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql(
          `event argument must be a string with a value of 'state_changed'`,
        );
        return Promise.resolve();
      }
    });

    it('throws an Error if nextOrObserver is invalid', async () => {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        const task = storageReference.putFile('abc');
        task.on('state_changed', 'not a fn');
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql(`'nextOrObserver' must be a Function, an Object or Null`);
        return Promise.resolve();
      }
    });

    it('observer calls error callback', async () => {
      const ref = firebase.storage().ref('/uploadOk.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/notFoundFooFile.bar`;
      const task = ref.putFile(path);

      task.on('state_changed', {
        error: error => {
          error.code.should.equal('storage/file-not-found');
          resolve();
        },
      });

      try {
        await task;
      } catch (error) {
        error.code.should.equal('storage/file-not-found');
      }

      await promise;
    });

    it('observer: calls next callback', async () => {
      const ref = firebase.storage().ref('/ok.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
      const task = ref.writeToFile(path);

      task.on('state_changed', {
        next: snapshot => {
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            resolve();
          }
        },
      });

      await task;
      await promise;
    });

    it('observer: calls completion callback', async () => {
      const ref = firebase.storage().ref('/ok.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
      const task = ref.writeToFile(path);

      task.on('state_changed', {
        complete: snapshot => {
          snapshot.state.should.equal(firebase.storage.TaskState.SUCCESS);
          resolve();
        },
      });

      await task;
      await promise;
    });

    it('calls error callback', async () => {
      const ref = firebase.storage().ref('/uploadOk.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/notFoundFooFile.bar`;
      const task = ref.putFile(path);

      task.on(
        'state_changed',
        null,
        error => {
          error.code.should.equal('storage/file-not-found');
          resolve();
        },
        null,
      );

      try {
        await task;
      } catch (error) {
        error.code.should.equal('storage/file-not-found');
      }

      await promise;
    });

    it('calls next callback', async () => {
      const ref = firebase.storage().ref('/ok.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
      const task = ref.writeToFile(path);

      task.on('state_changed', snapshot => {
        if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
          resolve();
        }
      });

      await task;
      await promise;
    });

    it('calls completion callback', async () => {
      const ref = firebase.storage().ref('/ok.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
      const task = ref.writeToFile(path);

      task.on('state_changed', null, null, snapshot => {
        snapshot.state.should.equal(firebase.storage.TaskState.SUCCESS);
        resolve();
      });

      await task;
      await promise;
    });

    it('returns a subscribe fn', async () => {
      const ref = firebase.storage().ref('/ok.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
      const task = ref.writeToFile(path);

      const subscribe = task.on('state_changed');

      subscribe(null, null, snapshot => {
        if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
          resolve();
        }
      });

      await task;
      await promise;
    });

    it('returns a subscribe fn supporting observer usage syntax', async () => {
      const ref = firebase.storage().ref('/ok.jpeg');
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
      const task = ref.writeToFile(path);

      const subscribe = task.on('state_changed');

      subscribe({
        complete: snapshot => {
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            resolve();
          }
        },
      });

      await task;
      await promise;
    });

    it('listens to download state', function testRunner() {
      this.timeout(25000);

      const ref = firebase.storage().ref('/cat.gif');
      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.gif`;

      const unsubscribe = ref.writeToFile(path).on(
        'state_changed',
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

    it('listens to upload state', function testRunner() {
      this.timeout(25000);

      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`;
      const ref = firebase.storage().ref('/uploadOk.jpeg');

      const unsubscribe = ref.putFile(path).on(
        'state_changed',
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

  describe('pause() resume()', () => {
    it('successfully pauses and resumes an upload', async function testRunner() {
      this.timeout(25000);

      await firebase
        .storage()
        .ref(device.getPlatform() === 'ios' ? '/smallFileTest.png' : '/cat.gif')
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/pauseUpload.gif`);

      const ref = firebase.storage().ref('/uploadCat.gif');
      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/pauseUpload.gif`;
      const uploadTask = ref.putFile(path);

      let hadRunningStatus = false;
      let hadPausedStatus = false;
      let hadResumedStatus = false;

      uploadTask.on(
        'state_changed',
        snapshot => {
          // 1) pause when we receive first running event
          if (snapshot.state === firebase.storage.TaskState.RUNNING && !hadRunningStatus) {
            hadRunningStatus = true;
            if (device.getPlatform() === 'android') {
              uploadTask.pause();
            } else {
              // TODO (salakar) submit bug report to Firebase iOS SDK repo (pausing immediately after the first progress event will fail the upload with an unknown error)
              setTimeout(() => {
                uploadTask.pause();
              }, 750);
            }
          }

          // 2) resume when we receive first paused event
          if (snapshot.state === firebase.storage.TaskState.PAUSED) {
            hadPausedStatus = true;
            uploadTask.resume();
          }

          // 3) track that we resumed on 2nd running status whilst paused
          if (
            snapshot.state === firebase.storage.TaskState.RUNNING &&
            hadRunningStatus &&
            hadPausedStatus &&
            !hadResumedStatus
          ) {
            hadResumedStatus = true;
          }

          // 4) finally confirm we received all statuses
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            should.equal(hadRunningStatus, true);
            should.equal(hadPausedStatus, true);
            should.equal(hadResumedStatus, true);
            resolve();
          }
        },
        error => {
          reject(error);
        },
      );

      await promise;
    });

    it('successfully pauses and resumes a download', function testRunner() {
      this.timeout(25000);

      const ref = firebase
        .storage()
        .ref(device.getPlatform() === 'ios' ? '/1mbTestFile.gif' : '/cat.gif');

      const { resolve, reject, promise } = Promise.defer();

      // random file name as Android does not allow overriding if file already exists
      const path = `${
        firebase.utils.FilePath.DOCUMENT_DIRECTORY
      }/invertase/pauseDownload${Math.round(Math.random() * 1000)}.gif`;
      const downloadTask = ref.writeToFile(path);

      let hadRunningStatus = false;
      let hadPausedStatus = false;
      let hadResumedStatus = false;

      downloadTask.on(
        'state_changed',
        snapshot => {
          // TODO(salakar) validate snapshot props
          // 1) pause when we receive first running event
          if (snapshot.state === firebase.storage.TaskState.RUNNING && !hadRunningStatus) {
            hadRunningStatus = true;
            downloadTask.pause();
          }

          // 2) resume when we receive first paused event
          if (snapshot.state === firebase.storage.TaskState.PAUSED) {
            hadPausedStatus = true;
            downloadTask.resume();
          }

          // 3) track that we resumed on 2nd running status whilst paused
          if (
            snapshot.state === firebase.storage.TaskState.RUNNING &&
            hadRunningStatus &&
            hadPausedStatus &&
            !hadResumedStatus
          ) {
            hadResumedStatus = true;
          }

          // 4) finally confirm we received all statuses
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            should.equal(hadRunningStatus, true);
            should.equal(hadPausedStatus, true);
            should.equal(hadResumedStatus, true);
            resolve();
          }
        },
        error => {
          reject(error);
        },
      );

      return promise;
    });
  });

  describe('cancel()', () => {
    before(async () => {
      await firebase
        .storage()
        .ref('/1mbTestFile.gif')
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/pauseUpload.gif`);
    });

    it('successfully cancels an upload', () => {
      const ref = firebase.storage().ref('/uploadCat.gif');
      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/pauseUpload.gif`;
      const uploadTask = ref.putFile(path);

      let hadRunningStatus = false;
      let hadCancelledStatus = false;

      uploadTask.on(
        'state_changed',
        snapshot => {
          // TODO(salakar) validate snapshot props
          // 1) cancel it when we receive first running event
          if (snapshot.state === firebase.storage.TaskState.RUNNING && !hadRunningStatus) {
            hadRunningStatus = true;
            uploadTask.cancel();
          }

          // 2) confirm cancellation
          if (snapshot.state === firebase.storage.TaskState.CANCELLED) {
            should.equal(hadRunningStatus, true);
            hadCancelledStatus = true;
          }

          if (snapshot.state === firebase.storage.TaskState.ERROR) {
            throw new Error('Should not error if cancelled?');
          }

          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            reject(new Error('UploadTask did not cancel!'));
          }
        },
        error => {
          should.equal(hadRunningStatus, true);
          should.equal(hadCancelledStatus, true);
          error.code.should.equal('storage/cancelled');
          error.message.should.containEql('User cancelled the operation.');
          resolve();
        },
      );

      return promise;
    });

    it('successfully cancels a download', () => {
      const ref = firebase.storage().ref('/cat.gif');
      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/cancelDownload.gif`;
      const downloadTask = ref.writeToFile(path);

      let hadRunningStatus = false;
      let hadCancelledStatus = false;

      downloadTask.on(
        'state_changed',
        snapshot => {
          // TODO(salakar) validate snapshot props
          // 1) cancel it when we receive first running event
          if (snapshot.state === firebase.storage.TaskState.RUNNING && !hadRunningStatus) {
            hadRunningStatus = true;
            downloadTask.cancel();
          }

          // 2) confirm cancellation
          if (snapshot.state === firebase.storage.TaskState.CANCELLED) {
            should.equal(hadRunningStatus, true);
            hadCancelledStatus = true;
          }

          if (snapshot.state === firebase.storage.TaskState.ERROR) {
            throw new Error('Should not error if cancelled?');
          }

          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            reject(new Error('DownloadTask did not cancel!'));
          }
        },
        error => {
          should.equal(hadRunningStatus, true);
          should.equal(hadCancelledStatus, true);
          error.code.should.equal('storage/cancelled');
          error.message.should.containEql('User cancelled the operation.');
          resolve();
        },
      );

      return promise;
    });
  });
});
