import sinon from 'sinon';
import 'should-sinon';
import should from 'should';


function documentReferenceTests({ describe, it, context, firebase }) {
  describe('DocumentReference', () => {
    context('class', () => {
      it('should return instance methods', () => {
        return new Promise((resolve) => {
          const document = firebase.native.firestore().doc('document-tests/doc1');
          document.should.have.property('firestore');
          // TODO: Remaining checks

          resolve();
        });
      });
    });

    context('delete()', () => {
      it('should delete Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .delete()
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            should.equal(doc.exists, false);
          });
      });
    });

    context('onSnapshot()', () => {
      it('calls callback with the initial data and then when value changes', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/doc1');
        const currentDataValue = { name: 'doc1' };
        const newDataValue = { name: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          unsubscribe = docRef.onSnapshot((snapshot) => {
            callback(snapshot.data());
            resolve2();
          });
        });

        callback.should.be.calledWith(currentDataValue);

        // Update the document

        await docRef.set(newDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDataValue);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('doesn\'t call callback when the ref is updated with the same value', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/doc1');
        const currentDataValue = { name: 'doc1' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          unsubscribe = docRef.onSnapshot((snapshot) => {
            callback(snapshot.data());
            resolve2();
          });
        });

        callback.should.be.calledWith(currentDataValue);

        await docRef.set(currentDataValue);

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
        const docRef = firebase.native.firestore().doc('document-tests/doc1');
        const currentDataValue = { name: 'doc1' };
        const newDataValue = { name: 'updated' };

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test
        let unsubscribeA;
        let unsubscribeB;
        await new Promise((resolve2) => {
          unsubscribeA = docRef.onSnapshot((snapshot) => {
            callbackA(snapshot.data());
            resolve2();
          });
        });

        await new Promise((resolve2) => {
          unsubscribeB = docRef.onSnapshot((snapshot) => {
            callbackB(snapshot.data());
            resolve2();
          });
        });

        callbackA.should.be.calledWith(currentDataValue);
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(currentDataValue);
        callbackB.should.be.calledOnce();

        await docRef.set(newDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledWith(newDataValue);
        callbackB.should.be.calledWith(newDataValue);

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
        const docRef = firebase.native.firestore().doc('document-tests/doc1');
        const currentDataValue = { name: 'doc1' };
        const newDataValue = { name: 'updated' };

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test
        let unsubscribeA;
        let unsubscribeB;
        await new Promise((resolve2) => {
          unsubscribeA = docRef.onSnapshot((snapshot) => {
            callbackA(snapshot.data());
            resolve2();
          });
        });

        await new Promise((resolve2) => {
          unsubscribeB = docRef.onSnapshot((snapshot) => {
            callbackB(snapshot.data());
            resolve2();
          });
        });

        callbackA.should.be.calledWith(currentDataValue);
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(currentDataValue);
        callbackB.should.be.calledOnce();

        await docRef.set(newDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledWith(newDataValue);
        callbackB.should.be.calledWith(newDataValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledTwice();

        // Unsubscribe A

        unsubscribeA();

        await docRef.set(currentDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        callbackB.should.be.calledWith(currentDataValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledThrice();

        // Unsubscribe B

        unsubscribeB();

        await docRef.set(newDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledThrice();
      });
    });

    context('onSnapshot()', () => {
      it('supports options and callbacks', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/doc1');
        const currentDataValue = { name: 'doc1' };
        const newDataValue = { name: 'updated' };

        const callback = sinon.spy();

          // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          unsubscribe = docRef.onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
            callback(snapshot.data());
            resolve2();
          });
        });

        callback.should.be.calledWith(currentDataValue);

          // Update the document

        await docRef.set(newDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

          // Assertions

        callback.should.be.calledWith(newDataValue);

          // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('supports observer', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/doc1');
        const currentDataValue = { name: 'doc1' };
        const newDataValue = { name: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          const observer = {
            next: (snapshot) => {
              callback(snapshot.data());
              resolve2();
            },
          };
          unsubscribe = docRef.onSnapshot(observer);
        });

        callback.should.be.calledWith(currentDataValue);

        // Update the document

        await docRef.set(newDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDataValue);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });
    });

    context('onSnapshot()', () => {
      it('supports options and observer', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/doc1');
        const currentDataValue = { name: 'doc1' };
        const newDataValue = { name: 'updated' };

        const callback = sinon.spy();

        // Test

        let unsubscribe;
        await new Promise((resolve2) => {
          const observer = {
            next: (snapshot) => {
              callback(snapshot.data());
              resolve2();
            },
          };
          unsubscribe = docRef.onSnapshot({ includeMetadataChanges: true }, observer);
        });

        callback.should.be.calledWith(currentDataValue);

        // Update the document

        await docRef.set(newDataValue);

        await new Promise((resolve2) => {
          setTimeout(() => resolve2(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDataValue);

        // Tear down

        unsubscribe();
      });
    });

    context('set()', () => {
      it('should create Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc2')
          .set({ name: 'doc2', testArray: [] })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc2').get();
            doc.data().name.should.equal('doc2');
          });
      });
    });

    context('set()', () => {
      it('should merge Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .set({ merge: 'merge' }, { merge: true })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('doc1');
            doc.data().merge.should.equal('merge');
          });
      });
    });

    context('set()', () => {
      it('should overwrite Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .set({ name: 'overwritten' })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('overwritten');
          });
      });
    });

    context('update()', () => {
      it('should update Document using object', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .update({ name: 'updated' })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('updated');
          });
      });
    });

    context('update()', () => {
      it('should update Document using key/value pairs', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .update('name', 'updated')
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('updated');
          });
      });
    });

    context('types', () => {
      it('should handle Boolean field', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/reference');
        await docRef.set({
          field: true,
        });

        const doc = await docRef.get();
        should.equal(doc.data().field, true);
      });
    });

    context('types', () => {
      it('should handle Date field', async () => {
        const date = new Date();
        const docRef = firebase.native.firestore().doc('document-tests/reference');
        await docRef.set({
          field: date,
        });

        const doc = await docRef.get();
        doc.data().field.should.be.instanceof(Date);
        should.equal(doc.data().field.toISOString(), date.toISOString());
        should.equal(doc.data().field.getTime(), date.getTime());
      });
    });

    context('types', () => {
      it('should handle DocumentReference field', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/reference');
        await docRef.set({
          field: firebase.native.firestore().doc('test/field'),
        });

        const doc = await docRef.get();
        should.equal(doc.data().field.path, 'test/field');
      });
    });

    context('types', () => {
      it('should handle GeoPoint field', async () => {
        const docRef = firebase.native.firestore().doc('document-tests/reference');
        await docRef.set({
          field: new firebase.native.firestore.GeoPoint(1.01, 1.02),
        });

        const doc = await docRef.get();
        should.equal(doc.data().field.latitude, 1.01);
        should.equal(doc.data().field.longitude, 1.02);
      });
    });
  });
}

export default documentReferenceTests;
