import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

/*
  Test suite files
 */
import collectionReferenceTests from './collectionReferenceTests';
import documentReferenceTests from './documentReferenceTests';
import fieldValueTests from './fieldValueTests';
import firestoreTests from './firestoreTests';

export const COL_1 = {
  baz: true,
  daz: 123,
  foo: 'bar',
  gaz: 12.1234567,
  geopoint: new firebase.native.firestore.GeoPoint(0, 0),
  naz: null,
  timestamp: new Date(2017, 2, 10, 10, 0, 0),
};

export const DOC_1 = { name: 'doc1' };
export const DOC_2 = { name: 'doc2', title: 'Document 2' };

const suite = new TestSuite('Firestore', 'firebase.firestore()', firebase);

const testGroups = [
  collectionReferenceTests,
  documentReferenceTests,
  fieldValueTests,
  firestoreTests,
];

function firestoreTestSuite(testSuite) {
  testSuite.beforeEach(async () => {
    this.collectionTestsCollection = testSuite.firebase.native.firestore().collection('collection-tests');
    this.documentTestsCollection = testSuite.firebase.native.firestore().collection('document-tests');
    this.firestoreTestsCollection = testSuite.firebase.native.firestore().collection('firestore-tests');
    // Make sure the collections are cleaned and initialised correctly
    await cleanCollection(this.collectionTestsCollection);
    await cleanCollection(this.documentTestsCollection);
    await cleanCollection(this.firestoreTestsCollection);

    const tasks = [];
    tasks.push(this.collectionTestsCollection.doc('col1').set(COL_1));
    tasks.push(this.documentTestsCollection.doc('doc1').set(DOC_1));
    tasks.push(this.documentTestsCollection.doc('doc2').set(DOC_2));

    await Promise.all(tasks);
  });

  testSuite.afterEach(async () => {
    // All data will be cleaned an re-initialised before each test
    // Adding a clean here slows down the test suite dramatically
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
export async function cleanCollection(collection) {
  const collectionTestsDocs = await collection.get();
  const tasks = [];
  collectionTestsDocs.forEach(doc => tasks.push(doc.ref.delete()));
  await Promise.all(tasks);
}
