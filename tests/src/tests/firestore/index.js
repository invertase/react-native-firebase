import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

/*
  Test suite files
 */
import collectionTestGroups from './collection/index';
import documentTestGroups from './document/index';

const suite = new TestSuite('Firestore', 'firebase.firestore()', firebase);

/*
  Register tests with test suite
 */

suite.addTests(documentTestGroups);
suite.addTests(collectionTestGroups);

export default suite;
