const {
  COL_DOC_1,
  COL_DOC_1_PATH,
  testCollectionDoc,
  resetTestCollectionDoc,
} = TestHelpers.firestore;

describe('firestore()', () => {
  describe('FieldPath', () => {
    before(async () => {
      await resetTestCollectionDoc(COL_DOC_1_PATH, COL_DOC_1());
    });

    it('documentId() should return a FieldPath', () => {
      const documentId = firebase.firestore.FieldPath.documentId();
      documentId.should.be.instanceof(firebase.firestore.FieldPath);
    });

    it('should allow getting values via documentSnapshot.get(FieldPath)', async () => {
      const snapshot = await testCollectionDoc(COL_DOC_1_PATH).get();

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
