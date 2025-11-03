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
  Timestamp,
  FirestoreDataConverter,
  arrayUnion,
  WithFieldValue,
  DocumentReference,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  deleteField,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
  getFirestore,
  QuerySnapshot,
  DocumentSnapshot,
} from '.';

type DocumentData = FirebaseFirestoreTypes.DocumentData;

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
  next: (snapshot: DocumentSnapshot) => {
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
    next: (snapshot: DocumentSnapshot) => {
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
  (snapshot: QuerySnapshot) => {
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
    next: (snapshot: QuerySnapshot) => {
      console.log(snapshot.docs);
    },
    error: (error: { message: any }) => {
      console.log(error.message);
    },
    complete() {},
  },
);

function withTestDb(
  fn: (db: FirebaseFirestoreTypes.Module) => void | Promise<void>,
): Promise<void> {
  return Promise.resolve(fn(getFirestore()));
}

function withTestDoc(fn: (doc: DocumentReference) => void | Promise<void>): Promise<void> {
  return withTestDb(db => {
    return fn(doc(collection(db, 'test-collection')));
  });
}

function withTestDocAndInitialData(
  data: DocumentData,
  fn: (doc: DocumentReference<DocumentData>) => void | Promise<void>,
): Promise<void> {
  return withTestDb(async db => {
    const ref = doc(collection(db, 'test-collection'));
    await setDoc(ref, data);
    return fn(ref);
  });
}

/*** withConverter tests ***/
class TestObject {
  constructor(
    readonly outerString: string,
    readonly outerArr: string[],
    readonly nested: {
      innerNested: {
        innerNestedNum: number;
      };
      innerArr: number[];
      timestamp: Timestamp;
    },
  ) {}
}

const testConverter: FirestoreDataConverter<TestObject, TestObject> = {
  toFirestore(testObj: WithFieldValue<TestObject>) {
    return { ...testObj };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): TestObject {
    const data = snapshot.data();
    return new TestObject(data.outerString, data.outerArr, data.nested);
  },
};

const initialData = {
  outerString: 'foo',
  outerArr: [],
  nested: {
    innerNested: {
      innerNestedNum: 2,
    },
    innerArr: arrayUnion(2),
    timestamp: serverTimestamp(),
  },
};

// nested partial support
const testConverterMerge = {
  toFirestore(testObj: PartialWithFieldValue<TestObject>) {
    return { ...testObj };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): TestObject {
    const data = snapshot.data();
    return new TestObject(data.outerString, data.outerArr, data.nested);
  },
};

// supports FieldValues
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverterMerge);

  // Allow Field Values in nested partials.
  await setDoc(
    ref,
    {
      outerString: deleteField(),
      nested: {
        innerNested: {
          innerNestedNum: increment(1),
        },
        innerArr: arrayUnion(2),
        timestamp: serverTimestamp(),
      },
    },
    { merge: true },
  );

  // Allow setting FieldValue on entire object field.
  await setDoc(
    ref,
    {
      nested: deleteField(),
    },
    { merge: true },
  );
});

// validates types in outer and inner fields
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverterMerge);

  // Check top-level fields.
  await setDoc(
    ref,
    {
      // @ts-expect-error
      outerString: 3,
      // @ts-expect-error
      outerArr: null,
    },
    { merge: true },
  );

  // Check nested fields.
  await setDoc(
    ref,
    {
      nested: {
        innerNested: {
          // @ts-expect-error
          innerNestedNum: 'string',
        },
        // @ts-expect-error
        innerArr: null,
      },
    },
    { merge: true },
  );
  await setDoc(
    ref,
    {
      // @ts-expect-error
      nested: 3,
    },
    { merge: true },
  );
});

// checks for nonexistent properties
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverterMerge);
  // Top-level property.
  await setDoc(
    ref,
    {
      // @ts-expect-error
      nonexistent: 'foo',
    },
    { merge: true },
  );

  // Nested property
  await setDoc(
    ref,
    {
      nested: {
        // @ts-expect-error
        nonexistent: 'foo',
      },
    },
    { merge: true },
  );
});

