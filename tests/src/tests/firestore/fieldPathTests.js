import should from 'should';
import { cleanCollection, COL_DOC_1 } from './data';

function fieldPathTests({ before, describe, it, context, firebase }) {
  describe('FieldPath', () => {
    context('documentId', () => {
      it('should be a FieldPath', () => {
        const documentId = firebase.native.firestore.FieldPath.documentId();
        documentId.should.be.instanceof(firebase.native.firestore.FieldPath);
      });
    });

    context('DocumentSnapshot.get()', () => {
      let collectionTestsCollection;
      before(async () => {
        collectionTestsCollection = firebase.native
          .firestore()
          .collection('collection-tests');

        // We clean as part of initialisation in case a test errors
        // We don't clean after the test as it slows tests significantly
        await cleanCollection(collectionTestsCollection);
        await collectionTestsCollection.doc('col1').set(COL_DOC_1);
      });

      it('should get the correct values', () =>
        firebase.native
          .firestore()
          .doc('collection-tests/col1')
          .get()
          .then(snapshot => {
            should.equal(snapshot.get('foo'), 'bar');
            should.equal(
              snapshot.get(new firebase.native.firestore.FieldPath('foo')),
              'bar'
            );
            should.equal(
              snapshot.get(
                new firebase.native.firestore.FieldPath('object', 'daz')
              ),
              123
            );
            should.equal(
              snapshot.get(
                new firebase.native.firestore.FieldPath('nonexistent', 'object')
              ),
              undefined
            );
          }));
    });
  });
}

export default fieldPathTests;
