import { getApp } from '@react-native-firebase/app';
import {
  getStorage,
  connectStorageEmulator,
  ref,
  deleteObject,
  getDownloadURL,
  getMetadata,
  list,
  listAll,
  uploadBytesResumable,
  uploadString,
  setMaxOperationRetryTime,
  setMaxUploadRetryTime,
  setMaxDownloadRetryTime,
  putFile,
  writeToFile,
  StringFormat,
  TaskEvent,
  TaskState,
  SDK_VERSION,
  type FirebaseStorage,
  type StorageReference,
} from '.';
import type { StorageObserver } from './lib/types/storage';

const storage = getStorage();
console.log(storage.app.name);

const storageWithApp = getStorage(getApp());
console.log(storageWithApp.app.name);

connectStorageEmulator(storage, 'localhost', 9199);

const storageRef: StorageReference = ref(storage, 'path/to/file');
console.log(storageRef.fullPath);

deleteObject(storageRef);
getDownloadURL(storageRef).then(url => console.log(url));
getMetadata(storageRef).then(metadata => console.log(metadata.name));
list(storageRef).then(result => console.log(result.items.length));
listAll(storageRef).then(result => console.log(result.items.length));
uploadBytesResumable(storageRef, new Uint8Array([1, 2, 3]));
uploadString(storageRef, 'hello', StringFormat.RAW);
setMaxOperationRetryTime(storage, 1000);
setMaxUploadRetryTime(storage, 1000);
setMaxDownloadRetryTime(storage, 1000);
putFile(storageRef, '/local/path');
writeToFile(storageRef, '/local/path');

console.log(TaskEvent.STATE_CHANGED);
console.log(TaskState.RUNNING);
console.log(SDK_VERSION);

const typedStorage: FirebaseStorage = storage;
console.log(typedStorage.app.name);

const _nullNextObserver: StorageObserver<unknown> = { next: null };
const _nullErrorObserver: StorageObserver<unknown> = { error: null };
const _nullCompleteObserver: StorageObserver<unknown> = { complete: null };
void _nullNextObserver;
void _nullErrorObserver;
void _nullCompleteObserver;
