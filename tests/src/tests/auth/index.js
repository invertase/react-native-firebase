import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

import authTests from './authTests';
import providerTests from './providerTests';
import userTests from './userTests';

const suite = new TestSuite('Auth', 'firebase.auth()', firebase);

suite.addTests(authTests);
suite.addTests(providerTests);
suite.addTests(userTests);

export default suite;
