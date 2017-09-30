import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import coreTests from './coreTests';

const suite = new TestSuite('Firebase Core', 'firebase.X', firebase);

// bootstrap tests
suite.addTests(coreTests);

export default suite;
