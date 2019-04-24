const {
  COL_DOC_1,
  DOC_2_PATH,
  COL_DOC_1_ID,
  COL_DOC_1_PATH,
  TEST_COLLECTION_NAME,
  TEST_COLLECTION_NAME_DYNAMIC,
  testCollection,
  cleanCollection,
  testCollectionDoc,
  resetTestCollectionDoc,
} = TestHelpers.firestore;

function getCollectionReferenceClass() {
  return jet.require('src/modules/firestore/CollectionReference');
}

function getDocumentReferenceClass() {
  return jet.require('src/modules/firestore/DocumentReference');
}

function getDocumentSnapshotClass() {
  return jet.require('src/modules/firestore/DocumentSnapshot');
}

function getPathClass() {
  return jet.require('src/modules/firestore/Path');
}

describe('firestore()', () => {
  describe('CollectionReference', () => {
    before(() => resetTestCollectionDoc(COL_DOC_1_PATH, COL_DOC_1()));

    it('get id()', () => {
      const Path = getPathClass();
      const firestore = firebase.firestore();
      const CollectionReference = getCollectionReferenceClass();

      const reference = new CollectionReference(firestore, new Path(['tests']));
      reference.should.be.instanceOf(CollectionReference);
      reference.id.should.equal('tests');
    });

    it('get firestore()', () => {
      const Path = getPathClass();
      const firestore = firebase.firestore();
      const CollectionReference = getCollectionReferenceClass();

      const reference = new CollectionReference(firestore, new Path(['tests']));
      reference.should.be.instanceOf(CollectionReference);
      reference.firestore.should.equal(firestore);
    });

    it('get parent()', () => {
      const Path = getPathClass();
      const firestore = firebase.firestore();
      const CollectionReference = getCollectionReferenceClass();
      const DocumentReference = getDocumentReferenceClass();

      const reference = new CollectionReference(firestore, new Path(['tests']));
      reference.should.be.instanceOf(CollectionReference);
      should.equal(reference.parent, null);

      const reference2 = new CollectionReference(
        firestore,
        new Path(['tests', 'someDoc', 'someChildCollection'])
      );
      reference2.should.be.instanceOf(CollectionReference);
      should.notEqual(reference2.parent, null);
      reference2.parent.should.be.an.instanceOf(DocumentReference);
    });

    describe('add()', () => {
      it('should create a Document', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);

        const docRef = await collection.add({
          first: 'Ada',
          last: 'Lovelace',
          born: 1815,
        });

        const doc = await firebase
          .firestore()
          .doc(docRef.path)
          .get();

        doc.data().first.should.equal('Ada');

        await firebase
          .firestore()
          .doc(docRef.path)
          .delete();
      });
    });

    describe('isEqual()', () => {
      it(`returns true if two CollectionReference's are for the same location`, () => {
        const ref1 = firebase.firestore().collection('foo');
        const ref2 = firebase.firestore().collection('foo');
        should.equal(ref1.isEqual(ref2), true);
      });

      it(`returns false if two CollectionReference's are for different paths`, () => {
        const ref1 = firebase.firestore().collection('foo');
        const ref2 = firebase.firestore().collection('bar');
        should.equal(ref1.isEqual(ref2), false);
      });

      it(`throws if arg is not an instance of CollectionReference`, () => {
        const ref1 = firebase.firestore().collection('foo');
        const maybeRef2 = 'nope';
        try {
          ref1.isEqual(maybeRef2);
          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          error.message.should.containEql(
            'expects an instance of CollectionReference'
          );
          return Promise.resolve();
        }
      });
    });

    describe('doc()', () => {
      it('should create DocumentReference with correct path', async () => {
        const docRef = await testCollectionDoc(COL_DOC_1_PATH);
        should.equal(docRef.path, COL_DOC_1_PATH);
      });

      it('should error when supplied an incorrect path', () => {
        (() => {
          firebase
            .firestore()
            .collection('collection')
            .doc('invalid/doc');
        }).should.throw('Argument "documentPath" must point to a document.');
      });
    });

    describe('get()', () => {
      it('should retrieve all documents on a collection', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const DocumentSnapshot = getDocumentSnapshotClass();

        const querySnapshot = await collection.get();

        // should.equal(querySnapshot.size >= 1, true);

        querySnapshot.forEach(documentSnapshot => {
          documentSnapshot.should.be.instanceOf(DocumentSnapshot);
        });
      });

      it('should support GetOptions source=`default`', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const querySnapshot = await collection.get({ source: 'default' });
        // should.equal(querySnapshot.size >= 1, true);
        querySnapshot.metadata.should.be.an.Object();
        should.equal(querySnapshot.metadata.fromCache, false);
      });

      it('should support GetOptions source=`server`', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const querySnapshot = await collection.get({ source: 'server' });
        // should.equal(querySnapshot.size >= 1, true);
        querySnapshot.metadata.should.be.an.Object();
        should.equal(querySnapshot.metadata.fromCache, false);
      });

      // TODO: Investigate why this isn't returning `fromCache=true`
      xit('should support GetOptions source=`cache`', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const querySnapshot = await collection.get({ source: 'cache' });
        // should.equal(querySnapshot.size >= 1, true);
        querySnapshot.metadata.should.be.an.Object();
        should.equal(querySnapshot.metadata.fromCache, true);
      });

      it('should error with invalid GetOptions source option', async () => {
        const collectionRef = testCollection(TEST_COLLECTION_NAME);
        try {
          await collectionRef.get(() => {});
          return Promise.reject(
            new Error('get() did not reject with invalid argument.')
          );
        } catch (e) {
          // do nothing
        }
        try {
          await collectionRef.get({ source: 'invalid' });
          return Promise.reject(
            new Error('get() did not reject with invalid source property.')
          );
        } catch (e) {
          // do nothing
        }
        
        return Promise.resolve();
      });
    });
  });
});
