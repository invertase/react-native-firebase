/*
 * Consumer-facing API type tests for @react-native-firebase/firestore.
 * Part 1: Namespaced API (firebase.firestore(), default firestore()).
 * Part 2: Modular API (getFirestore, doc, collection, setDoc, etc. from lib/modular.ts).
 */

// ---------------------------------------------------------------------------
// PART 1 — NAMESPACED API
// ---------------------------------------------------------------------------
// Import namespaced API: default export and firebase, plus types used in Part 1.
import firestore, {
  firebase,
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
  type QueryConstraint,
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
  FirebaseFirestoreTypes,
  Firestore,
  DocumentData,
  LoadBundleTaskProgress,
  FirestoreDataConverter,
  WithFieldValue,
  PartialWithFieldValue,
} from '.';
import {
  execute,
  field,
  and as pipelineAnd, // duplicate name from main module
  or as pipelineOr, // duplicate name from main module
  lessThan,
  stringConcat,
  arrayContainsAny,
  toLower,
  Ordering,
  countAll,
  sum as pipelineSum,
  average as pipelineAverage,
  maximum,
  constant,
  // comparison / logical
  greaterThan,
  equal,
  notEqual,
  greaterThanOrEqual,
  lessThanOrEqual,
  exists,
  arrayContains,
  arrayContainsAll,
  startsWith,
  endsWith,
  not,
  xor,
  equalAny,
  notEqualAny,
  isAbsent,
  isError,
  isType,
  ifAbsent,
  ifError,
  conditional,
  logicalMaximum,
  logicalMinimum,
  // ordering
  ascending,
  descending,
  // arithmetic
  add,
  subtract,
  divide,
  multiply,
  abs,
  ceil,
  floor,
  mod,
  round,
  sqrt,
  exp,
  ln,
  log,
  log10,
  pow,
  trunc,
  rand,
  // aggregates
  count as pipelineCount, // duplicate name from main module
  countDistinct,
  countIf,
  first,
  last,
  arrayAgg,
  arrayAggDistinct,
  minimum,
  // document / collection
  documentId as pipelineDocumentId, // duplicate name from main module
  collectionId,
  type as pipelineType,
  currentTimestamp,
  // array
  array,
  arrayConcat,
  arrayGet,
  arrayLength,
  arraySum,
  // map
  map,
  mapEntries,
  mapGet,
  mapKeys,
  mapMerge,
  mapRemove,
  mapSet,
  mapValues,
  // string
  concat,
  toUpper,
  trim,
  ltrim,
  rtrim,
  substring,
  reverse,
  split,
  join,
  like,
  length,
  byteLength,
  charLength,
  stringContains,
  stringIndexOf,
  stringRepeat,
  stringReplaceAll,
  stringReplaceOne,
  stringReverse,
  regexContains,
  regexFind,
  regexFindAll,
  regexMatch,
  // timestamp
  timestampAdd,
  timestampSubtract,
  timestampToUnixMicros,
  timestampToUnixMillis,
  timestampToUnixSeconds,
  timestampTruncate,
  unixMicrosToTimestamp,
  unixMillisToTimestamp,
  unixSecondsToTimestamp,
  // vector
  cosineDistance,
  dotProduct,
  euclideanDistance,
  vectorLength,
  // result utility
  pipelineResultEqual,
} from '@react-native-firebase/firestore/pipelines';
import type {
  PipelineResult,
  PipelineSnapshot,
  Pipeline,
  PipelineSource,
  BooleanExpression,
  Selectable,
  Field,
  Expression,
  FunctionExpression,
  AggregateFunction,
  ExpressionType,
  Type as PipelineValueType,
  TimeGranularity,
  AliasedAggregate,
  AliasedExpression,
  StageOptions,
  AddFieldsStageOptions,
  AggregateStageOptions,
  CollectionGroupStageOptions,
  CollectionStageOptions,
  DatabaseStageOptions,
  DistinctStageOptions,
  DocumentsStageOptions,
  FindNearestStageOptions,
  LimitStageOptions,
  OffsetStageOptions,
  RemoveFieldsStageOptions,
  ReplaceWithStageOptions,
  SampleStageOptions,
  SelectStageOptions,
  SortStageOptions,
  UnionStageOptions,
  UnnestStageOptions,
  WhereStageOptions,
  PipelineExecuteOptions,
  OneOf,
} from '@react-native-firebase/firestore/pipelines';

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
const unsubDoc3 = nsDocRef.onSnapshot({
  next: (_snap: FirebaseFirestoreTypes.DocumentSnapshot) => {},
  error: (_e: Error) => {},
});
unsubDoc1();
unsubDoc2();
unsubDoc3();

// ----- onSnapshot (query) -----
const unsubQuery1 = nsQuery.onSnapshot((snap: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snap.docs);
});
const unsubQuery2 = nsQuery.onSnapshot(
  { includeMetadataChanges: true },
  { next: (_snap: FirebaseFirestoreTypes.QuerySnapshot) => {}, error: (_e: Error) => {} },
);
unsubQuery1();
unsubQuery2();

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

// ----- QueryConstraint[] array test (reproducer for #8923) -----
// This test verifies that QueryConstraint subclasses can be assigned to QueryConstraint[]
// without TypeScript errors about missing _apply property
const constraints: QueryConstraint[] = [];

constraints.push(where('status', '==', 'active'));
constraints.push(orderBy('createdAt', 'desc'));
constraints.push(limit(10));

