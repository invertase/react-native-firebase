import should from 'should';

function fieldPathTests({ describe, it, context, firebase }) {
  describe('FieldPath', () => {
    context('documentId', () => {
      it('should be a FieldPath', () => {
        const documentId = firebase.native.firestore.FieldPath.documentId();
        documentId.should.be.instanceof(firebase.native.firestore.FieldPath);
      });
    });

    context('DocumentSnapshot.get()', () => {
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
