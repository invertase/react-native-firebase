import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

/*
  Test suite files
 */
import collectionReferenceTests from './collectionReferenceTests';
import documentReferenceTests from './documentReferenceTests';
import firestoreTests from './firestoreTests';

const suite = new TestSuite('Firestore', 'firebase.firestore()', firebase);

const testGroups = [
  collectionReferenceTests,
  documentReferenceTests,
  firestoreTests,
];

function firestoreTestSuite(testSuite) {
  testSuite.beforeEach(async () => {
    this.collectionTestsCollection = testSuite.firebase.native.firestore().collection('collection-tests');
    this.documentTestsCollection = testSuite.firebase.native.firestore().collection('document-tests');
    this.firestoreTestsCollection = testSuite.firebase.native.firestore().collection('firestore-tests');
    // Clean the collections in case the last run failed
    await cleanCollection(this.collectionTestsCollection);
    await cleanCollection(this.documentTestsCollection);
    await cleanCollection(this.firestoreTestsCollection);

    await this.collectionTestsCollection.add({
      baz: true,
      daz: 123,
      foo: 'bar',
      gaz: 12.1234567,
      naz: null,
    });

    await this.documentTestsCollection.doc('doc1').set({
      name: 'doc1',
    });
  });

  testSuite.afterEach(async () => {
    await cleanCollection(this.collectionTestsCollection);
    await cleanCollection(this.documentTestsCollection);
    await cleanCollection(this.firestoreTestsCollection);
  });

  testGroups.forEach((testGroup) => {
    testGroup(testSuite);
  });
}

/*
  Register tests with test suite
 */
suite.addTests(firestoreTestSuite);

export default suite;

/* HELPER FUNCTIONS */
async function cleanCollection(collection) {
  const collectionTestsDocs = await collection.get();
  const tasks = [];
  collectionTestsDocs.forEach(doc => tasks.push(doc.ref.delete()));
  await Promise.all(tasks);
}
