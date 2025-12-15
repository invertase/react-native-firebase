import database, {
  firebase,
  FirebaseDatabaseTypes,
  getDatabase,
  connectDatabaseEmulator,
  goOffline,
  goOnline,
  ref,
  refFromURL,
  setPersistenceEnabled,
  setLoggingEnabled,
  setPersistenceCacheSizeBytes,
  serverTimestamp,
  getServerTime,
  increment,
  ServerValue,
  endAt,
  endBefore,
  startAt,
  startAfter,
  limitToFirst,
  limitToLast,
  orderByChild,
  orderByKey,
  orderByPriority,
  orderByValue,
  equalTo,
  query,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  set,
  setPriority,
  setWithPriority,
  get,
  child,
  onDisconnect,
  keepSynced,
  push,
  remove,
  update,
  runTransaction,
} from '.';

console.log(database().app);

// checks module exists at root
console.log(firebase.database().app.name);
console.log(firebase.database().ref('foo/bar'));

// checks module exists at app level
console.log(firebase.app().database().app.name);

// app level module accepts string arg
console.log(firebase.app().database('some-string').app.name);
console.log(firebase.app().database('some-string').ref('foo'));

// checks statics exist
console.log(firebase.database.SDK_VERSION);

// checks statics exist on defaultExport
console.log(database.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.database(firebase.app()).app.name);

// checks default export supports app arg
console.log(database(firebase.app()).app.name);

// checks statics - ServerValue
console.log(firebase.database.ServerValue.TIMESTAMP);
console.log(firebase.database.ServerValue.increment(1));

// checks Module instance APIs
const dbInstance = firebase.database();
console.log(dbInstance.ref('foo/bar'));
console.log(dbInstance.refFromURL('https://example.firebaseio.com'));

dbInstance.goOnline().then(() => {
  console.log('Online');
});

dbInstance.goOffline().then(() => {
  console.log('Offline');
});

dbInstance.setPersistenceEnabled(true);
dbInstance.setLoggingEnabled(true);
dbInstance.setPersistenceCacheSizeBytes(2000000);
dbInstance.useEmulator('localhost', 9000);

const serverTime = dbInstance.getServerTime();
console.log(serverTime);

const rootRef = dbInstance.ref();
const rootChildRef = rootRef.child('users');
rootChildRef.push({ name: 'test' });

rootRef.set({ foo: 'bar' }).then(() => {
  console.log('Set complete');
});

rootRef
  .update({ foo: 'bar' }, () => {})
  .then(() => {
    console.log('Update complete');
  });

rootRef.once('value').then((snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
  console.log(snapshot.exists());
  console.log(snapshot.val());
  console.log(snapshot.key);
  console.log(snapshot.ref);
});

rootRef.on('value', (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
  console.log(snapshot.val());
});

rootRef.off('value');

// checks modular API functions
const dbModular1 = getDatabase();
console.log(dbModular1.app.name);

const dbModular2 = getDatabase(firebase.app());
console.log(dbModular2.app.name);

const dbModular3 = getDatabase(firebase.app(), 'https://example.firebaseio.com');
console.log(dbModular3.app.name);

connectDatabaseEmulator(dbInstance, 'localhost', 9000);

goOffline(dbInstance).then(() => {
  console.log('Offline');
});

goOnline(dbInstance).then(() => {
  console.log('Online');
});

const modularRef = ref(dbInstance, 'users');
const modularRef2 = ref(dbInstance);
console.log(modularRef.key);
console.log(modularRef2.key);

const modularRefFromURL = refFromURL(dbInstance, 'https://example.firebaseio.com/users');
console.log(modularRefFromURL.key);

setPersistenceEnabled(dbInstance, true);
setLoggingEnabled(dbInstance, true);
setPersistenceCacheSizeBytes(dbInstance, 2000000);

const timestamp = serverTimestamp();
console.log(timestamp);

getServerTime(dbInstance).then((time: number) => {
  console.log(time);
});

const incrementValue = increment(1);
console.log(incrementValue);

console.log(ServerValue.TIMESTAMP);
console.log(ServerValue.increment(1));

// checks modular query functions
const testRef = ref(dbInstance, 'users');
const testQuery = query(testRef, orderByChild('name'), limitToFirst(10));
console.log(testQuery);

// Test all query constraint functions
console.log(query(testRef, endAt('value')));
console.log(query(testRef, endBefore('value')));
console.log(query(testRef, startAt('value')));
console.log(query(testRef, startAfter('value')));
console.log(query(testRef, limitToFirst(5)));
console.log(query(testRef, limitToLast(5)));
console.log(query(testRef, orderByChild('age')));
console.log(query(testRef, orderByKey()));
console.log(query(testRef, orderByPriority()));
console.log(query(testRef, orderByValue()));
console.log(query(testRef, equalTo('value')));

const modularUnsubscribe1 = onValue(testRef, (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
  console.log(snapshot.val());
});

const modularUnsubscribe2 = onValue(
  testRef,
  (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
    console.log(snapshot.val());
  },
  (error: Error) => {
    console.log(error.message);
  },
);

const modularUnsubscribe3 = onValue(
  testRef,
  (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
    console.log(snapshot.val());
  },
  { onlyOnce: true },
);

modularUnsubscribe1();
modularUnsubscribe2();
modularUnsubscribe3();

const unsubscribeChildAdded = onChildAdded(
  testRef,
  (snapshot: FirebaseDatabaseTypes.DataSnapshot, previousChildName: string | null) => {
    console.log(snapshot.val());
    console.log(previousChildName);
  },
);

const unsubscribeChildChanged = onChildChanged(
  testRef,
  (snapshot: FirebaseDatabaseTypes.DataSnapshot, previousChildName: string | null) => {
    console.log(snapshot.val());
    console.log(previousChildName);
  },
);

const unsubscribeChildMoved = onChildMoved(
  testRef,
  (snapshot: FirebaseDatabaseTypes.DataSnapshot, previousChildName: string | null) => {
    console.log(snapshot.val());
    console.log(previousChildName);
  },
);

const unsubscribeChildRemoved = onChildRemoved(
  testRef,
  (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
    console.log(snapshot.val());
  },
);

unsubscribeChildAdded();
unsubscribeChildChanged();
unsubscribeChildMoved();
unsubscribeChildRemoved();

set(testRef, { foo: 'bar' }).then(() => {
  console.log('Set complete');
});

setPriority(testRef, 'high').then(() => {
  console.log('Priority set');
});

setWithPriority(testRef, { foo: 'bar' }, 'high').then(() => {
  console.log('Set with priority complete');
});

get(testQuery).then((snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
  console.log(snapshot.val());
});

const modularChildRef = child(testRef, 'child');
console.log(modularChildRef.key);

const onDisconnectRef = onDisconnect(testRef);
console.log(onDisconnectRef);

keepSynced(testRef, true).then(() => {
  console.log('Keep synced set');
});

const modularPushRef = push(testRef, { name: 'test' });
console.log(modularPushRef.key);

remove(testRef).then(() => {
  console.log('Remove complete');
});

update(testRef, { foo: 'bar' }).then(() => {
  console.log('Update complete');
});

runTransaction(testRef, (currentData: any) => {
  return { ...currentData, updated: true };
}).then((result: FirebaseDatabaseTypes.TransactionResult) => {
  console.log(result.committed);
  console.log(result.snapshot.val());
});

runTransaction(
  testRef,
  (currentData: any) => {
    return { ...currentData, updated: true };
  },
  { applyLocally: true },
).then((result: FirebaseDatabaseTypes.TransactionResult) => {
  console.log(result.committed);
});