// Verify we can use the constraints array
const testQuery = query(modColl, ...constraints);
void testQuery;

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
const unsubMod3 = onSnapshot(modDoc, {
  next: _snap => {},
  error: (_e: Error) => {},
});
const unsubMod4 = onSnapshot(modQuery1, snap => snap.docs);
unsubMod1();
unsubMod2();
unsubMod3();
unsubMod4();

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

// ---------------------------------------------------------------------------
// PART 3 — PIPELINES API
// ---------------------------------------------------------------------------
const pipelineDb = getFirestore();
const pipelineCollectionRef = collection(pipelineDb, 'pipeline-books');
const pipelineDocRef = doc(pipelineCollectionRef, 'book-a');
const pipelineQuerySource = query(
  pipelineCollectionRef,
  where('rating', '>=', 4),
  orderBy('rating', 'desc'),
  limit(5),
);
void pipelineDocRef;
void pipelineQuerySource;

const pipelineFromCollectionRef = pipelineDb
  .pipeline()
  .collection(pipelineCollectionRef)
  .where(field('rating').greaterThanOrEqual(4))
  .sort(Ordering.of(field('rating')).descending())
  .limit(2);
void pipelineFromCollectionRef;

const pipelineFromCollectionPath = pipelineDb
  .pipeline()
  .collection('pipeline-books')
  .where({ condition: field('author').equal('Alice') })
  .select('title', 'author');
void pipelineFromCollectionPath;

const pipelineFromCollectionOptions = pipelineDb.pipeline().collection({
  path: 'pipeline-books',
  rawOptions: { explain: true },
});
void pipelineFromCollectionOptions;

const pipelineFromCollectionGroup = pipelineDb
  .pipeline()
  .collectionGroup('pipeline-books')
  .sort(field('rating').descending());
void pipelineFromCollectionGroup;

const pipelineFromDatabase = pipelineDb.pipeline().database({ rawOptions: { explain: true } });
void pipelineFromDatabase;

const pipelineFromDocs = pipelineDb
  .pipeline()
  .documents(['pipeline-books/book-a', 'pipeline-books/book-b'])
  .select('title');
void pipelineFromDocs;
const docRef = doc(collection(pipelineDb, 'pipeline-books'), 'book-a');

const pipelineFromDocsOptions = pipelineDb.pipeline().documents({
  docs: [docRef, 'pipeline-books/book-c'],
});

void pipelineFromDocsOptions;

const pipelineFromQuery = pipelineDb.pipeline().collection('pipeline-books');
void pipelineFromQuery;

const pipelineUnion = pipelineDb
  .pipeline()
  .collection('cities/sf/restaurants')
  .where(field('type').equal('Chinese'))
  .union(
    pipelineDb
      .pipeline()
      .collection('cities/ny/restaurants')
      .where(field('type').equal('Italian')),
  )
  .where(field('rating').greaterThanOrEqual(4.5))
  .sort(field('__name__').descending());
void pipelineUnion;

const pipelineWithTransforms = pipelineDb
  .pipeline()
  .collection('books')
  .where(
    pipelineOr(
      pipelineAnd(
        field('rating').greaterThan(4),
        lessThan(field('price'), constant(10)),
      ),
      field('genre').equal('Fantasy'),
    ),
  )
  .addFields(stringConcat(field('title'), ' by ', field('author')).as('fullTitle'))
  .removeFields('legacyField')
  .select(
    field('fullTitle'),
    field('rating').greaterThan(4).as('isTopRated'),
    arrayContainsAny(field('genre'), ['Fantasy', constant('Sci-Fi')]).as(
      'matchesGenre',
    ),
  )
  .sort(Ordering.of(field('rating')).descending(), field('__name__').ascending())
  .offset(1)
  .limit({ n: 10 });
void pipelineWithTransforms;

const pipelineAggregateDistinct = pipelineDb
  .pipeline()
  .collection('cities')
  .aggregate({
    accumulators: [
      countAll().as('total'),
      pipelineSum('population').as('populationTotal'),
      pipelineAverage('population').as('populationAvg'),
      maximum('population').as('populationMax'),
    ],
    groups: [
      field('country').as('country'),
      toLower(field('state')).as('normalizedState'),
    ],
  })
  .where(field('populationTotal').greaterThan(1000))
  .distinct(field('normalizedState'), 'country');
void pipelineAggregateDistinct;

const pipelineFindNearest = pipelineDb.pipeline().collection('cities').findNearest({
  field: 'embedding',
  vectorValue: [1.5, 2.345],
  distanceMeasure: 'COSINE',
  distanceField: 'computedDistance',
  limit: 10,
});
void pipelineFindNearest;

const pipelineSampleAndUnnest = pipelineDb
  .pipeline()
  .collection('users')
  .sample({ percentage: 0.5 })
  .unnest(field('scores').as('userScore'), 'attempt')
  .replaceWith(field('profile'));
void pipelineSampleAndUnnest;

execute(pipelineFromCollectionRef).then(snapshot => {
  console.log(snapshot.executionTime.toMillis());
  snapshot.results.forEach(result => {
    console.log(result.id);
    console.log(result?.ref?.path);
    console.log(result.data());
    console.log(result.get('rating'));
  });
});

execute({
  pipeline: pipelineWithTransforms,
  indexMode: 'recommended',
  rawOptions: { requestLabel: 'type-test' },
}).then(snapshot => {
  console.log(snapshot.results.length);
});

// ---------------------------------------------------------------------------
// PART 3b — PIPELINES: comprehensive expression and type coverage
// ---------------------------------------------------------------------------

