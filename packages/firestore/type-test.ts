import firebase, {
  FirebaseFirestoreTypes,
  addDoc,
  collection,
  collectionGroup,
  doc,
  endAt,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  onSnapshot,
  query,
  startAfter,
  updateDoc,
  where,
} from '.';

console.log(firebase().collection);

// checks module exists at root
console.log(firebase.firestore().app.name);

// checks module exists at app level
console.log(firebase.app().firestore().app.name);
console.log(firebase.app().firestore().collection('foo'));

// checks statics exist
console.log(firebase.firestore.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebase.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.firestore(firebase.app()).app.name);
console.log(firebase.firestore(firebase.app('foo')).app.name);

console.log(firebase.firestore.Blob);
console.log(firebase.firestore.FieldPath);
console.log(firebase.firestore.FieldValue);
console.log(firebase.firestore.GeoPoint);
console.log(firebase.firestore.Timestamp);
console.log(firebase.firestore.CACHE_SIZE_UNLIMITED);
firebase.firestore.setLogLevel('debug');

firebase.firestore().collection('foo');
firebase.firestore().collection('foo').doc('foo').collection('foo');
firebase.firestore().collection('foo').doc('foo');
firebase.firestore().collection('foo').where('foo', '==', 'bar');
firebase.firestore().collection('foo').doc('foo').collection('foo').add({ foo: 'bar' }).then();
firebase.firestore().collection('foo').doc('foo').update({ foo: 'bar' }).then();
firebase
  .firestore()
  .collectionGroup('foo')
  .endAt(123)
  .startAfter(123)
  .get({ source: 'cache' })
  .then();
firebase
  .firestore()
  .collection('foo')
  .doc('foo')
  .onSnapshot(() => {});
firebase
  .firestore()
  .collection('foo')
  .doc('foo')
  .onSnapshot({
    next: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
      console.log(snapshot.get('foo'));
    },
    error: (error: { message: any }) => {
      console.log(error.message);
    },
  });
firebase
  .firestore()
  .collection('foo')
  .doc('foo')
  .onSnapshot(
    {
      includeMetadataChanges: true,
    },
    {
      next: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
        console.log(snapshot.get('foo'));
      },
      error: (error: { message: any }) => {
        console.log(error.message);
      },
      complete() {},
    },
  );
firebase
  .firestore()
  .collection('foo')
  .doc('foo')
  .onSnapshot(
    (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
      console.log(snapshot.get('foo'));
    },
    (error: { message: any }) => {
      console.log(error.message);
    },
    () => {},
  );
firebase
  .firestore()
  .collection('foo')
  .onSnapshot(
    {
      includeMetadataChanges: true,
    },
    {
      next: (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        console.log(snapshot.docs);
      },
      error: (error: { message: any }) => {
        console.log(error.message);
      },
      complete() {},
    },
  );

collection(firebase.firestore(), 'foo');
collection(firebase.firestore(), 'foo', 'foo', 'foo');
collection(doc(collection(firebase.firestore(), 'foo'), 'foo'), 'foo');
doc(firebase.firestore(), 'foo', 'foo');
doc(collection(firebase.firestore(), 'foo'), 'foo');
query(collection(firebase.firestore(), 'foo'), where('foo', '==', 'bar'));
addDoc(collection(firebase.firestore(), 'foo'), { foo: 'bar' }).then();
updateDoc(doc(firebase.firestore(), 'foo', 'foo'), { foo: 'bar' }).then();
getDoc(doc(firebase.firestore(), 'foo', 'foo')).then();
getDocFromCache(doc(firebase.firestore(), 'foo', 'foo')).then();
getDocFromServer(doc(firebase.firestore(), 'foo', 'foo')).then();
getDocs(query(collectionGroup(firebase.firestore(), 'foo'), endAt(123), startAfter(123))).then();
getDocsFromCache(
  query(collectionGroup(firebase.firestore(), 'foo'), endAt(123), startAfter(123)),
).then();
getDocsFromServer(
  query(collectionGroup(firebase.firestore(), 'foo'), endAt(123), startAfter(123)),
).then();
onSnapshot(doc(firebase.firestore(), 'foo', 'foo'), () => {});
onSnapshot(doc(firebase.firestore(), 'foo', 'foo'), {
  next: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
    console.log(snapshot.get('foo'));
  },
  error: (error: { message: any }) => {
    console.log(error.message);
  },
});
onSnapshot(
  doc(firebase.firestore(), 'foo', 'foo'),
  {
    includeMetadataChanges: true,
  },
  {
    next: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot) => {
      console.log(snapshot.get('foo'));
    },
    error: (error: { message: any }) => {
      console.log(error.message);
    },
    complete() {},
  },
);
onSnapshot(
  collection(firebase.firestore(), 'foo'),
  (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
    console.log(snapshot.docs);
  },
  (error: { message: any }) => {
    console.log(error.message);
  },
  () => {},
);
onSnapshot(
  collection(firebase.firestore(), 'foo'),
  {
    includeMetadataChanges: true,
  },
  {
    next: (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      console.log(snapshot.docs);
    },
    error: (error: { message: any }) => {
      console.log(error.message);
    },
    complete() {},
  },
);
