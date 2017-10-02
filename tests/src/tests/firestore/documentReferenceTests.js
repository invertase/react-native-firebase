import sinon from 'sinon';
import 'should-sinon';
import should from 'should';

function collectionReferenceTests({ describe, it, context, firebase }) {
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
      it('calls callback with the initial data and then when value changes', () => {
        return new Promise(async (resolve) => {
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

          await docRef.set(newDataValue);

          await new Promise((resolve2) => {
            setTimeout(() => resolve2(), 5);
          });

          // Assertions

          callback.should.be.calledWith(newDataValue);
          callback.should.be.calledTwice();

          // Tear down

          unsubscribe();

          resolve();
        });
      });
    });

    context('onSnapshot()', () => {
      it('doesn\'t call callback when the ref is updated with the same value', async () => {
        return new Promise(async (resolve) => {
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

          resolve();
        });
      });
    });

    context('onSnapshot()', () => {
      it('allows binding multiple callbacks to the same ref', () => {
        return new Promise(async (resolve) => {
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

          resolve();
        });
      });
    });

    context('onSnapshot()', () => {
      it('listener stops listening when unsubscribed', () => {
        return new Promise(async (resolve) => {
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

          resolve();
        });
      });
    });

    context('set()', () => {
      it('should create Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc2')
          .set({ name: 'doc2' })
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
      it('should update Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .set({ name: 'updated' })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('updated');
          });
      });
    });
  });
}

export default collectionReferenceTests;