// ----- Exported types: pin all to prevent regression -----
// Using a single tuple type alias touches every exported type at compile time.
type _AllPipelineTypes = [
  PipelineResult,
  PipelineSnapshot,
  Pipeline,
  PipelineSource<Pipeline>,
  BooleanExpression,
  Selectable,
  Field,
  Expression,
  FunctionExpression,
  AggregateFunction,
  ExpressionType,
  PipelineValueType,
  TimeGranularity,
  AliasedAggregate,
  AliasedExpression,
  StageOptions,
  AddFieldsStageOptions,
  AggregateStageOptions,
  CollectionGroupStageOptions,
  CollectionStageOptions,
  DatabaseStageOptions,
  DistinctStageOptions,
  DocumentsStageOptions,
  FindNearestStageOptions,
  LimitStageOptions,
  OffsetStageOptions,
  RemoveFieldsStageOptions,
  ReplaceWithStageOptions,
  SampleStageOptions,
  SelectStageOptions,
  SortStageOptions,
  UnionStageOptions,
  UnnestStageOptions,
  WhereStageOptions,
  PipelineExecuteOptions,
  OneOf<{ percentage: number; documents: number }>,
];
void (null as unknown as _AllPipelineTypes);

const xDb = getFirestore();

// ----- constant: all overloads -----
const _cNum: Expression = constant(42);
const _cStr: Expression = constant('hello');
const _cBool: BooleanExpression = constant(true);
const _cNull: Expression = constant(null);
const _cUnknown: Expression = constant({ nested: true });
void _cNum; void _cStr; void _cBool; void _cNull; void _cUnknown;

// ----- Comparison: standalone overloads -----
// greaterThan(Expression, Expression) | greaterThan(Expression, value)
void greaterThan(field('age'), field('minAge'));
void greaterThan(field('age'), constant(18));
// equal
void equal(field('status'), field('expected'));
void equal(field('status'), 'active');
// notEqual
void notEqual(field('status'), field('other'));
void notEqual(field('status'), 'deleted');
// greaterThanOrEqual
void greaterThanOrEqual(field('score'), field('threshold'));
void greaterThanOrEqual(field('score'), constant(50));
// lessThanOrEqual
void lessThanOrEqual(field('price'), field('maxPrice'));
void lessThanOrEqual(field('price'), constant(100));
// exists
void exists(field('optionalField'));
// arrayContains(Expression, Expression) | (Expression, value)
void arrayContains(field('tags'), field('targetTag'));
void arrayContains(field('tags'), 'sale');
// arrayContainsAll
void arrayContainsAll(field('tags'), ['a', 'b']);
void arrayContainsAll(field('tags'), [field('x'), 'y']);
// startsWith: (string, string) | (Expression, string) | (Expression, Expression)
void startsWith('title', 'The ');
void startsWith(field('title'), 'The ');
void startsWith(field('title'), field('prefix'));
// endsWith: (string, string) | (Expression, string) | (Expression, Expression)
void endsWith('title', 'ing');
void endsWith(field('title'), 'ing');
void endsWith(field('title'), field('suffix'));

// ----- Logical -----
// not
void not(field('isDeleted').equal(true));
// xor
void xor(field('a').equal(1), field('b').equal(2));
void xor(field('a').equal(1), field('b').equal(2), field('c').equal(3));
// equalAny: (Expression, Array) | (Expression, Expression) | (string, Array) | (string, Expression)
void equalAny(field('status'), ['active', 'pending']);
void equalAny(field('status'), field('allowedStatuses'));
void equalAny('status', ['active', 'pending']);
void equalAny('status', field('allowedStatuses'));
// notEqualAny
void notEqualAny(field('status'), ['deleted', 'banned']);
void notEqualAny(field('status'), field('blockedList'));
void notEqualAny('status', ['deleted', 'banned']);
void notEqualAny('status', field('blockedList'));

// ----- Existence / type checks -----
// isAbsent: (Expression) | (string)
void isAbsent(field('optionalField'));
void isAbsent('optionalField');
// isError
void isError(field('computedField'));
// isType: (string, Type) | (Expression, Type)
void isType(field('value'), 'string');
void isType('value', 'number');
// ifAbsent: (Expression, Expression) | (Expression, unknown) | (string, Expression)
void ifAbsent(field('optionalName'), field('defaultName'));
void ifAbsent(field('optionalName'), 'Unknown');
void ifAbsent('optionalName', field('defaultName'));
// ifError: (BooleanExpression, BooleanExpression) | (Expression, Expression) | (Expression, unknown)
void ifError(field('flag').equal(true), field('fallback').equal(false));
void ifError(field('riskScore'), field('defaultScore'));
void ifError(field('riskScore'), 0);
// conditional
void conditional(field('active').equal(true), field('price'), constant(0));

// ----- Ordering: standalone ascending / descending -----
void ascending(field('createdAt'));
void descending(field('score'));
void ascending('createdAt');
void descending('score');