// allows omitting fields
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverterMerge);

  // Omit outer fields
  await setDoc(
    ref,
    {
      outerString: deleteField(),
      nested: {
        innerNested: {
          innerNestedNum: increment(1),
        },
        innerArr: arrayUnion(2),
        timestamp: serverTimestamp(),
      },
    },
    { merge: true },
  );

  // Omit inner fields
  await setDoc(
    ref,
    {
      outerString: deleteField(),
      outerArr: [],
      nested: {
        innerNested: {
          innerNestedNum: increment(1),
        },
        timestamp: serverTimestamp(),
      },
    },
    { merge: true },
  );
});

// WithFieldValue
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverter);

  // Allow Field Values and nested partials.
  await setDoc(ref, {
    outerString: 'foo',
    outerArr: [],
    nested: {
      innerNested: {
        innerNestedNum: increment(1),
      },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });
});

// requires all outer fields to be present
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverter);

  // Allow Field Values and nested partials.
  // @ts-expect-error
  await setDoc(ref, {
    outerArr: [],
    nested: {
      innerNested: {
        innerNestedNum: increment(1),
      },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });
});

// requires all nested fields to be present
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverter);

  await setDoc(ref, {
    outerString: 'foo',
    outerArr: [],
    // @ts-expect-error
    nested: {
      innerNested: {
        innerNestedNum: increment(1),
      },
      timestamp: serverTimestamp(),
    },
  });
});

// validates inner and outer fields
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverter);

  await setDoc(ref, {
    outerString: 'foo',
    // @ts-expect-error
    outerArr: 2,
    nested: {
      innerNested: {
        // @ts-expect-error
        innerNestedNum: 'string',
      },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });
});

