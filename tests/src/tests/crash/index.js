import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import logTests from './log';

const suite = new TestSuite('Crash', 'firebase.crash()', firebase);

// bootstrap tests
suite.addTests(logTests);

export default suite;
