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

const { PATH, seed, WRITE_ONLY_NAME } = require('./helpers');

function snapshotProperties(snapshot) {
  snapshot.should.have.property('state');
  snapshot.should.have.property('metadata');
  snapshot.should.have.property('ref');
  snapshot.should.have.property('task');
  snapshot.should.have.property('totalBytes');
  snapshot.should.have.property('bytesTransferred');
}

describe('storage() -> StorageTask', function () {
  before(async function () {
    await seed(PATH);
  });

  describe('writeToFile()', function () {
    // TODO - followup - the storage emulator currently inverts not-found / permission error conditions
    // this one returns the permission denied against live storage, but object not found against emulator
    xit('errors if permission denied', async function () {
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

    it('downloads a file', async function () {
      const meta = await firebase
        .storage()
        .ref(`${PATH}/list/file1.txt`)
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/file1.txt`);

      meta.state.should.eql(firebase.storage.TaskState.SUCCESS);
      meta.bytesTransferred.should.eql(meta.totalBytes);
    });
  });

  describe('putString()', function () {
    it('uploads a raw string', async function () {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/putString.json`)
        .putString(jsonDerulo, firebase.storage.StringFormat.RAW, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads a data_url formatted string', async function () {
      const dataUrl = 'data:application/json;base64,eyJmb28iOiJiYXNlNjQifQ==';
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/putStringDataURL.json`)
        .putString(dataUrl, firebase.storage.StringFormat.DATA_URL);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads a url encoded data_url formatted string', async function () {
      const dataUrl = 'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E';
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/helloWorld.html`)
        .putString(dataUrl, firebase.storage.StringFormat.DATA_URL);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('when using data_url it still sets the content type if metadata is provided', async function () {
      const dataUrl = 'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E';

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/helloWorld.html`)
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

    it('uploads a base64 string', async function () {
      const base64String = 'eyJmb28iOiJiYXNlNjQifQ==';

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/putStringBase64.json`)
        .putString(base64String, firebase.storage.StringFormat.BASE64, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads a base64url string', async function () {
      const base64UrlString = 'eyJmb28iOiJiYXNlNjQifQ';

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/putStringBase64Url.json`)
        .putString(base64UrlString, firebase.storage.StringFormat.BASE64URL, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('throws an error on invalid data_url', async function () {
      const dataUrl = '';
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

    it('throws if string arg is not a valid string', async function () {
      try {
        await firebase.storage().ref('/a.b').putString(1, 'base64');
        return Promise.reject(new Error('Did not throw!'));
      } catch (error) {
        error.message.should.containEql("'string' expects a string value");
        return Promise.resolve();
      }
    });

    it('throws an error on invalid string format', async function () {
      try {
        await firebase.storage().ref('/a.b').putString('fooby', 'abc');
        return Promise.reject(new Error('Did not throw!'));
      } catch (error) {
        error.message.should.containEql("'format' provided is invalid, must be one of");
        return Promise.resolve();
      }
    });

    it('throws an error if metadata is not an object', async function () {
      try {
        await firebase.storage().ref('/a.b').putString('fooby', 'raw', 1234);
        return Promise.reject(new Error('Did not throw!'));
      } catch (error) {
        error.message.should.containEql('must be an object value if provided');
        return Promise.resolve();
      }
    });
  });

  describe('put()', function () {
    it('uploads a Blob', async function () {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const bob = new jet.context.Blob([jsonDerulo], {
        type: 'application/json',
      });

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/putStringBlob.json`)
        .put(bob);

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads an ArrayBuffer', async function () {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const arrayBuffer = new jet.context.window.ArrayBuffer(jsonDerulo.length);
      const arrayBufferView = new jet.context.window.Uint8Array(arrayBuffer);

      for (let i = 0, strLen = jsonDerulo.length; i < strLen; i++) {
        arrayBufferView[i] = jsonDerulo.charCodeAt(i);
      }

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/putStringArrayBuffer.json`)
        .put(arrayBuffer, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('uploads an Uint8Array', async function () {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const arrayBuffer = new jet.context.window.ArrayBuffer(jsonDerulo.length);
      const unit8Array = new jet.context.window.Uint8Array(arrayBuffer);

      for (let i = 0, strLen = jsonDerulo.length; i < strLen; i++) {
        unit8Array[i] = jsonDerulo.charCodeAt(i);
      }

      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/putStringUint8Array.json`)
        .put(unit8Array, {
          contentType: 'application/json',
        });

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('should have access to the snapshot values outside of the Task thennable', async function () {
      const jsonDerulo = JSON.stringify({ foo: 'bar' });

      const bob = new jet.context.Blob([jsonDerulo], {
        type: 'application/json',
      });

      const uploadTaskSnapshot = firebase.storage().ref(`${PATH}/putStringBlob.json`).put(bob);

      await uploadTaskSnapshot;

      const snapshot = uploadTaskSnapshot.snapshot;

      snapshotProperties(snapshot);
    });
  });

  describe('upload tasks', function () {
    // before(async function () {
    //   // TODO we need some semi-large assets to upload and download I think?
    //   await firebase
    //     .storage()
    //     .ref('/ok.jpeg')
    //     .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);
    //   await firebase
    //     .storage()
    //     .ref('/cat.gif')
    //     .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/cat.gif`);
    //   await firebase
    //     .storage()
    //     .ref('/hei.heic')
    //     .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/hei.heic`);
    // });

    // TODO followup - works against live storage but emulator inverts permission / not found errors
    xit('errors if permission denied', async function () {
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

    // TODO followup - works against live storage but emulator inverts permission / not found errors
    xit('supports thenable .catch()', async function () {
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

    // TODO we don't have files seeded on the device, but could do so from test helpers
    xit('uploads files with contentType detection', async function () {
      let uploadTaskSnapshot = await firebase
        .storage()
        .ref(`${PATH}/uploadOk.jpeg`)
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

    it('uploads a file without read permission', async function () {
      const uploadTaskSnapshot = await firebase
        .storage()
        .ref(WRITE_ONLY_NAME)
        .putString('Just a string to put in a file for upload');

      uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
      uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
      uploadTaskSnapshot.metadata.should.be.an.Object();
    });

    it('should have access to the snapshot values outside of the Task thennable', async function () {
      const uploadTaskSnapshot = firebase
        .storage()
        .ref(`${PATH}/putStringBlob.json`)
        .putString('Just a string to put in a file for upload');

      await uploadTaskSnapshot;

      const snapshot = uploadTaskSnapshot.snapshot;

      snapshotProperties(snapshot);
    });

    it('should have access to the snapshot values outside of the event subscriber', async function () {
      const uploadTaskSnapshot = firebase
        .storage()
        .ref(`${PATH}/putStringBlob.json`)
        .putString('Just a string to put in a file for upload');

      const { resolve, promise } = Promise.defer();

      uploadTaskSnapshot.on('state_changed', {
        next: snapshot => {
          if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
            snapshotProperties(snapshot);
            resolve();
          }
        },
      });
      await promise;
    });
  });

  describe('on()', function () {
    before(async function () {
      await firebase
        .storage()
        .ref(`${PATH}/ok.jpeg`)
        .putString('Just a string to put in a file for upload');
    });

    it('throws an Error if event is invalid', async function () {
      const storageReference = firebase.storage().ref(`${PATH}/ok.jpeg`);
      try {
        const task = storageReference.putFile('abc');
        task.on('foo');
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql(
          "event argument must be a string with a value of 'state_changed'",
        );
        return Promise.resolve();
      }
    });

    it('throws an Error if nextOrObserver is invalid', async function () {
      const storageReference = firebase.storage().ref(`${PATH}/ok.jpeg`);
      try {
        const task = storageReference.putFile('abc');
        task.on('state_changed', 'not a fn');
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql("'nextOrObserver' must be a Function, an Object or Null");
        return Promise.resolve();
      }
    });

    it('observer calls error callback', async function () {
      const ref = firebase.storage().ref(`${PATH}/uploadOk.jpeg`);
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/notFoundFooFile.bar`;
      const task = ref.putFile(path);

      task.on('state_changed', {
        error: error => {
          error.code.should.containEql('storage/file-not-found');
          resolve();
        },
      });

      try {
        await task;
      } catch (error) {
        error.code.should.containEql('storage/file-not-found');
      }

      await promise;
    });

    it('observer: calls next callback', async function () {
      const ref = firebase.storage().ref(`${PATH}/ok.jpeg`);
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

    it('observer: calls completion callback', async function () {
      const ref = firebase.storage().ref(`${PATH}/ok.jpeg`);
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

    it('calls error callback', async function () {
      const ref = firebase.storage().ref(`${PATH}/uploadOk.jpeg`);
      const { resolve, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/notFoundFooFile.bar`;
      const task = ref.putFile(path);

      task.on(
        'state_changed',
        null,
        error => {
          error.code.should.containEql('storage/file-not-found');
          resolve();
        },
        null,
      );

      try {
        await task;
      } catch (error) {
        error.code.should.containEql('storage/file-not-found');
      }

      await promise;
    });

    it('calls next callback', async function () {
      const ref = firebase.storage().ref(`${PATH}/ok.jpeg`);
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

    it('calls completion callback', async function () {
      const ref = firebase.storage().ref(`${PATH}/ok.jpeg`);
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

    it('returns a subscribe fn', async function () {
      const ref = firebase.storage().ref(`${PATH}/ok.jpeg`);
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

    it('returns a subscribe fn supporting observer usage syntax', async function () {
      const ref = firebase.storage().ref(`${PATH}/ok.jpeg`);
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

    it('listens to download state', async function () {
      const ref = firebase.storage().ref(`${PATH}/ok.jpeg`);
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

      await promise;
    });

    it('listens to upload state', async function () {
      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.gif`;
      const ref = firebase.storage().ref(`${PATH}/uploadOk.jpeg`);

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

      await promise;
    });
  });

  // TODO get files staged for emulator testing
  xdescribe('pause() resume()', function () {
    it('successfully pauses and resumes an upload', async function testRunner() {
      this.timeout(100 * 1000);

      await firebase
        .storage()
        .ref(device.getPlatform() === 'ios' ? '/smallFileTest.png' : '/cat.gif')
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/pauseUpload_test1.gif`);

      const ref = firebase.storage().ref('/uploadCat.gif');
      const { resolve, reject, promise } = Promise.defer();
      const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/pauseUpload_test1.gif`;
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

    it('successfully pauses and resumes a download', async function () {
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

      await promise;
    });
  });

  describe('cancel()', function () {
    // TODO stage a file big enough to test upload cancel
    xit('successfully cancels an upload', async function () {
      await firebase
        .storage()
        .ref('/1mbTestFile.gif')
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/pauseUpload.gif`);

      const ref = firebase.storage().ref('/successful-cancel.jpg');

      //Upload and cancel
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

      await promise;
    });
  });

  // TODO stage a file big enough to cancel a download
  xit('successfully cancels a download', async function () {
    await Utils.sleep(10000);
    const ref = firebase.storage().ref('/1mbTestFile.gif');
    const { resolve, reject, promise } = Promise.defer();
    const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/testUploadFile.jpg`;
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

    await promise;
  });
});
