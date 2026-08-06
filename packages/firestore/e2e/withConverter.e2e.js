/*
 * Copyright (c) 2021-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
const COLLECTION = 'firestore';
const { wipe } = require('./helpers');

const {
  getFirestore,
  doc,
  collection,
  refEqual,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
  initializeFirestore,
  serverTimestamp,
  Timestamp,
} = firestoreModular;

// Used for testing the FirestoreDataConverter.
class Post {
  constructor(title, author, id = 1) {
    this.title = title;
    this.author = author;
    this.id = id;
  }
  byline() {
    return this.title + ', by ' + this.author;
  }
}

const postConverter = {
  toFirestore(post) {
    return { title: post.title, author: post.author };
  },
  fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Post(data.title, data.author);
  },
};

const postConverterMerge = {
  toFirestore(post, options) {
    if (
      options &&
      ((options && options.merge === true) ||
        (options && Array.isArray(options.mergeFields) && options.mergeFields.length > 0))
    ) {
      post.should.not.be.an.instanceof(Post);
    } else {
      post.should.be.an.instanceof(Post);
    }
    const result = {};
    if (post.title) {
      result.title = post.title;
    }
    if (post.author) {
      result.author = post.author;
    }
    return result;
  },
  fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Post(data.title, data.author);
  },
};

// modular helper functions
function withTestDb(fn) {
  return fn(getFirestore());
}

async function withModifiedUndefinedPropertiesTestDb(fn) {
  const db = getFirestore();
  // Capture/restore via public initializeFirestore → settings(); avoid mutating _settings.
  const previousValue = db._settings.ignoreUndefinedProperties;
  initializeFirestore(db.app, { ignoreUndefinedProperties: false });
  try {
    await fn(db);
  } finally {
    initializeFirestore(db.app, { ignoreUndefinedProperties: previousValue });
  }
}

function withTestCollection(fn) {
  return withTestDb(db => fn(collection(db, COLLECTION)));
}
function withTestDoc(fn) {
  return withTestDb(db => fn(doc(db, `${COLLECTION}/doc`)));
}

function withTestCollectionAndInitialData(data, fn) {
  return withTestDb(async db => {
    const coll = collection(db, COLLECTION);
    for (const element of data) {
      const ref = doc(coll);
      await setDoc(ref, element);
    }
    return fn(coll);
  });
}

describe('firestore.withConverter', function () {
  before(function () {
    return wipe();
  });

  describe('modular', function () {
    before(function () {
      return wipe();
    });

    it('for collection references', function () {
      return withTestDb(firestore => {
        const coll1a = collection(firestore, 'a');
        const coll1b = doc(firestore, 'a/b').parent;
        const coll2 = collection(firestore, 'c');

        refEqual(coll1a, coll1b).should.be.true();
        refEqual(coll1a, coll2).should.be.false();

        const coll1c = collection(firestore, 'a').withConverter({
          toFirestore: data => data,
          fromFirestore: snap => snap.data(),
        });
        refEqual(coll1a, coll1c).should.be.false();

        try {
          refEqual(coll1a, doc(firestore, 'a/b'));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('expected a Query instance.');
          return Promise.resolve();
        }
      });
    });

    it('for document references', function () {
      return withTestDb(firestore => {
        const doc1a = doc(firestore, 'a/b');
        const doc1b = doc(collection(firestore, 'a'), 'b');
        const doc2 = doc(firestore, 'a/c');

        refEqual(doc1a, doc1b).should.be.true();
        refEqual(doc1a, doc2).should.be.false();

        try {
          const doc1c = collection(firestore, 'a').withConverter({
            toFirestore: data => data,
            fromFirestore: snap => snap.data(),
          });
          refEqual(doc1a, doc1c);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('expected a DocumentReference instance.');
        }

        try {
          refEqual(doc1a, collection(firestore, 'a'));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('expected a DocumentReference instance.');
        }
        return Promise.resolve();
      });
    });

    it('for DocumentReference.withConverter()', function () {
      return withTestDoc(async docRef => {
        docRef = docRef.withConverter(postConverter);
        await setDoc(docRef, new Post('post', 'author'));
        const postData = await getDoc(docRef);
        const post = postData.data();
        post.should.not.be.undefined();
        post.byline().should.equal('post, by author');
      });
    });

    it('for DocumentReference.withConverter(null) applies default converter', function () {
      return withTestCollection(async coll => {
        coll = coll.withConverter(postConverter).withConverter(null);
        try {
          await setDoc(doc(coll, 'post1'), 10);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            `firebase.firestore().doc().set(*) 'data' must be an object.`,
          );
          return Promise.resolve();
        }
      });
    });

    it('for CollectionReference.withConverter()', function () {
      return withTestCollection(async coll => {
        coll = coll.withConverter(postConverter);
        const docRef = await addDoc(coll, new Post('post', 'author'));
        const postData = await getDoc(docRef);
        const post = postData.data();
        post.should.not.be.undefined();
        post.byline().should.equal('post, by author');
      });
    });

    it('for CollectionReference.withConverter(null) applies default converter', function () {
      return withTestDoc(async doc => {
        try {
          doc = doc.withConverter(postConverter).withConverter(null);
          await setDoc(doc, 10);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            `firebase.firestore().doc().set(*) 'data' must be an object.`,
          );
          return Promise.resolve();
        }
      });
    });

    it('for Query.withConverter()', function () {
      return withTestCollectionAndInitialData(
        [{ title: 'post', author: 'author' }],
        async collRef => {
          let query1 = query(collRef, where('title', '==', 'post'));
          query1 = query1.withConverter(postConverter);
          const result = await getDocs(query1);
          result.docs[0].data().should.be.an.instanceOf(Post);
          result.docs[0].data().byline().should.equal('post, by author');
        },
      );
    });

    it('for Query.withConverter(null) applies default converter', function () {
      return withTestCollectionAndInitialData(
        [{ title: 'post', author: 'author' }],
        async collRef => {
          let query1 = query(collRef, where('title', '==', 'post'));
          query1 = query1.withConverter(postConverter).withConverter(null);
          const result = await getDocs(query1);
          result.docs[0].should.not.be.an.instanceOf(Post);
        },
      );
    });

    it('keeps the converter when calling parent() with a DocumentReference', function () {
      return withTestDb(async db => {
        const coll = doc(db, 'root/doc').withConverter(postConverter);
        const typedColl = coll.parent;
        refEqual(typedColl, collection(db, 'root').withConverter(postConverter)).should.be.true();
      });
    });

    it('drops the converter when calling parent() with a CollectionReference', function () {
      return withTestDb(async db => {
        const coll = collection(db, 'root/doc/parent').withConverter(postConverter);
        const untypedDoc = coll.parent;
        refEqual(untypedDoc, doc(db, 'root/doc')).should.be.true();
      });
    });

    it('checks converter when comparing with isEqual()', function () {
      return withTestDb(async db => {
        const postConverter2 = { ...postConverter };

        const postsCollection = collection(db, 'users/user1/posts').withConverter(postConverter);
        const postsCollection2 = collection(db, 'users/user1/posts').withConverter(postConverter2);
        refEqual(postsCollection, postsCollection2).should.be.false();

        const docRef = doc(db, 'some/doc').withConverter(postConverter);
        const docRef2 = doc(db, 'some/doc').withConverter(postConverter2);
        refEqual(docRef, docRef2).should.be.false();
      });
    });

    it('requires the correct converter for Partial usage', async function () {
      return withModifiedUndefinedPropertiesTestDb(async db => {
        const coll = collection(db, 'posts');
        const ref = doc(coll, 'post').withConverter(postConverter);
        const batch = writeBatch(db);

        try {
          batch.set(ref, { title: 'olive' }, { merge: true });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('Unsupported field value: undefined');
        }
        return Promise.resolve();
      });
    });

    it('supports primitive types with valid converter', function () {
      const primitiveConverter = {
        toFirestore(value) {
          return { value };
        },
        fromFirestore(snapshot) {
          const data = snapshot.data();
          return data.value;
        },
      };

      const arrayConverter = {
        toFirestore(value) {
          return { values: value };
        },
        fromFirestore(snapshot) {
          const data = snapshot.data();
          return data.values;
        },
      };

      return withTestCollection(async coll => {
        const ref = doc(coll, 'number').withConverter(primitiveConverter);
        await setDoc(ref, 3);
        const result = await getDoc(ref);
        result.data().should.equal(3);

        const ref2 = doc(coll, 'array').withConverter(arrayConverter);
        await setDoc(ref2, [1, 2, 3]);
        const result2 = await getDoc(ref2);
        result2.data().should.deepEqual([1, 2, 3]);
      });
    });

    it('passes data() serverTimestamps options through converter snapshots', async function () {
      if (Platform.other) {
        // macOS uses the Firestore web lite path, which does not support snapshot listeners.
        return;
      }

      const timestampCases = [
        { serverTimestamps: 'estimate', expectTimestamp: true },
        { serverTimestamps: 'previous', expectTimestamp: false },
        { serverTimestamps: 'none', expectTimestamp: false },
      ];

      for (const { serverTimestamps, expectTimestamp } of timestampCases) {
        const timestampConverter = {
          toFirestore() {
            return {
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
          },
          fromFirestore(snapshot) {
            return snapshot.data({ serverTimestamps });
          },
        };

        await withTestCollection(async coll => {
          const ref = doc(coll).withConverter(timestampConverter);
          await new Promise((resolve, reject) => {
            const unsubscribe = onSnapshot(
              ref,
              { includeMetadataChanges: true },
              snapshot => {
                try {
                  if (!snapshot.exists() || !snapshot.metadata.hasPendingWrites) {
                    return;
                  }

                  const data = snapshot.data();
                  if (expectTimestamp) {
                    data.createdAt.should.be.an.instanceOf(Timestamp);
                    data.updatedAt.should.be.an.instanceOf(Timestamp);
                  } else {
                    should.equal(data.createdAt, null);
                    should.equal(data.updatedAt, null);
                  }
                  unsubscribe();
                  resolve();
                } catch (error) {
                  unsubscribe();
                  reject(error);
                }
              },
              reject,
            );

            setDoc(ref, {}).catch(error => {
              unsubscribe();
              reject(error);
            });
          });
        });
      }
    });

    it("returns the prior settled value for serverTimestamps: 'previous' on an updated document", async function () {
      if (Platform.other) {
        // macOS uses the Firestore web lite path, which does not support snapshot listeners.
        return;
      }

      return withTestCollection(async coll => {
        const ref = doc(coll, 'previous-on-update');

        // 1. Create the document and wait for the initial write to settle (hasPendingWrites
        //    becomes false) so we have a real, resolved server Timestamp to compare against.
        const settledTimestamp = await new Promise((resolve, reject) => {
          const unsubscribe = onSnapshot(
            ref,
            { includeMetadataChanges: true },
            snapshot => {
              try {
                if (!snapshot.exists() || snapshot.metadata.hasPendingWrites) {
                  return;
                }

                const value = snapshot.data().timestampField;
                unsubscribe();
                resolve(value);
              } catch (error) {
                unsubscribe();
                reject(error);
              }
            },
            reject,
          );

          setDoc(ref, { timestampField: serverTimestamp() }).catch(error => {
            unsubscribe();
            reject(error);
          });
        });

        settledTimestamp.should.be.an.instanceOf(Timestamp);

        // 2. Update the same field with a brand new serverTimestamp() call, creating a new
        //    pending write, and assert that serverTimestamps: 'previous' returns the original
        //    settled value (real "previous value" semantics), not null and not the new pending
        //    write's value, while the write is still pending.
        await new Promise((resolve, reject) => {
          const unsubscribe = onSnapshot(
            ref,
            { includeMetadataChanges: true },
            snapshot => {
              try {
                if (!snapshot.exists() || !snapshot.metadata.hasPendingWrites) {
                  return;
                }

                const previousValue = snapshot.data({
                  serverTimestamps: 'previous',
                }).timestampField;
                previousValue.should.be.an.instanceOf(Timestamp);
                previousValue.isEqual(settledTimestamp).should.equal(true);
                unsubscribe();
                resolve();
              } catch (error) {
                unsubscribe();
                reject(error);
              }
            },
            reject,
          );

          updateDoc(ref, { timestampField: serverTimestamp() }).catch(error => {
            unsubscribe();
            reject(error);
          });
        });
      });
    });

    it('supports partials with merge', async function () {
      return withTestCollection(async coll => {
        const ref = doc(coll, 'post').withConverter(postConverterMerge);
        await setDoc(ref, new Post('walnut', 'author'));
        await setDoc(ref, { title: 'olive', id: increment(2) }, { merge: true });
        const postDoc = await getDoc(ref);
        postDoc.get('title').should.equal('olive');
        postDoc.get('author').should.equal('author');
      });
    });

    it('supports partials with mergeFields', async function () {
      return withTestCollection(async coll => {
        const ref = doc(coll, 'post').withConverter(postConverterMerge);
        await setDoc(ref, new Post('walnut', 'author'));
        await setDoc(ref, { title: 'olive' }, { mergeFields: ['title'] });
        const postDoc = await getDoc(ref);
        postDoc.get('title').should.equal('olive');
        postDoc.get('author').should.equal('author');
      });
    });
  });
});
