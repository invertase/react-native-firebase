import should from 'should';
import { cleanCollection, DOC_2 } from './data';

function fieldValueTests({ beforeEach, describe, it, context, firebase }) {
  describe('FieldValue', () => {
    let documentTestsCollection;
    beforeEach(async () => {
      documentTestsCollection = firebase.native
        .firestore()
        .collection('document-tests');

      // We clean as part of initialisation in case a test errors
      // We don't clean after the test as it slows tests significantly
      await cleanCollection(documentTestsCollection);
      await documentTestsCollection.doc('doc2').set(DOC_2);
    });

    context('delete()', () => {
      it('should delete field', () =>
        firebase.native
          .firestore()
          .doc('document-tests/doc2')
          .update({
            title: firebase.native.firestore.FieldValue.delete(),
          })
          .then(async () => {
            const doc = await firebase.native
              .firestore()
              .doc('document-tests/doc2')
              .get();
            should.equal(doc.data().title, undefined);
          }));
    });

    context('serverTimestamp()', () => {
      it('should set timestamp', () =>
        firebase.native
          .firestore()
          .doc('document-tests/doc2')
          .update({
            creationDate: firebase.native.firestore.FieldValue.serverTimestamp(),
          })
          .then(async () => {
            const doc = await firebase.native
              .firestore()
              .doc('document-tests/doc2')
              .get();
            doc.data().creationDate.should.be.instanceof(Date);
          }));
    });
  });
}

export default fieldValueTests;
