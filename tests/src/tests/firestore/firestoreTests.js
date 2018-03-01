import should from 'should';

function firestoreTests({ describe, it, context, firebase }) {
  describe('firestore()', () => {
    context('collection()', () => {
      it('should create CollectionReference with the right id', () =>
        new Promise(resolve => {
          const collectionRef = firebase.native
            .firestore()
            .collection('collection1/doc1/collection2');
          should.equal(collectionRef.id, 'collection2');
          resolve();
        }));

      it('should error if invalid collection path supplied', () => {
        (() => {
          firebase.native.firestore().collection('collection1/doc1');
        }).should.throw(
          'Argument "collectionPath" must point to a collection.'
        );
      });
    });

    context('doc()', () => {
      it('should create DocumentReference with correct path', () =>
        new Promise(resolve => {
          const docRef = firebase.native
            .firestore()
            .doc('collection1/doc1/collection2/doc2');
          should.equal(docRef.path, 'collection1/doc1/collection2/doc2');
          resolve();
        }));

      it('should error if invalid document path supplied', () => {
        (() => {
          firebase.native.firestore().doc('collection1');
        }).should.throw('Argument "documentPath" must point to a document.');
      });
    });

    context('batch()', () => {
      it('should create / update / delete as expected', () => {
        const ayRef = firebase.native
          .firestore()
          .collection('firestore-tests')
          .doc('AY');
        const lRef = firebase.native
          .firestore()
          .collection('firestore-tests')
          .doc('LON');
        const nycRef = firebase.native
          .firestore()
          .collection('firestore-tests')
          .doc('NYC');
        const sfRef = firebase.native
          .firestore()
          .collection('firestore-tests')
          .doc('SF');

        return firebase.native
          .firestore()
          .batch()
          .set(ayRef, { name: 'Aylesbury' })
          .set(lRef, { name: 'London' })
          .set(nycRef, { name: 'New York City' })
          .set(sfRef, { name: 'San Francisco' })
          .update(nycRef, { population: 1000000 })
          .update(sfRef, 'name', 'San Fran')
          .update(
            sfRef,
            new firebase.native.firestore.FieldPath('name'),
            'San Fran FieldPath'
          )
          .update(
            sfRef,
            new firebase.native.firestore.FieldPath('nested', 'name'),
            'Nested Nme'
          )
          .update(
            sfRef,
            new firebase.native.firestore.FieldPath('nested', 'firstname'),
            'First Name',
            new firebase.native.firestore.FieldPath('nested', 'lastname'),
            'Last Name'
          )
          .set(lRef, { population: 3000000 }, { merge: true })
          .delete(ayRef)
          .commit()
          .then(async () => {
            const ayDoc = await ayRef.get();
            should.equal(ayDoc.exists, false);

            const lDoc = await lRef.get();
            lDoc.data().name.should.equal('London');
            lDoc.data().population.should.equal(3000000);

            const nycDoc = await nycRef.get();
            nycDoc.data().name.should.equal('New York City');
            nycDoc.data().population.should.equal(1000000);

            const sfDoc = await sfRef.get();
            sfDoc.data().name.should.equal('San Fran FieldPath');
            sfDoc.data().nested.firstname.should.equal('First Name');
            sfDoc.data().nested.lastname.should.equal('Last Name');
          });
      });

      it('errors when invalid parameters supplied', async () => {
        const ref = firebase.native.firestore().doc('collection/doc');
        const batch = firebase.native.firestore().batch();
        (() => {
          batch.update(ref, 'error');
        }).should.throw(
          'WriteBatch.update failed: If using two arguments, the second must be an object.'
        );
        (() => {
          batch.update(ref, 'error1', 'error2', 'error3');
        }).should.throw(
          'WriteBatch.update failed: Must have a document reference, followed by either a single object argument, or equal numbers of key/value pairs.'
        );
        (() => {
          batch.update(ref, 0, 'error');
        }).should.throw(
          'WriteBatch.update failed: Argument at index 0 must be a string or FieldPath'
        );
      });
    });

    context('enablePersistence()', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.firestore().enablePersistence();
        }).should.throw(
          'Persistence is enabled by default on the Firestore SDKs'
        );
      });
    });

    context('setLogLevel()', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.firestore().setLogLevel();
        }).should.throw(
          'firebase.firestore().setLogLevel() is unsupported by the native Firebase SDKs.'
        );
      });
    });

    context('settings()', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.firestore().settings();
        }).should.throw('firebase.firestore().settings() coming soon');
      });
    });
  });
}

export default firestoreTests;
