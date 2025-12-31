import firestore, {
  firebase,
  FirebaseFirestoreTypes,
  getFirestore,
  connectFirestoreEmulator,
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
  initializeFirestore,
  setLogLevel,
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
} from '.';

console.log(firestore().app);

// checks module exists at root
console.log(firebase.firestore().app.name);
console.log(firebase.firestore().collection('foo'));

// checks module exists at app level
console.log(firebase.app().firestore().app.name);
console.log(firebase.app().firestore().collection('foo'));

// checks statics exist
console.log(firebase.firestore.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firestore.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.firestore(firebase.app()).app.name);
console.log(firebase.firestore(firebase.app('foo')).app.name);

// checks default export supports app arg
console.log(firestore(firebase.app()).app.name);

// checks statics
console.log(firebase.firestore.Blob);
console.log(firebase.firestore.FieldPath);
console.log(firebase.firestore.FieldValue);
console.log(firebase.firestore.GeoPoint);
console.log(firebase.firestore.Timestamp);
console.log(firebase.firestore.CACHE_SIZE_UNLIMITED);
firebase.firestore.setLogLevel('debug');

// checks Module instance APIs
const firestoreInstance = firebase.firestore();
console.log(firestoreInstance.collection('foo'));
console.log(firestoreInstance.collection('foo').doc('foo'));
console.log(firestoreInstance.collection('foo').doc('foo').collection('foo'));
console.log(firestoreInstance.collectionGroup('foo'));
console.log(firestoreInstance.batch());

const testCollection = firestoreInstance.collection('foo');
const testDoc = testCollection.doc('bar');
const testQuery = testCollection.where('name', '==', 'test');

testDoc.set({ foo: 'bar' }).then(() => {
  console.log('Set complete');
});

testDoc.update({ foo: 'bar' }).then(() => {
  console.log('Update complete');
});

testCollection.add({ foo: 'bar' }).then((ref: FirebaseFirestoreTypes.DocumentReference) => {
  console.log(ref.id);
});

testDoc.get({ source: 'cache' }).then((snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
  console.log(snapshot.exists());
  console.log(snapshot.data());
});

testQuery.get({ source: 'server' }).then((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snapshot.docs);
});

testDoc.onSnapshot((snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
  console.log(snapshot.data());
});

testDoc.onSnapshot(
  {
    includeMetadataChanges: true,
  },
  (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
    console.log(snapshot.data());
  },
);

testDoc.onSnapshot({
  next: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
    console.log(snapshot.data());
  },
  error: (error: Error) => {
    console.log(error.message);
  },
});

testQuery.onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snapshot.docs);
});

testQuery.onSnapshot(
  {
    includeMetadataChanges: true,
  },
  {
    next: (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      console.log(snapshot.docs);
    },
    error: (error: Error) => {
      console.log(error.message);
    },
  },
);

// checks modular API functions
const firestoreModular1 = getFirestore();
console.log(firestoreModular1.app.name);

const firestoreModular2 = getFirestore(firebase.app());
console.log(firestoreModular2.app.name);

const firestoreModular3 = getFirestore(firebase.app(), 'test-db');
console.log(firestoreModular3.app.name);

connectFirestoreEmulator(firestoreInstance, 'localhost', 8080, {
  mockUserToken: { user_id: 'test' },
});

const modularCollection = collection(firestoreInstance, 'users');
const modularDoc = doc(firestoreInstance, 'users', 'test');
const modularDoc2 = doc(modularCollection, 'test');
console.log(collection(modularDoc, 'subcollection'));
console.log(collectionGroup(firestoreInstance, 'users'));

console.log(refEqual(modularDoc, modularDoc2));

setDoc(modularDoc, { name: 'test' }).then(() => {
  console.log('Set complete');
});

setDoc(
  modularDoc,
  { name: 'test' },
  {
    merge: true,
  },
).then(() => {
  console.log('Set with merge complete');
});

updateDoc(modularDoc, { name: 'updated' }).then(() => {
  console.log('Update complete');
});

updateDoc(modularDoc, 'name', 'updated', 'age', 30).then(() => {
  console.log('Update with field path complete');
});

addDoc(modularCollection, { name: 'test' }).then(
  (ref: FirebaseFirestoreTypes.DocumentReference) => {
    console.log(ref.id);
  },
);

enableNetwork(firestoreInstance).then(() => {
  console.log('Network enabled');
});

disableNetwork(firestoreInstance).then(() => {
  console.log('Network disabled');
});

clearPersistence(firestoreInstance).then(() => {
  console.log('Persistence cleared');
});

