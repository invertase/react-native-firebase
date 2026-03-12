/*
 * Consumer-facing API type tests for @react-native-firebase/firestore.
 * Part 1: Namespaced API (firebase.firestore(), default firestore()).
 * Part 2: Modular API (getFirestore, doc, collection, setDoc, etc. from lib/modular.ts).
 */

// ---------------------------------------------------------------------------
// PART 1 — NAMESPACED API
// ---------------------------------------------------------------------------
// Import namespaced API: default export and firebase, plus types used in Part 1.
import firestore, { firebase } from '.';
import type { FirebaseFirestoreTypes } from '.';

// ----- Default export and module access -----
console.log(firestore().app);
console.log(firestore.SDK_VERSION);
console.log(firestore.firebase.SDK_VERSION);

// ----- firebase.firestore at root -----
console.log(firebase.firestore().app.name);
console.log(firebase.firestore().collection('foo'));

// ----- firebase.firestore at app level -----
console.log(firebase.app().firestore().app.name);
console.log(firebase.app().firestore().collection('foo'));

// ----- Multi-app and database ID -----
console.log(firebase.firestore(firebase.app()).app.name);
console.log(firebase.firestore(firebase.app('foo')).app.name);
// Database ID: firebase.app().firestore(databaseId)
console.log(firebase.app().firestore('(default)').app.name);
console.log(firebase.app().firestore('other-db').app.name);

// ----- Default export with app arg -----
console.log(firestore(firebase.app()).app.name);

// ----- Statics (FirestoreStatics) -----
console.log(firebase.firestore.Blob);
console.log(firebase.firestore.FieldPath);
console.log(firebase.firestore.FieldValue);
console.log(firebase.firestore.GeoPoint);
console.log(firebase.firestore.Timestamp);
console.log(firebase.firestore.Filter);
console.log(firebase.firestore.CACHE_SIZE_UNLIMITED);
firebase.firestore.setLogLevel('debug');

// ----- Firestore instance: references and batch -----
const nsFirestore = firebase.firestore();
console.log(nsFirestore.collection('users'));
console.log(nsFirestore.collection('users').doc('alice'));
console.log(nsFirestore.collection('users').doc('alice').collection('orders'));
console.log(nsFirestore.collectionGroup('orders'));
console.log(nsFirestore.batch());

// ----- CollectionReference -----
const nsColl = nsFirestore.collection('users');
const nsDocRef = nsColl.doc('alice');
const nsQuery = nsColl.where('name', '==', 'test');

nsDocRef.set({ name: 'Alice', count: 1 }).then(() => {});
nsDocRef
  .set({ name: 'Alice' }, { merge: true })
  .then(() => {});

nsDocRef.update({ count: 2 }).then(() => {});
nsDocRef.update('count', 3).then(() => {});

nsDocRef.delete().then(() => {});

nsColl.add({ name: 'Bob' }).then((ref: FirebaseFirestoreTypes.DocumentReference) => {
  console.log(ref.id);
});

nsDocRef.get().then((snap: FirebaseFirestoreTypes.DocumentSnapshot) => {
  console.log(snap.exists());
  console.log(snap.data());
  console.log(snap.id);
  console.log(snap.ref);
  console.log(snap.metadata);
});
nsDocRef.get({ source: 'cache' }).then(() => {});
nsDocRef.get({ source: 'server' }).then(() => {});

nsQuery.get().then((snap: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snap.docs);
  console.log(snap.empty);
  console.log(snap.size);
  console.log(snap.docChanges());
});

// ----- DocumentSnapshot -----
nsDocRef.get().then((snap: FirebaseFirestoreTypes.DocumentSnapshot) => {
  if (snap.exists()) {
    const d = snap.data();
    console.log(d);
  }
  console.log(snap.get('field'));
  console.log(snap.metadata.isEqual(snap.metadata));
});

