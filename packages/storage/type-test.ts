import firebase, { FirebaseStorageTypes } from '.';

console.log(firebase().app);
console.log(firebase.default().app);

// checks module exists at root
console.log(firebase.storage().app.name);

// checks module exists at app level
console.log(firebase.app().storage().app.name);

// checks statics exist
console.log(firebase.storage.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebase.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.storage(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase.storage(firebase.app('foo')).app.name);

console.log(firebase.storage.StringFormat.BASE64);
console.log(firebase.storage.TaskState.ERROR);
console.log(firebase.storage.TaskEvent.STATE_CHANGED);

console.log(firebase.storage().maxDownloadRetryTime);
console.log(firebase.storage().maxDownloadRetryTime);
console.log(firebase.storage().maxOperationRetryTime);

const ref = firebase.storage().ref('foo');
ref.child('foo').delete().then();
ref.listAll().then((result: FirebaseStorageTypes.ListResult) => {
  console.log(result.items);
  console.log(result.nextPageToken);
  console.log(result.prefixes);
  console.log(result.items[0].bucket);
  console.log(result.prefixes[0].parent);
});

const task = firebase.storage().ref('foo').putString('foo');
task.pause().then();
task.resume().then((bool: FirebaseStorageTypes.TaskState) => console.log(bool));
task.cancel().then((bool: FirebaseStorageTypes.TaskState) => console.log(bool));
task.on(
  'state_changed',
  (sn: FirebaseStorageTypes.TaskSnapshot) => {
    console.log(sn.bytesTransferred);
  },
  (error: { message: any }) => {
    console.log(error.message);
  },
  () => {},
);
task.then(
  (ts: FirebaseStorageTypes.TaskSnapshot) => {
    console.log(ts.bytesTransferred);
  },
  (error: { message: any }) => {
    console.log(error.message);
  },
);

task.catch((error: { message: any }) => {
  console.log(error.message);
});
