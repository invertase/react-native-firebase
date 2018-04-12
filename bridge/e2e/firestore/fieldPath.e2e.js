describe('firestore()', () => {
  describe('FieldPath', () => {
    before(async () => {
      await TestHelpers.firestore.resetTestCollectionDoc();
    });

    it('documentId() should return a FieldPath', () => {
      const documentId = firebase.firestore.FieldPath.documentId();
      documentId.should.be.instanceof(firebase.firestore.FieldPath);
    });

    it('should allow getting values via documentSnapshot.get(FieldPath)', async () => {
      const { testCollectionDoc } = TestHelpers.firestore;
      const snapshot = await testCollectionDoc().get();

      should.equal(snapshot.get('foo'), 'bar');

      should.equal(
        snapshot.get(new firebase.firestore.FieldPath('foo')),
        'bar'
      );

      should.equal(
        snapshot.get(new firebase.firestore.FieldPath('object', 'daz')),
        123
      );

      should.equal(
        snapshot.get(new firebase.firestore.FieldPath('nonexistent', 'object')),
        undefined
      );
    });
  });
});