// ----- onSnapshot (document) -----
const unsubDoc1 = nsDocRef.onSnapshot((snap: FirebaseFirestoreTypes.DocumentSnapshot) => {
  console.log(snap.data());
});
const unsubDoc2 = nsDocRef.onSnapshot(
  { includeMetadataChanges: true },
  (_snap: FirebaseFirestoreTypes.DocumentSnapshot) => {},
);
const unsubDoc4 = nsDocRef.onSnapshot(
  { source: 'cache' },
  (_snap: FirebaseFirestoreTypes.DocumentSnapshot) => {},
);
const unsubDoc3 = nsDocRef.onSnapshot({
  next: (_snap: FirebaseFirestoreTypes.DocumentSnapshot) => {},
  error: (_e: Error) => {},
});
unsubDoc1();
unsubDoc2();
unsubDoc3();
unsubDoc4();

// ----- onSnapshot (query) -----
const unsubQuery1 = nsQuery.onSnapshot((snap: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snap.docs);
});
const unsubQuery2 = nsQuery.onSnapshot(
  { includeMetadataChanges: true },
  { next: (_snap: FirebaseFirestoreTypes.QuerySnapshot) => {}, error: (_e: Error) => {} },
);
const unsubQuery3 = nsQuery.onSnapshot(
  { source: 'cache', includeMetadataChanges: true },
  { next: (_snap: FirebaseFirestoreTypes.QuerySnapshot) => {}, error: (_e: Error) => {} },
);
unsubQuery1();
unsubQuery2();
unsubQuery3();

// ----- Query: where, orderBy, limit, cursor -----
const nsQuery2 = nsColl
  .where('age', '>', 18)
  .orderBy('age', 'desc')
  .orderBy('name')
  .limit(10)
  .limitToLast(5)
  .startAt(1)
  .startAfter(2)
  .endAt(10)
  .endBefore(9);
void nsQuery2;

// ----- Firestore instance: loadBundle, namedQuery, runTransaction -----
const nsLoadTask = nsFirestore.loadBundle('bundle-data');
console.log(nsLoadTask.then(() => {}));

const nsNamed = nsFirestore.namedQuery('my-query');
console.log(nsNamed);

nsFirestore.runTransaction(async (tx: FirebaseFirestoreTypes.Transaction) => {
  const snap = await tx.get(nsDocRef);
  if (snap.exists()) {
    tx.update(nsDocRef, { count: ((snap.data() as { count?: number })?.count ?? 0) + 1 });
  }
  return null;
}).then(() => {});

// ----- Firestore instance: persistence and network -----
nsFirestore.clearPersistence().then(() => {});
nsFirestore.waitForPendingWrites().then(() => {});
nsFirestore.terminate().then(() => {});
nsFirestore.useEmulator('localhost', 8080);
nsFirestore.enableNetwork().then(() => {});
nsFirestore.disableNetwork().then(() => {});

// ----- Firestore instance: settings -----
nsFirestore.settings({ persistence: true }).then(() => {});

// ----- Persistent cache index manager (namespaced) -----
const nsIndexManager = nsFirestore.persistentCacheIndexManager();
if (nsIndexManager) {
  nsIndexManager.enableIndexAutoCreation().then(() => {});
  nsIndexManager.disableIndexAutoCreation().then(() => {});
  nsIndexManager.deleteAllIndexes().then(() => {});
}

// ----- WriteBatch (namespaced) -----
const nsBatch = nsFirestore.batch();
nsBatch.set(nsDocRef, { name: 'Alice' });
nsBatch.set(nsDocRef, { name: 'Alice' }, { merge: true });
nsBatch.update(nsDocRef, { count: 1 });
nsBatch.delete(nsDocRef);
nsBatch.commit().then(() => {});

