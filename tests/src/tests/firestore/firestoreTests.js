import should from 'should';
import { cleanCollection } from './data';

function firestoreTests({ before, describe, it, context, firebase }) {
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
      let firestoreTestsCollection;
      before(async () => {
        firestoreTestsCollection = firebase.native
          .firestore()
          .collection('firestore-tests');

        // We clean as part of initialisation in case a test errors
        // We don't clean after the test as it slows tests significantly
        await cleanCollection(firestoreTestsCollection);
      });

      it('should create / update / delete as expected', () => {
        const ayRef = firestoreTestsCollection.doc('AY');
        const lRef = firestoreTestsCollection.doc('LON');
        const nycRef = firestoreTestsCollection.doc('NYC');
        const sfRef = firestoreTestsCollection.doc('SF');

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
          'WriteBatch.update failed: If using a single update argument, it must be an object.'
        );
        (() => {
          batch.update(ref, 'error1', 'error2', 'error3');
        }).should.throw(
          'WriteBatch.update failed: The update arguments must be either a single object argument, or equal numbers of key/value pairs.'
        );
        (() => {
          batch.update(ref, 0, 'error');
        }).should.throw(
          'WriteBatch.update failed: Argument at index 0 must be a string or FieldPath'
        );
      });
    });

    context('disableNetwork()', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.firestore().disableNetwork();
        }).should.throw(
          'firebase.firestore().disableNetwork() is unsupported by the native Firebase SDKs.'
        );
      });
    });

    context('enableNetwork()', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.firestore().enableNetwork();
        }).should.throw(
          'firebase.firestore().enableNetwork() is unsupported by the native Firebase SDKs.'
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

    context('runTransaction()', () => {
      it('should set, update and delete transactionally and allow a return value', async () => {
        let deleteMe = false;
        const firestore = firebase.native.firestore();

        const docRef = firestore
          .collection('transactions')
          .doc(Date.now().toString());

        const updateFunction = async transaction => {
          const doc = await transaction.get(docRef);
          if (doc.exists && deleteMe) {
            transaction.delete(docRef);
            return 'bye';
          }

          if (!doc.exists) {
            transaction.set(docRef, { value: 1 });
            return 1;
          }

          const newValue = doc.data().value + 1;

          if (newValue > 2) {
            return Promise.reject(
              new Error('Value should not be greater than 2!')
            );
          }

          transaction.update(docRef, {
            value: newValue,
            somethingElse: 'update',
          });

          return newValue;
        };

        // set tests
        const val1 = await firestore.runTransaction(updateFunction);
        should.equal(val1, 1);
        const doc1 = await docRef.get();
        doc1.data().value.should.equal(1);
        should.equal(doc1.data().somethingElse, undefined);

        // update
        const val2 = await firestore.runTransaction(updateFunction);
        should.equal(val2, 2);
        const doc2 = await docRef.get();
        doc2.data().value.should.equal(2);
        doc2.data().somethingElse.should.equal('update');

        // rejecting / cancelling transaction
        let didReject = false;
        try {
          await firestore.runTransaction(updateFunction);
        } catch (e) {
          didReject = true;
        }
        should.equal(didReject, true);
        const doc3 = await docRef.get();
        doc3.data().value.should.equal(2);
        doc3.data().somethingElse.should.equal('update');

        // delete
        deleteMe = true;
        const val4 = await firestore.runTransaction(updateFunction);
        should.equal(val4, 'bye');
        const doc4 = await docRef.get();
        should.equal(doc4.exists, false);

        return Promise.resolve('Test Completed');
      });
    });
  });
}

export default firestoreTests;