// ----- Arithmetic -----
// add: (Expression, Expression | unknown) | (string, Expression | unknown)
void add(field('price'), field('tax'));
void add(field('price'), 5);
void add('price', field('tax'));
void add('price', 5);
// subtract: 4 overloads
void subtract(field('total'), field('discount'));
void subtract(field('total'), 10);
void subtract('total', field('discount'));
void subtract('total', 10);
// divide: 4 overloads
void divide(field('total'), field('count'));
void divide(field('total'), 2);
void divide('total', field('count'));
void divide('total', 2);
// multiply: (Expression, ...) | (string, ...)
void multiply(field('price'), field('qty'));
void multiply(field('price'), 1.2);
void multiply('price', field('qty'));
void multiply('price', 1.2);
// abs: (Expression) | (string)
void abs(field('balance'));
void abs('balance');
// ceil: (Expression) | (string)
void ceil(field('score'));
void ceil('score');
// floor: (Expression) | (string)
void floor(field('score'));
void floor('score');
// mod: 4 overloads
void mod(field('value'), field('divisor'));
void mod(field('value'), 3);
void mod('value', field('divisor'));
void mod('value', 3);
// round: (Expression) | (string) | (Expression, places) | (string, places) | (Expression, Expression)
void round(field('score'));
void round('score');
void round(field('score'), 2);
void round('score', 2);
void round(field('score'), field('precision'));
// sqrt: (Expression) | (string)
void sqrt(field('area'));
void sqrt('area');
// exp: (Expression) | (string)
void exp(field('x'));
void exp('x');
// ln: (Expression) | (string)
void ln(field('x'));
void ln('x');
// log: 4 overloads
void log(field('x'), 10);
void log(field('x'), field('base'));
void log('x', 10);
void log('x', field('base'));
// log10: (Expression) | (string)
void log10(field('x'));
void log10('x');
// pow: 4 overloads
void pow(field('base'), field('exp'));
void pow(field('base'), 2);
void pow('base', field('exp'));
void pow('base', 2);
// trunc: (Expression) | (string) | (Expression, places) | (string, places) | (Expression, Expression)
void trunc(field('score'));
void trunc('score');
void trunc(field('score'), 2);
void trunc('score', 2);
void trunc(field('score'), field('precision'));
// rand (no args)
void rand();
// logicalMaximum / logicalMinimum: (Expression, ...) | (string, ...)
void logicalMaximum(field('a'), field('b'), field('c'));
void logicalMaximum('a', 10, 20);
void logicalMinimum(field('a'), field('b'), field('c'));
void logicalMinimum('a', 10, 20);

// ----- Aggregate functions -----
// count: (Expression) | (string)
void pipelineCount(field('userId'));
void pipelineCount('userId');
// countDistinct: (Expression | string)
void countDistinct(field('category'));
void countDistinct('category');
// countIf: (BooleanExpression)
void countIf(field('active').equal(true));
// first: (Expression) | (string)
void first(field('rating'));
void first('rating');
// last: (Expression) | (string)
void last(field('rating'));
void last('rating');
// arrayAgg: (Expression) | (string)
void arrayAgg(field('tags'));
void arrayAgg('tags');
// arrayAggDistinct: (Expression) | (string)
void arrayAggDistinct(field('tags'));
void arrayAggDistinct('tags');
// minimum: (Expression) | (string)
void minimum(field('price'));
void minimum('price');

// ----- Document / collection expressions -----
// documentId: (string | DocumentReference) | (Expression)
void pipelineDocumentId(field('ref'));
void pipelineDocumentId('users/alice');
// collectionId: (string) | (Expression)
void collectionId(field('path'));
void collectionId('path');
// type: (string) | (Expression)
void pipelineType(field('value'));
void pipelineType('value');
// currentTimestamp (no args)
void currentTimestamp();

// ----- Array expressions -----
// array
void array([1, 2, 3]);
void array([field('a'), constant(2)]);
// arrayConcat: (Expression, ...) | (string, ...)
void arrayConcat(field('tags'), field('moreTags'));
void arrayConcat(field('tags'), ['extra']);
void arrayConcat('tags', field('moreTags'));
// arrayGet: 4 overloads
void arrayGet(field('items'), 0);
void arrayGet(field('items'), field('index'));
void arrayGet('items', 0);
void arrayGet('items', field('index'));
// arrayLength: (string) | (Expression)
void arrayLength(field('items'));
void arrayLength('items');
// arraySum: (string) | (Expression)
void arraySum(field('scores'));
void arraySum('scores');

// ----- Map expressions -----
// map
void map({ key: 'value', num: 42 });
void map({ title: field('title'), score: constant(1) });
// mapEntries: (string) | (Expression)
void mapEntries(field('metadata'));
void mapEntries('metadata');
// mapGet: (string, string) | (Expression, string)
void mapGet(field('metadata'), 'theme');
void mapGet('metadata', 'theme');
// mapKeys: (string) | (Expression)
void mapKeys(field('metadata'));
void mapKeys('metadata');
// mapMerge: (string, ...) | (Record | Expression, ...)
void mapMerge(field('meta1'), field('meta2'));
void mapMerge(field('meta1'), { extra: 'value' });
void mapMerge('meta1', field('meta2'));
// mapRemove: 4 overloads
void mapRemove(field('metadata'), 'key');
void mapRemove('metadata', 'key');
void mapRemove(field('metadata'), field('keyField'));
void mapRemove('metadata', field('keyField'));
// mapSet: (string, key, value) | (Expression, key, value)
void mapSet(field('metadata'), 'key', 'value');
void mapSet('metadata', 'key', 'value');
void mapSet(field('metadata'), field('keyField'), constant('v'));
// mapValues: (string) | (Expression)
void mapValues(field('metadata'));
void mapValues('metadata');

