import storage, {
  firebase,
  // Types
  type Storage,
  type FirebaseStorageTypes,
  // Modular API
  getStorage,
  connectStorageEmulator,
  ref,
  deleteObject,
  getBlob,
  getBytes,
  getDownloadURL,
  getMetadata,
  getStream,
  list,
  listAll,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
  refFromURL,
  setMaxOperationRetryTime,
  setMaxUploadRetryTime,
  putFile,
  writeToFile,
  toString as storageToString,
  child,
  setMaxDownloadRetryTime,
  StringFormat,
  TaskEvent,
  TaskState,
} from '.';

console.log(storage().app);

// checks module exists at root
console.log(firebase.storage().app.name);
console.log(firebase.storage().maxUploadRetryTime);
console.log(firebase.storage().maxDownloadRetryTime);
console.log(firebase.storage().maxOperationRetryTime);

// checks module exists at app level
console.log(firebase.app().storage().app.name);

// checks custom URL support
console.log(firebase.app().storage('gs://custom-bucket').app.name);

// checks statics exist
console.log(firebase.storage.SDK_VERSION);
console.log(firebase.storage.StringFormat.RAW);
console.log(firebase.storage.StringFormat.BASE64);
console.log(firebase.storage.StringFormat.BASE64URL);
console.log(firebase.storage.StringFormat.DATA_URL);
console.log(firebase.storage.TaskState.CANCELLED);
console.log(firebase.storage.TaskState.ERROR);
console.log(firebase.storage.TaskState.PAUSED);
console.log(firebase.storage.TaskState.RUNNING);
console.log(firebase.storage.TaskState.SUCCESS);
console.log(firebase.storage.TaskEvent.STATE_CHANGED);

// checks statics exist on defaultExport
console.log(storage.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.storage(firebase.app()).app.name);

// checks default export supports app arg
console.log(storage(firebase.app()).app.name);

// checks Module instance APIs
const storageInstance = firebase.storage();
console.log(storageInstance.app.name);
console.log(storageInstance.maxUploadRetryTime);
console.log(storageInstance.maxDownloadRetryTime);
console.log(storageInstance.maxOperationRetryTime);

storageInstance.setMaxUploadRetryTime(25000).then(() => {
  console.log('Max upload retry time set');
});

storageInstance.setMaxDownloadRetryTime(25000).then(() => {
  console.log('Max download retry time set');
});

storageInstance.setMaxOperationRetryTime(5000).then(() => {
  console.log('Max operation retry time set');
});

const storageRef = storageInstance.ref('test/path');
console.log(storageRef.bucket);
console.log(storageRef.fullPath);
console.log(storageRef.name);
console.log(storageRef.root);
console.log(storageRef.storage);

const refFromURLInstance = storageInstance.refFromURL('gs://bucket/path/to/file');
console.log(refFromURLInstance.fullPath);

storageInstance.useEmulator('localhost', 9199);

// checks Reference instance APIs
const reference = storageInstance.ref('test');
console.log(reference.bucket);
console.log(reference.fullPath);
console.log(reference.name);
console.log(reference.parent);
console.log(reference.root);
console.log(reference.storage);

console.log(reference.toString());

const childRef = reference.child('child');
console.log(childRef.fullPath);

reference.delete().then(() => {
  console.log('Deleted');
});

reference.getDownloadURL().then((url: string) => {
  console.log(url);
});

reference.getMetadata().then((metadata: FirebaseStorageTypes.FullMetadata) => {
  console.log(metadata);
});

reference.list({ maxResults: 10 }).then((result: FirebaseStorageTypes.ListResult) => {
  console.log(result.items);
  console.log(result.prefixes);
  console.log(result.nextPageToken);
});

reference.listAll().then((result: FirebaseStorageTypes.ListResult) => {
  console.log(result.items);
  console.log(result.prefixes);
});

const putFileTask = reference.putFile('/local/path', { cacheControl: 'no-cache' });
putFileTask.pause().then(() => {
  console.log('Paused');
});
putFileTask.resume().then((resumed: boolean) => {
  console.log(resumed);
});
putFileTask.cancel().then((cancelled: boolean) => {
  console.log(cancelled);
});

const writeToFileTask = reference.writeToFile('/local/path');
writeToFileTask.then((snapshot: FirebaseStorageTypes.TaskSnapshot) => {
  console.log(snapshot.bytesTransferred);
});

const putTask = reference.put(new Blob(), { cacheControl: 'no-cache' });
putTask.on('state_changed', (snapshot: FirebaseStorageTypes.TaskSnapshot) => {
  console.log(snapshot.state);
});

const putStringTask = reference.putString('data', 'raw', { cacheControl: 'no-cache' });
putStringTask.then((snapshot: FirebaseStorageTypes.TaskSnapshot) => {
  console.log(snapshot.bytesTransferred);
});

reference
  .updateMetadata({ cacheControl: 'no-cache' })
  .then((metadata: FirebaseStorageTypes.FullMetadata) => {
    console.log(metadata);
  });

// checks modular API functions
const modularStorage1 = getStorage();
console.log(modularStorage1.app.name);