// ----- Namespaced FieldValue (statics) -----
const nsFieldPath = new firebase.firestore.FieldPath('user', 'name');
void nsFieldPath;
const nsBlob = firebase.firestore.Blob.fromBase64String('dGVzdA==');
void nsBlob;
const nsGeoPoint = new firebase.firestore.GeoPoint(0, 0);
void nsGeoPoint;
const nsTimestamp = firebase.firestore.Timestamp.now();
void nsTimestamp;
const nsDelete = firebase.firestore.FieldValue.delete();
const nsServerTs = firebase.firestore.FieldValue.serverTimestamp();
const nsArrayUnion = firebase.firestore.FieldValue.arrayUnion(1, 2);
const nsArrayRemove = firebase.firestore.FieldValue.arrayRemove(1);
void nsArrayRemove;
const nsIncrement = firebase.firestore.FieldValue.increment(1);

nsDocRef.set({
  name: 'x',
  deleted: nsDelete,
  ts: nsServerTs,
  arr: nsArrayUnion,
  cnt: nsIncrement,
}).then(() => {});

// ----- withConverter (namespaced) -----
interface User {
  name: string;
  age: number;
}
const nsConverter: FirebaseFirestoreTypes.FirestoreDataConverter<User> = {
  toFirestore(u: User) {
    return u;
  },
  fromFirestore(snap: FirebaseFirestoreTypes.QueryDocumentSnapshot): User {
    return snap.data() as User;
  },
};
const nsCollWithConv = nsFirestore.collection('users').withConverter(nsConverter);
const nsDocWithConv = nsCollWithConv.doc('alice');
nsDocWithConv.set({ name: 'Alice', age: 30 }).then(() => {});
nsDocWithConv.get().then((snap: FirebaseFirestoreTypes.DocumentSnapshot<User>) => {
  const u = snap.data();
  if (u) console.log(u.name, u.age);
});

// ---------------------------------------------------------------------------
// PART 2 — MODULAR API
// ---------------------------------------------------------------------------
// All exports from lib/modular.ts (and re-exports from index).
import {
  getFirestore,
  connectFirestoreEmulator,
  setLogLevel,
  initializeFirestore,
  doc,
  collection,
  collectionGroup,
  refEqual,
  setDoc,
  updateDoc,
  addDoc,
  enableNetwork,
  disableNetwork,
  clearPersistence,
  clearIndexedDbPersistence,
  terminate,
  waitForPendingWrites,
  runTransaction,
  getCountFromServer,
  getAggregateFromServer,
  sum,
  average,
  count,
  loadBundle,
  namedQuery,
  writeBatch,
  getPersistentCacheIndexManager,
  enablePersistentCacheIndexAutoCreation,
  disablePersistentCacheIndexAutoCreation,
  deleteAllPersistentCacheIndexes,
  query,
  where,
  or,
  and,
  orderBy,
  startAt,
  startAfter,
  endAt,
  endBefore,
  limit,
  limitToLast,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  deleteDoc,
  onSnapshot,
  snapshotEqual,
  queryEqual,
  onSnapshotsInSync,
  deleteField,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  FieldPath,
  documentId,
  Bytes,
  GeoPoint,
  Timestamp,
  VectorValue,
  vector,
  CACHE_SIZE_UNLIMITED,
  AggregateField,
  AggregateQuerySnapshot,
  DocumentReference,
  Query,
  QueryDocumentSnapshot,
} from '.';
import type {
  Firestore,
  DocumentData,
  LoadBundleTaskProgress,
  FirestoreDataConverter,
  WithFieldValue,
  PartialWithFieldValue,
} from '.';

// ----- getFirestore -----
const modFirestore1 = getFirestore();
console.log(modFirestore1.app.name);

const modFirestore2 = getFirestore(firebase.app());
console.log(modFirestore2.app.name);

const modFirestore3 = getFirestore(firebase.app(), 'other-db');
console.log(modFirestore3.app.name);

// ----- connectFirestoreEmulator -----
connectFirestoreEmulator(modFirestore1, 'localhost', 8080);
connectFirestoreEmulator(modFirestore1, 'localhost', 8080, {
  mockUserToken: { user_id: 'test' },
});

// ----- setLogLevel -----
setLogLevel('debug');

// ----- initializeFirestore -----
initializeFirestore(firebase.app(), {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
}).then((fs: Firestore) => {
  console.log(fs.app.name);
});

