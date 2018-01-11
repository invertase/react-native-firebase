import should from 'should';


function fieldPathTests({ describe, it, context, firebase }) {
  describe('FieldPath', () => {
    context('DocumentSnapshot.get()', () => {
      it('should get the correct values', () => {
        return firebase.native.firestore()
          .doc('collection-tests/col1')
          .get()
          .then((snapshot) => {
            should.equal(snapshot.get('foo'), 'bar');
            should.equal(snapshot.get(new firebase.native.firestore.FieldPath('foo')), 'bar');
            should.equal(snapshot.get(new firebase.native.firestore.FieldPath('object', 'daz')), 123);
            should.equal(snapshot.get(new firebase.native.firestore.FieldPath('nonexistent', 'object')), undefined);
          });
      });
    });
  });
}

export default fieldPathTests;
