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

    describe('ref', () => {
      it('returns a DocumentReference', async () => {
        const { testCollectionDoc } = TestHelpers.firestore;
        const snapshot = await testCollectionDoc().get();
        const DocumentReference = bridge.require(
          'react-native-firebase/dist/modules/firestore/DocumentReference'
        );
        snapshot.ref.should.be.an.instanceOf(DocumentReference);
      });
    });

    describe('metadata', () => {
      it('returns an object of meta data', async () => {
        const { testCollectionDoc } = TestHelpers.firestore;
        const { metadata } = await testCollectionDoc().get();
        metadata.should.be.an.Object();
        metadata.should.have.property('hasPendingWrites');
        metadata.should.have.property('fromCache');
        metadata.hasPendingWrites.should.be.a.Boolean();
        metadata.fromCache.should.be.a.Boolean();
      });
    });

    describe('exists', () => {
      it('returns a boolean', async () => {
        const { testCollectionDoc } = TestHelpers.firestore;
        const { exists } = await testCollectionDoc().get();
        exists.should.be.a.Boolean();
        exists.should.be.true();
      });
    });

    describe('data()', () => {
      it('returns document data', async () => {
        // additionally tests context binding not lost during destructuring
        const { testCollectionDoc } = TestHelpers.firestore;
        const snapshot = await testCollectionDoc().get();
        const { data } = snapshot;

        snapshot.data.should.be.a.Function();
        data.should.be.a.Function();

        snapshot.data().should.be.a.Object();
        data().should.be.a.Object();

        snapshot.data().baz.should.be.true();
        data().baz.should.be.true();
      });
    });

    describe('get()', () => {
      it('using a dot notated path string', async () => {
        // additionally tests context binding not lost during destructuring
        const { testCollectionDoc } = TestHelpers.firestore;
        const snapshot = await testCollectionDoc().get();
        const { get } = snapshot;

        should.equal(snapshot.get('foo'), 'bar');
        should.equal(get('foo'), 'bar');

        should.equal(snapshot.get('object.daz'), 123);
        should.equal(get('object.daz'), 123);

        should.equal(snapshot.get('nonexistent.object'), undefined);
        should.equal(get('nonexistent.object'), undefined);
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
