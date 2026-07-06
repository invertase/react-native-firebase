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

const { PATH, seed, seedLargeFixture, LARGE_FIXTURE_PATH, WRITE_ONLY_NAME } = require('./helpers');
const { FilePath } = modular;

function snapshotProperties(snapshot) {
  snapshot.should.have.property('state');
  snapshot.should.have.property('metadata');
  snapshot.should.have.property('ref');
  snapshot.should.have.property('task');
  snapshot.should.have.property('totalBytes');
  snapshot.should.have.property('bytesTransferred');
}

function isCancelledState(state) {
  return state === 'cancelled' || state === storageModular.TaskState.CANCELLED;
}

function expectMidTransferCancel(
  task,
  taskLabel,
  { waitForProgress = false, cancelDelayMs = 0 } = {},
) {
  const { TaskState } = storageModular;
  const { resolve, reject, promise } = Promise.defer();
  let hadRunningStatus = false;
  let settled = false;

  const finishCancelled = error => {
    if (settled) {
      return;
    }
    settled = true;
    should.equal(hadRunningStatus, true);
    if (error) {
      error.code.should.equal('storage/cancelled');
      error.message.should.containEql('User cancelled the operation.');
    }
    resolve();
  };

  task.on(
    'state_changed',
    snapshot => {
      if (snapshot.state === TaskState.RUNNING && !hadRunningStatus) {
        const readyToCancel = !waitForProgress || snapshot.bytesTransferred > 0;
        if (!readyToCancel) {
          return;
        }
        hadRunningStatus = true;
        const cancelTask = () => {
          task.cancel().should.eql(true);
        };
        if (cancelDelayMs > 0) {
          setTimeout(cancelTask, cancelDelayMs);
        } else {
          cancelTask();
        }
      }

      if (isCancelledState(snapshot.state)) {
        finishCancelled();
      }

      if (snapshot.state === TaskState.ERROR) {
        throw new Error('Should not error if cancelled?');
      }

      if (snapshot.state === TaskState.SUCCESS) {
        reject(new Error(`${taskLabel} did not cancel!`));
      }
    },
    error => {
      finishCancelled(error);
    },
  );

  task.catch(error => {
    finishCancelled(error);
  });

  return promise;
}