// checks for nonexistent properties
withTestDoc(async doc => {
  const ref = doc.withConverter(testConverter);

  // Top-level nonexistent fields should error
  await setDoc(ref, {
    outerString: 'foo',
    // @ts-expect-error
    outerNum: 3,
    outerArr: [],
    nested: {
      innerNested: {
        innerNestedNum: 2,
      },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });

  // Nested nonexistent fields should error
  await setDoc(ref, {
    outerString: 'foo',
    outerNum: 3,
    outerArr: [],
    nested: {
      innerNested: {
        // @ts-expect-error
        nonexistent: 'string',
        innerNestedNum: 2,
      },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });
});

// allows certain types but not others
withTestDoc(async () => {
  const withTryCatch = async (fn: () => Promise<void>): Promise<void> => {
    try {
      await fn();
    } catch {}
  };

  // These tests exist to establish which object types are allowed to be
  // passed in by default when `T = DocumentData`. Some objects extend
  // the JavaScript `{}`, which is why they're allowed whereas others
  // throw an error.
  return withTestDoc(async doc => {
    // @ts-expect-error
    await withTryCatch(() => setDoc(doc, 1));
    // @ts-expect-error
    await withTryCatch(() => setDoc(doc, 'foo'));
    // @ts-expect-error
    await withTryCatch(() => setDoc(doc, false));
    await withTryCatch(() => setDoc(doc, undefined));
    await withTryCatch(() => setDoc(doc, null));
    await withTryCatch(() => setDoc(doc, [0]));
    await withTryCatch(() => setDoc(doc, new Set<string>()));
    await withTryCatch(() => setDoc(doc, new Map<string, number>()));
  });
});

// used as a type
class ObjectWrapper<T> {
  withFieldValueT(value: WithFieldValue<T>): WithFieldValue<T> {
    return value;
  }

  withPartialFieldValueT(value: PartialWithFieldValue<T>): PartialWithFieldValue<T> {
    return value;
  }

  // Wrapper to avoid having Firebase types in non-Firebase code.
  withT(value: T): void {
    this.withFieldValueT(value);
  }

  // Wrapper to avoid having Firebase types in non-Firebase code.
  withPartialT(value: Partial<T>): void {
    this.withPartialFieldValueT(value);
  }
}

// supports passing in the object as `T`
interface Foo {
  id: string;
  foo: number;
}
const foo = new ObjectWrapper<Foo>();
foo.withFieldValueT({ id: '', foo: increment(1) });
foo.withPartialFieldValueT({ foo: increment(1) });
foo.withT({ id: '', foo: 1 });
foo.withPartialT({ foo: 1 });

// does not allow primitive types to use FieldValue
type Bar = number;
const bar = new ObjectWrapper<Bar>();
// @ts-expect-error
bar.withFieldValueT(increment(1));
// @ts-expect-error
bar.withPartialFieldValueT(increment(1));

// UpdateData
withTestDocAndInitialData(initialData, async docRef => {
  await updateDoc(docRef.withConverter(testConverter), {
    outerString: deleteField(),
    nested: {
      innerNested: {
        innerNestedNum: increment(2),
      },
      innerArr: arrayUnion(3),
    },
  });
});

// validates inner and outer fields
withTestDocAndInitialData(initialData, async docRef => {
  await updateDoc(docRef.withConverter(testConverter), {
    // @ts-expect-error
    outerString: 3,
    nested: {
      innerNested: {
        // @ts-expect-error
        innerNestedNum: 'string',
      },
      // @ts-expect-error
      innerArr: 2,
    },
  });
});

// supports string-separated fields
withTestDocAndInitialData(initialData, async docRef => {
  const testDocRef = docRef.withConverter(testConverter);
  await updateDoc(testDocRef, {
    // @ts-expect-error
    outerString: 3,
    // @ts-expect-error
    'nested.innerNested.innerNestedNum': 'string',
    // @ts-expect-error
    'nested.innerArr': 3,
    'nested.timestamp': serverTimestamp(),
  });

  // String comprehension works in nested fields.
  await updateDoc(testDocRef, {
    nested: {
      innerNested: {
        // @ts-expect-error
        innerNestedNum: 'string',
      },
      // @ts-expect-error
      innerArr: 3,
    },
  });
});

// supports optional fields
interface TestObjectOptional {
  optionalStr?: string;
  nested?: {
    requiredStr: string;
  };
}

const testConverterOptional = {
  toFirestore(testObj: WithFieldValue<TestObjectOptional>) {
    return { ...testObj };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): TestObjectOptional {
    const data = snapshot.data();
    return {
      optionalStr: data.optionalStr,
      nested: data.nested,
    };
  },
};

withTestDocAndInitialData(initialData, async docRef => {
  const testDocRef: DocumentReference<TestObjectOptional> =
    docRef.withConverter(testConverterOptional);

  await updateDoc(testDocRef, {
    optionalStr: 'foo',
  });
  await updateDoc(testDocRef, {
    optionalStr: 'foo',
  });

  await updateDoc(testDocRef, {
    nested: {
      requiredStr: 'foo',
    },
  });
  await updateDoc(testDocRef, {
    'nested.requiredStr': 'foo',
  });
});

// supports null fields
interface TestObjectOptional2 {
  optionalStr?: string;
  nested?: {
    strOrNull: string | null;
  };
}

const testConverterOptional2 = {
  toFirestore(testObj: WithFieldValue<TestObjectOptional2>) {
    return { ...testObj };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): TestObjectOptional2 {
    const data = snapshot.data();
    return {
      optionalStr: data.optionalStr,
      nested: data.nested,
    };
  },
};

withTestDocAndInitialData(initialData, async docRef => {
  const testDocRef: DocumentReference<TestObjectOptional2> =
    docRef.withConverter(testConverterOptional2);

  await updateDoc(testDocRef, {
    nested: {
      strOrNull: null,
    },
  });
  await updateDoc(testDocRef, {
    'nested.strOrNull': null,
  });
});

// supports union fields
interface TestObjectUnion {
  optionalStr?: string;
  nested?:
    | {
        requiredStr: string;
      }
    | { requiredNumber: number };
}

const testConverterUnion: FirestoreDataConverter<TestObjectUnion, TestObjectUnion> = {
  toFirestore(testObj: WithFieldValue<TestObjectUnion>) {
    return { ...testObj };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): TestObjectUnion {
    const data = snapshot.data();
    return {
      optionalStr: data.optionalStr,
      nested: data.nested,
    };
  },
};

withTestDocAndInitialData(initialData, async docRef => {
  const testDocRef = docRef.withConverter(testConverterUnion);

  await updateDoc(testDocRef, {
    nested: {
      requiredStr: 'foo',
    },
  });

  await updateDoc(testDocRef, {
    'nested.requiredStr': 'foo',
  });
  await updateDoc(testDocRef, {
    // @ts-expect-error
    'nested.requiredStr': 1,
  });

  await updateDoc(testDocRef, {
    'nested.requiredNumber': 1,
  });

  await updateDoc(testDocRef, {
    // @ts-expect-error
    'nested.requiredNumber': 'foo',
  });
  await updateDoc(testDocRef, {
    // @ts-expect-error
    'nested.requiredNumber': null,
  });
});

// checks for nonexistent fields
withTestDocAndInitialData(initialData, async docRef => {
  const testDocRef = docRef.withConverter(testConverter);

  // Top-level fields.
  await updateDoc(testDocRef, {
    // @ts-expect-error
    nonexistent: 'foo',
  });

  // Nested Fields.
  await updateDoc(testDocRef, {
    nested: {
      // @ts-expect-error
      nonexistent: 'foo',
    },
  });

  // String fields.
  await updateDoc(testDocRef, {
    // @ts-expect-error
    nonexistent: 'foo',
  });
  await updateDoc(testDocRef, {
    // @ts-expect-error
    'nested.nonexistent': 'foo',
  });
});

// methods
// addDoc()
withTestDb(async db => {
  const ref = collection(db, 'testobj').withConverter(testConverter);

  // Requires all fields to be present
  // @ts-expect-error
  await addDoc(ref, {
    outerArr: [],
    nested: {
      innerNested: {
        innerNestedNum: 2,
      },
      innerArr: [],
      timestamp: serverTimestamp(),
    },
  });
});

// WriteBatch.set()
withTestDb(async db => {
  const ref = doc(collection(db, 'testobj')).withConverter(testConverter);
  const batch = writeBatch(db);

  // Requires full object if {merge: true} is not set.
  // @ts-expect-error
  batch.set(ref, {
    outerArr: [],
    nested: {
      innerNested: {
        innerNestedNum: increment(1),
      },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });

  batch.set(
    ref,
    {
      outerArr: [],
      nested: {
        innerNested: {
          innerNestedNum: increment(1),
        },
        innerArr: arrayUnion(2),
        timestamp: serverTimestamp(),
      },
    },
    { merge: true },
  );
});

// WriteBatch.update()
withTestDb(async db => {
  const ref = doc(collection(db, 'testobj')).withConverter(testConverter);
  const batch = writeBatch(db);

  batch.update(ref, {
    outerArr: [],
    nested: {
      'innerNested.innerNestedNum': increment(1),
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });
});

// Transaction.set()
withTestDb(async db => {
  const ref = doc(collection(db, 'testobj')).withConverter(testConverter);

  return runTransaction(db, async tx => {
    // Requires full object if {merge: true} is not set.
    // @ts-expect-error
    tx.set(ref, {
      outerArr: [],
      nested: {
        innerNested: {
          innerNestedNum: increment(1),
        },
        innerArr: arrayUnion(2),
        timestamp: serverTimestamp(),
      },
    });

    tx.set(
      ref,
      {
        outerArr: [],
        nested: {
          innerNested: {
            innerNestedNum: increment(1),
          },
          innerArr: arrayUnion(2),
          timestamp: serverTimestamp(),
        },
      },
      { merge: true },
    );
  });
});

// Transaction.update()
withTestDb(async db => {
  const ref = doc(collection(db, 'testobj')).withConverter(testConverter);
  await setDoc(ref, {
    outerString: 'foo',
    outerArr: [],
    nested: {
      innerNested: {
        innerNestedNum: 2,
      },
      innerArr: arrayUnion(2),
      timestamp: serverTimestamp(),
    },
  });

  return runTransaction(db, async tx => {
    tx.update(ref, {
      outerArr: [],
      nested: {
        innerNested: {
          innerNestedNum: increment(1),
        },
        innerArr: arrayUnion(2),
        timestamp: serverTimestamp(),
      },
    });
  });
});