// ----- String expressions -----
// concat: (Expression, ...) | (string, ...)
void concat(field('first'), field('last'));
void concat(field('first'), ' ', field('last'));
void concat('first', ' ', constant('last'));
// toUpper: (string) | (Expression)
void toUpper(field('name'));
void toUpper('name');
// trim: (string, ?trim) | (Expression, ?trim)
void trim(field('name'));
void trim('name');
void trim(field('name'), ' ');
void trim('name', field('trimChar'));
// ltrim: (string, ?trim) | (Expression, ?trim)
void ltrim(field('name'));
void ltrim('name');
void ltrim(field('name'), ' ');
// rtrim: (string, ?trim) | (Expression, ?trim)
void rtrim(field('name'));
void rtrim('name');
void rtrim(field('name'), ' ');
// substring: 4 overloads (field+number, expression+number, field+expression, expression+expression) with optional length
void substring('name', 0);
void substring(field('name'), 0);
void substring('name', 0, 5);
void substring(field('name'), 0, 5);
void substring(field('name'), field('start'), field('len'));
// reverse: (Expression) | (string)
void reverse(field('name'));
void reverse('name');
// split: 4 overloads
void split('name', ',');
void split(field('name'), ',');
void split('name', field('delimiter'));
void split(field('name'), field('delimiter'));
// join: 4 overloads
void join('tags', ',');
void join(field('tags'), ',');
void join('tags', field('delimiter'));
void join(field('tags'), field('delimiter'));
// like: 4 overloads
void like('name', '%alice%');
void like(field('name'), '%alice%');
void like('name', field('pattern'));
void like(field('name'), field('pattern'));
// length: (string) | (Expression)
void length(field('name'));
void length('name');
// byteLength: (Expression) | (string)
void byteLength(field('data'));
void byteLength('data');
// charLength: (string) | (Expression)
void charLength(field('name'));
void charLength('name');
// stringContains: 4 overloads
void stringContains('name', 'alice');
void stringContains(field('name'), 'alice');
void stringContains('name', field('needle'));
void stringContains(field('name'), field('needle'));
// stringIndexOf: (string, ...) | (Expression, ...)
void stringIndexOf(field('email'), '@');
void stringIndexOf('email', '@');
// stringRepeat: (string, ...) | (Expression, ...)
void stringRepeat(field('sep'), 3);
void stringRepeat('sep', 3);
void stringRepeat(field('sep'), field('times'));
// stringReplaceAll: (string, ...) | (Expression, ...)
void stringReplaceAll('name', 'a', 'b');
void stringReplaceAll(field('name'), 'a', 'b');
// stringReplaceOne: (string, ...) | (Expression, ...)
void stringReplaceOne('name', 'a', 'b');
void stringReplaceOne(field('name'), 'a', 'b');
// stringReverse: (Expression) | (string)
void stringReverse(field('name'));
void stringReverse('name');
// regexContains: 4 overloads
void regexContains('name', '^alice');
void regexContains(field('name'), '^alice');
void regexContains('name', field('pattern'));
void regexContains(field('name'), field('pattern'));
// regexFind: 4 overloads
void regexFind('name', '\\d+');
void regexFind(field('name'), '\\d+');
void regexFind('name', field('pattern'));
void regexFind(field('name'), field('pattern'));
// regexFindAll: 4 overloads
void regexFindAll('name', '\\d+');
void regexFindAll(field('name'), '\\d+');
void regexFindAll('name', field('pattern'));
void regexFindAll(field('name'), field('pattern'));
// regexMatch: 4 overloads
void regexMatch('code', '^[A-Z]{3}');
void regexMatch(field('code'), '^[A-Z]{3}');
void regexMatch('code', field('pattern'));
void regexMatch(field('code'), field('pattern'));

// ----- Timestamp expressions -----
// timestampAdd: (Expression, unit, number) | (string, unit, number) | (Expression, Expression, Expression)
void timestampAdd(field('createdAt'), 'day', 7);
void timestampAdd('createdAt', 'day', 7);
void timestampAdd(field('createdAt'), field('unit'), field('amount'));
// timestampSubtract: same shapes
void timestampSubtract(field('expiry'), 'hour', 1);
void timestampSubtract('expiry', 'hour', 1);
void timestampSubtract(field('expiry'), field('unit'), field('amount'));
// timestampToUnixMicros: (Expression) | (string)
void timestampToUnixMicros(field('ts'));
void timestampToUnixMicros('ts');
// timestampToUnixMillis: (Expression) | (string)
void timestampToUnixMillis(field('ts'));
void timestampToUnixMillis('ts');
// timestampToUnixSeconds: (Expression) | (string)
void timestampToUnixSeconds(field('ts'));
void timestampToUnixSeconds('ts');
// timestampTruncate: (string, granularity) | (Expression, granularity) | with timezone | (Expression, Expression)
void timestampTruncate('ts', 'day');
void timestampTruncate(field('ts'), 'day');
void timestampTruncate('ts', 'day', 'UTC');
void timestampTruncate(field('ts'), 'month', field('tz'));
void timestampTruncate(field('ts'), field('granularity'));
// unixMicrosToTimestamp: (Expression) | (string)
void unixMicrosToTimestamp(field('micros'));
void unixMicrosToTimestamp('micros');
// unixMillisToTimestamp: (Expression) | (string)
void unixMillisToTimestamp(field('millis'));
void unixMillisToTimestamp('millis');
// unixSecondsToTimestamp: (Expression) | (string)
void unixSecondsToTimestamp(field('seconds'));
void unixSecondsToTimestamp('seconds');

// ----- Vector distance expressions -----
// cosineDistance: 4 overloads
void cosineDistance(field('embedding'), [1, 2, 3]);
void cosineDistance(field('embedding'), field('queryVec'));
void cosineDistance('embedding', [1, 2, 3]);
void cosineDistance('embedding', field('queryVec'));
// dotProduct: 4 overloads
void dotProduct(field('embedding'), [1, 2, 3]);
void dotProduct(field('embedding'), field('queryVec'));
void dotProduct('embedding', [1, 2, 3]);
void dotProduct('embedding', field('queryVec'));
// euclideanDistance: 4 overloads
void euclideanDistance(field('embedding'), [1, 2, 3]);
void euclideanDistance(field('embedding'), field('queryVec'));
void euclideanDistance('embedding', [1, 2, 3]);
void euclideanDistance('embedding', field('queryVec'));
// vectorLength: (Expression) | (string)
void vectorLength(field('embedding'));
void vectorLength('embedding');

