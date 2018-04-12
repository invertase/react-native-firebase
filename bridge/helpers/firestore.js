const TEST_COLLECTION_NAME = 'collection-tests';

let shouldCleanup = false;
const ONE_HOUR = 60 * 60 * 1000;

module.exports = {
  async cleanup() {
    if (!shouldCleanup) return Promise.resolve();
    await module.exports.cleanCollection(TEST_COLLECTION_NAME);
    // TODO add any others?
    return Promise.resolve();
  },

  TEST_COLLECTION_NAME,

  DOC_1: { name: 'doc1' },
  DOC_1_PATH: `collection-tests/doc1${testRunId}`,

  DOC_2: { name: 'doc2', title: 'Document 2' },
  DOC_2_PATH: `collection-tests/doc2${testRunId}`,

  // needs to be a fn as firebase may not yet be available
  COL_DOC_1() {
    shouldCleanup = true;
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

  COL_DOC_1_PATH: `collection-tests/col1${testRunId}`,
  COL_DOC_1_ID: `col1${testRunId}`,

  /**
   * Removes all documents on the collection for the current testId or
   * documents older than 24 hours
   *
   * @param collectionName
   * @return {Promise<*>}
   */
  async cleanCollection(collectionName) {
    const firestore = firebaseAdmin.firestore();
    const collection = firestore.collection(
      collectionName || TEST_COLLECTION_NAME
    );

    const docsToDelete = (await collection.get()).docs;
    const yesterday = new Date(new Date() - 24 * ONE_HOUR);

    if (docsToDelete.length) {
      const batch = firestore.batch();

      for (let i = 0, len = docsToDelete.length; i < len; i++) {
        const { ref } = docsToDelete[i];

        if (
          ref.path.includes(testRunId) ||
          new Date(docsToDelete[i].createTime) <= yesterday
        ) {
          batch.delete(ref);
        }
      }

      return batch.commit();
    }

    return Promise.resolve();
  },

  testCollection() {
    shouldCleanup = true;
    return firebase.firestore().collection(TEST_COLLECTION_NAME);
  },

  testCollectionDoc() {
    shouldCleanup = true;
    return firebase.firestore().doc(module.exports.COL_DOC_1_PATH);
  },

  testCollectionDocAdmin() {
    shouldCleanup = true;
    return firebaseAdmin.firestore().doc(module.exports.COL_DOC_1_PATH);
  },

  resetTestCollectionDoc() {
    shouldCleanup = true;
    return firebase
      .firestore()
      .doc(module.exports.COL_DOC_1_PATH)
      .set(module.exports.COL_DOC_1());
  },
};

// call a get request without waiting to force firestore to connect
// so the first test isn't delayed whilst connecting
module.exports
  .testCollectionDocAdmin()
  .get()
  .then(() => {})
  .catch(() => {});
