import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

/*
  Test suite files
 */
import collectionReferenceTests from './collectionReferenceTests';
import documentReferenceTests from './documentReferenceTests';
import fieldPathTests from './fieldPathTests';
import fieldValueTests from './fieldValueTests';
import firestoreTests from './firestoreTests';

export const COL_1 = {
  baz: true,
  daz: 123,
  foo: 'bar',
  gaz: 12.1234567,
  geopoint: new firebase.native.firestore.GeoPoint(0, 0),
  naz: null,
  object: {
    daz: 123,
  },
  timestamp: new Date(2017, 2, 10, 10, 0, 0),
};

const suite = new TestSuite('Firestore', 'firebase.firestore()', firebase);

const testGroups = [
  collectionReferenceTests,
  documentReferenceTests,
  fieldPathTests,
  fieldValueTests,
  firestoreTests,
];

function firestoreTestSuite(testSuite) {
  testSuite.beforeEach(async () => {
    // Do nothing
  });

  testSuite.afterEach(async () => {
    // Do nothing
  });

  testGroups.forEach(testGroup => {
    testGroup(testSuite);
  });
}

/*
  Register tests with test suite
 */
suite.addTests(firestoreTestSuite);

export default suite;