// ----- pipelineResultEqual -----
execute(pipelineFromCollectionRef).then(snapshot => {
  const [r1, r2] = snapshot.results;
  if (r1 && r2) {
    const areEqual: boolean = pipelineResultEqual(r1, r2);
    void areEqual;
  }
});

// ---------------------------------------------------------------------------
// PART 3c — PIPELINES: integration pipelines exercising all groups together
// ---------------------------------------------------------------------------

// Comparison + logical operators in where / select
const pipelineComparisonOps = xDb
  .pipeline()
  .collection('products')
  .where(
    pipelineAnd(
      greaterThan(field('price'), constant(10)),
      lessThanOrEqual(field('stock'), constant(100)),
      notEqual(field('status'), 'discontinued'),
      exists(field('sku')),
      not(isAbsent(field('category'))),
      equalAny(field('region'), ['EU', 'US']),
      notEqualAny(field('tag'), ['spam', 'bot']),
    ),
  )
  .select(
    field('sku'),
    conditional(
      field('stock').greaterThan(0),
      constant('in-stock'),
      constant('out-of-stock'),
    ).as('availability'),
    isType(field('value'), 'string').as('isString'),
    logicalMaximum(field('bidA'), field('bidB')).as('topBid'),
    logicalMinimum(field('askA'), field('askB')).as('bottomAsk'),
  );
void pipelineComparisonOps;

// Arithmetic operators
const pipelineArithmetic = xDb
  .pipeline()
  .collection('orders')
  .addFields(
    add(field('subtotal'), field('tax')).as('total'),
    add('subtotal', 5).as('withFlatFee'),
    subtract(field('msrp'), field('salePrice')).as('savings'),
    subtract('msrp', 10).as('flatDiscount'),
    multiply(field('price'), field('qty')).as('lineTotal'),
    multiply('price', 1.2).as('withMarkup'),
    divide(field('revenue'), field('units')).as('revenuePerUnit'),
    divide('revenue', 100).as('revenueHundredths'),
    mod(field('id'), 10).as('shard'),
    mod('id', 3).as('bucket'),
    pow(field('rating'), 2).as('squaredRating'),
    pow('radius', 2).as('squaredRadius'),
    abs(field('balance')).as('absBalance'),
    abs('delta').as('absDelta'),
    ceil(field('rawScore')).as('ceiledScore'),
    ceil('rawPrice').as('ceiledPrice'),
    floor(field('rawScore')).as('flooredScore'),
    floor('rawPrice').as('flooredPrice'),
    round(field('score'), 2).as('roundedScore'),
    round('score', field('dp')).as('dynamicRound'),
    sqrt(field('area')).as('side'),
    sqrt('area').as('sideFromField'),
    trunc(field('value'), 2).as('truncValue'),
    trunc('value').as('truncValueNoDP'),
    exp(field('x')).as('expX'),
    ln(field('x')).as('lnX'),
    log(field('x'), 10).as('logX'),
    log10(field('x')).as('log10X'),
    rand().as('randomValue'),
  );
void pipelineArithmetic;

// String operators
const pipelineStringOps = xDb
  .pipeline()
  .collection('users')
  .where(
    pipelineAnd(
      startsWith(field('username'), 'admin'),
      endsWith('email', '.com'),
      stringContains(field('bio'), 'developer'),
      like('role', 'eng%'),
      regexContains(field('phone'), '^\\+1'),
      xor(
        field('isPublic').equal(true),
        field('isVerified').equal(true),
      ),
    ),
  )
  .addFields(
    toUpper(field('name')).as('upperName'),
    toUpper('name').as('upperName2'),
    trim(field('description')).as('trimmedDesc'),
    trim('rawText', ' ').as('trimmedRaw'),
    ltrim(field('rawText')).as('ltrimmed'),
    ltrim('rawText').as('ltrimmed2'),
    rtrim(field('rawText')).as('rtrimmed'),
    rtrim('rawText').as('rtrimmed2'),
    substring(field('bio'), 0, 100).as('shortBio'),
    substring('bio', 0, 100).as('shortBio2'),
    substring(field('bio'), field('start'), field('len')).as('dynamicSubstr'),
    reverse(field('code')).as('reversedCode'),
    reverse('code').as('reversedCode2'),
    split(field('csvField'), ',').as('values'),
    split('csvField', field('sep')).as('dynamicSplit'),
    length(field('name')).as('nameLength'),
    length('name').as('nameLength2'),
    byteLength(field('data')).as('byteLen'),
    byteLength('data').as('byteLen2'),
    charLength(field('name')).as('charLen'),
    charLength('name').as('charLen2'),
    stringConcat(field('firstName'), ' ', field('lastName')).as('fullName'),
    concat(field('a'), field('b'), field('c')).as('concatResult'),
    stringIndexOf(field('email'), '@').as('atIndex'),
    stringIndexOf('email', '@').as('atIndex2'),
    stringRepeat(field('sep'), 3).as('tripled'),
    stringRepeat('sep', field('n')).as('dynamicRepeat'),
    stringReplaceAll(field('text'), 'foo', 'bar').as('replaced'),
    stringReplaceAll('text', 'foo', 'bar').as('replaced2'),
    stringReplaceOne(field('text'), 'foo', 'bar').as('replacedOnce'),
    stringReplaceOne('text', 'foo', 'bar').as('replacedOnce2'),
    stringReverse(field('token')).as('reversedToken'),
    stringReverse('token').as('reversedToken2'),
    regexFind(field('text'), '\\d+').as('firstNumber'),
    regexFind('text', '\\d+').as('firstNumber2'),
    regexFindAll(field('text'), '\\d+').as('allNumbers'),
    regexFindAll('text', field('pattern')).as('allNumbers2'),
    regexMatch(field('code'), '^[A-Z]{3}$').as('isValidCode'),
    regexMatch('code', field('pattern')).as('isValidCode2'),
  );
