import { expectType } from 'tsd';
import firebase, {
  collection,
  doc,
  FirebaseFirestoreTypes,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '.';

export const tests = [
  async () => {
    type DocShape = { name: string; age: number; createdAt: Timestamp };
    const usersCollection = collection<DocShape>(firebase(), 'collectionName');
    expectType<FirebaseFirestoreTypes.CollectionReference<DocShape>>(usersCollection);
    const userDoc = doc(usersCollection, 'doc-id');
    expectType<FirebaseFirestoreTypes.DocumentReference<DocShape>>(userDoc);
    const snapshot = await getDoc(userDoc);
    expectType<FirebaseFirestoreTypes.DocumentSnapshot<DocShape>>(snapshot);
    expectType<DocShape | undefined>(snapshot.data());

    updateDoc(userDoc, { age: 20, createdAt: serverTimestamp() });
    updateDoc(userDoc, { age: increment(1), createdAt: serverTimestamp() });

    setDoc(userDoc, {
      name: 'hi',
      age: 30,
      createdAt: Timestamp.fromDate(new Date()),
    });

    const q = query(usersCollection, where('not-typed-intentionally', '==', 'CA'));
    onSnapshot(q, s => {
      for (const doc of s.docs) {
        expectType<DocShape>(doc.data());
      }
    });

    onSnapshot(q, {
      next: s => {
        for (const doc of s.docs) {
          expectType<DocShape>(doc.data());
        }
      },
      error: e => {
        expectType<Error>(e);
      },
    });

    usersCollection.where('age', '>', 18).onSnapshot(s => {
      for (const doc of s.docs) {
        expectType<DocShape>(doc.data());
      }
    });

    where('a', '!=', 3);
    where('a', '<', 3);
    where('a', '<=', 3);
    where('a', '==', 3);
    where('a', '>', 3);
    where('a', '>=', 3);
    where('a', 'array-contains', 3);
    where('a', 'array-contains-any', 3);
    where('a', 'in', 3);
    where('a', 'not-in', 3);
  },
];