// ----- doc, collection, collectionGroup, refEqual -----
const modColl = collection(modFirestore1, 'users');
const modDoc = doc(modFirestore1, 'users', 'alice');
const modDoc2 = doc(modColl, 'alice');
console.log(collection(modDoc, 'orders'));
console.log(collectionGroup(modFirestore1, 'orders'));
console.log(refEqual(modDoc, modDoc2));

// ----- setDoc -----
setDoc(modDoc, { name: 'Alice' }).then(() => {});
setDoc(modDoc, { name: 'Alice' }, { merge: true }).then(() => {});

// ----- updateDoc -----
updateDoc(modDoc, { name: 'Updated' }).then(() => {});
updateDoc(modDoc, 'name', 'Updated').then(() => {});
updateDoc(modDoc, 'name', 'Updated', 'age', 30).then(() => {});

// ----- addDoc -----
addDoc(modColl, { name: 'Bob' }).then((ref: DocumentReference) => {
  console.log(ref.id);
});

// ----- enableNetwork, disableNetwork, clearPersistence, clearIndexedDbPersistence, terminate, waitForPendingWrites -----
enableNetwork(modFirestore1).then(() => {});
disableNetwork(modFirestore1).then(() => {});
clearPersistence(modFirestore1).then(() => {});
clearIndexedDbPersistence(modFirestore1).then(() => {});
terminate(modFirestore1).then(() => {});
waitForPendingWrites(modFirestore1).then(() => {});

// ----- runTransaction -----
runTransaction(modFirestore1, async tx => {
  const snap = await tx.get(modDoc);
  if (snap.exists()) {
    const data = snap.data() as { count?: number } | undefined;
    tx.update(modDoc, { count: (data?.count ?? 0) + 1 });
  }
  return 'done';
}).then(() => {});

// ----- query, where, or, and, orderBy, startAt, startAfter, endAt, endBefore, limit, limitToLast -----
const modQuery1 = query(modColl, where('name', '==', 'test'));
const modQuery2 = query(modColl, orderBy('age', 'desc'), limit(10));
const modQuery3 = query(
  modColl,
  or(where('status', '==', 'active'), where('status', '==', 'pending')),
);
void modQuery3;
const modQuery4 = query(
  modColl,
  and(where('age', '>', 18), where('status', '==', 'active')),
  orderBy('name'),
  startAt('A'),
  startAfter('B'),
  endAt('Z'),
  endBefore('Y'),
  limitToLast(5),
);
void modQuery4;

// ----- getCountFromServer -----
getCountFromServer(modQuery1).then(
  (snap: AggregateQuerySnapshot<{ count: AggregateField<number> }>) => {
    console.log(snap.query);
    console.log(snap.data().count);
  },
);

// ----- getAggregateFromServer, sum, average, count -----
const aggSpec = {
  totalAge: sum('age'),
  avgAge: average('age'),
  count: count(),
};
getAggregateFromServer(modQuery1, aggSpec).then(
  (
    snap: AggregateQuerySnapshot<{
      totalAge: AggregateField<number>;
      avgAge: AggregateField<number | null>;
      count: AggregateField<number>;
    }>,
  ) => {
    console.log(snap.query);
    console.log(snap.data());
  },
);

// ----- getDoc, getDocFromCache, getDocFromServer -----
getDoc(modDoc).then(snap => snap.data());
getDocFromCache(modDoc).then(snap => snap.data());
getDocFromServer(modDoc).then(snap => snap.data());

// ----- getDocs, getDocsFromCache, getDocsFromServer -----
getDocs(modQuery1).then(snap => snap.docs);
getDocsFromCache(modQuery1).then(snap => snap.docs);
getDocsFromServer(modQuery1).then(snap => snap.docs);

// ----- deleteDoc -----
deleteDoc(modDoc).then(() => {});