void pipelineStringOps;

// Map operators
const pipelineMapOps = xDb
  .pipeline()
  .collection('docs')
  .addFields(
    map({ type: constant('doc'), version: constant(1) }).as('meta'),
    mapGet(field('settings'), 'theme').as('theme'),
    mapGet('settings', 'language').as('language'),
    mapKeys(field('metadata')).as('metaKeys'),
    mapKeys('metadata').as('metaKeys2'),
    mapValues(field('metadata')).as('metaValues'),
    mapValues('metadata').as('metaValues2'),
    mapEntries(field('config')).as('configEntries'),
    mapEntries('config').as('configEntries2'),
    mapSet(field('prefs'), 'updated', constant(true)).as('updatedPrefs'),
    mapSet('prefs', 'flag', true).as('updatedPrefs2'),
    mapRemove(field('prefs'), 'legacyKey').as('cleanedPrefs'),
    mapRemove('prefs', 'legacyKey').as('cleanedPrefs2'),
    mapRemove(field('prefs'), field('keyExpr')).as('cleanedPrefs3'),
    mapMerge(field('defaults'), field('overrides')).as('merged'),
    mapMerge(field('defaults'), { extra: constant('v') }).as('merged2'),
    mapMerge('defaults', field('overrides')).as('merged3'),
  );
void pipelineMapOps;

// Array operators
const pipelineArrayOps = xDb
  .pipeline()
  .collection('posts')
  .where(
    pipelineAnd(
      arrayContains(field('tags'), 'typescript'),
      arrayContainsAny(field('tags'), ['js', 'ts']),
      arrayContainsAll(field('permissions'), ['read', 'write']),
    ),
  )
  .addFields(
    array([constant(1), constant(2), constant(3)]).as('fixedArr'),
    arrayLength(field('comments')).as('commentCount'),
    arrayLength('comments').as('commentCount2'),
    arrayGet(field('items'), 0).as('firstItem'),
    arrayGet(field('items'), field('idx')).as('dynamicItem'),
    arrayGet('items', 0).as('firstItem2'),
    arrayConcat(field('primaryTags'), field('secondaryTags')).as('allTags'),
    arrayConcat('primaryTags', ['extra']).as('allTags2'),
    arraySum(field('scores')).as('totalScore'),
    arraySum('scores').as('totalScore2'),
  );
void pipelineArrayOps;

// Aggregate pipeline: all aggregate functions
const pipelineAllAggregates = xDb
  .pipeline()
  .collection('analytics')
  .aggregate({
    accumulators: [
      countAll().as('total'),
      pipelineCount(field('userId')).as('userCount'),
      pipelineCount('userId').as('userCountByField'),
      countDistinct(field('sessionId')).as('uniqueSessions'),
      countDistinct('sessionId').as('uniqueSessions2'),
      countIf(field('converted').equal(true)).as('conversions'),
      pipelineSum(field('revenue')).as('totalRevenue'),
      pipelineSum('revenue').as('totalRevenue2'),
      pipelineAverage(field('revenue')).as('avgRevenue'),
      pipelineAverage('revenue').as('avgRevenue2'),
      minimum(field('price')).as('minPrice'),
      minimum('price').as('minPrice2'),
      maximum(field('price')).as('maxPrice'),
      maximum('price').as('maxPrice2'),
      first(field('score')).as('firstScore'),
      first('score').as('firstScore2'),
      last(field('score')).as('lastScore'),
      last('score').as('lastScore2'),
      arrayAgg(field('tags')).as('allTagsAgg'),
      arrayAggDistinct(field('category')).as('distinctCategories'),
      arrayAggDistinct('category').as('distinctCategories2'),
    ],
    groups: [
      field('country').as('country'),
      toLower(field('state')).as('normalizedState'),
    ],
  });
void pipelineAllAggregates;

