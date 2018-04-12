describe('firestore()', () => {
  describe('DocumentSnapshot', () => {
    before(async () => {
      await TestHelpers.firestore.resetTestCollectionDoc();
    });

    describe('id', () => {
      it('returns a string document id', async () => {
        const { testCollectionDoc, COL_DOC_1_ID } = TestHelpers.firestore;
        const snapshot = await testCollectionDoc().get();
        snapshot.id.should.be.a.String();
        snapshot.id.should.equal(COL_DOC_1_ID);
      });
    });

    describe.only('ref', () => {
      it('returns a DocumentReference', async () => {
        const { testCollectionDoc } = TestHelpers.firestore;
        const snapshot = await testCollectionDoc().get();
        // console.dir(bridge.context.require.getModules());
        // snapshot.ref.should.be.an.instanceOf(
        //   bridge.require(
        //     'react-native-firebase/dist/modules/firestore/DocumentReference.js'
        //   )
        // );
      });
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
