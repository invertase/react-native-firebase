import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

/*
  Test suite files
 */

import snapshotTests from './snapshot';
import refTestGroups from './ref/index';

const suite = new TestSuite('Database', 'firebase.database()', firebase);

/*
  Register tests with test suite
 */

suite.addTests(refTestGroups);
suite.addTests(snapshotTests);

export default suite;

