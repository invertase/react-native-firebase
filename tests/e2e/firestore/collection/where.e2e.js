const {
  COL_DOC_1,
  COL_DOC_1_PATH,
  TEST_COLLECTION_NAME_DYNAMIC,
  resetTestCollectionDoc,
} = TestHelpers.firestore;

describe('firestore()', () => {
  describe('CollectionReference', () => {
    before(() => resetTestCollectionDoc(COL_DOC_1_PATH, COL_DOC_1()));
    describe('where()', () => {
      it('correctly handles == boolean values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('baz', '==', true)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().baz, true);
            });
          }));

      it('correctly handles == string values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('foo', '==', 'bar')
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().foo, 'bar');
            });
          }));

      it('correctly handles == null values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('naz', '==', null)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().naz, null);
            });
          }));

      it('correctly handles == date values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '==', COL_DOC_1().timestamp)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
          }));

      it('correctly handles == geopoint values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('geopoint', '==', COL_DOC_1().geopoint)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
          }));

      it('correctly handles >= number values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('daz', '>=', 123)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().daz, 123);
            });
          }));

      it('correctly handles >= geopoint values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('geopoint', '>=', new firebase.firestore.GeoPoint(-1, -1))
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
          }));

      it('correctly handles <= float values', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('gaz', '<=', 12.1234666)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().gaz, 12.1234567);
            });
          }));

      it('correctly handles FieldPath', () =>
        firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where(new firebase.firestore.FieldPath('baz'), '==', true)
          .get()
          .then(querySnapshot => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach(documentSnapshot => {
              should.equal(documentSnapshot.data().baz, true);
            });
          }));
    });
  });
});