clearIndexedDbPersistence(firestoreInstance).then(() => {
  console.log('IndexedDB persistence cleared');
});

terminate(firestoreInstance).then(() => {
  console.log('Terminated');
});

waitForPendingWrites(firestoreInstance).then(() => {
  console.log('Pending writes complete');
});

initializeFirestore(firebase.app(), {
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
}).then((fs: FirebaseFirestoreTypes.Module) => {
  console.log(fs.app.name);
});

setLogLevel('debug');

runTransaction(firestoreInstance, async (transaction: FirebaseFirestoreTypes.Transaction) => {
  const docRef = doc(firestoreInstance, 'users', 'test');
  const docSnap = await transaction.get(docRef);
  if (docSnap.exists()) {
    transaction.update(docRef, { count: (docSnap.data()?.count || 0) + 1 });
  }
  return 'success';
}).then((result: string) => {
  console.log(result);
});

const testQuery2 = query(modularCollection, where('name', '==', 'test'));
const testQuery3 = query(modularCollection, orderBy('age', 'desc'), limit(10));
console.log(
  query(
    modularCollection,
    where('age', '>', 18),
    or(where('status', '==', 'active'), where('status', '==', 'pending')),
  ),
);
console.log(
  query(
    modularCollection,
    and(where('age', '>', 18), where('status', '==', 'active')),
    orderBy('name'),
    startAt('A'),
    startAfter('B'),
    endAt('Z'),
    endBefore('Y'),
    limitToLast(5),
  ),
);

getCountFromServer(testQuery2).then(
  (
    snapshot: FirebaseFirestoreTypes.AggregateQuerySnapshot<{
      count: FirebaseFirestoreTypes.AggregateField<number>;
    }>,
  ) => {
    console.log(snapshot.data().count);
  },
);

getAggregateFromServer(testQuery2, {
  totalAge: sum('age'),
  avgAge: average('age'),
  count: count(),
}).then(
  (
    snapshot: FirebaseFirestoreTypes.AggregateQuerySnapshot<{
      totalAge: FirebaseFirestoreTypes.AggregateField<number>;
      avgAge: FirebaseFirestoreTypes.AggregateField<number | null>;
      count: FirebaseFirestoreTypes.AggregateField<number>;
    }>,
  ) => {
    console.log(snapshot.data());
  },
);

getDoc(modularDoc).then(snapshot => {
  console.log(snapshot.data());
});

getDocFromCache(modularDoc).then(snapshot => {
  console.log(snapshot.data());
});

getDocFromServer(modularDoc).then(snapshot => {
  console.log(snapshot.data());
});

getDocs(testQuery2).then((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snapshot.docs);
});

getDocsFromCache(testQuery2).then((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snapshot.docs);
});

getDocsFromServer(testQuery2).then((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snapshot.docs);
});

deleteDoc(modularDoc).then(() => {
  console.log('Delete complete');
});

const unsubscribe1 = onSnapshot(modularDoc, snapshot => {
  console.log(snapshot.data());
});

const unsubscribe2 = onSnapshot(
  modularDoc,
  {
    includeMetadataChanges: true,
  },
  snapshot => {
    console.log(snapshot.data());
  },
);

const unsubscribe3 = onSnapshot(modularDoc, {
  next: snapshot => {
    console.log(snapshot.data());
  },
  error: (error: Error) => {
    console.log(error.message);
  },
});

const unsubscribe4 = onSnapshot(
  modularDoc,
  {
    includeMetadataChanges: true,
  },
  {
    next: snapshot => {
      console.log(snapshot.data());
    },
    error: (error: Error) => {
      console.log(error.message);
    },
  },
);

const unsubscribe5 = onSnapshot(testQuery2, (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
  console.log(snapshot.docs);
});

const unsubscribe6 = onSnapshot(
  testQuery2,
  {
    includeMetadataChanges: true,
  },
  {
    next: (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      console.log(snapshot.docs);
    },
    error: (error: Error) => {
      console.log(error.message);
    },
  },
);

unsubscribe1();
unsubscribe2();
unsubscribe3();
unsubscribe4();
unsubscribe5();
unsubscribe6();

getDoc(modularDoc).then(docSnap1 => {
  getDoc(modularDoc).then(docSnap2 => {
    console.log(snapshotEqual(docSnap1, docSnap2));
  });
});

getDocs(testQuery2).then((querySnap1: FirebaseFirestoreTypes.QuerySnapshot) => {
  getDocs(testQuery2).then((querySnap2: FirebaseFirestoreTypes.QuerySnapshot) => {
    console.log(snapshotEqual(querySnap1, querySnap2));
  });
});