// ----- onSnapshot (modular) -----
const unsubMod1 = onSnapshot(modDoc, snap => snap.data());
const unsubMod2 = onSnapshot(modDoc, { includeMetadataChanges: true }, snap => snap.data());
const unsubMod5 = onSnapshot(modDoc, { source: 'cache' }, snap => snap.data());
const unsubMod3 = onSnapshot(modDoc, {
  next: _snap => {},
  error: (_e: Error) => {},
});
const unsubMod4 = onSnapshot(modQuery1, snap => snap.docs);
const unsubMod6 = onSnapshot(modQuery1, { source: 'cache', includeMetadataChanges: true }, snap =>
  snap.docs,
);
unsubMod1();
unsubMod2();
unsubMod3();
unsubMod4();
unsubMod5();
unsubMod6();

// ----- snapshotEqual, queryEqual -----
getDoc(modDoc).then(s1 => {
  getDoc(modDoc).then(s2 => {
    console.log(snapshotEqual(s1, s2));
  });
});
console.log(queryEqual(modQuery1, modQuery2));

// ----- onSnapshotsInSync -----
const unsubSync = onSnapshotsInSync(modFirestore1, () => {});
const unsubSync2 = onSnapshotsInSync(modFirestore1, {
  next: () => {},
  error: (_e: Error) => {},
});
unsubSync();
unsubSync2();

// ----- FieldValue (modular): deleteField, serverTimestamp, arrayUnion, arrayRemove, increment -----
const modDelete = deleteField();
const modServerTs = serverTimestamp();
const modArrayUnion = arrayUnion('a', 'b');
const modArrayRemove = arrayRemove('a');
void modArrayRemove;
const modIncrement = increment(5);
setDoc(modDoc, {
  name: 'test',
  deleted: modDelete,
  ts: modServerTs,
  tags: modArrayUnion,
  cnt: modIncrement,
}).then(() => {});

// ----- FieldPath, documentId (modular) -----
const modFieldPath = new FieldPath('user', 'profile', 'name');
const modDocumentId = documentId();
console.log(query(modColl, where(modDocumentId, '==', 'id')));
console.log(query(modColl, orderBy(modFieldPath)));

// ----- Bytes -----
const bytes1 = Bytes.fromBase64String('dGVzdA==');
const bytes2 = Bytes.fromUint8Array(new Uint8Array([1, 2, 3]));
console.log(bytes1.toBase64());
console.log(bytes2.toUint8Array());
console.log(bytes1.isEqual(bytes2));

// ----- GeoPoint (modular) -----
const gp1 = new GeoPoint(37.7749, -122.4194);
console.log(gp1.latitude);
console.log(gp1.longitude);
console.log(gp1.isEqual(gp1));
console.log(gp1.toJSON());

// ----- Timestamp (modular) -----
const ts1 = Timestamp.now();
const ts2 = Timestamp.fromDate(new Date());
console.log(Timestamp.fromMillis(Date.now()));
console.log(ts1.seconds);
console.log(ts1.nanoseconds);
console.log(ts1.toDate());
console.log(ts1.toMillis());
console.log(ts1.isEqual(ts2));

// ----- VectorValue, vector -----
const v1 = vector([1, 2, 3]);
const v2 = VectorValue.fromJSON(v1.toJSON());
console.log(v1.toArray());
console.log(v1.isEqual(v2));

// ----- loadBundle -----
loadBundle(modFirestore1, 'bundle-data').then((_progress: LoadBundleTaskProgress) => {});

// ----- namedQuery -----
namedQuery(modFirestore1, 'my-query').then((q: Query | null) => {
  if (q) console.log(q);
});

// ----- writeBatch -----
const modBatch = writeBatch(modFirestore1);
modBatch.set(modDoc, { name: 'test' });
modBatch.update(modDoc, { age: 30 });
modBatch.delete(modDoc);
modBatch.commit().then(() => {});

// ----- Persistent cache index manager (modular) -----
const modIndexManager = getPersistentCacheIndexManager(modFirestore1);
if (modIndexManager) {
  enablePersistentCacheIndexAutoCreation(modIndexManager).then(() => {});
  disablePersistentCacheIndexAutoCreation(modIndexManager).then(() => {});
  deleteAllPersistentCacheIndexes(modIndexManager).then(() => {});
}

