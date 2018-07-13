import sinon from 'sinon';
import 'should-sinon';
import should from 'should';

import { cleanCollection, COL_DOC_1 } from './data';

function collectionReferenceTests({
  beforeEach,
  describe,
  it,
  context,
  firebase,
  before,
  after,
}) {
  describe('CollectionReference', () => {
    let collectionTestsCollection;
    beforeEach(async () => {
      collectionTestsCollection = firebase.native
        .firestore()
        .collection('collection-tests');

      // We clean as part of initialisation in case a test errors
      // We don't clean after the test as it slows tests significantly
      await cleanCollection(collectionTestsCollection);
      await collectionTestsCollection.doc('col1').set(COL_DOC_1);
    });

    context('class', () => {
      it('should return instance methods', () =>
        new Promise(resolve => {
          const collection = firebase.native
            .firestore()
            .collection('collection-tests');
          collection.should.have.property('firestore');
          // TODO: Remaining checks

          resolve();
        }));
    });

    context('parent', () => {
      it('should return parent document', () => {
        const collection = firebase.native
          .firestore()
          .collection('collection/document/subcollection');
        collection.parent.path.should.equal('collection/document');
      });
    });

    context('add()', () => {
      it('should create Document', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .add({ first: 'Ada', last: 'Lovelace', born: 1815 })
          .then(async docRef => {
            const doc = await firebase.native
              .firestore()
              .doc(docRef.path)
              .get();
            doc.data().first.should.equal('Ada');
          }));
    });

    context('doc()', () => {
      it('should create DocumentReference with correct path', () =>
        new Promise(resolve => {
          const docRef = firebase.native
            .firestore()
            .collection('collection-tests')
            .doc('doc');
          should.equal(docRef.path, 'collection-tests/doc');
          resolve();
        }));

      it('should error when supplied an incorrect path', () => {
        (() => {
          firebase.native
            .firestore()
            .collection('collection')
            .doc('invalid/doc');
        }).should.throw('Argument "documentPath" must point to a document.');
      });
    });

    context('get()', () => {
      it('should retrieve a single document', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().baz, true);
            });
          }));
    });

    context('onSnapshot()', () => {
      it('QuerySnapshot has correct properties', async () => {
        const snapshot = await firebase.native
          .firestore()
          .collection('collection-tests')
          .get();

        snapshot.docChanges.should.be.an.Array();
        snapshot.empty.should.equal(false);
        snapshot.metadata.should.be.an.Object();
        snapshot.query.should.be.an.Object();
      });

      it('DocumentChange has correct properties', async () => {
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');

        // Test

        let unsubscribe;
        let changes;
        await new Promise(resolve2 => {
          unsubscribe = collectionRef.onSnapshot(snapshot => {
            changes = snapshot.docChanges;
            resolve2();
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

      it('calls callback with the initial data and then when document changes', async () => {
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');
        const newDocValue = { ...COL_DOC_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise(resolve2 => {
          unsubscribe = collectionRef.onSnapshot(snapshot => {
            snapshot.forEach(doc => callback(doc.data()));
            resolve2();
          });
        });

        callback.should.be.calledWith(COL_DOC_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });

      it('calls callback with the initial data and then when document is added', async () => {
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');
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

        callback.should.be.calledWith(COL_DOC_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col2');
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(COL_DOC_1);
        callback.should.be.calledWith(newDocValue);
        callback.should.be.calledThrice();

        // Tear down

        unsubscribe();
      });

      it("doesn't call callback when the ref is updated with the same value", async () => {
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise(resolve2 => {
          unsubscribe = collectionRef.onSnapshot(snapshot => {
            snapshot.forEach(doc => callback(doc.data()));
            resolve2();
          });
        });

        callback.should.be.calledWith(COL_DOC_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(COL_DOC_1);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledOnce(); // Callback is not called again

        // Tear down

        unsubscribe();
      });

      it('allows binding multiple callbacks to the same ref', async () => {
        // Setup
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');
        const newDocValue = { ...COL_DOC_1, foo: 'updated' };

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test
        let unsubscribeA;
        let unsubscribeB;
        await new Promise(resolve2 => {
          unsubscribeA = collectionRef.onSnapshot(snapshot => {
            snapshot.forEach(doc => callbackA(doc.data()));
            resolve2();
          });
        });
        await new Promise(resolve2 => {
          unsubscribeB = collectionRef.onSnapshot(snapshot => {
            snapshot.forEach(doc => callbackB(doc.data()));
            resolve2();
          });
        });

        callbackA.should.be.calledWith(COL_DOC_1);
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(COL_DOC_1);
        callbackB.should.be.calledOnce();

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledWith(newDocValue);
        callbackB.should.be.calledWith(newDocValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledTwice();

        // Tear down

        unsubscribeA();
        unsubscribeB();
      });

      it('listener stops listening when unsubscribed', async () => {
        // Setup
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');
        const newDocValue = { ...COL_DOC_1, foo: 'updated' };

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test
        let unsubscribeA;
        let unsubscribeB;
        await new Promise(resolve2 => {
          unsubscribeA = collectionRef.onSnapshot(snapshot => {
            snapshot.forEach(doc => callbackA(doc.data()));
            resolve2();
          });
        });
        await new Promise(resolve2 => {
          unsubscribeB = collectionRef.onSnapshot(snapshot => {
            snapshot.forEach(doc => callbackB(doc.data()));
            resolve2();
          });
        });

        callbackA.should.be.calledWith(COL_DOC_1);
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(COL_DOC_1);
        callbackB.should.be.calledOnce();

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledWith(newDocValue);
        callbackB.should.be.calledWith(newDocValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledTwice();

        // Unsubscribe A

        unsubscribeA();

        await docRef.set(COL_DOC_1);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        callbackB.should.be.calledWith(COL_DOC_1);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledThrice();

        // Unsubscribe B

        unsubscribeB();

        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledThrice();
      });

      it('supports options and callback', async () => {
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');
        const newDocValue = { ...COL_DOC_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise(resolve2 => {
          unsubscribe = collectionRef.onSnapshot(
            {
              includeMetadataChanges: true,
            },
            snapshot => {
              snapshot.forEach(doc => callback(doc.data()));
              resolve2();
            }
          );
        });

        callback.should.be.calledWith(COL_DOC_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);

        // Tear down

        unsubscribe();
      });

      it('supports observer', async () => {
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');
        const newDocValue = { ...COL_DOC_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise(resolve2 => {
          const observer = {
            next: snapshot => {
              snapshot.forEach(doc => callback(doc.data()));
              resolve2();
            },
          };
          unsubscribe = collectionRef.onSnapshot(observer);
        });

        callback.should.be.calledWith(COL_DOC_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });

      it('supports options and observer', async () => {
        const collectionRef = firebase.native
          .firestore()
          .collection('collection-tests');
        const newDocValue = { ...COL_DOC_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise(resolve2 => {
          const observer = {
            next: snapshot => {
              snapshot.forEach(doc => callback(doc.data()));
              resolve2();
            },
            error: () => {},
          };
          unsubscribe = collectionRef.onSnapshot(
            {
              includeMetadataChanges: true,
            },
            observer
          );
        });

        callback.should.be.calledWith(COL_DOC_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise(resolve2 => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);

        // Tear down

        unsubscribe();
      });

      it('errors when invalid parameters supplied', async () => {
        const colRef = firebase.native
          .firestore()
          .collection('collection-tests');

        (() => {
          colRef.onSnapshot(() => {}, 'error');
        }).should.throw(
          'Query.onSnapshot failed: Second argument must be a valid function.'
        );
        (() => {
          colRef.onSnapshot({
            next: () => {},
            error: 'error',
          });
        }).should.throw(
          'Query.onSnapshot failed: Observer.error must be a valid function.'
        );
        (() => {
          colRef.onSnapshot({
            next: 'error',
          });
        }).should.throw(
          'Query.onSnapshot failed: Observer.next must be a valid function.'
        );
        (() => {
          colRef.onSnapshot(
            {
              includeMetadataChanges: true,
            },
            () => {},
            'error'
          );
        }).should.throw(
          'Query.onSnapshot failed: Third argument must be a valid function.'
        );
        (() => {
          colRef.onSnapshot(
            {
              includeMetadataChanges: true,
            },
            {
              next: () => {},
              error: 'error',
            }
          );
        }).should.throw(
          'Query.onSnapshot failed: Observer.error must be a valid function.'
        );
        (() => {
          colRef.onSnapshot(
            {
              includeMetadataChanges: true,
            },
            {
              next: 'error',
            }
          );
        }).should.throw(
          'Query.onSnapshot failed: Observer.next must be a valid function.'
        );
        (() => {
          colRef.onSnapshot(
            {
              includeMetadataChanges: true,
            },
            'error'
          );
        }).should.throw(
          'Query.onSnapshot failed: Second argument must be a function or observer.'
        );
        (() => {
          colRef.onSnapshot({
            error: 'error',
          });
        }).should.throw(
          'Query.onSnapshot failed: First argument must be a function, observer or options.'
        );
        (() => {
          colRef.onSnapshot();
        }).should.throw(
          'Query.onSnapshot failed: Called with invalid arguments.'
        );
      });
    });

    // Where
    context('where()', () => {
      it('correctly handles == boolean values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where('baz', '==', true)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().baz, true);
            });
          }));

      it('correctly handles == string values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where('foo', '==', 'bar')
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().foo, 'bar');
            });
          }));

      it('correctly handles == null values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where('naz', '==', null)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().naz, null);
            });
          }));

      it('correctly handles == date values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where('timestamp', '==', COL_DOC_1.timestamp)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
          }));

      it('correctly handles == geopoint values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where('geopoint', '==', COL_DOC_1.geopoint)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
          }));

      it('correctly handles >= number values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where('daz', '>=', 123)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().daz, 123);
            });
          }));

      it('correctly handles >= geopoint values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where(
            'geopoint',
            '>=',
            new firebase.native.firestore.GeoPoint(-1, -1)
          )
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
          }));

      it('correctly handles <= float values', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where('gaz', '<=', 12.1234666)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().gaz, 12.1234567);
            });
          }));

      it('correctly handles FieldPath', () =>
        firebase.native
          .firestore()
          .collection('collection-tests')
          .where(new firebase.native.firestore.FieldPath('baz'), '==', true)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().baz, true);
            });
          }));
    });

    context('limit', () => {
      let collectionTests;
      before(async () => {
        collectionTests = firebase.native
          .firestore()
          .collection('collection-tests2');
        await Promise.all([
          collectionTests.doc('col1').set(COL_DOC_1),
          collectionTests.doc('col2').set({ ...COL_DOC_1, daz: 234 }),
          collectionTests.doc('col3').set({ ...COL_DOC_1, daz: 234 }),
          collectionTests.doc('col4').set({ ...COL_DOC_1, daz: 234 }),
          collectionTests.doc('col5').set({ ...COL_DOC_1, daz: 234 }),
        ]);
      });

      it('correctly works with get()', async () =>
        collectionTests
          .limit(3)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 3);
            return cleanCollection(collectionTests);
          }));

      it('correctly works with onSnapshot()', async () => {
        const collectionRef = collectionTests.limit(3);
        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise(resolve2 => {
          unsubscribe = collectionRef.onSnapshot(snapshot => {
            callback(snapshot.size);
            resolve2();
          });
        });

        // Assertions

        callback.should.be.calledWith(3);

        // Tear down

        unsubscribe();
      });

      after(() => cleanCollection(collectionTests));
    });

    context('cursors', () => {
      let collectionTests;
      before(async () => {
        collectionTests = firebase.native
          .firestore()
          .collection('collection-tests2');
        await Promise.all([
          collectionTests.doc('col1').set({ ...COL_DOC_1, foo: 'bar0' }),
          collectionTests.doc('col2').set({
            ...COL_DOC_1,
            foo: 'bar1',
            daz: 234,
            object: { daz: 234 },
            timestamp: new Date(2017, 2, 11, 10, 0, 0),
          }),
          collectionTests.doc('col3').set({
            ...COL_DOC_1,
            foo: 'bar2',
            daz: 345,
            object: { daz: 345 },
            timestamp: new Date(2017, 2, 12, 10, 0, 0),
          }),
          collectionTests.doc('col4').set({
            ...COL_DOC_1,
            foo: 'bar3',
            daz: 456,
            object: { daz: 456 },
            timestamp: new Date(2017, 2, 13, 10, 0, 0),
          }),
          collectionTests.doc('col5').set({
            ...COL_DOC_1,
            foo: 'bar4',
            daz: 567,
            object: { daz: 567 },
            timestamp: new Date(2017, 2, 14, 10, 0, 0),
          }),
        ]);
      });

      context('endAt', () => {
        it('handles dates', () =>
          collectionTests
            .orderBy('timestamp')
            .endAt(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
                345,
              ]);
            }));

        it('handles numbers', () =>
          collectionTests
            .orderBy('daz')
            .endAt(345)
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
                345,
              ]);
            }));

        it('handles strings', () =>
          collectionTests
            .orderBy('foo')
            .endAt('bar2')
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
                345,
              ]);
            }));

        it('handles snapshots', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests
            .orderBy('foo')
            .endAt(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
                345,
              ]);
            });
        });

        it('works with FieldPath', () =>
          collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('timestamp'))
            .endAt(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
                345,
              ]);
            }));

        it('handles snapshots with FieldPath', async () => {
          const collectionSnapshot = await collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('foo'))
            .get();
          return collectionTests
            .orderBy('foo')
            .endAt(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
                345,
              ]);
            });
        });
      });

      context('endBefore', () => {
        it('handles dates', () =>
          collectionTests
            .orderBy('timestamp')
            .endBefore(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
              ]);
            }));

        it('handles numbers', () =>
          collectionTests
            .orderBy('daz')
            .endBefore(345)
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
              ]);
            }));

        it('handles strings', () =>
          collectionTests
            .orderBy('foo')
            .endBefore('bar2')
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
              ]);
            }));

        it('handles snapshots', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests
            .orderBy('foo')
            .endBefore(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
              ]);
            });
        });

        it('works with FieldPath', () =>
          collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('timestamp'))
            .endBefore(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
              ]);
            }));

        it('handles snapshots with FieldPath', async () => {
          const collectionSnapshot = await collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('foo'))
            .get();
          return collectionTests
            .orderBy('foo')
            .endBefore(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                123,
                234,
              ]);
            });
        });
      });

      context('startAt', () => {
        it('handles dates', () =>
          collectionTests
            .orderBy('timestamp')
            .startAt(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                345,
                456,
                567,
              ]);
            }));

        it('handles numbers', () =>
          collectionTests
            .orderBy('daz')
            .startAt(345)
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                345,
                456,
                567,
              ]);
            }));

        it('handles strings', () =>
          collectionTests
            .orderBy('foo')
            .startAt('bar2')
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                345,
                456,
                567,
              ]);
            }));

        it('handles snapshots', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests
            .orderBy('foo')
            .startAt(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                345,
                456,
                567,
              ]);
            });
        });

        it('works with FieldPath', () =>
          collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('timestamp'))
            .startAt(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                345,
                456,
                567,
              ]);
            }));

        it('handles snapshots with FieldPath', async () => {
          const collectionSnapshot = await collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('foo'))
            .get();
          return collectionTests
            .orderBy('foo')
            .startAt(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                345,
                456,
                567,
              ]);
            });
        });
      });

      context('startAfter', () => {
        it('handles dates', () =>
          collectionTests
            .orderBy('timestamp')
            .startAfter(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                456,
                567,
              ]);
            }));

        it('handles numbers', () =>
          collectionTests
            .orderBy('daz')
            .startAfter(345)
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                456,
                567,
              ]);
            }));

        it('handles strings', () =>
          collectionTests
            .orderBy('foo')
            .startAfter('bar2')
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                456,
                567,
              ]);
            }));

        it('handles snapshot', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests
            .orderBy('foo')
            .startAfter(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                456,
                567,
              ]);
            });
        });

        it('works with FieldPath', () =>
          collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('timestamp'))
            .startAfter(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                456,
                567,
              ]);
            }));

        it('handles snapshots with FieldPath', async () => {
          const collectionSnapshot = await collectionTests
            .orderBy(new firebase.native.firestore.FieldPath('foo'))
            .get();
          return collectionTests
            .orderBy('foo')
            .startAfter(collectionSnapshot.docs[2])
            .get()
            .then(querySnapshot => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(querySnapshot.docs.map(doc => doc.data().daz), [
                456,
                567,
              ]);
            });
        });
      });

      context('orderBy()', () => {
        it('errors if called after startAt', () => {
          (() => {
            firebase.native
              .firestore()
              .collection('collections')
              .startAt({})
              .orderBy('test');
          }).should.throw(
            'Cannot specify an orderBy() constraint after calling startAt(), startAfter(), endBefore() or endAt().'
          );
        });

        it('errors if called after startAfter', () => {
          (() => {
            firebase.native
              .firestore()
              .collection('collections')
              .startAfter({})
              .orderBy('test');
          }).should.throw(
            'Cannot specify an orderBy() constraint after calling startAt(), startAfter(), endBefore() or endAt().'
          );
        });

        it('errors if called after endBefore', () => {
          (() => {
            firebase.native
              .firestore()
              .collection('collections')
              .endBefore({})
              .orderBy('test');
          }).should.throw(
            'Cannot specify an orderBy() constraint after calling startAt(), startAfter(), endBefore() or endAt().'
          );
        });

        it('errors if called after endAt', () => {
          (() => {
            firebase.native
              .firestore()
              .collection('collections')
              .endAt({})
              .orderBy('test');
          }).should.throw(
            'Cannot specify an orderBy() constraint after calling startAt(), startAfter(), endBefore() or endAt().'
          );
        });
      });

      context('onSnapshot()', () => {
        it('gets called correctly', async () => {
          const collectionRef = collectionTests
            .orderBy('object.daz')
            .endAt(345);
          const newDocValue = { ...COL_DOC_1, object: { daz: 346 } };

          const callback = sinon.spy();

          // Test

          let unsubscribe;
          await new Promise(resolve2 => {
            unsubscribe = collectionRef.onSnapshot(snapshot => {
              callback(snapshot.docs.map(doc => doc.data().daz));
              resolve2();
            });
          });

          callback.should.be.calledWith([123, 234, 345]);

          const docRef = firebase.native
            .firestore()
            .doc('collection-tests2/col1');
          await docRef.set(newDocValue);

          await new Promise(resolve2 => {
            setTimeout(() => resolve2(), 5);
          });

          // Assertions

          callback.should.be.calledWith([234, 345]);
          callback.should.be.calledTwice();

          // Tear down

          unsubscribe();
        });

        it('gets called correctly when combined with where', async () => {
          const collectionRef = collectionTests
            .where('baz', '==', true)
            .orderBy('daz');
          const newDocValue = { ...COL_DOC_1, daz: 678 };

          const callback = sinon.spy();

          // Test

          let unsubscribe;
          await new Promise(resolve2 => {
            unsubscribe = collectionRef.onSnapshot(snapshot => {
              callback(snapshot.docs.map(doc => doc.data().daz));
              resolve2();
            });
          });

          callback.should.be.calledWith([123, 234, 345, 456, 567]);

          const docRef = firebase.native
            .firestore()
            .doc('collection-tests2/col6');
          await docRef.set(newDocValue);

          await new Promise(resolve2 => {
            setTimeout(() => resolve2(), 5);
          });

          // Assertions

          callback.should.be.calledWith([123, 234, 345, 456, 567, 678]);
          callback.should.be.calledTwice();

          // Tear down

          unsubscribe();
        });
      });

      after(() => cleanCollection(collectionTests));
    });
  });
}

export default collectionReferenceTests;
