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
  getDoc,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
  initializeFirestore,
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

// v8 compatibility helper functions
function modifyIgnoreUndefinedProperties(db, value) {
  // JS SDK settings can only be called once
  if (Platform.other) {
    db._settings.ignoreUndefinedProperties = value;
  } else {
    db.settings({ ignoreUndefinedProperties: value });
  }
}

// modular helper functions
function withTestDb(fn) {
  return fn(getFirestore());
}

async function withModifiedUndefinedPropertiesTestDb(fn) {
  const db = getFirestore();
  const previousValue = db._settings.ignoreUndefinedProperties;
  initializeFirestore(db.app, { ignoreUndefinedProperties: false });
  await fn(db);
  initializeFirestore(db.app, { ignoreUndefinedProperties: previousValue });
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
  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    before(function () {
      return wipe();
    });

    it('for collection references', function () {
      const firestore = firebase.firestore();
      const coll1a = firestore.collection('a');
      const coll1b = firestore.doc('a/b').parent;
      const coll2 = firestore.collection('c');

      coll1a.isEqual(coll1b).should.be.true();
      coll1a.isEqual(coll2).should.be.false();

      const coll1c = firestore.collection('a').withConverter({
        toFirestore: data => data,
        fromFirestore: snap => snap.data(),
      });
      coll1a.isEqual(coll1c).should.be.false();

      try {
        coll1a.isEqual(firestore.doc('a/b'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('expected a Query instance.');
        return Promise.resolve();
      }
    });

    it('for document references', function () {
      const firestore = firebase.firestore();
      const doc1a = firestore.doc('a/b');
      const doc1b = firestore.collection('a').doc('b');
      const doc2 = firestore.doc('a/c');

      doc1a.isEqual(doc1b).should.be.true();
      doc1a.isEqual(doc2).should.be.false();

      try {
        const doc1c = firestore.collection('a').withConverter({
          toFirestore: data => data,
          fromFirestore: snap => snap.data(),
        });
        doc1a.isEqual(doc1c);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('expected a DocumentReference instance.');
      }

      try {
        doc1a.isEqual(firestore.collection('a'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('expected a DocumentReference instance.');
      }
      return Promise.resolve();
    });

    it('for DocumentReference.withConverter()', async function () {
      const firestore = firebase.firestore();
      let docRef = firestore.doc(`${COLLECTION}/doc`);
      docRef = docRef.withConverter(postConverter);
      await docRef.set(new Post('post', 'author'));
      const postData = await docRef.get();
      const post = postData.data();
      post.should.not.be.undefined();
      post.byline().should.equal('post, by author');
    });

    it('for DocumentReference.withConverter(null) applies default converter', function () {
      const firestore = firebase.firestore();
      const coll = firestore
        .collection(COLLECTION)
        .withConverter(postConverter)
        .withConverter(null);
      try {
        return coll
          .doc('post1')
          .set(10)
          .then(() => Promise.reject(new Error('Did not throw an Error.')));
      } catch (error) {
        error.message.should.containEql(
          `firebase.firestore().doc().set(*) 'data' must be an object.`,
        );
        return Promise.resolve();
      }
    });

    it('for CollectionReference.withConverter()', async function () {
      const firestore = firebase.firestore();
      let coll = firestore.collection(COLLECTION);
      coll = coll.withConverter(postConverter);
      const docRef = await coll.add(new Post('post', 'author'));
      const postData = await docRef.get();
      const post = postData.data();
      post.should.not.be.undefined();
      post.byline().should.equal('post, by author');
    });

    it('for CollectionReference.withConverter(null) applies default converter', function () {
      const firestore = firebase.firestore();
      let docRef = firestore.doc(`${COLLECTION}/doc`);
      try {
        docRef = docRef.withConverter(postConverter).withConverter(null);
        return docRef.set(10).then(() => Promise.reject(new Error('Did not throw an Error.')));
      } catch (error) {
        error.message.should.containEql(
          `firebase.firestore().doc().set(*) 'data' must be an object.`,
        );
        return Promise.resolve();
      }
    });

    it('for Query.withConverter()', async function () {
      const firestore = firebase.firestore();
      const collRef = firestore.collection(COLLECTION);
      await collRef.add({ title: 'post', author: 'author' });
      let query1 = collRef.where('title', '==', 'post');
      query1 = query1.withConverter(postConverter);
      const result = await query1.get();
      result.docs[0].data().should.be.an.instanceOf(Post);
      result.docs[0].data().byline().should.equal('post, by author');
    });

    it('for Query.withConverter(null) applies default converter', async function () {
      const firestore = firebase.firestore();
      const collRef = firestore.collection(COLLECTION);
      await collRef.add({ title: 'post', author: 'author' });
      let query1 = collRef.where('title', '==', 'post');
      query1 = query1.withConverter(postConverter).withConverter(null);
      const result = await query1.get();
      result.docs[0].should.not.be.an.instanceOf(Post);
    });

    it('keeps the converter when calling parent() with a DocumentReference', function () {
      const db = firebase.firestore();
      const coll = db.doc('root/doc').withConverter(postConverter);
      const typedColl = coll.parent;
      typedColl.isEqual(db.collection('root').withConverter(postConverter)).should.be.true();
    });

    it('drops the converter when calling parent() with a CollectionReference', function () {
      const db = firebase.firestore();
      const coll = db.collection('root/doc/parent').withConverter(postConverter);
      const untypedDoc = coll.parent;
      untypedDoc.isEqual(db.doc('root/doc')).should.be.true();
    });

    it('checks converter when comparing with isEqual()', function () {
      const db = firebase.firestore();
      const postConverter2 = { ...postConverter };

      const postsCollection = db.collection('users/user1/posts').withConverter(postConverter);
      const postsCollection2 = db.collection('users/user1/posts').withConverter(postConverter2);
      postsCollection.isEqual(postsCollection2).should.be.false();

      const docRef = db.doc('some/doc').withConverter(postConverter);
      const docRef2 = db.doc('some/doc').withConverter(postConverter2);
      docRef.isEqual(docRef2).should.be.false();
    });

    it('requires the correct converter for Partial usage', async function () {
      const db = firebase.firestore();
      const previousValue = db._settings.ignoreUndefinedProperties;
      modifyIgnoreUndefinedProperties(db, false);

      const coll = db.collection('posts');
      const ref = coll.doc('post').withConverter(postConverter);
      const batch = db.batch();

      try {
        batch.set(ref, { title: 'olive' }, { merge: true });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Unsupported field value: undefined');
      }
      modifyIgnoreUndefinedProperties(db, previousValue);
      return Promise.resolve();
    });

    it('supports primitive types with valid converter', async function () {
      const firestore = firebase.firestore();
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

      const coll = firestore.collection(COLLECTION);
      const ref = coll.doc('number').withConverter(primitiveConverter);
      await ref.set(3);
      const result = await ref.get();
      result.data().should.equal(3);

      const ref2 = coll.doc('array').withConverter(arrayConverter);
      await ref2.set([1, 2, 3]);
      const result2 = await ref2.get();
      result2.data().should.deepEqual([1, 2, 3]);
    });

    it('supports partials with merge', async function () {
      const firestore = firebase.firestore();
      const coll = firestore.collection(COLLECTION);
      const ref = coll.doc('post').withConverter(postConverterMerge);
      await ref.set(new Post('walnut', 'author'));
      await ref.set(
        { title: 'olive', id: firebase.firestore.FieldValue.increment(2) },
        { merge: true },
      );
      const postDoc = await ref.get();
      postDoc.get('title').should.equal('olive');
      postDoc.get('author').should.equal('author');
    });

    it('supports partials with mergeFields', async function () {
      const firestore = firebase.firestore();
      const coll = firestore.collection(COLLECTION);
      const ref = coll.doc('post').withConverter(postConverterMerge);
      await ref.set(new Post('walnut', 'author'));
      await ref.set({ title: 'olive' }, { mergeFields: ['title'] });
      const postDoc = await ref.get();
      postDoc.get('title').should.equal('olive');
      postDoc.get('author').should.equal('author');
    });
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
