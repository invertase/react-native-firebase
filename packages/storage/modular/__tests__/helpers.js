import StorageImpl from '../src/implementations/storageReference';
import StorageServiceImpl from '../src/implementations/storageService';
// import { defaultAppName } from '../../../app/modular/src/internal';

export function createStorageReference(storage, path) {
  return new StorageImpl(storage || createStorageRef(), path);
}

export function createStorageRef() {
  return {
    app: { name: 'myApp' },
    maxOperationRetryTime: 1,
    maxDownloadRetryTime: 1,
    maxUploadRetryTime: 1,
    bucket: 'test_bucket',
  };
}

export function createStorageService(storage, options = { bucket: '' }) {
  return new StorageServiceImpl(storage, options);
  // return new StorageServiceImpl(storage || createStorageServiceImpl(), options);
}

// export function createStorageServiceImpl() {
//   return {
//     app: { name: 'myApp' },
//     maxOperationRetryTime: 1,
//     maxDownloadRetryTime: 1,
//     maxUploadRetryTime: 1,
//     bucket: 'test_bucket',
//   };
// }
