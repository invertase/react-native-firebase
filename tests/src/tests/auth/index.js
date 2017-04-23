import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

import authTests from './authTests';

const suite = new TestSuite('Auth', 'firebase.auth()', firebase);

suite.addTests(authTests);

export default suite;