// ----- withConverter (modular) + type tests -----
class TestObject {
  constructor(
    readonly outerString: string,
    readonly outerArr: string[],
    readonly nested: {
      innerNested: { innerNestedNum: number };
      innerArr: number[];
      timestamp: Timestamp;
    },
  ) {}
}

const testConverter: FirestoreDataConverter<TestObject, TestObject> = {
  toFirestore(obj: WithFieldValue<TestObject>) {
    return { ...obj };
  },
  fromFirestore(snap: QueryDocumentSnapshot): TestObject {
    const data = snap.data();
    return new TestObject(data.outerString, data.outerArr, data.nested);
  },
};

const initialData = {
  outerString: 'foo',
  outerArr: [] as string[],
  nested: {
    innerNested: { innerNestedNum: 2 },
    innerArr: arrayUnion(2),
    timestamp: serverTimestamp(),
  },
};

async function withTestDb(fn: (db: Firestore) => void | Promise<void>): Promise<void> {
  return fn(getFirestore());
}

async function withTestDoc(
  fn: (doc: DocumentReference<DocumentData>) => void | Promise<void>,
): Promise<void> {
  return withTestDb(db => fn(doc(collection(db, 'test-collection'))));
}

async function withTestDocAndInitialData(
  data: DocumentData,
  fn: (doc: DocumentReference<DocumentData>) => void | Promise<void>,
): Promise<void> {
  return withTestDb(async db => {
    const ref = doc(collection(db, 'test-collection'));
    await setDoc(ref, data);
    return fn(ref);
  });
}

// WithFieldValue / PartialWithFieldValue
withTestDoc(async docRef => {
  const ref = docRef.withConverter(testConverter);
  await setDoc(ref, {
    outerString: 'foo',
    outerArr: [],
    nested: {
      innerNested: { innerNestedNum: increment(1) },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });
});

// Merge with partial
withTestDoc(async docRef => {
  const ref = docRef.withConverter(testConverter);
  await setDoc(
    ref,
    {
      outerString: deleteField(),
      nested: {
        innerNested: { innerNestedNum: increment(1) },
        innerArr: arrayUnion(2),
        timestamp: serverTimestamp(),
      },
    },
    { merge: true },
  );
});

// UpdateData
withTestDocAndInitialData(initialData, async docRef => {
  await updateDoc(docRef.withConverter(testConverter), {
    outerString: deleteField(),
    nested: {
      innerNested: { innerNestedNum: increment(2) },
      innerArr: arrayUnion(3),
    },
  });
});

// runTransaction set/update
withTestDb(async db => {
  const ref = doc(collection(db, 'test')).withConverter(testConverter);
  return runTransaction(db, async tx => {
    tx.set(ref, {
      outerString: 'foo',
      outerArr: [],
      nested: {
        innerNested: { innerNestedNum: 2 },
        innerArr: arrayUnion(2),
        timestamp: serverTimestamp(),
      },
    });
    tx.update(ref, {
      'nested.innerNested.innerNestedNum': increment(1),
    });
  });
});

// writeBatch set/update
withTestDb(async db => {
  const ref = doc(collection(db, 'test')).withConverter(testConverter);
  const batch = writeBatch(db);
  batch.set(ref, { outerString: 'x', outerArr: [], nested: initialData.nested });
  batch.update(ref, { outerString: 'y' });
  await batch.commit();
});

// Type helpers: WithFieldValue / PartialWithFieldValue as types
class ObjectWrapper<T> {
  withFieldValueT(value: WithFieldValue<T>): WithFieldValue<T> {
    return value;
  }
  withPartialFieldValueT(value: PartialWithFieldValue<T>): PartialWithFieldValue<T> {
    return value;
  }
}
interface Foo {
  id: string;
  foo: number;
}
const fooWrapper = new ObjectWrapper<Foo>();
fooWrapper.withFieldValueT({ id: '', foo: increment(1) });
fooWrapper.withPartialFieldValueT({ foo: increment(1) });
