const should = require('should');

describe('firestore.runTransaction', () => {
  it('should set, update and delete transactionally and allow a return value', async () => {
    let deleteMe = false;
    const firestore = firebase.firestore();

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
        return Promise.reject(new Error('Value should not be greater than 2!'));
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
