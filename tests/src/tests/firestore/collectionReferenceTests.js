import sinon from 'sinon';
import 'should-sinon';
import should from 'should';

import { COL_1, cleanCollection } from './index';

function collectionReferenceTests({ describe, it, context, firebase, before, after }) {
  describe('CollectionReference', () => {
    context('class', () => {
      it('should return instance methods', () => {
        return new Promise((resolve) => {
          const collection = firebase.native.firestore().collection('collection-tests');
          collection.should.have.property('firestore');
          // TODO: Remaining checks

          resolve();
        });
      });
    });

    context('add()', () => {
      it('should create Document', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .add({ first: 'Ada', last: 'Lovelace', born: 1815 })
          .then(async (docRef) => {
            const doc = await firebase.native.firestore().doc(docRef.path).get();
            doc.data().first.should.equal('Ada');
          });
      });
    });

    context('doc()', () => {
      it('should create DocumentReference with correct path', () => {
        return new Promise((resolve) => {
          const docRef = firebase.native.firestore().collection('collection-tests').doc('doc');
          should.equal(docRef.path, 'collection-tests/doc');
          resolve();
        });
      });
    });

    context('get()', () => {
      it('should retrieve a single document', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().baz, true);
            });
          });
      });
    });

    context('onSnapshot()', () => {
      it('calls callback with the initial data and then when document changes', async () => {
        const collectionRef = firebase.native.firestore().collection('collection-tests');
        const newDocValue = { ...COL_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          unsubscribe = collectionRef.onSnapshot((snapshot) => {
            snapshot.forEach(doc => callback(doc.data()));
            resolve2();
          });
        });

        callback.should.be.calledWith(COL_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('calls callback with the initial data and then when document is added', async () => {
        const collectionRef = firebase.native.firestore().collection('collection-tests');
        const newDocValue = { foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          unsubscribe = collectionRef.onSnapshot((snapshot) => {
            snapshot.forEach(doc => callback(doc.data()));
            resolve2();
          });
        });

        callback.should.be.calledWith(COL_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col2');
        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(COL_1);
        callback.should.be.calledWith(newDocValue);
        callback.should.be.calledThrice();

        // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('doesn\'t call callback when the ref is updated with the same value', async () => {
        const collectionRef = firebase.native.firestore().collection('collection-tests');

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          unsubscribe = collectionRef.onSnapshot((snapshot) => {
            snapshot.forEach(doc => callback(doc.data()));
            resolve2();
          });
        });

        callback.should.be.calledWith(COL_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(COL_1);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledOnce(); // Callback is not called again

        // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('allows binding multiple callbacks to the same ref', async () => {
        // Setup
        const collectionRef = firebase.native.firestore().collection('collection-tests');
        const newDocValue = { ...COL_1, foo: 'updated' };

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test
        let unsubscribeA;
        let unsubscribeB;
        await new Promise((resolve2) => {
          unsubscribeA = collectionRef.onSnapshot((snapshot) => {
            snapshot.forEach(doc => callbackA(doc.data()));
            resolve2();
          });
        });
        await new Promise((resolve2) => {
          unsubscribeB = collectionRef.onSnapshot((snapshot) => {
            snapshot.forEach(doc => callbackB(doc.data()));
            resolve2();
          });
        });

        callbackA.should.be.calledWith(COL_1);
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(COL_1);
        callbackB.should.be.calledOnce();

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
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
    });

    context('onSnapshot()', () => {
      it('listener stops listening when unsubscribed', async () => {
        // Setup
        const collectionRef = firebase.native.firestore().collection('collection-tests');
        const newDocValue = { ...COL_1, foo: 'updated' };

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test
        let unsubscribeA;
        let unsubscribeB;
        await new Promise((resolve2) => {
          unsubscribeA = collectionRef.onSnapshot((snapshot) => {
            snapshot.forEach(doc => callbackA(doc.data()));
            resolve2();
          });
        });
        await new Promise((resolve2) => {
          unsubscribeB = collectionRef.onSnapshot((snapshot) => {
            snapshot.forEach(doc => callbackB(doc.data()));
            resolve2();
          });
        });

        callbackA.should.be.calledWith(COL_1);
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(COL_1);
        callbackB.should.be.calledOnce();

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledWith(newDocValue);
        callbackB.should.be.calledWith(newDocValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledTwice();

        // Unsubscribe A

        unsubscribeA();

        await docRef.set(COL_1);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        callbackB.should.be.calledWith(COL_1);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledThrice();

        // Unsubscribe B

        unsubscribeB();

        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledThrice();
      });
    });

    context('onSnapshot()', () => {
      it('supports options and callback', async () => {
        const collectionRef = firebase.native.firestore().collection('collection-tests');
        const newDocValue = { ...COL_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          unsubscribe = collectionRef.onSnapshot({ includeQueryMetadataChanges: true, includeDocumentMetadataChanges: true }, (snapshot) => {
            snapshot.forEach(doc => callback(doc.data()));
            resolve2();
          });
        });

        callback.should.be.calledWith(COL_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);

        // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('supports observer', async () => {
        const collectionRef = firebase.native.firestore().collection('collection-tests');
        const newDocValue = { ...COL_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          const observer = {
            next: (snapshot) => {
              snapshot.forEach(doc => callback(doc.data()));
              resolve2();
            },
          };
          unsubscribe = collectionRef.onSnapshot(observer);
        });

        callback.should.be.calledWith(COL_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('supports options and observer', async () => {
        const collectionRef = firebase.native.firestore().collection('collection-tests');
        const newDocValue = { ...COL_1, foo: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          const observer = {
            next: (snapshot) => {
              snapshot.forEach(doc => callback(doc.data()));
              resolve2();
            },
          };
          unsubscribe = collectionRef.onSnapshot({ includeQueryMetadataChanges: true, includeDocumentMetadataChanges: true }, observer);
        });

        callback.should.be.calledWith(COL_1);

        const docRef = firebase.native.firestore().doc('collection-tests/col1');
        await docRef.set(newDocValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDocValue);

        // Tear down

        unsubscribe();
      });
    });

    // Where
    context('where()', () => {
      it('correctly handles == boolean values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('baz', '==', true)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().baz, true);
            });
          });
      });

      it('correctly handles == string values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('foo', '==', 'bar')
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().foo, 'bar');
            });
          });
      });

      it('correctly handles == null values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('naz', '==', null)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().naz, null);
            });
          });
      });

      it('correctly handles == date values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('timestamp', '==', COL_1.timestamp)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
          });
      });

      it('correctly handles == geopoint values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('geopoint', '==', COL_1.geopoint)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
          });
      });

      it('correctly handles >= number values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('daz', '>=', 123)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().daz, 123);
            });
          });
      });

      it('correctly handles >= geopoint values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('geopoint', '>=', new firebase.native.firestore.GeoPoint(-1, -1))
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
          });
      });

      it('correctly handles <= float values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('gaz', '<=', 12.1234666)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().gaz, 12.1234567);
            });
          });
      });

      it('correctly handles limit', async () => {
        const collectionTests = firebase.native.firestore().collection('collection-tests2');
        await Promise.all([
          collectionTests.doc('col1').set(COL_1),
          collectionTests.doc('col2').set({ ...COL_1, daz: 234 }),
          collectionTests.doc('col3').set({ ...COL_1, daz: 234 }),
          collectionTests.doc('col4').set({ ...COL_1, daz: 234 }),
          collectionTests.doc('col5').set({ ...COL_1, daz: 234 }),
        ]);

        return collectionTests.limit(3)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 3);
            return cleanCollection(collectionTests);
          });
      });
    });

    context('cursors', () => {
      let collectionTests;
      before(async () => {
        collectionTests = firebase.native.firestore().collection('collection-tests2');
        await Promise.all([
          collectionTests.doc('col1').set({ ...COL_1, foo: 'bar0' }),
          collectionTests.doc('col2').set({ ...COL_1, foo: 'bar1', daz: 234, timestamp: new Date(2017, 2, 11, 10, 0, 0) }),
          collectionTests.doc('col3').set({ ...COL_1, foo: 'bar2', daz: 345, timestamp: new Date(2017, 2, 12, 10, 0, 0) }),
          collectionTests.doc('col4').set({ ...COL_1, foo: 'bar3', daz: 456, timestamp: new Date(2017, 2, 13, 10, 0, 0) }),
          collectionTests.doc('col5').set({ ...COL_1, foo: 'bar4', daz: 567, timestamp: new Date(2017, 2, 14, 10, 0, 0) }),
        ]);
      });

      context('endAt', () => {
        it('handles dates', () => {
          return collectionTests.orderBy('timestamp').endAt(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234, 345],
              );
            });
        });

        it('handles numbers', () => {
          return collectionTests.orderBy('daz').endAt(345)
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234, 345],
              );
            });
        });

        it('handles strings', () => {
          return collectionTests.orderBy('foo').endAt('bar2')
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234, 345],
              );
            });
        });

        it('handles snapshots', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests.orderBy('foo').endAt(collectionSnapshot.docs[2])
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234, 345],
              );
            });
        });
      });

      context('endBefore', () => {
        it('handles dates', () => {
          return collectionTests.orderBy('timestamp').endBefore(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234],
              );
            });
        });

        it('handles numbers', () => {
          return collectionTests.orderBy('daz').endBefore(345)
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234],
              );
            });
        });

        it('handles strings', () => {
          return collectionTests.orderBy('foo').endBefore('bar2')
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234],
              );
            });
        });

        it('handles snapshots', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests.orderBy('foo').endBefore(collectionSnapshot.docs[2])
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [123, 234],
              );
            });
        });
      });

      context('startAt', () => {
        it('handles dates', () => {
          return collectionTests.orderBy('timestamp').startAt(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [345, 456, 567],
              );
            });
        });

        it('handles numbers', () => {
          return collectionTests.orderBy('daz').startAt(345)
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [345, 456, 567],
              );
            });
        });

        it('handles strings', () => {
          return collectionTests.orderBy('foo').startAt('bar2')
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [345, 456, 567],
              );
            });
        });

        it('handles snapshots', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests.orderBy('foo').startAt(collectionSnapshot.docs[2])
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 3);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [345, 456, 567],
              );
            });
        });
      });

      context('startAfter', () => {
        it('handles dates', () => {
          return collectionTests.orderBy('timestamp').startAfter(new Date(2017, 2, 12, 10, 0, 0))
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [456, 567],
              );
            });
        });

        it('handles numbers', () => {
          return collectionTests.orderBy('daz').startAfter(345)
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [456, 567],
              );
            });
        });

        it('handles strings', () => {
          return collectionTests.orderBy('foo').startAfter('bar2')
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [456, 567],
              );
            });
        });

        it('handles snapshot', async () => {
          const collectionSnapshot = await collectionTests.orderBy('foo').get();
          return collectionTests.orderBy('foo').startAfter(collectionSnapshot.docs[2])
            .get()
            .then((querySnapshot) => {
              should.equal(querySnapshot.size, 2);
              should.deepEqual(
                querySnapshot.docs.map(doc => doc.data().daz),
                [456, 567],
              );
            });
        });
      });

      after(() => {
        return cleanCollection(collectionTests);
      });
    });
  });
}

export default collectionReferenceTests;
