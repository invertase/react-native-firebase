// import { getApp, initializeApp } from '../../../app/modular/src/index';
import { getApp, initializeApp, deleteApp } from '@react-native-firebase/app-exp';

import {
  getMetadata,
  ref,
  list,
  listAll,
  getStorage,
  getDownloadURL,
  uploadBytesResumable,
  setMaxOperationRetryTime,
  setMaxUploadRetryTime,
  updateMetadata,
  uploadBytes,
  uploadString,
  putFile,
  useStorageEmulator,
} from '../src';

async function create(name) {
  return initializeApp(
    {
      apiKey: 'AIzaSyAgUhHU8wSJgO5MVNy95tMT07NEjzMOfz0',
      authDomain: 'react-native-firebase-testing.firebaseapp.com',
      databaseURL: 'https://react-native-firebase-testing.firebaseio.com',
      projectId: 'react-native-firebase-testing',
      storageBucket: 'react-native-firebase-testing.appspot.com',
      messagingSenderId: '448618578101',
      appId: '1:448618578101:web:0b650370bb29e29cac3efc',
      measurementId: 'G-F79DJ0VFGS',
    },
    name,
  );
}

describe('storage', () => {
  beforeEach(async () => {
    await create('foo');
    app = getApp('foo');

    storage = getStorage(app, 'gs://react-native-firebase-testing.appspot.com');
    useStorageEmulator(storage, 'localhost', 9199);
  });

  afterEach(async () => {
    await deleteApp(app);
  });

  describe('getStorage', () => {
    it('returns a storage implementation', async () => {
      const reference = ref(storage, '/1mbTestFile.gif');

      expect(reference.name).toBe('1mbTestFile.gif');
      expect(reference.parent).toBe(null);
      expect(reference.root._path).toBe('/');
      expect(reference.toString()).toBe(
        'gs://react-native-firebase-testing.appspot.com/1mbTestFile.gif',
      );

      await deleteApp(app);
    });
  });
  describe('getMetadata', () => {
    test('it gets Metadata for an an app', async () => {
      const reference = ref(storage, '/1mbTestFile.gif');

      const metaData = await getMetadata(reference);

      expect(metaData.bucket).toBe('react-native-firebase-testing.appspot.com');
      expect(metaData.name).toBe('1mbTestFile.gif');
    });
  });

  describe('getDownloadURL', () => {
    test('it gets getDownloadURL for an an app', async () => {
      const reference = ref(storage, '/1mbTestFile.gif');

      const downLoadUrl = await getDownloadURL(reference);

      expect(downLoadUrl).toBe(
        'https://firebasestorage.googleapis.com/v0/b/react-native-firebase-testing.appspot.com/o/1mbTestFile.gif?alt=media&token=9685179c-7707-48a8-9303-3da44ee8da09',
      );
    });
  });

  describe('listAll', () => {
    test('it returns a list of storage references', async () => {
      const reference = ref(storage, '/list');

      const result = await listAll(reference);

      expect(result.items.length).toBe(3);
    });
  });

  describe('uploadTask', () => {
    it('successfully cancels an upload', async () => {
      const reference = ref(storage, '/uploadOk.jpeg');

      var testBlob = new Blob(['test text'], { type: 'text/plain' });
      const uploadTask = uploadBytesResumable(reference, testBlob);

      let hadRunningStatus = false;
      let hadCancelledStatus = false;

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            // 1) cancel it when we receive first running event
            if (snapshot.state === 'running' && !hadRunningStatus) {
              hadRunningStatus = true;
              uploadTask.cancel();
            }

            if (snapshot.state === 'error') {
              throw new Error('Should not error if cancelled?');
            }

            if (snapshot.state === 'success') {
              reject(new Error('UploadTask did not cancel!'));
            }
          },
          error => {
            expect(hadRunningStatus).toBe(true);
            expect(hadCancelledStatus).toBe(false);

            expect(error.code).toBe('storage/canceled');
            expect(error.message).toBe(
              'Firebase Storage: User canceled the upload/download. (storage/canceled)',
            );

            resolve();
          },
        );
      });
    });

    it('successfully uploads', async () => {
      const reference = ref(storage, '/uploadOk.jpeg');

      var testBlob = new Blob(['test text'], { type: 'text/plain' });
      const uploadTask = uploadBytesResumable(reference, testBlob);

      return uploadTask.then(snapshot => {
        expect(snapshot.state).toBe('success');
      });
    });
  });

  it('successfully pauses and resumes an upload', async () => {
    const reference = ref(storage, '/uploadOk.jpeg');

    var testBlob = new Blob(['test text'], { type: 'text/plain' });
    const uploadTask = uploadBytesResumable(reference, testBlob);

    let hadRunningStatus = false;
    let hadPausedStatus = false;
    let hadResumedStatus = false;

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          // 1) pause when we receive first running event
          if (snapshot.state === 'running' && !hadRunningStatus) {
            hadRunningStatus = true;

            uploadTask.pause();
          }

          // 2) resume when we receive first paused event
          if (snapshot.state === 'paused') {
            hadPausedStatus = true;
            uploadTask.resume();
          }

          // 3) track that we resumed on 2nd running status whilst paused
          if (
            snapshot.state === 'running' &&
            hadRunningStatus &&
            hadPausedStatus &&
            !hadResumedStatus
          ) {
            hadResumedStatus = true;
          }

          // 4) finally confirm we received all statuses
          // TODO Snapshot state remains as running, private methods show correct outcome
          if (snapshot._snapshot.task._state === 'success') {
            resolve();
          }
        },
        error => reject(error),
        () => resolve(),
      );
    });
  });

  it('should have access to the snapshot values outside of the Task', async function () {
    const reference = ref(storage, '/uploadOk.jpeg');

    var testBlob = new Blob(['test text'], { type: 'text/plain' });
    const uploadTask = uploadBytesResumable(reference, testBlob);

    const snapshot = uploadTask.snapshot;

    expect(snapshot.state).toBe('running');
  });

  it('supports thenable .catch()', async function () {
    const reference = ref(storage, '/uploadOk.jpeg');

    var testBlob = new Blob(['test text'], { type: 'text/plain' });
    const uploadTask = uploadBytesResumable(reference, testBlob);

    return uploadTask.catch(error => {
      error.code.should.equal('storage/unauthorized');
      error.message.includes('not authorized').should.be.true();
      return 1;
    });
  });

  it('can access snapshot properties', async function () {
    const reference = ref(storage, '/uploadOk.jpeg');

    var testBlob = new Blob(['test text'], { type: 'text/plain' });
    const uploadTask = uploadBytesResumable(reference, testBlob);

    expect(uploadTask.snapshot.bytesTransferred).toBe(0);
    expect(uploadTask.snapshot.totalBytes).toBe(9);
    expect(uploadTask.snapshot.metadata.ref._path).toBe('/uploadOk.jpeg');
    expect(uploadTask.snapshot.ref._path).toBe('/uploadOk.jpeg');
    expect(uploadTask.snapshot.task._ref._path).toBe('/uploadOk.jpeg');
  });

  describe('convertListResult', () => {
    it('successfully converts a list result', async () => {
      const reference = ref(storage, '/list');
      const result = await list(reference, { maxResults: 2 });

      expect(result.items.length).toBe(2);
    });
  });

  describe('setMaxOperationRetryTime', () => {
    it('successfully sets maxOperationRetryTime', async () => {
      await setMaxOperationRetryTime(storage, 50);
      const updatedStorage = getStorage(app, 'gs://react-native-firebase-testing.appspot.com');

      expect(updatedStorage.maxOperationRetryTime).toBe(50);
    });
  });

  describe('setMaxUploadRetryTime', () => {
    it('successfully sets maxUploadRetryTime', async () => {
      await setMaxUploadRetryTime(storage, 50);
      const updatedStorage = getStorage(app, 'gs://react-native-firebase-testing.appspot.com');

      expect(updatedStorage.maxUploadRetryTime).toBe(50);
    });
  });

  describe('updateMetadata', () => {
    it('successfully updates metadata', async () => {
      const reference = ref(storage, '/uploadOk.jpeg');

      const updated = await updateMetadata(reference, { customMetadata: { foo: 'bar' } });

      expect(updated.customMetadata.foo).toBe('bar');
    });
  });

  describe('uploadBytes', () => {
    it('successfully uploads', async () => {
      const reference = ref(storage, '/uploadOk.jpeg');

      var blob = new Blob(['test text'], { type: 'text/plain' });

      const uploadTask = uploadBytes(reference, blob);

      return uploadTask.then(snapshot => {
        expect(snapshot.metadata.name).toBe('uploadOk.jpeg');
      });
    });
  });

  describe('uploadString', () => {
    it('successfully uploads a string', async () => {
      const reference = ref(storage, '/playground/put-string-example.txt');

      const { metadata } = await uploadString(reference, 'example');

      expect(metadata.name).toBe('put-string-example.txt');
    });
  });

  describe('putFile', () => {
    it('throws without a valid storage reference', async () => {
      const reference = ref(storage, '/uploadOk.jpeg');
      await expect(() => putFile(reference, '/test')).rejects.toThrow(
        'putFile is not supported on the web. Please use uploadBytes instead, passing a File instance',
      );
    });
  });
});