const modularStorage2 = getStorage(firebase.app());
console.log(modularStorage2.app.name);

const modularStorage3 = getStorage(firebase.app(), 'gs://custom-bucket');
console.log(modularStorage3.app.name);

connectStorageEmulator(modularStorage1, 'localhost', 9199);

const modularRef1 = ref(modularStorage1, 'modular/path');
console.log(modularRef1.fullPath);

const modularRef2 = ref(modularStorage1);
console.log(modularRef2.fullPath);

deleteObject(modularRef1).then(() => {
  console.log('Modular deleted');
});

getBlob(modularRef1).then((blob: Blob) => {
  console.log(blob);
});

getBlob(modularRef1, 1024).then((blob: Blob) => {
  console.log(blob);
});

getBytes(modularRef1).then((bytes: ArrayBuffer) => {
  console.log(bytes);
});

getBytes(modularRef1, 2048).then((bytes: ArrayBuffer) => {
  console.log(bytes);
});

getDownloadURL(modularRef1).then((url: string) => {
  console.log(url);
});

getMetadata(modularRef1).then((metadata: FirebaseStorageTypes.FullMetadata) => {
  console.log(metadata);
});

const modularStream = getStream(modularRef1);
console.log(modularStream);

list(modularRef1, { maxResults: 10 }).then((result: FirebaseStorageTypes.ListResult) => {
  console.log(result.items);
});

listAll(modularRef1).then((result: FirebaseStorageTypes.ListResult) => {
  console.log(result.items);
});

updateMetadata(modularRef1, { cacheControl: 'no-cache' }).then(
  (metadata: FirebaseStorageTypes.FullMetadata) => {
    console.log(metadata);
  },
);

uploadBytes(modularRef1, new Blob(), { cacheControl: 'no-cache' }).then(
  (result: FirebaseStorageTypes.TaskResult) => {
    console.log(result);
  },
);

const modularUploadBytesResumable = uploadBytesResumable(modularRef1, new Blob(), {
  cacheControl: 'no-cache',
});
modularUploadBytesResumable.pause().then(() => {
  console.log('Modular paused');
});

const modularUploadString = uploadString(modularRef1, 'modular-data', 'base64', {
  cacheControl: 'no-cache',
});
modularUploadString.then((snapshot: FirebaseStorageTypes.TaskSnapshot) => {
  console.log(snapshot);
});

const modularRefFromURL = refFromURL(modularStorage1, 'gs://bucket/path');
console.log(modularRefFromURL.fullPath);

setMaxOperationRetryTime(modularStorage1, 5000).then(() => {
  console.log('Modular max operation retry time set');
});

setMaxUploadRetryTime(modularStorage1, 25000).then(() => {
  console.log('Modular max upload retry time set');
});

const modularPutFile = putFile(modularRef1, '/local/path', { cacheControl: 'no-cache' });
modularPutFile.then((snapshot: FirebaseStorageTypes.TaskSnapshot) => {
  console.log(snapshot);
});

const modularWriteToFile = writeToFile(modularRef1, '/local/path');
modularWriteToFile.then((snapshot: FirebaseStorageTypes.TaskSnapshot) => {
  console.log(snapshot);
});

console.log(storageToString(modularRef1));

const modularChildRef = child(modularRef1, 'child');
console.log(modularChildRef.fullPath);

setMaxDownloadRetryTime(modularStorage1, 25000).then(() => {
  console.log('Modular max download retry time set');
});

// checks modular statics exports
console.log(StringFormat.RAW);
console.log(TaskEvent.STATE_CHANGED);
console.log(TaskState.SUCCESS);

// Test type usage
const storageInstance2: Storage = firebase.storage();
console.log(storageInstance2.app.name);

// Test backwards compatibility types
const legacyType: FirebaseStorageTypes.Module = storageInstance2;
console.log(legacyType.app.name);
const legacyStatics: FirebaseStorageTypes.Statics = storage;
console.log(legacyStatics.SDK_VERSION);
const legacyReference: FirebaseStorageTypes.Reference = storageInstance2.ref('test');
console.log(legacyReference.fullPath);
const legacyMetadata: FirebaseStorageTypes.FullMetadata = {} as FirebaseStorageTypes.FullMetadata;
console.log(legacyMetadata);
const legacySettableMetadata: FirebaseStorageTypes.SettableMetadata =
  {} as FirebaseStorageTypes.SettableMetadata;
console.log(legacySettableMetadata);
const legacyListResult: FirebaseStorageTypes.ListResult = {} as FirebaseStorageTypes.ListResult;
console.log(legacyListResult);
const legacyTaskSnapshot: FirebaseStorageTypes.TaskSnapshot =
  {} as FirebaseStorageTypes.TaskSnapshot;
console.log(legacyTaskSnapshot);
const legacyTask: FirebaseStorageTypes.Task = {} as FirebaseStorageTypes.Task;
console.log(legacyTask);

// Test SDK_VERSION
const sdkVersion: string = storage.SDK_VERSION;
console.log(sdkVersion);