describe('storage() -> StorageTask', function () {
  describe('storage() -> StorageTask modular', function () {});

  describe('StorageTask modular', function () {
    before(async function () {
      await seed(PATH);
    });

    describe('writeToFile()', function () {
      if (Platform.other) return;
      // TODO - followup - the storage emulator currently inverts not-found / permission error conditions
      // this one returns the permission denied against live storage, but object not found against emulator
      xit('errors if permission denied', async function () {
        const { getStorage, ref } = storageModular;
        try {
          await ref(getStorage(), '/not.jpg').writeToFile(`${FilePath.DOCUMENT_DIRECTORY}/not.jpg`);
          return Promise.reject(new Error('No permission denied error'));
        } catch (error) {
          error.code.should.equal('storage/unauthorized');
          error.message.includes('not authorized').should.be.true();
          return Promise.resolve();
        }
      });

      it('downloads a file', async function () {
        if (Platform.other) return;
        const { getStorage, ref, writeToFile, TaskState } = storageModular;

        const meta = await writeToFile(
          ref(getStorage(), `${PATH}/list/file1.txt`),
          `${FilePath.DOCUMENT_DIRECTORY}/file1.txt`,
        );

        meta.state.should.eql(TaskState.SUCCESS);
        meta.bytesTransferred.should.eql(meta.totalBytes);
      });
    });

    describe('putString()', function () {
      it('uploads a raw string', async function () {
        const { getStorage, ref, uploadString, StringFormat, TaskState } = storageModular;

        const jsonDerulo = JSON.stringify({ foo: 'bar' });

        const uploadTaskSnapshot = await uploadString(
          ref(getStorage(), `${PATH}/putString.json`),
          jsonDerulo,
          StringFormat.RAW,
          {
            contentType: 'application/json',
          },
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('uploads a data_url formatted string', async function () {
        const { getStorage, ref, uploadString, StringFormat, TaskState } = storageModular;

        const dataUrl = 'data:application/json;base64,eyJmb28iOiJiYXNlNjQifQ==';

        const uploadTaskSnapshot = await uploadString(
          ref(getStorage(), `${PATH}/putStringDataURL.json`),
          dataUrl,
          StringFormat.DATA_URL,
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('uploads a url encoded data_url formatted string', async function () {
        const { getStorage, ref, uploadString, StringFormat, TaskState } = storageModular;

        const dataUrl = 'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E';

        const uploadTaskSnapshot = await uploadString(
          ref(getStorage(), `${PATH}/helloWorld.html`),
          dataUrl,
          StringFormat.DATA_URL,
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('when using data_url it still sets the content type if metadata is provided', async function () {
        const { getStorage, ref, uploadString, StringFormat, TaskState } = storageModular;
        const dataUrl = 'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E';

        const uploadTaskSnapshot = await uploadString(
          ref(getStorage(), `${PATH}/helloWorld.html`),
          dataUrl,
          StringFormat.DATA_URL,
          {
            // TODO(salakar) automate test metadata is preserved when auto setting mediatype
            customMetadata: {
              hello: 'world',
            },
          },
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('uploads a base64 string', async function () {
        const { getStorage, ref, uploadString, StringFormat, TaskState } = storageModular;
        const base64String = 'eyJmb28iOiJiYXNlNjQifQ==';

        const uploadTaskSnapshot = await uploadString(
          ref(getStorage(), `${PATH}/putStringBase64.json`),
          base64String,
          StringFormat.BASE64,
          {
            contentType: 'application/json',
          },
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('uploads a base64url string', async function () {
        const { getStorage, ref, uploadString, StringFormat, TaskState } = storageModular;
        const base64UrlString = 'eyJmb28iOiJiYXNlNjQifQ';

        const uploadTaskSnapshot = await uploadString(
          ref(getStorage(), `${PATH}/putStringBase64Url.json`),
          base64UrlString,
          StringFormat.BASE64URL,
          {
            contentType: 'application/json',
          },
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('throws an error on invalid data_url', async function () {
        const { getStorage, ref, uploadString, StringFormat } = storageModular;
        const dataUrl = '';
        try {
          await uploadString(ref(getStorage(), '/a.b'), dataUrl, StringFormat.DATA_URL);

          return Promise.reject(new Error('Did not throw!'));
        } catch (error) {
          error.message.should.containEql('invalid data_url string provided');
          return Promise.resolve();
        }
      });

      it('throws if string arg is not a valid string', async function () {
        const { getStorage, ref, uploadString, StringFormat } = storageModular;
        try {
          await uploadString(ref(getStorage(), '/a.b'), 1, StringFormat.BASE64);
          return Promise.reject(new Error('Did not throw!'));
        } catch (error) {
          error.message.should.containEql("'string' expects a string value");
          return Promise.resolve();
        }
      });

      it('throws an error on invalid string format', async function () {
        const { getStorage, ref, uploadString } = storageModular;
        try {
          await uploadString(ref(getStorage(), '/a.b'), 'fooby', 'abc');
          return Promise.reject(new Error('Did not throw!'));
        } catch (error) {
          error.message.should.containEql("'format' provided is invalid, must be one of");
          return Promise.resolve();
        }
      });

      it('throws an error if metadata is not an object', async function () {
        const { getStorage, ref, uploadString, StringFormat } = storageModular;
        try {
          await uploadString(ref(getStorage(), '/a.b'), 'fooby', StringFormat.RAW, 1234);
          return Promise.reject(new Error('Did not throw!'));
        } catch (error) {
          error.message.should.containEql('must be an object value if provided');
          return Promise.resolve();
        }
      });
    });

    describe('put()', function () {
      it('uploads a Blob', async function () {
        const { getStorage, ref, uploadBytesResumable, TaskState } = storageModular;
        const jsonDerulo = JSON.stringify({ foo: 'bar' });
        const bob = new Blob([jsonDerulo], {
          type: 'application/json',
        });

        // works every time if you sleep - iOS code is racy around Blob creation/usage
        await Utils.sleep(100);

        const uploadTaskSnapshot = await uploadBytesResumable(
          ref(getStorage(), `${PATH}/putStringBlob.json`),
          bob,
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('uploads an ArrayBuffer', async function () {
        const { getStorage, ref, uploadBytesResumable, TaskState } = storageModular;
        const jsonDerulo = JSON.stringify({ foo: 'bar' });

        const arrayBuffer = new ArrayBuffer(jsonDerulo.length);
        const arrayBufferView = new Uint8Array(arrayBuffer);

        for (let i = 0, strLen = jsonDerulo.length; i < strLen; i++) {
          arrayBufferView[i] = jsonDerulo.charCodeAt(i);
        }
        const uploadTaskSnapshot = await uploadBytesResumable(
          ref(getStorage(), `${PATH}/putStringArrayBuffer.json`),
          arrayBuffer,
          {
            contentType: 'application/json',
          },
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('uploads an Uint8Array', async function () {
        const { getStorage, ref, uploadBytesResumable, TaskState } = storageModular;
        const jsonDerulo = JSON.stringify({ foo: 'bar' });

        const arrayBuffer = new ArrayBuffer(jsonDerulo.length);
        const unit8Array = new Uint8Array(arrayBuffer);

        for (let i = 0, strLen = jsonDerulo.length; i < strLen; i++) {
          unit8Array[i] = jsonDerulo.charCodeAt(i);
        }

        const uploadTaskSnapshot = await uploadBytesResumable(
          ref(getStorage(), `${PATH}/putStringUint8Array.json`),
          unit8Array,
          {
            contentType: 'application/json',
          },
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('should have access to the snapshot values outside of the Task thennable', async function () {
        const { getStorage, ref, uploadBytesResumable } = storageModular;
        const jsonDerulo = JSON.stringify({ foo: 'bar' });

        const bob = new Blob([jsonDerulo], {
          type: 'application/json',
        });

        // works every time if you sleep - iOS code is racy around Blob creation/usage
        await Utils.sleep(100);

        const uploadTaskSnapshot = uploadBytesResumable(
          ref(getStorage(), `${PATH}/putStringBlob.json`),
          bob,
        );
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
      //     .writeToFile(`${FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`);
      //   await firebase
      //     .storage()
      //     .ref('/cat.gif')
      //     .writeToFile(`${FilePath.DOCUMENT_DIRECTORY}/cat.gif`);
      //   await firebase
      //     .storage()
      //     .ref('/hei.heic')
      //     .writeToFile(`${FilePath.DOCUMENT_DIRECTORY}/hei.heic`);
      // });

      // TODO followup - works against live storage but emulator inverts permission / not found errors
      xit('errors if permission denied', async function () {
        const { getStorage, ref, putFile } = storageModular;
        try {
          await putFile(
            ref(getStorage(), '/uploadNope.json'),
            `${FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`,
          );

          return Promise.reject(new Error('No permission denied error'));
        } catch (error) {
          error.code.should.equal('storage/unauthorized');
          error.message.includes('not authorized').should.be.true();
          return Promise.resolve();
        }
      });

      // TODO followup - works against live storage but emulator inverts permission / not found errors
      xit('supports thenable .catch()', async function () {
        const { getStorage, ref, putFile } = storageModular;

        await putFile(
          ref(getStorage(), '/uploadNope.json'),
          `${FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`,
        ).catch(error => {
          error.code.should.equal('storage/unauthorized');
          error.message.includes('not authorized').should.be.true();
          return 1;
        });
        should.equal(out, 1);
      });

      // TODO we don't have files seeded on the device, but could do so from test helpers
      xit('uploads files with contentType detection', async function () {
        const { getStorage, ref, putFile, TaskState } = storageModular;

        let uploadTaskSnapshot = await putFile(
          ref(getStorage(), `${PATH}/uploadOk.jpeg`),
          `${FilePath.DOCUMENT_DIRECTORY}/ok.jpeg`,
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
        uploadTaskSnapshot.metadata.contentType.should.equal('image/jpeg');

        uploadTaskSnapshot = await putFile(
          ref(getStorage(), '/uploadCat.gif'),
          `${FilePath.DOCUMENT_DIRECTORY}%2Fcat.gif`,
        );

        uploadTaskSnapshot.metadata.should.be.an.Object();
        uploadTaskSnapshot.metadata.contentType.should.equal('image/gif');

        if (Platform.ios) {
          uploadTaskSnapshot = await putFile(
            ref(getStorage(), '/uploadHei.heic'),
            `${FilePath.DOCUMENT_DIRECTORY}/hei.heic`,
          );

          uploadTaskSnapshot.metadata.should.be.an.Object();
          uploadTaskSnapshot.metadata.contentType.should.equal('image/heic');
        }
      });

      it('uploads a file without read permission', async function () {
        const { getStorage, ref, uploadString, TaskState } = storageModular;
        const uploadTaskSnapshot = await uploadString(
          ref(getStorage(), WRITE_ONLY_NAME),
          'Just a string to put in a file for upload',
        );

        uploadTaskSnapshot.state.should.eql(TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      });

      it('should have access to the snapshot values outside of the Task thennable', async function () {
        const { getStorage, ref, uploadString } = storageModular;

        const uploadTaskSnapshot = uploadString(
          ref(getStorage(), `${PATH}/putStringBlob.json`),
          'Just a string to put in a file for upload',
        );

        await uploadTaskSnapshot;
        const snapshot = uploadTaskSnapshot.snapshot;
        snapshotProperties(snapshot);
      });

      it('should have access to the snapshot values outside of the event subscriber', async function () {
        const { getStorage, ref, uploadString, TaskState } = storageModular;

        const uploadTaskSnapshot = uploadString(
          ref(getStorage(), `${PATH}/putStringBlob.json`),
          'Just a string to put in a file for upload',
        );

        const { resolve, promise } = Promise.defer();
        uploadTaskSnapshot.on('state_changed', {
          next: snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
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
        const { getStorage, ref, uploadString } = storageModular;

        await uploadString(
          ref(getStorage(), `${PATH}/ok.jpeg`),
          'Just a string to put in a file for upload',
        );
      });

      it('throws an Error if event is invalid', async function () {
        const { getStorage, ref, putFile, TaskEvent } = storageModular;

        const storageReference = ref(getStorage(), `${PATH}/ok.jpeg`);
        try {
          const task = putFile(storageReference, 'abc');

          task.on('foo');
          return Promise.reject(new Error('Did not error!'));
        } catch (error) {
          error.message.should.containEql(
            `event argument must be a string with a value of '${TaskEvent.STATE_CHANGED}'`,
          );
          return Promise.resolve();
        }
      });

      it('throws an Error if nextOrObserver is invalid', async function () {
        const { getStorage, ref, putFile, TaskEvent } = storageModular;
        const storageReference = ref(getStorage(), `${PATH}/ok.jpeg`);
        try {
          const task = putFile(storageReference, 'abc');
          task.on(TaskEvent.STATE_CHANGED, 'not a fn');
          return Promise.reject(new Error('Did not error!'));
        } catch (error) {
          error.message.should.containEql("'nextOrObserver' must be a Function, an Object or Null");
          return Promise.resolve();
        }
      });

      it('observer calls error callback', async function () {
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile/putFile
        const { getStorage, ref, putFile, TaskEvent } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/uploadOk.jpeg`);
        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/notFoundFooFile.bar`;
        const task = putFile(storageRef, path);

        task.on(TaskEvent.STATE_CHANGED, {
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
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile
        const { getStorage, ref, writeToFile, TaskState } = storageModular;

        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);
        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
        const task = writeToFile(storageRef, path);
        task.on('state_changed', {
          next: snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
              resolve();
            }
          },
        });
        await task;
        await promise;
      });

      it('observer: calls completion callback', async function () {
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile
        const { getStorage, ref, writeToFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);

        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
        const task = writeToFile(storageRef, path);

        task.on('state_changed', {
          complete: snapshot => {
            snapshot.state.should.equal(TaskState.SUCCESS);
            resolve();
          },
        });

        await task;
        await promise;
      });

      it('calls error callback', async function () {
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile/putFile
        const { getStorage, ref, putFile } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/uploadOk.jpeg`);
        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/notFoundFooFile.bar`;
        const task = putFile(storageRef, path);

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
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile
        const { getStorage, ref, writeToFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);

        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
        const task = writeToFile(storageRef, path);

        task.on('state_changed', snapshot => {
          if (snapshot.state === TaskState.SUCCESS) {
            resolve();
          }
        });

        await task;
        await promise;
      });

      it('calls completion callback', async function () {
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile
        const { getStorage, ref, writeToFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);
        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
        const task = writeToFile(storageRef, path);

        task.on('state_changed', null, null, snapshot => {
          snapshot.state.should.equal(TaskState.SUCCESS);
          resolve();
        });

        await task;
        await promise;
      });

      it('returns a subscribe fn', async function () {
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile
        const { getStorage, ref, writeToFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);
        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
        const task = writeToFile(storageRef, path);

        const subscribe = task.on('state_changed');

        subscribe(null, null, snapshot => {
          if (snapshot.state === TaskState.SUCCESS) {
            resolve();
          }
        });

        await task;
        await promise;
      });

      it('returns a subscribe fn supporting observer usage syntax', async function () {
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile
        const { getStorage, ref, writeToFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);
        const { resolve, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;
        const task = writeToFile(storageRef, path);

        const subscribe = task.on('state_changed');

        subscribe({
          complete: snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
              resolve();
            }
          },
        });

        await task;
        await promise;
      });

      it('listens to download state', async function () {
        if (Platform.other) return; // TODO refactor to use putString instead of writeToFile
        const { getStorage, ref, writeToFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);
        const { resolve, reject, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.gif`;

        const unsubscribe = writeToFile(storageRef, path).on(
          'state_changed',
          snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
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
        if (Platform.other) return; // TODO refactor to use putString instead of putFile
        const { getStorage, ref, putFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), `${PATH}/ok.jpeg`);
        const { resolve, reject, promise } = Promise.defer();
        const path = `${FilePath.DOCUMENT_DIRECTORY}/onDownload.gif`;

        const unsubscribe = putFile(storageRef, path).on(
          'state_changed',
          snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
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
    describe('pause() resume() cancel() sync boolean contract', function () {
      it('returns false synchronously for completed uploads', async function () {
        const { getStorage, ref, uploadString, TaskState } = storageModular;

        const uploadTask = uploadString(
          ref(getStorage(), `${PATH}/syncBoolCompleted.${WRITE_ONLY_NAME}`),
          JSON.stringify({ sync: true }),
        );

        const snapshot = await uploadTask;
        snapshot.state.should.eql(TaskState.SUCCESS);

        uploadTask.pause().should.eql(false);
        (uploadTask.pause() instanceof Promise).should.eql(false);
        uploadTask.resume().should.eql(false);
        (uploadTask.resume() instanceof Promise).should.eql(false);
        uploadTask.cancel().should.eql(false);
        (uploadTask.cancel() instanceof Promise).should.eql(false);
      });
    });

    describe('pause() resume()', function () {
      before(async function () {
        await seedLargeFixture(PATH);
      });

      it('successfully pauses and resumes a download', async function () {
        if (Platform.other) return;
        const { getStorage, ref, writeToFile, TaskState } = storageModular;
        const storageRef = ref(getStorage(), LARGE_FIXTURE_PATH);

        const { resolve, reject, promise } = Promise.defer();
        const path = `${
          FilePath.DOCUMENT_DIRECTORY
        }/invertase/pauseDownload${Math.round(Math.random() * 1000)}.bin`;
        const downloadTask = writeToFile(storageRef, path);

        let hadRunningStatus = false;
        let hadPausedStatus = false;
        let hadResumedStatus = false;

        downloadTask.on(
          'state_changed',
          snapshot => {
            if (snapshot.state === TaskState.RUNNING && !hadRunningStatus) {
              hadRunningStatus = true;
              downloadTask.pause().should.eql(true);
              downloadTask.pause().should.eql(false);
            }

            if (snapshot.state === TaskState.PAUSED) {
              hadPausedStatus = true;
              downloadTask.resume().should.eql(true);
            }

            if (
              snapshot.state === TaskState.RUNNING &&
              hadRunningStatus &&
              hadPausedStatus &&
              !hadResumedStatus
            ) {
              hadResumedStatus = true;
            }

            if (snapshot.state === TaskState.SUCCESS) {
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

      // Platform gap — iOS upload mid-transfer pause/resume (temporary skip pending diagnosis).
      // CI iOS debug+release fail with [storage/unknown] after ~50s on first RUNNING pause;
      // Android and macOS pass. Download pause/resume passes on iOS. Related cancel gap:
      // firebase-ios-sdk#16353, RNFB #2043. Re-enable after B3.1 local e2e + sim-app.log review.
      (Platform.ios ? it.skip : it)('successfully pauses and resumes an upload', async function () {
        if (Platform.other) return;
        const { getStorage, ref, writeToFile, putFile, TaskState } = storageModular;

        const localPath = `${FilePath.DOCUMENT_DIRECTORY}/pauseUpload_large.bin`;
        await writeToFile(ref(getStorage(), LARGE_FIXTURE_PATH), localPath);

        const uploadRef = ref(getStorage(), `${PATH}/upload/pauseResume.bin`);
        const { resolve, reject, promise } = Promise.defer();
        const uploadTask = putFile(uploadRef, localPath);

        let hadRunningStatus = false;
        let hadPausedStatus = false;
        let hadResumedStatus = false;

        const pauseUpload = () => {
          uploadTask.pause().should.eql(true);
          uploadTask.pause().should.eql(false);
        };

        uploadTask.on(
          'state_changed',
          snapshot => {
            if (snapshot.state === TaskState.RUNNING && !hadRunningStatus) {
              hadRunningStatus = true;
              pauseUpload();
            }

            if (snapshot.state === TaskState.PAUSED) {
              hadPausedStatus = true;
              uploadTask.resume().should.eql(true);
            }

            if (
              snapshot.state === TaskState.RUNNING &&
              hadRunningStatus &&
              hadPausedStatus &&
              !hadResumedStatus
            ) {
              hadResumedStatus = true;
            }

            if (snapshot.state === TaskState.SUCCESS) {
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
      before(async function () {
        await seedLargeFixture(PATH);
      });

      it('successfully cancels a download', async function () {
        if (Platform.other) return;
        const { getStorage, ref, writeToFile } = storageModular;
        const storageRef = ref(getStorage(), LARGE_FIXTURE_PATH);
        const path = `${
          FilePath.DOCUMENT_DIRECTORY
        }/invertase/cancelDownload${Math.round(Math.random() * 1000)}.bin`;
        const downloadTask = writeToFile(storageRef, path);

        await expectMidTransferCancel(downloadTask, 'DownloadTask');
      });

      // Platform gap — iOS upload mid-transfer cancel (user-accepted acceptable exception).
      // Firebase Storage iOS SDK 12.15.0: immediate cancel on first RUNNING hangs (~7+ min);
      // delayed cancel races SUCCESS; pause-then-cancel also hangs. Android passes below.
      // Related: immediate pause() after first progress was unreliable since 2019-05-03 (RNFB
      // #2043); a ~750ms delay before pause worked, but that timing is hard to test reliably
      // against the fixture size. Revisit when Podfile.lock FirebaseStorage != 12.15.0 or when
      // https://github.com/firebase/firebase-ios-sdk/issues/16353 is closed/fixed.
      (Platform.ios ? it.skip : it)('successfully cancels an upload', async function () {
        if (Platform.other) return;
        const { getStorage, ref, writeToFile, putFile } = storageModular;

        const localPath = `${FilePath.DOCUMENT_DIRECTORY}/cancelUpload_large.bin`;
        await writeToFile(ref(getStorage(), LARGE_FIXTURE_PATH), localPath);

        const uploadRef = ref(getStorage(), `${PATH}/upload/cancel.bin`);
        const uploadTask = putFile(uploadRef, localPath);

        await expectMidTransferCancel(uploadTask, 'UploadTask');
      });
    });
  });
});