// Timestamp + document/collection metadata
const pipelineTimestampOps = xDb
  .pipeline()
  .collection('events')
  .addFields(
    currentTimestamp().as('processedAt'),
    timestampAdd(field('createdAt'), 'day', 30).as('expiresAt'),
    timestampAdd('createdAt', 'hour', 2).as('expiresAt2'),
    timestampAdd(field('ts'), field('unit'), field('amount')).as('dynamicAdd'),
    timestampSubtract(field('expiry'), 'hour', 1).as('previousUpdate'),
    timestampSubtract('expiry', 'minute', 30).as('previousUpdate2'),
    timestampSubtract(field('ts'), field('unit'), field('amount')).as('dynamicSub'),
    timestampToUnixMillis(field('eventTime')).as('eventTimeMs'),
    timestampToUnixMillis('eventTime').as('eventTimeMs2'),
    timestampToUnixSeconds(field('eventTime')).as('eventTimeSec'),
    timestampToUnixSeconds('eventTime').as('eventTimeSec2'),
    timestampToUnixMicros(field('preciseTime')).as('preciseTimeMicros'),
    timestampToUnixMicros('preciseTime').as('preciseTimeMicros2'),
    timestampTruncate(field('createdAt'), 'day').as('dayBucket'),
    timestampTruncate('updatedAt', 'month').as('monthBucket'),
    timestampTruncate(field('ts'), 'day', 'UTC').as('dayBucketUTC'),
    timestampTruncate(field('ts'), field('granularity')).as('dynamicTruncate'),
    unixMillisToTimestamp(field('epochMs')).as('fromEpochMs'),
    unixMillisToTimestamp('epochMs').as('fromEpochMs2'),
    unixSecondsToTimestamp(field('epochSec')).as('fromEpochSec'),
    unixSecondsToTimestamp('epochSec').as('fromEpochSec2'),
    unixMicrosToTimestamp(field('epochMicros')).as('fromEpochMicros'),
    unixMicrosToTimestamp('epochMicros').as('fromEpochMicros2'),
    pipelineType(field('value')).as('valueType'),
    pipelineType('value').as('valueType2'),
    collectionId(field('path')).as('collId'),
    collectionId('path').as('collId2'),
    pipelineDocumentId(field('ref')).as('docId'),
    pipelineDocumentId('users/alice').as('docId2'),
  );
void pipelineTimestampOps;

// Vector distance
const pipelineVectorOps = xDb
  .pipeline()
  .collection('embeddings')
  .addFields(
    cosineDistance(field('embedding'), [1.0, 0.5, 0.2]).as('cosDist'),
    cosineDistance('embedding', [1.0, 0.5, 0.2]).as('cosDist2'),
    cosineDistance(field('embedding'), field('queryVec')).as('cosDistExpr'),
    dotProduct(field('embedding'), [1.0, 0.5, 0.2]).as('dotDist'),
    dotProduct('embedding', [1.0, 0.5, 0.2]).as('dotDist2'),
    dotProduct(field('embedding'), field('queryVec')).as('dotDistExpr'),
    euclideanDistance(field('embedding'), [1.0, 0.5, 0.2]).as('euclidDist'),
    euclideanDistance('embedding', [1.0, 0.5, 0.2]).as('euclidDist2'),
    euclideanDistance(field('embedding'), field('queryVec')).as('euclidDistExpr'),
    vectorLength(field('embedding')).as('vecLen'),
    vectorLength('embedding').as('vecLen2'),
  );
void pipelineVectorOps;

// Sort with standalone ascending / descending
const pipelineSortStandalone = xDb
  .pipeline()
  .collection('items')
  .sort(ascending(field('createdAt')), descending(field('score')));
void pipelineSortStandalone;

// sort({ ordering: [...] }) overload
const pipelineSortOptions = xDb
  .pipeline()
  .collection('items')
  .sort({ ordering: [ascending(field('name')), descending('rating')] });
void pipelineSortOptions;

// Stage options types used as explicit annotations
const whereStageOpts: WhereStageOptions = { condition: field('active').equal(true) };
const selectStageOpts: SelectStageOptions = { selections: [field('name'), field('age')] };
const addFieldsStageOpts: AddFieldsStageOptions = { fields: [field('x').as('y')] };
const removeFieldsStageOpts: RemoveFieldsStageOptions = { fields: [field('legacyField'), 'old'] };
const sortStageOpts: SortStageOptions = {
  orderings: [ascending(field('name')), descending(field('score'))],
};
const limitStageOpts: LimitStageOptions = { limit: 10 };
const offsetStageOpts: OffsetStageOptions = { offset: 5 };
const aliasedAgg: AliasedAggregate = { aggregate: countAll(), alias: 'total' };
const aggregateStageOpts: AggregateStageOptions = {
  accumulators: [aliasedAgg],
  groups: [field('region').as('region')],
};
const distinctStageOpts: DistinctStageOptions = { groups: [field('country'), 'region'] };
const replaceWithStageOpts: ReplaceWithStageOptions = { map: field('profile') };
const sampleStageOpts: SampleStageOptions = { percentage: 0.1 };
const collectionStageOpts: CollectionStageOptions = { collection: 'users' };
const collectionGroupStageOpts: CollectionGroupStageOptions = { collectionId: 'orders' };
const databaseStageOpts: DatabaseStageOptions = { rawOptions: { explain: true } };
const documentsStageOpts: DocumentsStageOptions = { docs: ['users/alice', 'users/bob'] };
const findNearestStageOpts: FindNearestStageOptions = {
  field: 'embedding',
  vectorValue: [0.1, 0.2],
  distanceMeasure: 'cosine',
  distanceField: 'dist',
  limit: 5,
};
const unionStageOpts: UnionStageOptions = {
  other: xDb.pipeline().collection('backup'),
};
const unnestStageOpts: UnnestStageOptions = {
  selectable: field('scores').as('score'),
  indexField: 'idx',
};
const executeOpts: PipelineExecuteOptions = {
  pipeline: xDb.pipeline().collection('test'),
  indexMode: 'recommended',
};
void whereStageOpts;
void selectStageOpts;
void addFieldsStageOpts;
void removeFieldsStageOpts;
void sortStageOpts;
void limitStageOpts;
void offsetStageOpts;
void aggregateStageOpts;
void distinctStageOpts;
void replaceWithStageOpts;
void sampleStageOpts;
void collectionStageOpts;
void collectionGroupStageOpts;
void databaseStageOpts;
void documentsStageOpts;
void findNearestStageOpts;
void unionStageOpts;
void unnestStageOpts;
void executeOpts;
