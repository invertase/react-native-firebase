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

        should.equal(querySnapshot.size >= 1, true);

        querySnapshot.forEach(documentSnapshot => {
          documentSnapshot.should.be.instanceOf(DocumentSnapshot);
        });
      });

      it('should support GetOptions source=`default`', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const querySnapshot = await collection.get({ source: 'default' });
        should.equal(querySnapshot.size >= 1, true);
        querySnapshot.metadata.should.be.an.Object();
        should.equal(querySnapshot.metadata.fromCache, false);
      });

      it('should support GetOptions source=`server`', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const querySnapshot = await collection.get({ source: 'server' });
        should.equal(querySnapshot.size >= 1, true);
        querySnapshot.metadata.should.be.an.Object();
        should.equal(querySnapshot.metadata.fromCache, false);
      });

      // TODO: Investigate why this isn't returning `fromCache=true`
      xit('should support GetOptions source=`cache`', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const querySnapshot = await collection.get({ source: 'cache' });
        should.equal(querySnapshot.size >= 1, true);
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

    describe('onSnapshot()', () => {
      it('QuerySnapshot has correct properties', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);
        const snapshot = await collection.get();
        snapshot.docChanges.should.be.an.Array();
        snapshot.empty.should.equal(false);
        snapshot.metadata.should.be.an.Object();
        snapshot.query.should.be.an.Object();
      });

      it('DocumentChange has correct properties', async () => {
        const collection = testCollection(TEST_COLLECTION_NAME);

        // Test
        let changes;
        let unsubscribe;
        await new Promise(resolve => {
          unsubscribe = collection.onSnapshot(snapshot => {
            changes = snapshot.docChanges;
            resolve();
          });
        });

        // Assertions
        changes.should.be.a.Array();
        changes[0].doc.should.be.an.Object();
        changes[0].newIndex.should.be.a.Number();
        changes[0].oldIndex.should.be.a.Number();
        changes[0].type.should.be.a.String();

        // Tear down
        unsubscribe();
      });

      xit('calls callback with the initial data and then when document changes', async () => {
        await cleanCollection(TEST_COLLECTION_NAME);

        const callback = sinon.spy();
        const collection = testCollection(TEST_COLLECTION_NAME);
        const newDocValue = { ...COL_DOC_1(), foo: 'updated' };

        // Test
        let unsubscribe;
        let resolved = false;
        await new Promise(resolve => {
          unsubscribe = collection.onSnapshot(snapshot => {
            if (snapshot && snapshot.docs.length) {
              callback(snapshot.docs[0].data());
            } else {
              callback(null);
            }

            if (!resolved) {
              resolved = true;
              resolve();
            }
          });
        });

        callback.should.be.calledOnce();

        await testCollectionDoc(COL_DOC_1_PATH).set(newDocValue);
        await sleep(25);

        // Assertions
        callback.should.be.calledTwice();
        callback.getCall(1).args[0].foo.should.equal('updated');

        // Tear down
        unsubscribe();
      });

      // crappy race condition somewhere =/ will come back to it later
      xit('calls callback with the initial data and then when document is added', async () => {
        await cleanCollection(TEST_COLLECTION_NAME);
        const colDoc = await resetTestCollectionDoc();

        await sleep(50);

        const collectionRef = firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME);

        const newDocValue = { foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise(resolve2 => {
          unsubscribe = collectionRef.onSnapshot(snapshot => {
            snapshot.forEach(doc => callback(doc.data()));
            resolve2();
          });
        });

        callback.should.be.calledWith(colDoc);

        const docRef = firebase.firestore().doc(DOC_2_PATH);
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(colDoc);
        callback.should.be.calledWith(newDocValue);
        callback.should.be.calledThrice();

        // Tear down

        unsubscribe();
      });

      //   it("doesn't call callback when the ref is updated with the same value", async () => {
      //     const collectionRef = firebase
      //       .firestore()
      //       .collection('collection-tests');

      //     const callback = sinon.spy();

      //     // Test

      //     let unsubscribe;
      //     await new Promise(resolve2 => {
      //       unsubscribe = collectionRef.onSnapshot(snapshot => {
      //         snapshot.forEach(doc => callback(doc.data()));
      //         resolve2();
      //       });
      //     });

      //     callback.should.be.calledWith(COL_DOC_1);

      //     const docRef = firebase.firestore().doc('collection-tests/col1');
      //     await docRef.set(COL_DOC_1);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     // Assertions

      //     callback.should.be.calledOnce(); // Callback is not called again

      //     // Tear down

      //     unsubscribe();
      //   });

      //   it('allows binding multiple callbacks to the same ref', async () => {
      //     // Setup
      //     const collectionRef = firebase
      //       .firestore()
      //       .collection('collection-tests');
      //     const newDocValue = { ...COL_DOC_1, foo: 'updated' };

      //     const callbackA = sinon.spy();
      //     const callbackB = sinon.spy();

      //     // Test
      //     let unsubscribeA;
      //     let unsubscribeB;
      //     await new Promise(resolve2 => {
      //       unsubscribeA = collectionRef.onSnapshot(snapshot => {
      //         snapshot.forEach(doc => callbackA(doc.data()));
      //         resolve2();
      //       });
      //     });
      //     await new Promise(resolve2 => {
      //       unsubscribeB = collectionRef.onSnapshot(snapshot => {
      //         snapshot.forEach(doc => callbackB(doc.data()));
      //         resolve2();
      //       });
      //     });

      //     callbackA.should.be.calledWith(COL_DOC_1);
      //     callbackA.should.be.calledOnce();

      //     callbackB.should.be.calledWith(COL_DOC_1);
      //     callbackB.should.be.calledOnce();

      //     const docRef = firebase.firestore().doc('collection-tests/col1');
      //     await docRef.set(newDocValue);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     callbackA.should.be.calledWith(newDocValue);
      //     callbackB.should.be.calledWith(newDocValue);

      //     callbackA.should.be.calledTwice();
      //     callbackB.should.be.calledTwice();

      //     // Tear down

      //     unsubscribeA();
      //     unsubscribeB();
      //   });

      //   it('listener stops listening when unsubscribed', async () => {
      //     // Setup
      //     const collectionRef = firebase
      //       .firestore()
      //       .collection('collection-tests');
      //     const newDocValue = { ...COL_DOC_1, foo: 'updated' };

      //     const callbackA = sinon.spy();
      //     const callbackB = sinon.spy();

      //     // Test
      //     let unsubscribeA;
      //     let unsubscribeB;
      //     await new Promise(resolve2 => {
      //       unsubscribeA = collectionRef.onSnapshot(snapshot => {
      //         snapshot.forEach(doc => callbackA(doc.data()));
      //         resolve2();
      //       });
      //     });
      //     await new Promise(resolve2 => {
      //       unsubscribeB = collectionRef.onSnapshot(snapshot => {
      //         snapshot.forEach(doc => callbackB(doc.data()));
      //         resolve2();
      //       });
      //     });

      //     callbackA.should.be.calledWith(COL_DOC_1);
      //     callbackA.should.be.calledOnce();

      //     callbackB.should.be.calledWith(COL_DOC_1);
      //     callbackB.should.be.calledOnce();

      //     const docRef = firebase.firestore().doc('collection-tests/col1');
      //     await docRef.set(newDocValue);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     callbackA.should.be.calledWith(newDocValue);
      //     callbackB.should.be.calledWith(newDocValue);

      //     callbackA.should.be.calledTwice();
      //     callbackB.should.be.calledTwice();

      //     // Unsubscribe A

      //     unsubscribeA();

      //     await docRef.set(COL_DOC_1);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     callbackB.should.be.calledWith(COL_DOC_1);

      //     callbackA.should.be.calledTwice();
      //     callbackB.should.be.calledThrice();

      //     // Unsubscribe B

      //     unsubscribeB();

      //     await docRef.set(newDocValue);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     callbackA.should.be.calledTwice();
      //     callbackB.should.be.calledThrice();
      //   });

      //   it('supports options and callback', async () => {
      //     const collectionRef = firebase
      //       .firestore()
      //       .collection('collection-tests');
      //     const newDocValue = { ...COL_DOC_1, foo: 'updated' };

      //     const callback = sinon.spy();

      //     // Test

      //     let unsubscribe;
      //     await new Promise(resolve2 => {
      //       unsubscribe = collectionRef.onSnapshot(
      //         {
      //           includeMetadataChanges: true,
      //         },
      //         snapshot => {
      //           snapshot.forEach(doc => callback(doc.data()));
      //           resolve2();
      //         }
      //       );
      //     });

      //     callback.should.be.calledWith(COL_DOC_1);

      //     const docRef = firebase.firestore().doc('collection-tests/col1');
      //     await docRef.set(newDocValue);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     // Assertions

      //     callback.should.be.calledWith(newDocValue);

      //     // Tear down

      //     unsubscribe();
      //   });

      //   it('supports observer', async () => {
      //     const collectionRef = firebase
      //       .firestore()
      //       .collection('collection-tests');
      //     const newDocValue = { ...COL_DOC_1, foo: 'updated' };

      //     const callback = sinon.spy();

      //     // Test

      //     let unsubscribe;
      //     await new Promise(resolve2 => {
      //       const observer = {
      //         next: snapshot => {
      //           snapshot.forEach(doc => callback(doc.data()));
      //           resolve2();
      //         },
      //       };
      //       unsubscribe = collectionRef.onSnapshot(observer);
      //     });

      //     callback.should.be.calledWith(COL_DOC_1);

      //     const docRef = firebase.firestore().doc('collection-tests/col1');
      //     await docRef.set(newDocValue);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     // Assertions

      //     callback.should.be.calledWith(newDocValue);
      //     callback.should.be.calledTwice();

      //     // Tear down

      //     unsubscribe();
      //   });

      //   it('supports options and observer', async () => {
      //     const collectionRef = firebase
      //       .firestore()
      //       .collection('collection-tests');
      //     const newDocValue = { ...COL_DOC_1, foo: 'updated' };

      //     const callback = sinon.spy();

      //     // Test

      //     let unsubscribe;
      //     await new Promise(resolve2 => {
      //       const observer = {
      //         next: snapshot => {
      //           snapshot.forEach(doc => callback(doc.data()));
      //           resolve2();
      //         },
      //         error: () => {},
      //       };
      //       unsubscribe = collectionRef.onSnapshot(
      //         {
      //           includeMetadataChanges: true,
      //         },
      //         observer
      //       );
      //     });

      //     callback.should.be.calledWith(COL_DOC_1);

      //     const docRef = firebase.firestore().doc('collection-tests/col1');
      //     await docRef.set(newDocValue);

      //     await new Promise(resolve2 => {
      //       setTimeout(() => resolve2(), 5);
      //     });

      //     // Assertions

      //     callback.should.be.calledWith(newDocValue);

      //     // Tear down

      //     unsubscribe();
      //   });

      //   it('errors when invalid parameters supplied', async () => {
      //     const colRef = firebase.firestore().collection('collection-tests');

      //     (() => {
      //       colRef.onSnapshot(() => {}, 'error');
      //     }).should.throw(
      //       'Query.onSnapshot failed: Second argument must be a valid function.'
      //     );
      //     (() => {
      //       colRef.onSnapshot({
      //         next: () => {},
      //         error: 'error',
      //       });
      //     }).should.throw(
      //       'Query.onSnapshot failed: Observer.error must be a valid function.'
      //     );
      //     (() => {
      //       colRef.onSnapshot({
      //         next: 'error',
      //       });
      //     }).should.throw(
      //       'Query.onSnapshot failed: Observer.next must be a valid function.'
      //     );
      //     (() => {
      //       colRef.onSnapshot(
      //         {
      //           includeMetadataChanges: true,
      //         },
      //         () => {},
      //         'error'
      //       );
      //     }).should.throw(
      //       'Query.onSnapshot failed: Third argument must be a valid function.'
      //     );
      //     (() => {
      //       colRef.onSnapshot(
      //         {
      //           includeMetadataChanges: true,
      //         },
      //         {
      //           next: () => {},
      //           error: 'error',
      //         }
      //       );
      //     }).should.throw(
      //       'Query.onSnapshot failed: Observer.error must be a valid function.'
      //     );
      //     (() => {
      //       colRef.onSnapshot(
      //         {
      //           includeMetadataChanges: true,
      //         },
      //         {
      //           next: 'error',
      //         }
      //       );
      //     }).should.throw(
      //       'Query.onSnapshot failed: Observer.next must be a valid function.'
      //     );
      //     (() => {
      //       colRef.onSnapshot(
      //         {
      //           includeMetadataChanges: true,
      //         },
      //         'error'
      //       );
      //     }).should.throw(
      //       'Query.onSnapshot failed: Second argument must be a function or observer.'
      //     );
      //     (() => {
      //       colRef.onSnapshot({
      //         error: 'error',
      //       });
      //     }).should.throw(
      //       'Query.onSnapshot failed: First argument must be a function, observer or options.'
      //     );
      //     (() => {
      //       colRef.onSnapshot();
      //     }).should.throw(
      //       'Query.onSnapshot failed: Called with invalid arguments.'
      //     );
      //   });
      // });


      //   describe('onSnapshot()', () => {
      //     it('gets called correctly', async () => {
      //       const collectionRef = collectionTests
      //         .orderBy('object.daz')
      //         .endAt(345);
      //       const newDocValue = { ...COL_DOC_1, object: { daz: 346 } };

      //       const callback = sinon.spy();

      //       // Test

      //       let unsubscribe;
      //       await new Promise(resolve2 => {
      //         unsubscribe = collectionRef.onSnapshot(snapshot => {
      //           callback(snapshot.docs.map(doc => doc.data().daz));
      //           resolve2();
      //         });
      //       });

      //       callback.should.be.calledWith([123, 234, 345]);

      //       const docRef = firebase.firestore().doc('collection-tests2/col1');
      //       await docRef.set(newDocValue);

      //       await new Promise(resolve2 => {
      //         setTimeout(() => resolve2(), 5);
      //       });

      //       // Assertions

      //       callback.should.be.calledWith([234, 345]);
      //       callback.should.be.calledTwice();

      //       // Tear down

      //       unsubscribe();
      //     });

      //     it('gets called correctly when combined with where', async () => {
      //       const collectionRef = collectionTests
      //         .where('baz', '==', true)
      //         .orderBy('daz');
      //       const newDocValue = { ...COL_DOC_1, daz: 678 };

      //       const callback = sinon.spy();

      //       // Test

      //       let unsubscribe;
      //       await new Promise(resolve2 => {
      //         unsubscribe = collectionRef.onSnapshot(snapshot => {
      //           callback(snapshot.docs.map(doc => doc.data().daz));
      //           resolve2();
      //         });
      //       });

      //       callback.should.be.calledWith([123, 234, 345, 456, 567]);

      //       const docRef = firebase.firestore().doc('collection-tests2/col6');
      //       await docRef.set(newDocValue);

      //       await new Promise(resolve2 => {
      //         setTimeout(() => resolve2(), 5);
      //       });

      //       // Assertions

      //       callback.should.be.calledWith([123, 234, 345, 456, 567, 678]);
      //       callback.should.be.calledTwice();

      //       // Tear down

      //       unsubscribe();
      //     });
      //   });
    });
  });
});