console.log(queryEqual(testQuery2, testQuery3));

const unsubscribeSync = onSnapshotsInSync(firestoreInstance, () => {
  console.log('Snapshots in sync');
});

const unsubscribeSync2 = onSnapshotsInSync(firestoreInstance, {
  next: () => {
    console.log('Snapshots in sync');
  },
  error: (error: Error) => {
    console.log(error.message);
  },
});

unsubscribeSync();
unsubscribeSync2();

// FieldValue functions
const deleteFieldValue = deleteField();
const serverTimestampValue = serverTimestamp();
const arrayUnionValue = arrayUnion('item1', 'item2');
const arrayRemoveValue = arrayRemove('item1', 'item2');
const incrementValue = increment(5);

setDoc(modularDoc, {
  name: 'test',
  deletedField: deleteFieldValue,
  timestamp: serverTimestampValue,
  tags: arrayUnionValue,
  removedTags: arrayRemoveValue,
  count: incrementValue,
}).then(() => {
  console.log('Set with FieldValues complete');
});

// FieldPath
const fieldPath = new FieldPath('user', 'profile', 'name');
const documentIdPath = documentId();

console.log(query(modularCollection, where(documentIdPath, '==', 'test')));
console.log(query(modularCollection, orderBy(fieldPath)));

// Bytes
const bytes1 = Bytes.fromBase64String('dGVzdA==');
const bytes2 = Bytes.fromUint8Array(new Uint8Array([1, 2, 3]));
console.log(bytes1.toBase64());
console.log(bytes2.toUint8Array());
console.log(bytes1.isEqual(bytes2));

// GeoPoint
const geoPoint1 = new GeoPoint(37.7749, -122.4194);
const geoPoint2 = new GeoPoint(40.7128, -74.006);
console.log(geoPoint1.latitude);
console.log(geoPoint1.longitude);
console.log(geoPoint1.isEqual(geoPoint2));
console.log(geoPoint1.toJSON());

// Timestamp
const timestamp1 = Timestamp.now();
const timestamp2 = Timestamp.fromDate(new Date());
console.log(Timestamp.fromMillis(Date.now()));
console.log(timestamp1.seconds);
console.log(timestamp1.nanoseconds);
console.log(timestamp1.toDate());
console.log(timestamp1.toMillis());
console.log(timestamp1.isEqual(timestamp2));
console.log(timestamp1.toJSON());
console.log(timestamp1.toString());

// VectorValue
const v1 = vector([3.14159]);
const v2 = vector([1.618]);
const v3 = VectorValue.fromJSON(v2.toJSON());
console.log(v1.toArray());
console.log(v2.toJSON());
console.log(v2.isEqual(v1));
console.log(v3.isEqual(v2));

// Aggregate functions
const sumField = sum('age');
const avgField = average('age');
const countField = count();

getAggregateFromServer(testQuery2, {
  totalAge: sumField,
  avgAge: avgField,
  count: countField,
}).then(
  (
    snapshot: FirebaseFirestoreTypes.AggregateQuerySnapshot<{
      totalAge: FirebaseFirestoreTypes.AggregateField<number>;
      avgAge: FirebaseFirestoreTypes.AggregateField<number | null>;
      count: FirebaseFirestoreTypes.AggregateField<number>;
    }>,
  ) => {
    console.log(snapshot.data());
  },
);

// Bundle and named queries
loadBundle(firestoreInstance, 'bundle-data').then(
  (progress: FirebaseFirestoreTypes.LoadBundleTaskProgress) => {
    console.log(progress);
  },
);

namedQuery(firestoreInstance, 'test-query').then((q: FirebaseFirestoreTypes.Query | null) => {
  if (q) {
    console.log(q);
  }
});

// WriteBatch
const batch = writeBatch(firestoreInstance);
batch.set(modularDoc, { name: 'test' });
batch.update(modularDoc, { age: 30 });
batch.delete(modularDoc);
batch.commit().then(() => {
  console.log('Batch committed');
});

// PersistentCacheIndexManager
const indexManager = getPersistentCacheIndexManager(firestoreInstance);
if (indexManager) {
  enablePersistentCacheIndexAutoCreation(indexManager).then(() => {
    console.log('Auto creation enabled');
  });

  disablePersistentCacheIndexAutoCreation(indexManager).then(() => {
    console.log('Auto creation disabled');
  });

  deleteAllPersistentCacheIndexes(indexManager).then(() => {
    console.log('All indexes deleted');
  });
}
