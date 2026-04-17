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
  type Database as ModularDatabase,
  type DatabaseReference as ModularDatabaseReference,
  type DataSnapshot as ModularDataSnapshot,
  type EmulatorMockTokenOptions,
  type IteratedDataSnapshot,
  type Query as ModularQuery,
  type QueryConstraint,
  type QueryConstraintType,
  type ThenableReference as ModularThenableReference,
  type TransactionResult as ModularTransactionResult,
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
const dbModular1: ModularDatabase = getDatabase();
console.log(dbModular1.app.name);
const dbType: 'database' = dbModular1.type;
void dbType;

const dbModular2: ModularDatabase = getDatabase(firebase.app());
console.log(dbModular2.app.name);

const dbModular3: ModularDatabase = getDatabase(firebase.app(), 'https://example.firebaseio.com');
console.log(dbModular3.app.name);

const mockUserToken: EmulatorMockTokenOptions = { user_id: 'test-user' };
connectDatabaseEmulator(dbModular1, 'localhost', 9000, { mockUserToken });

goOffline(dbModular1);

goOnline(dbModular1);

const modularRef: ModularDatabaseReference = ref(dbModular1, 'users');
const modularRef2: ModularDatabaseReference = ref(dbModular1);
console.log(modularRef.key);
console.log(modularRef2.key);

const modularRefFromURL: ModularDatabaseReference = refFromURL(
  dbModular1,
  'https://example.firebaseio.com/users',
);
console.log(modularRefFromURL.key);

setPersistenceEnabled(dbModular1, true);
setLoggingEnabled(dbModular1, true);
setPersistenceCacheSizeBytes(dbModular1, 2000000);

const timestamp = serverTimestamp();
console.log(timestamp);

const modularServerTime: Date = getServerTime(dbModular1);
console.log(modularServerTime);

const incrementValue = increment(1);
console.log(incrementValue);

console.log(ServerValue.TIMESTAMP);
console.log(ServerValue.increment(1));

// checks modular query functions
const testRef: ModularDatabaseReference = ref(dbModular1, 'users');
const testQuery: ModularQuery = query(testRef, orderByChild('name'), limitToFirst(10));
console.log(testQuery);

const queryConstraintType: QueryConstraintType = 'orderByKey';
void queryConstraintType;
const queryConstraint: QueryConstraint = orderByKey();
console.log(queryConstraint.type);
void queryConstraint;

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

const modularUnsubscribe1 = onValue(testRef, (snapshot: ModularDataSnapshot) => {
  console.log(snapshot.val());
});

const modularUnsubscribe2 = onValue(
  testRef,
  (snapshot: ModularDataSnapshot) => {
    console.log(snapshot.val());
  },
  (error: Error) => {
    console.log(error.message);
  },
);

const modularUnsubscribe3 = onValue(
  testRef,
  (snapshot: ModularDataSnapshot) => {
    console.log(snapshot.val());
  },
  { onlyOnce: true },
);

modularUnsubscribe1();
modularUnsubscribe2();
modularUnsubscribe3();

const unsubscribeChildAdded = onChildAdded(
  testRef,
  (snapshot: ModularDataSnapshot, previousChildName?: string | null) => {
    console.log(snapshot.val());
    console.log(previousChildName);
  },
);
const unsubscribeChildAddedOptionalPrev = onChildAdded(testRef, (snapshot: ModularDataSnapshot) => {
  console.log(snapshot.val());
});

const unsubscribeChildChanged = onChildChanged(
  testRef,
  (snapshot: ModularDataSnapshot, previousChildName: string | null) => {
    console.log(snapshot.val());
    console.log(previousChildName);
  },
);

const unsubscribeChildMoved = onChildMoved(
  testRef,
  (snapshot: ModularDataSnapshot, previousChildName: string | null) => {
    console.log(snapshot.val());
    console.log(previousChildName);
  },
);

const unsubscribeChildRemoved = onChildRemoved(testRef, (snapshot: ModularDataSnapshot) => {
  console.log(snapshot.val());
});

unsubscribeChildAdded();
unsubscribeChildAddedOptionalPrev();
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

get(testQuery).then((snapshot: ModularDataSnapshot) => {
  console.log(snapshot.val());
  console.log(snapshot.priority);
  console.log(snapshot.size);
  snapshot.forEach((child: IteratedDataSnapshot) => {
    console.log(child.key);
  });
});

const modularChildRef = child(testRef, 'child');
console.log(modularChildRef.key);

const onDisconnectRef = onDisconnect(testRef);
console.log(onDisconnectRef);
onDisconnectRef.set('offline').then(() => {});

keepSynced(testRef, true).then(() => {
  console.log('Keep synced set');
});

const modularPushRef: ModularThenableReference = push(testRef, { name: 'test' });
console.log(modularPushRef.key);

remove(testRef).then(() => {
  console.log('Remove complete');
});

update(testRef, { foo: 'bar' }).then(() => {
  console.log('Update complete');
});

runTransaction(testRef, (currentData: any) => {
  return { ...currentData, updated: true };
}).then((result: ModularTransactionResult) => {
  console.log(result.committed);
  console.log(result.snapshot.val());
  console.log(result.toJSON());
});

runTransaction(
  testRef,
  (currentData: any) => {
    return { ...currentData, updated: true };
  },
  { applyLocally: true },
).then((result: ModularTransactionResult) => {
  console.log(result.committed);
});

console.log(testQuery.isEqual(null));
