describe('firestore()', () => {
  describe('DocumentSnapshot', () => {
    before(async () => {
      await TestHelpers.firestore.resetTestCollectionDoc();
    });

    describe('get()', () => {
      it('using a dot notated path string', async () => {
        const { testCollectionDoc } = TestHelpers.firestore;
        const snapshot = await testCollectionDoc().get();

        should.equal(snapshot.get('foo'), 'bar');
        should.equal(snapshot.get('object.daz'), 123);
        should.equal(snapshot.get('nonexistent.object'), undefined);
      });

      it('using a FieldPath instance', async () => {
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
          snapshot.get(
            new firebase.firestore.FieldPath('nonexistent', 'object')
          ),
          undefined
        );
      });
    });
  });
});
