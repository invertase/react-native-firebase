module.exports = {
  DOC_1: { name: 'doc1' },

  DOC_2: { name: 'doc2', title: 'Document 2' },

  // needs to be a fn as firebase may not yet be available
  COL_DOC_1() {
    return {
      baz: true,
      daz: 123,
      foo: 'bar',
      gaz: 12.1234567,
      geopoint: new firebase.firestore.GeoPoint(0, 0),
      naz: null,
      object: {
        daz: 123,
      },
      timestamp: new Date(2017, 2, 10, 10, 0, 0),
    };
  },

  /**
   *
   * @param collectionName
   * @return {Promise<*>}
   */
  async cleanCollection(collectionName = 'collection-tests') {
    const firestore = firebaseAdmin.firestore();
    const batch = firestore.batch();
    const collection = firestore.collection(collectionName);
    const docsToDelete = await collection.get();

    for (let i = 0, len = docsToDelete.length; i < len; i++) {
      const { ref, path } = docsToDelete[i];
      if (path.includes(testRunId)) {
        batch.delete(ref);
      }
    }

    return writeBatch.commit();
  },
};
